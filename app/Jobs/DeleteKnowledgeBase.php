<?php

namespace App\Jobs;

use App\Models\KnowledgeBase;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DeleteKnowledgeBase implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    public function __construct(public int $id)
    {
        $this->onQueue('documents');
    }

    public function backoff(): array
    {
        return [60, 300, 600];
    }

    public function handle(): void
    {
        $kb = KnowledgeBase::onlyTrashed()->find($this->id);
        if (! $kb) {
            return;
        }
        foreach ($kb->documents()->get() as $d) {
            if ($d->object_key) {
                Storage::disk($d->disk)->delete($d->object_key);
            }
            DB::table('knowledge_chunks')->where('document_id', $d->id)->delete();
            $d->delete();
        }
        DB::table('assistant_knowledge_base')->where('knowledge_base_id', $kb->id)->delete();
    }
}
