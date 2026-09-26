<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$key = getenv('OPENROUTER_API_KEY');
$proxy = getenv('OPENROUTER_PROXY');

$models = [
    'google/gemini-3.5-flash-lite',
    'google/gemini-2.5-flash-lite',
    'deepseek/deepseek-v4-flash',
    'openai/gpt-4o-mini',
    'inclusionai/ling-3.0-flash-sante:free',
];

foreach ($models as $m) {
    try {
        $res = Http::withToken($key)
            ->withOptions(['proxy' => $proxy])
            ->timeout(60)
            ->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $m,
                'messages' => [['role' => 'user', 'content' => 'Ответь одним словом: привет']],
                'max_tokens' => 50,
            ]);
        $content = $res->json('choices.0.message.content', '');
        echo "{$m} => status=" . $res->status() . ' content=' . mb_substr($content, 0, 60) . "\n";
    } catch (\Throwable $e) {
        echo "{$m} => EXCEPTION " . $e->getMessage() . "\n";
    }
}
