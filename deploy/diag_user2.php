<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "== assistants for user 2 ==\n";
foreach (DB::table('assistants')->where('user_id', 2)->get() as $a) {
    $links = DB::table('assistant_knowledge_base')->where('assistant_id', $a->id)->pluck('knowledge_base_id');
    echo "id={$a->id} name={$a->name} active={$a->active} kbs=[" . $links->implode(',') . "]\n";
}

echo "\n== knowledge_bases for user 2 ==\n";
foreach (DB::table('knowledge_bases')->where('user_id', 2)->get() as $kb) {
    echo "id={$kb->id} name={$kb->name} status={$kb->status}\n";
}

echo "\n== all assistants with kbs (any user) ==\n";
foreach (DB::table('assistants')->get() as $a) {
    $links = DB::table('assistant_knowledge_base')->where('assistant_id', $a->id)->pluck('knowledge_base_id');
    if ($links->count()) {
        echo "id={$a->id} name={$a->name} user={$a->user_id} kbs=[" . $links->implode(',') . "]\n";
    }
}
