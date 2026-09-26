<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "== All ai_usage (last 20) ==\n";
foreach (DB::table('ai_usage')->latest('id')->limit(20)->get() as $r) {
    echo "#{$r->id} purpose={$r->purpose} status={$r->status} model={$r->model} created={$r->created_at}\n";
}

echo "\n== conversation successes ever ==\n";
$conv = DB::table('ai_usage')->where('purpose', 'conversation')->count();
$convOk = DB::table('ai_usage')->where('purpose', 'conversation')->where('status', 'completed')->count();
echo "total={$conv} completed={$convOk}\n";
