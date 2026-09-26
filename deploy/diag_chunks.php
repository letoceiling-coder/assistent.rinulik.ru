<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "== chunks for kb 7 ==\n";
foreach (DB::table('knowledge_chunks')->where('knowledge_base_id', 7)->get() as $c) {
    echo "chunk={$c->id} doc={$c->document_id} model={$c->embedding_model} text=" . mb_substr($c->text, 0, 60) . "\n";
}
echo "count=" . DB::table('knowledge_chunks')->where('knowledge_base_id', 7)->count() . "\n";

echo "\n== messages in conversation 3 ==\n";
foreach (DB::table('messages')->where('conversation_id', 3)->orderBy('id')->get() as $m) {
    echo "#{$m->id} {$m->role} status={$m->status}: " . mb_substr($m->content, 0, 80) . "\n";
}

echo "\n== conversation 3 summary/status ==\n";
$c = DB::table('conversations')->where('id', 3)->first();
echo "status={$c->status} summary=" . mb_substr((string) $c->summary, 0, 100) . "\n";
