<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$assistant = App\Models\Assistant::with('knowledgeBases')->find(6);
echo "assistant={$assistant->name}\n";
echo "linked kbs: " . $assistant->knowledgeBases()->whereIn('status', ['ready','processing'])->pluck('knowledge_bases.id')->implode(',') . "\n";

$retriever = app(App\Services\Retriever::class);
foreach (['Хочу видео для рекламы, но не знаю какой формат подойдёт', 'Сколько стоит рекламный ролик'] as $q) {
    try {
        $chunks = $retriever->search($assistant, $q, 'diag:search2:'.md5($q));
        echo "\nquery: {$q}\nchunks: " . count($chunks) . "\n";
        foreach ($chunks as $ch) {
            echo "  [sim=" . round((float)$ch['similarity'],3) . "] " . mb_substr($ch['text'], 0, 50) . "\n";
        }
    } catch (\Throwable $e) {
        echo "\nquery: {$q}\nEXCEPTION: " . $e->getMessage() . "\n";
    }
}
