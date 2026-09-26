<?php

return [
    'admin_email' => env('ADMIN_EMAIL', 'dsc-23@yandex.ru'),
    'admin_password' => env('ADMIN_INITIAL_PASSWORD'),
    'openrouter_key' => env('OPENROUTER_API_KEY'),
    'openrouter_proxy' => env('OPENROUTER_PROXY'),
    'embedding_dimensions' => (int) env('EMBEDDING_DIMENSIONS', 1536),
    'candidate_chunks' => 20,
    'context_chunks' => 6,
    'similarity_threshold' => 0.35,
    'chunk_chars' => 2400,
    'chunk_overlap' => 250,
    'max_context_chars' => 16000,
    'usd_rub' => env('BILLING_USD_RUB', '100.00'),
    'markup' => env('BILLING_MARKUP', '1.20'),
    'minimum_balance' => 0,
    'request_reserve_kopecks' => 500,
    'notification_bot' => env('TELEGRAM_SYSTEM_BOT_USERNAME'),
    'notification_token' => env('TELEGRAM_SYSTEM_BOT_TOKEN'),
    'notification_secret' => env('TELEGRAM_SYSTEM_BOT_SECRET'),
];
