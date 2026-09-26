<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$u = App\Models\User::find(1);
if (!$u) {
    echo "Admin user ID=1 not found. Creating...\n";
    $u = App\Models\User::create([
        'name' => 'Джон Уик',
        'email' => getenv('ADMIN_EMAIL') ?: 'dsc-23@yandex.ru',
        'password' => bcrypt('123123123'),
        'role' => 'super_admin',
        'must_change_password' => true,
    ]);
    echo "Created admin ID={$u->id}\n";
}
echo "Admin: {$u->email} role={$u->role} must_change_password=" . ($u->must_change_password ? 'true' : 'false') . "\n";