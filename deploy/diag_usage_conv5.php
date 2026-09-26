<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "== ai_usage recent ==\n";
foreach (DB::table('ai_usage')->latest('id')->limit(15)->get() as $r) {
    echo "#{$r->id} purpose={$r->purpose} status={$r->status} user={$r->user_id} request_key=" . mb_substr($r->request_key, 0, 50) . "\n";
}

echo "\n== conversation 5 summary ==\n";
$c = DB::table('conversations')->where('id', 5)->first();
echo "summary=" . mb_substr((string)$c->summary, 0, 200) . "\n";
