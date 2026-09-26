<?php

namespace App\Services\Messaging;

use App\Contracts\MessagingIntegration;
use App\Models\Integration;
use Illuminate\Support\Facades\Http;

class MaxIntegration implements MessagingIntegration
{
    private function call(string $token, string $method, string $path, array $data = []): array
    {
        try {
            $r = Http::withHeaders(['Authorization' => $token])->connectTimeout(8)->timeout(25)->send($method, 'https://platform-api2.max.ru'.$path, [$method === 'GET' ? 'query' : 'json' => $data]);
        } catch (\Throwable) {
            throw new \RuntimeException('MAX недоступен. Проверьте соединение и доверенные сертификаты сервера.');
        }
        if (! $r->successful() || $r->json('success') === false) {
            throw new \RuntimeException('MAX отклонил запрос. Проверьте токен и права бота.');
        }

        return $r->json() ?? [];
    }

    public function validateCredentials(array $credentials): array
    {
        $m = $this->call($credentials['token'], 'GET', '/me');

        return ['id' => $m['user_id'], 'username' => $m['username'] ?? $m['name'] ?? 'MAX'];
    }

    public function registerWebhook(Integration $i): void
    {
        $this->call($i->credentials['token'], 'POST', '/subscriptions', ['url' => url('/webhooks/'.$i->public_id), 'update_types' => ['message_created'], 'secret' => $i->webhook_secret]);
    }

    public function disconnect(Integration $i): void
    {
        $this->call($i->credentials['token'], 'DELETE', '/subscriptions?url='.rawurlencode(url('/webhooks/'.$i->public_id)));
    }

    public function parseIncomingMessage(array $p): ?array
    {
        $m = $p['message'] ?? null;
        if (($p['update_type'] ?? '') !== 'message_created' || ! $m || empty($m['body']['text']) || ($m['sender']['is_bot'] ?? false)) {
            return null;
        }
        if (empty($m['recipient']['chat_id']) || empty($m['body']['mid'])) {
            return null;
        }

        return ['id' => (string) $m['body']['mid'], 'chat' => (string) $m['recipient']['chat_id'], 'user' => (string) ($m['sender']['user_id'] ?? ''), 'text' => mb_substr($m['body']['text'], 0, 12000)];
    }

    public function sendText(Integration $i, string $chatId, string $text): void
    {
        $this->call($i->credentials['token'], 'POST', '/messages?chat_id='.rawurlencode($chatId), ['text' => mb_substr($text,0,3900)]);
    }
}
