<?php

namespace App\Http\Controllers;

use App\Services\DemoPrompt;
use App\Services\OpenRouterGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Public, anonymous website demo backed by a real model.
 * Protections (every call costs money): per-IP throttle (route middleware `throttle:demo`),
 * a server-side per-session message cap and a global daily budget. Message text is never logged or stored.
 */
class DemoController extends Controller
{
    public function message(Request $r, OpenRouterGateway $gateway): JsonResponse
    {
        $data = $r->validate([
            'messages' => 'required|array|min:1|max:10',
            'messages.*' => 'required|array',
            'messages.*.role' => 'required|string|in:user,assistant',
            'messages.*.content' => 'required|string|min:1|max:2000',
        ]);
        $messages = array_values($data['messages']);
        foreach ($messages as $i => $m) {
            if ($m['role'] === 'user' && mb_strlen(trim($m['content'])) > 800) {
                throw ValidationException::withMessages(["messages.$i.content" => 'Сообщение длиннее 800 символов.']);
            }
            if (trim($m['content']) === '') {
                throw ValidationException::withMessages(["messages.$i.content" => 'Пустое сообщение.']);
            }
        }
        if (end($messages)['role'] !== 'user') {
            throw ValidationException::withMessages(['messages' => 'Последнее сообщение должно быть от посетителя.']);
        }

        $cfg = config('assistent.demo');
        $limit = (int) $cfg['session_limit'];
        $sent = (int) $r->session()->get('demo.sent', 0);
        if ($sent >= $limit) {
            return response()->json(['reason' => 'demo_limit', 'remaining' => 0, 'message' => 'Лимит демо-сообщений исчерпан.'], 403);
        }

        // Global daily budget across all visitors (counts provider attempts).
        $budgetKey = 'demo:budget:'.now()->toDateString();
        Cache::add($budgetKey, 0, now()->addDays(2));
        if (Cache::increment($budgetKey) > (int) $cfg['daily_limit']) {
            return response()->json(['reason' => 'daily_limit', 'message' => 'На сегодня демо закончилось.'], 429);
        }

        $history = array_slice($messages, -((int) $cfg['history']));
        $payload = [['role' => 'system', 'content' => DemoPrompt::SYSTEM]];
        foreach ($history as $m) {
            $payload[] = ['role' => $m['role'], 'content' => trim($m['content'])];
        }

        try {
            $result = $gateway->demoChat($payload, (int) $cfg['max_tokens']);
        } catch (\Throwable $e) {
            // Never log message text or provider bodies.
            Log::warning('demo.ai_failed', ['exception_class' => get_class($e)]);

            return response()->json(['reason' => 'unavailable', 'message' => 'Демо временно недоступно.'], 503);
        }

        $reply = mb_substr(self::plainText($result['text']), 0, (int) $cfg['reply_chars']);
        if ($reply === '') {
            Log::warning('demo.ai_failed', ['exception_class' => 'EmptyReply']);

            return response()->json(['reason' => 'unavailable', 'message' => 'Демо временно недоступно.'], 503);
        }

        $sent++;
        $r->session()->put('demo.sent', $sent);
        Log::info('demo.reply', [
            'prompt_tokens' => (int) ($result['usage']['prompt_tokens'] ?? 0),
            'completion_tokens' => (int) ($result['usage']['completion_tokens'] ?? 0),
            'cost_usd' => is_numeric($result['usage']['cost'] ?? null) ? (float) $result['usage']['cost'] : null,
        ]);

        return response()->json(['reply' => $reply, 'remaining' => max(0, $limit - $sent)]);
    }

    /** The demo UI renders plain text, so strip markdown emphasis/headings the model sometimes adds. */
    public static function plainText(string $text): string
    {
        $text = preg_replace('/(\*{1,3}|_{2,3})(?=\S)(.+?)(?<=\S)\1/u', '$2', $text);
        $text = preg_replace('/^\s{0,3}#{1,6}\s+/mu', '', $text);
        $text = preg_replace('/^\s*[*\-]\s+/mu', '— ', $text);
        $text = str_replace(['**', '__'], '', $text);

        return trim(preg_replace("/\n{3,}/u", "\n\n", $text));
    }
}
