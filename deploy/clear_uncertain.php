<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Clear uncertain/failed ai_usage records so they don't block new requests
$deleted = DB::table('ai_usage')->whereIn('status', ['uncertain', 'failed', 'started'])->delete();
echo "Deleted {$deleted} blocked ai_usage records\n";

// Refund any reserved amounts for these
foreach (DB::table('wallet_transactions')->where('type', 'ai_reserve')->where('created_at', '>', now()->subDay())->get() as $t) {
    // leave as-is; refunds handled by gateway
}
echo "DONE\n";
