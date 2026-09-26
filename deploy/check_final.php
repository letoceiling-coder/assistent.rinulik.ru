<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$docs = DB::table('knowledge_documents')->get();
echo "Docs: " . $docs->count() . "\n";
foreach ($docs as $d) {
    echo "  #{$d->id}: {$d->name} status={$d->status} error=" . ($d->error ?? 'none') . "\n";
}
echo "Chunks: " . DB::table('knowledge_chunks')->count() . "\n";
echo "Ready KBs: " . DB::table('knowledge_bases')->where('status','ready')->count() . "\n";