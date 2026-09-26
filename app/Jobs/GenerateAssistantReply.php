<?php

namespace App\Jobs;

use App\Models\Conversation;
use App\Models\Message;
use App\Services\ConversationEngine;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;

class GenerateAssistantReply implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    public int $timeout = 600;

    public function __construct(public int $conversationId)
    {
        $this->onQueue('ai');
    }

    public function middleware(): array
    {
        return [(new WithoutOverlapping('conversation:'.$this->conversationId))->shared()->releaseAfter(10)->expireAfter(660)];
    }

    public function backoff(): array
    {
        return [15, 60, 120];
    }

    public function handle(ConversationEngine $engine): void
    {
        $c = Conversation::find($this->conversationId);
        if ($c) {
            $engine->reply($c);
        }
    }

    public function failed(?\Throwable $e): void
    {
        Message::where('conversation_id', $this->conversationId)->where('role', 'user')->where('status', 'pending')->update(['status' => 'failed']);
    }
}
