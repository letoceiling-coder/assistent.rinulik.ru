<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OpenRouterGateway
{
    public function __construct(private Settings $settings, private WalletLedger $ledger) {}

    public function assignment(string $purpose): object
    {
        $a = DB::table('ai_model_assignments')->where('purpose', $purpose)->where('enabled', true)->first();
        if (! $a || ! $a->model) {
            throw ValidationException::withMessages(['ai' => 'Для этой задачи ещё не настроена AI-модель.']);
        }

        return $a;
    }

    public function key(): string
    {
        $key = $this->settings->get('openrouter_key', config('assistent.openrouter_key'));
        if (! $key) {
            throw ValidationException::withMessages(['ai' => 'AI-провайдер ещё не подключён. Обратитесь к администратору.']);
        }

        return $key;
    }

    private function http(string $title = 'ASSISTENT'): \Illuminate\Http\Client\PendingRequest
    {
        $client = Http::withToken($this->key())
            ->withHeaders(['HTTP-Referer' => config('app.url'), 'X-Title' => $title])
            ->connectTimeout(10)
            ->timeout(90);
        $proxy = config('assistent.openrouter_proxy');
        if ($proxy) {
            $client->withOptions(['proxy' => $proxy]);
        }

        return $client;
    }

    public function syncModels(): int
    {
        $res = $this->http()->timeout(30)->get('https://openrouter.ai/api/v1/models');
        if (! $res->successful()) {
            throw ValidationException::withMessages(['ai' => 'Не удалось получить модели OpenRouter. Проверьте ключ и доступность сервиса.']);
        }
        $count = 0;
        foreach ($res->json('data', []) as $m) {
            DB::table('ai_models')->updateOrInsert(['id' => $m['id']], ['name' => $m['name'], 'pricing' => json_encode($m['pricing'] ?? []), 'context_length' => $m['context_length'] ?? 0, 'updated_at' => now()]);
            $count++;
        }

        return $count;
    }

    public function chat(int $user, string $purpose, array $messages, string $key, bool $json = false): array
    {
        $a = $this->assignment($purpose);
        $body = ['messages' => $messages, 'temperature' => (float) $a->temperature, 'max_tokens' => $a->max_tokens, 'usage' => ['include' => true]];
        if ($json) {
            $body['response_format'] = ['type' => 'json_object'];
        }

        return $this->request($user, $purpose, $body, $key, false);
    }

    public function embed(int $user, array $texts, string $key): array
    {
        return $this->request($user, 'embedding', ['input' => $texts, 'dimensions' => config('assistent.embedding_dimensions'), 'encoding_format' => 'float'], $key, true);
    }

    public function request(int $user, string $purpose, array $body, string $key, bool $embedding): array
    {
        $a = $this->assignment($purpose);
        $token = $this->key();

        return Cache::lock('ai-user:'.$user, 240)->block(5, function () use ($user, $purpose, $body, $key, $embedding, $a, $token) {
            $old = DB::table('ai_usage')->where('request_key', $key)->first();
            if ($old && $old->status === 'completed') {
                return json_decode($old->response, true);
            }
            if ($old) {
                throw ValidationException::withMessages(['ai' => 'Предыдущий запрос требует проверки. Повторное списание предотвращено.']);
            }
            $rate = (string) $this->settings->get('usd_rub', config('assistent.usd_rub'));
            $markup = (string) $this->settings->get('markup', config('assistent.markup'));
            $reserve = (int) $this->settings->get('request_reserve_kopecks', config('assistent.request_reserve_kopecks'));
            DB::transaction(function () use ($user, $purpose, $key, $a, $rate, $markup, $reserve) {
                $wallet = DB::table('wallets')->where('user_id', $user)->lockForUpdate()->first();
                $minimum = (int) $this->settings->get('minimum_balance', 0);
                if (! $wallet || $wallet->balance < $minimum + $reserve) {
                    throw ValidationException::withMessages(['balance' => 'Недостаточно средств для AI-запроса.']);
                }
                $this->ledger->post($user, -$reserve, 'ai_reserve', 'reserve:'.$key, 'Резерв AI-запроса');
                DB::table('ai_usage')->insert(['user_id' => $user, 'request_key' => $key, 'purpose' => $purpose, 'model' => $a->model, 'conversion_rate' => $rate, 'markup' => $markup, 'status' => 'started', 'created_at' => now(), 'updated_at' => now()]);
            });
            $start = microtime(true);
            $models = array_values(array_unique(array_filter([$a->model, $embedding ? null : $a->fallback])));
            try {
                $result = null;
                foreach ($models as $model) {
                    for ($attempt = 0; $attempt <= min(2, $a->retry_count); $attempt++) {
                        $res = $this->http()->post('https://openrouter.ai/api/v1/'.($embedding ? 'embeddings' : 'chat/completions'), $body + ['model' => $model]);
                        if ($res->successful() && ! $res->json('error')) {
                            $result = $res->json();
                            break 2;
                        }
                        // Only explicit rejection is safe to retry. Network ambiguity is caught below.
                        if ($res->status() !== 429 && $res->status() < 500) {
                            break;
                        }
                        usleep(250000 * ($attempt + 1));
                    }
                }
                if (! $result) {
                    DB::transaction(function () use ($user, $reserve, $key) {
                        $this->ledger->post($user, $reserve, 'refund', 'refund:'.$key, 'AI-провайдер отклонил запрос');
                        DB::table('ai_usage')->where('request_key', $key)->update(['status' => 'failed', 'updated_at' => now()]);
                    });
                    throw new \RuntimeException('Provider rejected request');
                }
                $cost = $result['usage']['cost'] ?? null;
                if ($cost === null || ! is_numeric($cost) || (float) $cost < 0) {
                    DB::table('ai_usage')->where('request_key', $key)->update(['status' => 'cost_pending', 'provider_request_id' => $result['id'] ?? null, 'updated_at' => now()]);
                    throw new \RuntimeException('Provider cost not reported; reservation retained for reconciliation');
                }
                $charge = self::charge((string) $cost, $rate, $markup);
                DB::transaction(function () use ($user, $reserve, $key, $result, $cost, $charge, $start, $a) {
                    $this->ledger->post($user, $reserve, 'refund', 'release:'.$key, 'Освобождение резерва');
                    $this->ledger->post($user, -$charge, 'ai_usage', 'charge:'.$key, 'Использование AI');
                    DB::table('ai_usage')->where('request_key', $key)->update(['status' => 'completed', 'provider_request_id' => $result['id'] ?? null, 'model' => $result['model'] ?? $a->model, 'provider' => $result['provider'] ?? 'openrouter', 'input_tokens' => $result['usage']['prompt_tokens'] ?? $result['usage']['total_tokens'] ?? 0, 'output_tokens' => $result['usage']['completion_tokens'] ?? 0, 'cost_usd' => $cost, 'charge' => $charge, 'latency_ms' => (int) ((microtime(true) - $start) * 1000), 'response' => json_encode($result), 'updated_at' => now()]);
                });

                return $result;
            } catch (\Throwable $e) {
                DB::table('ai_usage')->where('request_key', $key)->where('status', 'started')->update(['status' => 'uncertain', 'updated_at' => now()]);
                // Never log provider exception URLs/bodies: they can contain credentials or customer text.
                Log::warning('ai.request_failed', ['request_key' => $key, 'exception_class' => get_class($e)]);
                throw ValidationException::withMessages(['ai' => 'AI-запрос не завершён. Попробуйте позже или обратитесь к администратору.']);
            }
        });
    }

    /**
     * Anonymous website demo: NOT billed to any wallet and NOT stored in ai_usage.
     * Uses the `conversation` model assignment (model + fallback), one retry on 429/5xx, a short timeout.
     * Callers must rate-limit (see DemoController). Never logs message text.
     *
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{text: string, usage: array<string, mixed>}
     */
    public function demoChat(array $messages, int $maxTokens): array
    {
        $a = $this->assignment('conversation');
        $body = ['messages' => $messages, 'temperature' => (float) $a->temperature, 'max_tokens' => $maxTokens, 'usage' => ['include' => true]];
        $models = array_values(array_unique(array_filter([$a->model, $a->fallback])));
        $deadline = microtime(true) + 28;
        foreach ($models as $model) {
            for ($attempt = 0; $attempt <= 1; $attempt++) {
                $left = (int) floor($deadline - microtime(true));
                if ($left < 3) {
                    break 2;
                }
                $res = $this->http('Scrooty')->connectTimeout(5)->timeout(min(25, $left))->post('https://openrouter.ai/api/v1/chat/completions', $body + ['model' => $model]);
                if ($res->successful() && ! $res->json('error')) {
                    $text = (string) $res->json('choices.0.message.content', '');
                    if (trim($text) !== '') {
                        return ['text' => $text, 'usage' => (array) $res->json('usage', [])];
                    }
                    break; // empty answer: try the fallback model
                }
                if ($res->status() !== 429 && $res->status() < 500) {
                    break;
                }
                usleep(250000);
            }
        }
        throw new \RuntimeException('Demo provider request failed');
    }

    public static function charge(string $usd, string $rate, string $markup): int
    {
        if ($usd === '' || (float) $usd <= 0) {
            return 0;
        }
        try {
            $amount = bcmul(bcmul(bcmul($usd, $rate, 12), $markup, 12), '100', 12);
            $integer = bcdiv($amount, '1', 0);

            return (int) $integer + (bccomp($amount, $integer, 12) > 0 ? 1 : 0);
        } catch (\ValueError) {
            return 0;
        }
    }
}
