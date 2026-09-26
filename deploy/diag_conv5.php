<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

foreach (DB::table('messages')->where('conversation_id', 5)->orderBy('id')->get() as $m) {
    echo "#{$m->id} {$m->role} status={$m->status}\n";
    echo "  content: " . mb_substr($m->content, 0, 300) . "\n";
    echo "  metadata: " . $m->metadata . "\n";
}

echo "\n== conversation 5 ==\n";
$c = DB::table('conversations')->where('id', 5)->first();
echo "status={$c->status} assistant={$c->assistant_id}\n";
