<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "== Recent ai_usage ==\n";
foreach (DB::table('ai_usage')->latest('id')->limit(8)->get() as $r) {
    echo "#{$r->id} purpose={$r->purpose} status={$r->status} model={$r->model} user={$r->user_id}\n";
}

echo "\n== Wallets ==\n";
foreach (DB::table('wallets')->get() as $w) {
    echo "user={$w->user_id} balance={$w->balance}\n";
}

echo "\n== assignments ==\n";
foreach (DB::table('ai_model_assignments')->where('enabled', true)->get() as $a) {
    echo "{$a->purpose}: {$a->model}\n";
}
