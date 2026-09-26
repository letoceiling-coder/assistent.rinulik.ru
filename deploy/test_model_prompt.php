<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$gw = app(App\Services\OpenRouterGateway::class);
$chunks = [['text' => 'Студия генерации видео «ВидоМир». Услуги: рекламные ролики от 15000 руб, обучающие видео от 12000 руб, анимация от 20000 руб, монтаж от 5000 руб, контент для соцсетей от 3000 руб. Сроки: рекламный ролик 3-5 дней.']];
$settings = ['strict_knowledge' => true];
$assistant = App\Models\Assistant::find(6);

$system = "РОЛЬ\nТы — живой, внимательный помощник компании «{$assistant->name}». Общаешься как человек: тепло, естественно и по существу.\nЦЕЛЬ\nПомочь клиенту разобраться в вопросе и подвести его к нужному результату.\nИСТОЧНИКИ\nФакты о компании бери ТОЛЬКО из раздела ЗНАНИЯ.\nОБЩЕНИЕ\n- Если вопрос неполный или данных не хватает — задай ОДИН уточняющий вопрос и предложи 2–3 варианта на выбор.\n- Если информация есть — дай точный ответ и мягко предложи следующий шаг.\nКОНТЕКСТ КОМПАНИИ\n".json_encode(['name' => $assistant->name, 'goal' => $assistant->goal, 'instructions' => $assistant->instructions, 'style' => $settings], JSON_UNESCAPED_UNICODE)."\nИСТОРИЯ ДИАЛОГА\n—\nЗНАНИЯ\n".json_encode($chunks, JSON_UNESCAPED_UNICODE)."\nВАЖНО: не выдумывай факты, которых нет в ЗНАНИЯХ. Если не знаешь — уточни у клиента или предложи передать менеджеру.";

try {
    $res = $gw->chat(2, 'conversation', [
        ['role' => 'system', 'content' => $system],
        ['role' => 'user', 'content' => 'Хочу видео для рекламы, но не знаю какой формат подойдёт'],
    ], 'diag:prompt:'.time());
    echo "MODEL REPLY:\n" . ($res['choices'][0]['message']['content'] ?? 'EMPTY') . "\n";
} catch (\Throwable $e) {
    echo "EXCEPTION: " . get_class($e) . " " . $e->getMessage() . "\n";
}
