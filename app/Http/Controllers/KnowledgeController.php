<?php

namespace App\Http\Controllers;

use App\Jobs\DeleteKnowledgeBase;
use App\Jobs\ProcessKnowledgeDocument;
use App\Models\KnowledgeBase;
use App\Models\KnowledgeDocument;
use App\Services\OpenRouterGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class KnowledgeController extends Controller
{
    public function index(Request $r)
    {
        return KnowledgeBase::where('user_id', $r->user()->id)->withCount('documents')->when($r->q, fn ($q) => $q->where('name', 'like', '%'.mb_substr($r->q, 0, 100).'%'))->latest()->paginate(30);
    }

    public function store(Request $r)
    {
        return response()->json(KnowledgeBase::create($r->validate(['name' => 'required|string|max:120', 'description' => 'nullable|string|max:2000']) + ['user_id' => $r->user()->id]), 201);
    }

    public function show(KnowledgeBase $knowledge)
    {
        Gate::authorize('manage', $knowledge);

        return $knowledge->load(['documents' => fn ($q) => $q->select('id', 'knowledge_base_id', 'name', 'status', 'error', 'size', 'created_at')]);
    }

    public function upload(Request $r, KnowledgeBase $knowledge)
    {
        Gate::authorize('manage', $knowledge);
        $r->validate(['files' => 'required|array|max:20', 'files.*' => 'file|max:20480|mimes:pdf,doc,docx,txt,md|extensions:pdf,doc,docx,txt,md']);
        if (! config('filesystems.disks.s3.bucket') || ! config('filesystems.disks.s3.key')) {
            abort(503, 'Хранилище Selectel ещё не настроено. Пока можно добавить информацию текстом.');
        }
        $results = [];
        foreach ($r->file('files') as $f) {
            $key = 'users/'.$r->user()->id.'/knowledge/'.$knowledge->id.'/'.Str::uuid().'.'.$f->getClientOriginalExtension();
            try {
                Storage::disk('s3')->put($key, fopen($f->getRealPath(), 'rb'), ['visibility' => 'private']);
            } catch (\Throwable) {
                $results[] = ['name' => basename($f->getClientOriginalName()), 'status' => 'failed', 'error' => 'Не удалось сохранить в S3'];
                continue;
            }
            try {
                $doc = KnowledgeDocument::create(['knowledge_base_id' => $knowledge->id, 'name' => basename($f->getClientOriginalName()), 'object_key' => $key, 'mime' => $f->getMimeType(), 'size' => $f->getSize(), 'checksum' => hash_file('sha256', $f->getRealPath())]);
                ProcessKnowledgeDocument::dispatch($doc->id);
                $results[] = $doc->only(['id', 'name', 'status']);
            } catch (\Throwable $e) {
                Storage::disk('s3')->delete($key);
                $results[] = ['name' => basename($f->getClientOriginalName()), 'status' => 'failed', 'error' => $e->getMessage()];
            }
        }
        if (count($results) > 0) {
            $knowledge->update(['status' => 'processing']);
        }

        return response()->json(['documents' => $results], 202);
    }

    public function text(Request $r, KnowledgeBase $knowledge)
    {
        Gate::authorize('manage', $knowledge);
        $data = $r->validate(['name' => 'required|string|max:120', 'text' => 'required|string|min:10|max:1000000', 'draft' => 'boolean']);
        $doc = KnowledgeDocument::create(['knowledge_base_id' => $knowledge->id, 'name' => $data['name'].'.txt', 'disk' => 'local', 'extracted_text' => $data['text'], 'size' => strlen($data['text']), 'checksum' => hash('sha256', $data['text']), 'status' => ($data['draft'] ?? false) ? 'draft' : 'pending']);
        if ($doc->status === 'pending') {
            $knowledge->update(['status' => 'processing']);
            ProcessKnowledgeDocument::dispatch($doc->id);
        }

        return response()->json($doc->only(['id', 'name', 'status']), 201);
    }

    public function retry(KnowledgeDocument $document)
    {
        Gate::authorize('manage', $document->knowledgeBase);
        $document->update(['status' => 'pending', 'error' => null]);
        ProcessKnowledgeDocument::dispatch($document->id);

        return ['ok' => true];
    }

    public function generate(Request $r, OpenRouterGateway $ai)
    {
        $data = $r->validate(['description' => 'required|string|min:20|max:10000', 'request_id' => 'required|uuid']);
        $res = $ai->chat($r->user()->id, 'knowledge_generator', [
            ['role' => 'system', 'content' => 'Создай черновик базы знаний в Markdown из описания бизнеса. Не выдумывай цены, адреса, сроки, гарантии и другие факты. Неизвестные поля отмечай [ТРЕБУЕТ УТОЧНЕНИЯ]. Заверши списком вопросов владельцу. Не публикуй черновик.'],
            ['role' => 'user', 'content' => $data['description']],
        ], 'draft:'.$r->user()->id.':'.$data['request_id']);

        return ['draft' => $res['choices'][0]['message']['content'] ?? ''];
    }

    public function destroy(Request $r, KnowledgeBase $knowledge)
    {
        Gate::authorize('manage', $knowledge);
        $linked = DB::table('assistant_knowledge_base')->where('knowledge_base_id', $knowledge->id)->count();
        if ($linked > 0 && ! $r->boolean('force')) {
            return response()->json(['linked_assistants' => $linked, 'message' => "База знаний подключена к {$linked} ассистент(ам). Удалите связи или подтвердите удаление."], 409);
        }
        $knowledge->delete();
        DeleteKnowledgeBase::dispatch($knowledge->id);

        return ['ok' => true];
    }

    public function showDocument(KnowledgeDocument $document)
    {
        Gate::authorize('manage', $document->knowledgeBase);
        if ($document->extracted_text) {
            return ['id' => $document->id, 'name' => $document->name, 'text' => $document->extracted_text];
        }
        abort(404, 'Текст документа недоступен.');
    }

    public function updateDocument(Request $r, KnowledgeDocument $document)
    {
        Gate::authorize('manage', $document->knowledgeBase);
        $data = $r->validate(['text' => 'required|string|min:10|max:1000000']);
        $document->update(['extracted_text' => $data['text'], 'status' => 'pending', 'error' => null]);
        $document->knowledgeBase->update(['status' => 'processing']);
        ProcessKnowledgeDocument::dispatch($document->id);

        return ['ok' => true];
    }
}
