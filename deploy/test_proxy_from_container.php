<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$key = getenv('OPENROUTER_API_KEY');
$proxy = getenv('OPENROUTER_PROXY');
echo "proxy = {$proxy}\n";

try {
    $res = Http::withToken($key)
        ->withOptions(['proxy' => $proxy])
        ->timeout(60)
        ->post('https://openrouter.ai/api/v1/chat/completions', [
            'model' => 'google/gemini-2.0-flash-lite-preview-02-05:free',
            'messages' => [['role' => 'user', 'content' => 'hi']],
            'max_tokens' => 20,
        ]);
    echo 'status=' . $res->status() . "\n";
    echo 'body=' . mb_substr($res->body(), 0, 300) . "\n";
} catch (\Throwable $e) {
    echo 'EXCEPTION: ' . get_class($e) . ' ' . $e->getMessage() . "\n";
}
