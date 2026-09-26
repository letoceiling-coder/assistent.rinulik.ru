<?php

namespace App\Contracts;

use App\Models\Integration;

interface MessagingIntegration
{
    public function validateCredentials(array $credentials): array;

    public function registerWebhook(Integration $integration): void;

    public function disconnect(Integration $integration): void;

    public function parseIncomingMessage(array $payload): ?array;

    public function sendText(Integration $integration, string $chatId, string $text): void;
}
