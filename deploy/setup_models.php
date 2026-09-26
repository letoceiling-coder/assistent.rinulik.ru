<?php
require '/var/www/html/vendor/autoload.php';
$app = require '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Check if assignments exist
$count = DB::table('ai_model_assignments')->count();
if ($count > 0) {
    echo "Assignments already exist ($count), skipping setup.\n";
    foreach (DB::table('ai_model_assignments')->get() as $a) {
        echo "  {$a->purpose}: {$a->model} (enabled={$a->enabled})\n";
    }
    exit(0);
}

// Sync models from OpenRouter
echo "Syncing OpenRouter models...\n";
$res = Http::withToken(env('OPENROUTER_API_KEY'))->timeout(30)->get('https://openrouter.ai/api/v1/models');
if (!$res->successful()) {
    echo "ERROR: Cannot fetch models from OpenRouter\n";
    exit(1);
}
$count = 0;
foreach ($res->json('data', []) as $m) {
    DB::table('ai_models')->updateOrInsert(['id' => $m['id']], [
        'name' => $m['name'],
        'pricing' => json_encode($m['pricing'] ?? []),
        'context_length' => $m['context_length'] ?? 0,
        'updated_at' => now(),
    ]);
    $count++;
}
echo "Imported $count models\n";

// Find a good model for each purpose
$fastModels = DB::table('ai_models')
    ->where('id', 'not like', '%.%')
    ->where('id', 'like', '%openai%')
    ->orWhere('id', 'like', '%anthropic%')
    ->orWhere('id', 'like', '%google%')
    ->orWhere('id', 'like', '%mistral%')
    ->orWhere('id', 'like', '%meta%')
    ->pluck('id')->toArray();
    
// Try specific models in order of preference
$preferred = [
    'openai/gpt-4o-mini',
    'openai/gpt-4o',
    'openai/gpt-4',
    'anthropic/claude-3-haiku',
    'anthropic/claude-3-sonnet',
    'google/gemini-1.5-flash',
    'mistral/mistral-small',
    'meta-llama/llama-3.2-3b-instruct',
];

function findModel($preferred, $all) {
    foreach ($preferred as $p) {
        if (in_array($p, $all)) return $p;
    }
    return $all[0] ?? null;
}

$allModelIds = DB::table('ai_models')->pluck('id')->toArray();

if (empty($allModelIds)) {
    echo "ERROR: No models available after sync\n";
    exit(1);
}

$assignments = [
    'conversation' => ['model' => 'openai/gpt-4o-mini', 'temperature' => 0.3, 'max_tokens' => 2000, 'enabled' => true],
    'knowledge_processing' => ['model' => 'openai/gpt-4o-mini', 'temperature' => 0.1, 'max_tokens' => 4000, 'enabled' => true],
    'knowledge_generator' => ['model' => 'openai/gpt-4o-mini', 'temperature' => 0.3, 'max_tokens' => 4000, 'enabled' => true],
    'assistant_generator' => ['model' => 'openai/gpt-4o-mini', 'temperature' => 0.4, 'max_tokens' => 4000, 'enabled' => true],
    'lead_detection' => ['model' => 'openai/gpt-4o-mini', 'temperature' => 0.1, 'max_tokens' => 1000, 'enabled' => true],
    'summary' => ['model' => 'openai/gpt-4o-mini', 'temperature' => 0.2, 'max_tokens' => 2000, 'enabled' => true],
    'grounding' => ['model' => 'openai/gpt-4o-mini', 'temperature' => 0.1, 'max_tokens' => 1000, 'enabled' => true],
    'embedding' => ['model' => 'openai/text-embedding-ada-002', 'temperature' => 0, 'max_tokens' => 0, 'enabled' => true],
];

// Check if text-embedding-ada-002 exists, otherwise use any available
$hasEmbedding = in_array('openai/text-embedding-ada-002', $allModelIds);
if (!$hasEmbedding) {
    // Look for any embedding model
    $embedModels = DB::table('ai_models')->where('id', 'like', '%embed%')->pluck('id')->toArray();
    if (!empty($embedModels)) {
        $assignments['embedding']['model'] = $embedModels[0];
    } else {
        // Use first available model as fallback
        $assignments['embedding']['model'] = $allModelIds[0];
    }
}

// Fall back to first available model for any that don't exist
foreach ($assignments as $purpose => &$cfg) {
    if (!in_array($cfg['model'], $allModelIds)) {
        $cfg['model'] = $allModelIds[0];
        echo "  $purpose: using fallback {$cfg['model']}\n";
    } else {
        echo "  $purpose: {$cfg['model']}\n";
    }
    $cfg['timeout'] = 120;
    $cfg['retry_count'] = 1;
    DB::table('ai_model_assignments')->insert([
        'purpose' => $purpose,
        'model' => $cfg['model'],
        'temperature' => $cfg['temperature'],
        'max_tokens' => $cfg['max_tokens'],
        'timeout' => $cfg['timeout'],
        'retry_count' => $cfg['retry_count'],
        'enabled' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

echo "\nAll assignments created successfully!\n";