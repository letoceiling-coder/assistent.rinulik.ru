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
    // Public website demo (POST /api/v1/demo/messages). Every request costs real provider money.
    'demo' => [
        'daily_limit' => (int) env('DEMO_DAILY_LIMIT', 1000),      // all visitors, per calendar day
        'session_limit' => (int) env('DEMO_SESSION_LIMIT', 4),     // visitor messages per Laravel session
        'per_minute_ip' => (int) env('DEMO_PER_MINUTE_IP', 6),
        'per_day_ip' => (int) env('DEMO_PER_DAY_IP', 30),
        'max_tokens' => (int) env('DEMO_MAX_TOKENS', 400),
        'history' => 10,                                            // messages sent to the model
        'reply_chars' => 1500,
    ],
];
