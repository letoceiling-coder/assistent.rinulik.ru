<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$current = DB::table('system_settings')->where('key', 'similarity_threshold')->first();
if ($current) {
    echo "current similarity_threshold={$current->value}\n";
    DB::table('system_settings')->where('key', 'similarity_threshold')->update(['value' => '0.35', 'updated_at' => now()]);
    echo "updated to 0.35\n";
} else {
    echo "no setting, using config default 0.35\n";
}
