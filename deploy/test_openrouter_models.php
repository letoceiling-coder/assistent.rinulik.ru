<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$key = DB::table('system_settings')->where('key', 'openrouter_key')->value('value');
if (! $key) {
    $key = config('assistent.openrouter_key');
}

$models = ['google/gemini-2.0-flash-lite-preview-02-05:free', 'openai/gpt-4o-mini', 'google/gemini-2.0-flash-lite', 'openai/gpt-4o-mini-2024-07-18'];

foreach ($models as $m) {
    try {
        $res = Http::withToken($key)
            ->withHeaders(['HTTP-Referer' => config('app.url'), 'X-Title' => 'ASSISTENT'])
            ->timeout(60)
            ->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $m,
                'messages' => [['role' => 'user', 'content' => 'hi']],
                'max_tokens' => 20,
            ]);
        echo "{$m} => status=" . $res->status() . ' body=' . mb_substr($res->body(), 0, 120) . "\n";
    } catch (\Throwable $e) {
        echo "{$m} => EXCEPTION " . $e->getMessage() . "\n";
    }
}
