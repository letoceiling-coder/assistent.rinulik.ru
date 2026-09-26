<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$key = getenv('OPENROUTER_API_KEY');
$proxy = getenv('OPENROUTER_PROXY');

try {
    $res = Http::withToken($key)
        ->withOptions(['proxy' => $proxy])
        ->timeout(60)
        ->get('https://openrouter.ai/api/v1/models');
    echo 'status=' . $res->status() . "\n";
    $data = $res->json('data', []);
    echo 'count=' . count($data) . "\n";
    // Show free models and common ones
    foreach ($data as $m) {
        $id = $m['id'] ?? '';
        $name = $m['name'] ?? '';
        $pricing = $m['pricing'] ?? [];
        $prompt = $pricing['prompt'] ?? null;
        // Show free models and gemini/gpt
        if (str_contains($id, 'gemini') || str_contains($id, 'gpt-4o-mini') || str_contains($id, 'gpt-4.1-mini') || str_contains($id, 'flash')) {
            echo "{$id} | {$name} | prompt={$prompt}\n";
        }
    }
} catch (\Throwable $e) {
    echo 'EXCEPTION: ' . $e->getMessage() . "\n";
}
