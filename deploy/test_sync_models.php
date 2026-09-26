<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$gateway = $app->make(App\Services\OpenRouterGateway::class);
try {
    $count = $gateway->syncModels();
    echo "Synced $count models\n";
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
}