<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$main = 'google/gemini-3.5-flash-lite';
$fallback = 'google/gemini-2.5-flash-lite';
$embedding = 'text-embedding-3-small';

$purposes = [
    'conversation' => ['model' => $main, 'temperature' => 0.3, 'max_tokens' => 2000, 'timeout' => 60, 'retry_count' => 1, 'enabled' => true],
    'knowledge_processing' => ['model' => $main, 'temperature' => 0.1, 'max_tokens' => 4000, 'timeout' => 90, 'retry_count' => 1, 'enabled' => true],
    'knowledge_generator' => ['model' => $main, 'temperature' => 0.3, 'max_tokens' => 4000, 'timeout' => 90, 'retry_count' => 1, 'enabled' => true],
    'assistant_generator' => ['model' => $main, 'temperature' => 0.4, 'max_tokens' => 4000, 'timeout' => 90, 'retry_count' => 1, 'enabled' => true],
    'lead_detection' => ['model' => $main, 'temperature' => 0.1, 'max_tokens' => 1000, 'timeout' => 30, 'retry_count' => 1, 'enabled' => true],
    'summary' => ['model' => $main, 'temperature' => 0.2, 'max_tokens' => 2000, 'timeout' => 60, 'retry_count' => 1, 'enabled' => true],
    'grounding' => ['model' => $main, 'temperature' => 0.1, 'max_tokens' => 500, 'timeout' => 30, 'retry_count' => 1, 'enabled' => true],
    'embedding' => ['model' => $embedding, 'temperature' => 0, 'max_tokens' => 256, 'timeout' => 30, 'retry_count' => 1, 'enabled' => true],
];

foreach ($purposes as $purpose => $config) {
    $config['fallback'] = $fallback;
    DB::table('ai_model_assignments')->updateOrInsert(
        ['purpose' => $purpose],
        $config + ['updated_at' => now()]
    );
    echo "Assigned: {$purpose} => {$config['model']} (fallback={$fallback})\n";
}

echo "\nAll assignments:\n";
foreach (DB::table('ai_model_assignments')->get() as $a) {
    echo "  {$a->purpose}: {$a->model} fallback={$a->fallback} enabled={$a->enabled}\n";
}
echo "DONE\n";
