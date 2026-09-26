<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$assistant = App\Models\Assistant::find(5);
$gw = app(App\Services\OpenRouterGateway::class);
$retriever = app(App\Services\Retriever::class);

// Get embedding for query
$model = $gw->assignment('embedding')->model;
try {
    $emb = $gw->embed($assistant->user_id, ['нужно видео'], 'diag:sim:test')['data'][0]['embedding'];
    $vector = json_encode($emb);
    echo "embedding obtained, model={$model}\n";

    $rows = DB::table('knowledge_chunks as c')
        ->where('c.knowledge_base_id', 7)
        ->select('c.id', 'c.text')
        ->selectRaw('1 - (c.embedding <=> ?::vector) as similarity', [$vector])
        ->orderByRaw('c.embedding <=> ?::vector', [$vector])
        ->limit(10)->get();
    foreach ($rows as $r) {
        echo "sim=" . round((float)$r->similarity, 4) . " text=" . mb_substr($r->text, 0, 40) . "\n";
    }
} catch (\Throwable $e) {
    echo "EXCEPTION: " . get_class($e) . " " . $e->getMessage() . "\n";
}
