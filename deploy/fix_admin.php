<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$user = App\Models\User::find(1);
$user->role = 'super_admin';
$user->must_change_password = true;
$user->save();
echo "Admin fixed: " . $user->email . " role=" . $user->role . "\n";