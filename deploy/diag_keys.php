<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "== system_settings openrouter ==\n";
foreach (DB::table('system_settings')->where('key', 'like', '%openrouter%')->get() as $s) {
    $val = $s->value;
    if (str_contains((string) $val, 'sk-or')) {
        $val = substr((string) $val, 0, 12) . '...' . substr((string) $val, -6);
    }
    echo "{$s->key} = {$val}\n";
}

echo "\n== env key (masked) ==\n";
$env = getenv('OPENROUTER_API_KEY');
echo 'OPENROUTER_API_KEY = ' . (substr((string) $env, 0, 12) . '...') . "\n";
echo 'OPENROUTER_PROXY = ' . getenv('OPENROUTER_PROXY') . "\n";

echo "\n== Are DB key and env key same? ==\n";
$dbKey = DB::table('system_settings')->where('key', 'openrouter_key')->value('value');
echo 'same = ' . ($dbKey === $env ? 'YES' : 'NO') . "\n";
if ($dbKey !== $env) {
    echo 'dbKey start=' . substr((string) $dbKey, 0, 12) . "\n";
    echo 'envKey start=' . substr((string) $env, 0, 12) . "\n";
}
