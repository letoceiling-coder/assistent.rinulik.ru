<?php

namespace App\Jobs;

use App\Models\KnowledgeDocument;
use App\Services\Chunker;
use App\Services\DocumentExtractor;
use App\Services\OpenRouterGateway;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProcessKnowledgeDocument implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 900;

    public function __construct(public int $documentId)
    {
        $this->onQueue('documents');
    }

    public function backoff(): array
    {
        return [30, 120, 300];
    }

    public function handle(Chunker $chunker, DocumentExtractor $extractor, OpenRouterGateway $gateway): void
    {
        Cache::lock('document:'.$this->documentId, 960)->block(2, function () use ($chunker, $extractor, $gateway) {
            $doc = KnowledgeDocument::findOrFail($this->documentId);
            $kb = $doc->knowledgeBase;
            if (! $kb || $doc->status === 'ready') {
                return;
            }
            $doc->update(['status' => 'processing', 'processing_started_at' => now(), 'error' => null]);
            $kb->update(['status' => 'processing']);
            $text = $doc->extracted_text;
            if (! $text) {
                $path = tempnam(sys_get_temp_dir(), 'assistent-');
                try {
                    file_put_contents($path, Storage::disk($doc->disk)->get($doc->object_key));
                    $text = $extractor->extract($path, strtolower(pathinfo($doc->name, PATHINFO_EXTENSION)));
                } finally {
                    @unlink($path);
                }
                $doc->update(['extracted_text' => $text]);
            }
            if (mb_strlen(trim($text)) < 10) {
                throw new \RuntimeException('Документ не содержит текста. Для сканов требуется OCR.');
            }
            if (mb_strlen($text) > 1000000) {
                throw new \RuntimeException('Документ слишком большой. Разделите его на части.');
            }
            $chunks = $chunker->split($text);
            $model = $gateway->assignment('embedding')->model;
            $rows = [];
            foreach (array_chunk($chunks, 16, true) as $batch) {
                $hash = hash('sha256', $model.json_encode($batch));
                $res = $gateway->embed($kb->user_id, array_values($batch), 'document:'.$doc->id.':'.$hash);
                $vectors = $res['data'] ?? [];
                usort($vectors, fn ($a, $b) => $a['index'] <=> $b['index']);
                if (count($vectors) !== count($batch)) {
                    throw new \RuntimeException('Incomplete embeddings');
                }
                foreach (array_keys($batch) as $pos => $index) {
                    $vector = $vectors[$pos]['embedding'];
                    if (count($vector) !== config('assistent.embedding_dimensions')) {
                        throw new \RuntimeException('Embedding dimensions mismatch');
                    }
                    $rows[] = ['knowledge_base_id' => $kb->id, 'document_id' => $doc->id, 'chunk_index' => $index, 'text' => $chunks[$index], 'token_count' => (int) ceil(mb_strlen($chunks[$index]) / 3), 'metadata' => json_encode(['document' => $doc->name, 'chunk' => $index]), 'embedding' => json_encode($vector), 'embedding_model' => $model, 'created_at' => now(), 'updated_at' => now()];
                }
            }
            DB::transaction(function () use ($doc, $kb, $rows) {
                DB::table('knowledge_chunks')->where('document_id', $doc->id)->delete();
                foreach (array_chunk($rows, 20) as $batch) {
                    DB::table('knowledge_chunks')->insert($batch);
                }
                $doc->update(['status' => 'ready']);
                $remaining = $kb->documents()->where('id', '!=', $doc->id)->where('status', '!=', 'ready')->exists();
                $kb->update(['status' => $remaining ? 'processing' : 'ready', 'indexed_at' => now()]);
            });
        });
    }

    public function failed(?\Throwable $e): void
    {
        $doc = KnowledgeDocument::find($this->documentId);
        $doc?->update(['status' => 'failed', 'error' => 'Не удалось обработать документ. Проверьте формат, баланс и настройки embeddings.']);
        $doc?->knowledgeBase?->update(['status' => 'failed']);
    }
}
