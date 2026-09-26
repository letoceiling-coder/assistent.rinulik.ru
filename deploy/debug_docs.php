<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$docs = DB::table('knowledge_documents')->get();
foreach ($docs as $d) {
    echo "#{$d->id}: name={$d->name} status={$d->status} error=" . ($d->error ?? 'none') . "\n";
}
$usage = DB::table('ai_usage')->where('request_key','like','document:%')->orderBy('id','desc')->limit(3)->get();
echo "\nRecent AI usage:\n";
foreach ($usage as $u) {
    echo "  {$u->request_key}: status={$u->status} model={$u->model}\n";
}
$wallets = DB::table('wallets')->get();
echo "\nWallets:\n";
foreach ($wallets as $w) {
    echo "  user #{$w->user_id}: balance={$w->balance} kopecks\n";
}