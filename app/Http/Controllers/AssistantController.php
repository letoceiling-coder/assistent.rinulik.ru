<?php

namespace App\Http\Controllers;

use App\Models\Assistant;
use App\Models\Integration;
use App\Models\KnowledgeBase;
use App\Services\OpenRouterGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AssistantController extends Controller
{
    public function index(Request $r)
    {
        return Assistant::where('user_id', $r->user()->id)->with('knowledgeBases:id,name,status')->when($r->q, fn ($q) => $q->where('name', 'like', '%'.mb_substr($r->q, 0, 100).'%'))->latest()->paginate(30);
    }

    public function generate(Request $r, OpenRouterGateway $ai)
    {
        $data = $r->validate([
            'description' => 'required|string|min:20|max:10000',
            'name' => 'nullable|string|max:100',
            'business_type' => 'nullable|string|max:100',
            'business_type_label' => 'nullable|string|max:100',
            'request_id' => 'required|uuid',
        ]);
        $typeLabel = $data['business_type_label'] ?? $data['business_type'] ?? '';
        $prompt = $typeLabel ? "Тип бизнеса: {$typeLabel}\n" : '';
        $prompt .= ($data['name'] ?? '') ? "Название ассистента: {$data['name']}\n" : '';
        $prompt .= "Описание бизнеса:\n{$data['description']}";

        $res = $ai->chat($r->user()->id, 'assistant_generator', [
            ['role' => 'system', 'content' => 'Ты — эксперт по настройке AI-ассистентов для бизнеса. Строго следуй указанному типу бизнеса и описанию. На основе описания бизнеса создай полную конфигурацию ассистента. Верни ТОЛЬКО JSON без пояснений и markdown-обёртки. Ключи: name (имя ассистента, до 100 символов), goal (какую задачу решает, до 3000), description (описание бизнеса, до 2000), instructions (дополнительные инструкции для общения, до 8000), greeting (приветствие, до 1000), style (стиль общения, строго один из: "Дружелюбно и профессионально, на вы", "Кратко и по делу, на вы", "Тепло и неформально, на ты"), no_knowledge (что сказать, если информации недостаточно, до 1000). Пиши на русском. Не выдумывай факты — если данных нет в описании, отметь [ТРЕБУЕТ УТОЧНЕНИЯ].'],
            ['role' => 'user', 'content' => $prompt],
        ], 'assistant:'.$r->user()->id.':'.$data['request_id'], true);

        $content = $res['choices'][0]['message']['content'] ?? '';
        $config = json_decode($content, true);
        if (! is_array($config) && preg_match('/\{.*\}/s', $content, $m)) {
            $config = json_decode($m[0], true);
        }

        return is_array($config) ? $config : ['message' => 'Не удалось сгенерировать конфигурацию.'];
    }

    public function store(Request $r)
    {
        return response()->json($this->save($r, new Assistant(['user_id' => $r->user()->id])), 201);
    }

    public function update(Request $r, Assistant $assistant)
    {
        Gate::authorize('manage', $assistant);

        return $this->save($r, $assistant);
    }

    private function save(Request $r, Assistant $assistant): Assistant
    {
        $data = $r->validate(['name' => 'required|string|max:100', 'description' => 'nullable|string|max:2000', 'goal' => 'nullable|string|max:3000', 'instructions' => 'nullable|string|max:8000', 'active' => 'boolean', 'settings' => 'nullable|array', 'settings.style' => 'nullable|string|max:300', 'settings.greeting' => 'nullable|string|max:1000', 'settings.no_knowledge' => 'nullable|string|max:1000', 'settings.context_messages' => 'nullable|integer|min:2|max:30', 'settings.max_length' => 'nullable|integer|min:200|max:3900', 'knowledge_base_ids' => 'array', 'knowledge_base_ids.*' => 'integer']);
        $ids = $data['knowledge_base_ids'] ?? [];
        abort_if(KnowledgeBase::where('user_id', $r->user()->id)->whereIn('id', $ids)->count() !== count(array_unique($ids)), 403);
        unset($data['knowledge_base_ids']);
        $data['settings'] = array_intersect_key($data['settings'] ?? [], array_flip(['style', 'greeting', 'no_knowledge', 'context_messages', 'max_length'])) + ['strict_knowledge' => true];
        $assistant->fill($data)->save();
        $assistant->knowledgeBases()->sync($ids);

        return $assistant->load('knowledgeBases:id,name,status');
    }

    public function destroy(Assistant $assistant)
    {
        Gate::authorize('manage', $assistant);
        abort_if(Integration::where('assistant_id', $assistant->id)->where('status', 'connected')->exists(), 422, 'Сначала отключите каналы ассистента.');
        $assistant->delete();

        return ['ok' => true];
    }
}
