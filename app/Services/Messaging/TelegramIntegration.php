<?php

namespace App\Services\Messaging;

use App\Contracts\MessagingIntegration;
use App\Models\Integration;
use Illuminate\Support\Facades\Http;

class TelegramIntegration implements MessagingIntegration
{
    public function call(string $token, string $method, array $body = []): array
    {
        try {
            $r = Http::connectTimeout(8)->timeout(25)->post('https://api.telegram.org/bot'.$token.'/'.$method, $body);
        } catch (\Throwable) {
            throw new \RuntimeException('Telegram недоступен. Проверьте соединение.');
        }
        if (! $r->successful() || ! $r->json('ok')) {
            throw new \RuntimeException('Telegram отклонил запрос. Проверьте токен и права бота.');
        }

        return $r->json('result') ?? [];
    }

    public function validateCredentials(array $credentials): array
    {
        return $this->call($credentials['token'], 'getMe');
    }

    public function registerWebhook(Integration $i): void
    {
        $this->call($i->credentials['token'], 'setWebhook', ['url' => url('/webhooks/'.$i->public_id), 'secret_token' => $i->webhook_secret, 'allowed_updates' => ['message'], 'drop_pending_updates' => false]);
    }

    public function disconnect(Integration $i): void
    {
        $this->call($i->credentials['token'], 'deleteWebhook');
    }

    public function parseIncomingMessage(array $p): ?array
    {
        $m = $p['message'] ?? null;
        if (! $m || empty($m['text']) || ($m['from']['is_bot'] ?? false) || ($m['chat']['type'] ?? '') !== 'private') {
            return null;
        }

        return ['id' => (string) $p['update_id'], 'chat' => (string) $m['chat']['id'], 'user' => (string) $m['from']['id'], 'text' => mb_substr($m['text'], 0, 12000)];
    }

    public function sendText(Integration $i, string $chatId, string $text): void
    {
        $this->call($i->credentials['token'], 'sendMessage', ['chat_id' => $chatId, 'text' => mb_substr($text, 0, 4000)]);
    }
}
