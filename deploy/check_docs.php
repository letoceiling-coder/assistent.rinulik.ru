<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$docs = DB::table('knowledge_documents')->where('status','failed')->orWhere('status','processing')->get();
foreach ($docs as $d) {
    echo "Doc #{$d->id}: name={$d->name} status={$d->status} error={$d->error}\n";
    echo "  disk={$d->disk} object_key={$d->object_key}\n";
}

// Also check the pipeline
$chunks = DB::table('knowledge_chunks')->count();
echo "\nTotal chunks: {$chunks}\n";

$assignments = DB::table('ai_model_assignments')->get();
echo "\nAssignments:\n";
foreach ($assignments as $a) {
    echo "  {$a->purpose}: {$a->model} enabled={$a->enabled}\n";
}