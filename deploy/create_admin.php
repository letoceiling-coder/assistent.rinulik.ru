<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$adminEmail = getenv('ADMIN_EMAIL') ?: 'dsc-23@yandex.ru';
$adminPassword = getenv('ADMIN_INITIAL_PASSWORD');

if (!$adminPassword) {
    echo "ERROR: ADMIN_INITIAL_PASSWORD is not set in .env\n";
    exit(1);
}

$user = App\Models\User::where('email', $adminEmail)->first();
if ($user) {
    echo "Admin user already exists (ID: {$user->id})\n";
    exit(0);
}

$user = App\Models\User::create([
    'name' => 'Джон Уик',
    'email' => $adminEmail,
    'password' => bcrypt($adminPassword),
    'role' => 'super_admin',
    'must_change_password' => true,
]);

echo "Admin user created (ID: {$user->id}, email: {$adminEmail})\n";