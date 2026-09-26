<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$docs = DB::table('knowledge_documents')->whereIn('status',['failed','pending'])->get();
if ($docs->isEmpty()) { echo "No failed/pending docs\n"; exit; }
foreach ($docs as $d) {
    echo "Found doc #{$d->id}: {$d->name} status={$d->status}\n";
    DB::table('knowledge_documents')->where('id',$d->id)->update(['status'=>'pending','error'=>null,'processing_started_at'=>null]);
    echo "  Reset - dispatching job\n";
    \App\Jobs\ProcessKnowledgeDocument::dispatch($d->id);
}
echo "Done\n";