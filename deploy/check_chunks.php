<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
echo "Docs: " . DB::table('knowledge_documents')->count() . "\n";
echo "Chunks: " . DB::table('knowledge_chunks')->count() . "\n";
echo "Ready KBs: " . DB::table('knowledge_bases')->where('status','ready')->count() . "\n";
foreach (DB::table('knowledge_bases')->get() as $kb) {
    $chunkCount = DB::table('knowledge_chunks')->where('knowledge_base_id', $kb->id)->count();
    echo "  KB #{$kb->id}: {$kb->name} status={$kb->status} chunks={$chunkCount}\n";
}