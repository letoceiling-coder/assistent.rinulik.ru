<?php

namespace App\Services\Messaging;

use App\Contracts\MessagingIntegration;

class Adapters
{
    public function for(string $channel): MessagingIntegration
    {
        return match ($channel) {
            'telegram' => app(TelegramIntegration::class),'max' => app(MaxIntegration::class),default => throw new \RuntimeException('Канал ещё недоступен. Для Avito требуется подтверждение доступа к Messenger API.')
        };
    }
}
