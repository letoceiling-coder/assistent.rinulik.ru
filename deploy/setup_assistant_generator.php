<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$p = 'assistant_generator';
$exists = DB::table('ai_model_assignments')->where('purpose', $p)->first();
if (! $exists) {
    DB::table('ai_model_assignments')->insert([
        'purpose' => $p,
        'model' => 'google/gemini-2.0-flash-lite-preview-02-05:free',
        'temperature' => 0.4,
        'max_tokens' => 4000,
        'timeout' => 90,
        'retry_count' => 1,
        'enabled' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    echo "INSERTED {$p}\n";
} else {
    echo "EXISTS {$p}: model={$exists->model} enabled={$exists->enabled}\n";
}

echo "All purposes:\n";
foreach (DB::table('ai_model_assignments')->get() as $a) {
    echo "  {$a->purpose}: {$a->model} enabled={$a->enabled}\n";
}
