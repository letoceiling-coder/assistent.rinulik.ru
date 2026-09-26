<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Delete stuck ai_usage records for doc embedding requests
$deleted = DB::table('ai_usage')->where('request_key','like','document:%')->whereIn('status',['uncertain','started','failed'])->delete();
echo "Cleared $deleted stuck usage records\n";

// Reset failed docs
$count = DB::table('knowledge_documents')->where('status','failed')->update(['status'=>'pending','error'=>null,'processing_started_at'=>null]);
echo "Reset $count docs\n";

// Re-dispatch
$docs = DB::table('knowledge_documents')->where('status','pending')->get();
foreach ($docs as $d) {
    \App\Jobs\ProcessKnowledgeDocument::dispatch($d->id);
    echo "  Dispatched #{$d->id}: {$d->name}\n";
}
echo "Done\n";