<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$assistant = App\Models\Assistant::with('knowledgeBases')->find(5);
echo "assistant={$assistant->name}\n";
echo "linked kbs: " . $assistant->knowledgeBases()->whereIn('status', ['ready','processing'])->pluck('knowledge_bases.id')->implode(',') . "\n";

$gw = app(App\Services\OpenRouterGateway::class);
$retriever = app(App\Services\Retriever::class);

try {
    $chunks = $retriever->search($assistant, 'нужно видео', 'diag:search:test');
    echo "chunks returned: " . count($chunks) . "\n";
    foreach ($chunks as $ch) {
        echo "  [sim=" . round((float)$ch['similarity'],3) . "] " . mb_substr($ch['text'], 0, 50) . "\n";
    }
} catch (\Throwable $e) {
    echo "EXCEPTION: " . get_class($e) . " " . $e->getMessage() . "\n";
}
