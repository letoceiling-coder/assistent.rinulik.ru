<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

foreach (App\Models\User::all() as $u) {
    echo "id={$u->id} email={$u->email} role={$u->role} blocked={$u->blocked}\n";
}
