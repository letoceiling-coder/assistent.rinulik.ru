<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "== embedding assignment ==\n";
$a = DB::table('ai_model_assignments')->where('purpose', 'embedding')->first();
echo "model={$a->model} enabled={$a->enabled}\n";

echo "\n== chunks by embedding_model ==\n";
foreach (DB::table('knowledge_chunks')->select('embedding_model')->distinct()->get() as $r) {
    echo "model={$r->embedding_model}\n";
}

echo "\n== knowledge_bases ==\n";
foreach (DB::table('knowledge_bases')->get() as $kb) {
    echo "id={$kb->id} name={$kb->name} status={$kb->status} user={$kb->user_id}\n";
}

echo "\n== knowledge_documents ==\n";
foreach (DB::table('knowledge_documents')->get() as $d) {
    echo "id={$d->id} kb={$d->knowledge_base_id} name={$d->name} status={$d->status}\n";
}

echo "\n== assistants + linked kbs ==\n";
foreach (DB::table('assistants')->get() as $as) {
    $links = DB::table('assistant_knowledge_base')->where('assistant_id', $as->id)->pluck('knowledge_base_id');
    echo "assistant={$as->id} name={$as->name} active={$as->active} kbs=[" . $links->implode(',') . "]\n";
}

echo "\n== conversations ==\n";
foreach (DB::table('conversations')->get() as $c) {
    echo "id={$c->id} assistant={$c->assistant_id} status={$c->status} channel={$c->channel}\n";
}
