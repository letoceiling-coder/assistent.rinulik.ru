<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$key = DB::table('system_settings')->where('key', 'openrouter_key')->value('value');
if (! $key) {
    $key = config('assistent.openrouter_key');
}

// 1. Auth check via GET /models (no chat, just validates key)
try {
    $res = Http::withToken($key)->timeout(30)->get('https://openrouter.ai/api/v1/models');
    echo 'MODELS status=' . $res->status() . ' body=' . mb_substr($res->body(), 0, 200) . "\n";
} catch (\Throwable $e) {
    echo 'MODELS EXCEPTION: ' . $e->getMessage() . "\n";
}

// 2. Check network routes
echo "\nNetwork check:\n";
echo 'app.url = ' . config('app.url') . "\n";

// Check if proxy host reachable
exec('ping -c 1 -W 1 172.30.48.1 2>&1', $out, $code);
echo "ping 172.30.48.1 => code=$code out=" . implode(' ', $out) . "\n";
