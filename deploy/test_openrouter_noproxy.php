<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$key = DB::table('system_settings')->where('key', 'openrouter_key')->value('value');
if (! $key) {
    $key = config('assistent.openrouter_key');
}
echo 'key=' . substr((string) $key, 0, 8) . "...\n";
echo 'proxy config = ' . config('assistent.openrouter_proxy') . "\n";

// Test directly WITHOUT proxy
try {
    $res = Http::withToken($key)
        ->withHeaders(['HTTP-Referer' => config('app.url'), 'X-Title' => 'ASSISTENT'])
        ->timeout(60)
        ->post('https://openrouter.ai/api/v1/chat/completions', [
            'model' => 'openai/gpt-4o-mini',
            'messages' => [['role' => 'user', 'content' => 'hi']],
            'max_tokens' => 20,
        ]);
    echo 'DIRECT status=' . $res->status() . ' body=' . mb_substr($res->body(), 0, 200) . "\n";
} catch (\Throwable $e) {
    echo 'DIRECT EXCEPTION: ' . $e->getMessage() . "\n";
}

// Test via proxy
try {
    $res = Http::withToken($key)
        ->withHeaders(['HTTP-Referer' => config('app.url'), 'X-Title' => 'ASSISTENT'])
        ->withOptions(['proxy' => config('assistent.openrouter_proxy')])
        ->timeout(60)
        ->post('https://openrouter.ai/api/v1/chat/completions', [
            'model' => 'openai/gpt-4o-mini',
            'messages' => [['role' => 'user', 'content' => 'hi']],
            'max_tokens' => 20,
        ]);
    echo 'PROXY status=' . $res->status() . ' body=' . mb_substr($res->body(), 0, 200) . "\n";
} catch (\Throwable $e) {
    echo 'PROXY EXCEPTION: ' . $e->getMessage() . "\n";
}
