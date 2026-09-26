<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$key = DB::table('system_settings')->where('key', 'openrouter_key')->value('value');
if (! $key) {
    $key = config('assistent.openrouter_key');
}
echo 'key=' . (substr((string) $key, 0, 8) . '...') . "\n";

try {
    $res = Http::withToken($key)
        ->withHeaders(['HTTP-Referer' => config('app.url'), 'X-Title' => 'ASSISTENT'])
        ->timeout(60)
        ->post('https://openrouter.ai/api/v1/chat/completions', [
            'model' => 'google/gemini-2.0-flash-lite-preview-02-05:free',
            'messages' => [['role' => 'user', 'content' => 'hi']],
            'max_tokens' => 50,
        ]);
    echo 'status=' . $res->status() . "\n";
    echo 'body=' . $res->body() . "\n";
} catch (\Throwable $e) {
    echo 'EXCEPTION: ' . get_class($e) . ' ' . $e->getMessage() . "\n";
}
