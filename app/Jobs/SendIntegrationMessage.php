<?php

namespace App\Jobs;

use App\Models\Conversation;
use App\Models\Integration;
use App\Models\Message;
use App\Models\User;
use App\Services\Messaging\Adapters;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;

class SendIntegrationMessage implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function __construct(public int $messageId)
    {
        $this->onQueue('integrations');
    }

    public function handle(Adapters $adapters): void
    {
        Cache::lock('delivery:'.$this->messageId, 60)->block(3, function () use ($adapters) {
            $m = Message::findOrFail($this->messageId);
            if ($m->status !== 'pending_delivery') {
                return;
            }
            $c = Conversation::findOrFail($m->conversation_id);
            $i = Integration::find($c->integration_id);
            if (! $i || $i->status !== 'connected' || $c->status !== 'bot_active' || User::find($c->user_id)?->blocked) {
                $m->update(['status' => 'cancelled']);

                return;
            }
            $m->update(['status' => 'sending']);
            try {
                $adapters->for($i->channel)->sendText($i, $c->external_chat_id, $m->content);
                $m->update(['status' => 'delivered']);
            } catch (\Throwable) {
                $m->update(['status' => 'delivery_uncertain']);
                $i->update(['last_error' => 'Доставка ответа не подтверждена. Проверьте диалог перед повторной отправкой.']);
            }
        });
    }
}
