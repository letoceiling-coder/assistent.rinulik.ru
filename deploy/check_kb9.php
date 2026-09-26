<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$kb = DB::table('knowledge_bases')->find(9);
echo "KB #9: name={$kb->name} status={$kb->status}\n";
$docs = DB::table('knowledge_documents')->where('knowledge_base_id',9)->get();
echo "Docs: " . $docs->count() . "\n";
foreach ($docs as $d) {
    echo "  #{$d->id}: {$d->name} status={$d->status} error=" . ($d->error ?? 'none') . "\n";
}
$usage = DB::table('ai_usage')->where('request_key','like','%document%')->orderBy('id','desc')->limit(10)->get();
echo "\nRecent document usage:\n";
foreach ($usage as $u) {
    echo "  {$u->request_key}: status={$u->status} model={$u->model}\n";
}
$queue = DB::table('jobs')->where('queue','documents')->count();
echo "\nJobs in documents queue: $queue\n";