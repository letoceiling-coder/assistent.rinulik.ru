<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Check admin
$admin = App\Models\User::find(1);
echo "Admin: {$admin->email} role={$admin->role} must_change_password={$admin->must_change_password}\n";

// Assign all model purposes
$main = 'google/gemini-3.5-flash-lite';
$fallback = 'google/gemini-2.5-flash-lite';
$purposes = [
    'conversation' => ['model' => $main, 'fallback' => $fallback, 'temperature' => 0.3, 'max_tokens' => 2000, 'timeout' => 60, 'retry_count' => 1, 'enabled' => true],
    'embedding' => ['model' => 'text-embedding-3-small', 'fallback' => $fallback, 'temperature' => 0, 'max_tokens' => 256, 'timeout' => 30, 'retry_count' => 1, 'enabled' => true],
    'knowledge_processing' => ['model' => $main, 'fallback' => $fallback, 'temperature' => 0.1, 'max_tokens' => 4000, 'timeout' => 90, 'retry_count' => 1, 'enabled' => true],
    'knowledge_generator' => ['model' => $main, 'fallback' => $fallback, 'temperature' => 0.3, 'max_tokens' => 4000, 'timeout' => 90, 'retry_count' => 1, 'enabled' => true],
    'assistant_generator' => ['model' => $main, 'fallback' => $fallback, 'temperature' => 0.4, 'max_tokens' => 4000, 'timeout' => 90, 'retry_count' => 1, 'enabled' => true],
    'lead_detection' => ['model' => $main, 'fallback' => $fallback, 'temperature' => 0.1, 'max_tokens' => 1000, 'timeout' => 30, 'retry_count' => 1, 'enabled' => true],
    'summary' => ['model' => $main, 'fallback' => $fallback, 'temperature' => 0.2, 'max_tokens' => 2000, 'timeout' => 60, 'retry_count' => 1, 'enabled' => true],
    'grounding' => ['model' => $main, 'fallback' => $fallback, 'temperature' => 0.1, 'max_tokens' => 500, 'timeout' => 30, 'retry_count' => 1, 'enabled' => true],
];

foreach ($purposes as $purpose => $config) {
    DB::table('ai_model_assignments')->updateOrInsert(
        ['purpose' => $purpose],
        $config + ['updated_at' => now()]
    );
    echo "Assigned: {$purpose} => {$config['model']}\n";
}

// Verify
$assignments = DB::table('ai_model_assignments')->get();
echo "\nAll assignments:\n";
foreach ($assignments as $a) {
    echo "  {$a->purpose}: {$a->model} enabled={$a->enabled}\n";
}
echo "DONE\n";