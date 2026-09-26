<?php

namespace App\Jobs;

use App\Models\Conversation;
use App\Models\Integration;
use App\Models\Message;
use App\Services\Messaging\Adapters;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class ProcessIncomingMessage implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    public function __construct(public int $eventId)
    {
        $this->onQueue('integrations');
    }

    public function backoff(): array
    {
        return [10, 30, 120];
    }

    public function handle(Adapters $adapters): void
    {
        DB::transaction(function () use ($adapters) {
            $event = DB::table('webhook_events')->where('id', $this->eventId)->lockForUpdate()->first();
            if (! $event || $event->status === 'processed') {
                return;
            }
            $i = Integration::find($event->integration_id);
            if (! $i || $i->status !== 'connected') {
                return;
            }
            $m = $adapters->for($i->channel)->parseIncomingMessage(json_decode($event->payload, true));
            if ($m) {
                $c = Conversation::firstOrCreate(['integration_id' => $i->id, 'external_chat_id' => $m['chat']], ['user_id' => $i->user_id, 'assistant_id' => $i->assistant_id, 'channel' => $i->channel, 'external_user_id' => $m['user']]);
                Message::firstOrCreate(['idempotency_key' => 'incoming:'.$event->id], ['conversation_id' => $c->id, 'role' => 'user', 'content' => $m['text'], 'status' => 'pending']);
                $c->update(['last_message_at' => now()]);
                $i->update(['last_message_at' => now()]);
                GenerateAssistantReply::dispatch($c->id)->delay(now()->addSeconds(3))->afterCommit();
            }
            DB::table('webhook_events')->where('id', $event->id)->update(['status' => 'processed', 'updated_at' => now()]);
        });
    }

    public function failed(?\Throwable $e): void
    {
        DB::table('webhook_events')->where('id', $this->eventId)->update(['status' => 'failed', 'error' => 'Не удалось обработать событие.', 'updated_at' => now()]);
    }
}
