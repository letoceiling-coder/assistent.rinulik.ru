<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

foreach (DB::table('assistants')->where('id', 6)->get() as $a) {
    echo "assistant {$a->id} name={$a->name}\n";
    echo "settings=" . $a->settings . "\n";
    echo "instructions=" . mb_substr((string)$a->instructions, 0, 200) . "\n";
    echo "goal=" . mb_substr((string)$a->goal, 0, 200) . "\n";
}
