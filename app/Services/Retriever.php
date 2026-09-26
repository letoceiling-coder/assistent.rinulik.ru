<?php

namespace App\Services;

use App\Models\Assistant;
use Illuminate\Support\Facades\DB;

class Retriever
{
    public function __construct(private OpenRouterGateway $gateway, private Settings $settings) {}

    public function search(Assistant $assistant, string $query, string $requestKey): array
    {
        $ids = $assistant->knowledgeBases()->where('user_id', $assistant->user_id)->whereIn('status', ['ready', 'processing'])->pluck('knowledge_bases.id');
        if ($ids->isEmpty()) {
            return [];
        }
        $model = $this->gateway->assignment('embedding')->model;
        $embedding = $this->gateway->embed($assistant->user_id, [$query], $requestKey)['data'][0]['embedding'];
        $vector = json_encode($embedding);
        $threshold = (float) $this->settings->get('similarity_threshold', config('assistent.similarity_threshold'));
        $candidates = (int) $this->settings->get('candidate_chunks', config('assistent.candidate_chunks'));
        $context = (int) $this->settings->get('context_chunks', config('assistent.context_chunks'));
        if (DB::getDriverName() !== 'pgsql') {
            throw new \RuntimeException('Vector retrieval requires PostgreSQL');
        }
        $rows = DB::table('knowledge_chunks as c')->join('knowledge_documents as d', 'd.id', '=', 'c.document_id')->whereIn('c.knowledge_base_id', $ids)->where('d.status', 'ready')->where('c.embedding_model', $model)->select('c.id', 'c.text', 'c.document_id', 'c.knowledge_base_id', 'c.metadata')->selectRaw('1 - (c.embedding <=> ?::vector) as similarity', [$vector])->orderByRaw('c.embedding <=> ?::vector', [$vector])->limit($candidates)->get();
        $tokens = preg_split('/\W+/u', mb_strtolower($query), -1, PREG_SPLIT_NO_EMPTY);
        $ranked = $rows->map(function ($r) use ($tokens) {
            $overlap = 0;
            foreach ($tokens as $t) {
                if (mb_strlen($t) > 2 && mb_stripos($r->text, $t) !== false) {
                    $overlap++;
                }
            }
            $r->rank = (float) $r->similarity + min(.15, $overlap * .025);

            return (array) $r;
        })->sortByDesc('rank');
        // Include chunks above threshold, but ALWAYS fall back to top chunks so the KB is never ignored.
        $selected = $ranked->filter(fn ($r) => (float) $r['similarity'] >= $threshold)->values();
        if ($selected->isEmpty()) {
            $selected = $ranked->take(max(2, $context))->values();
        }
        $selected = $selected->take($context);
        $out = [];
        $chars = 0;
        foreach ($selected as $r) {
            $chars += mb_strlen($r['text']);
            if ($chars > config('assistent.max_context_chars')) {
                break;
            } $out[] = $r;
        }

        return $out;
    }
}
