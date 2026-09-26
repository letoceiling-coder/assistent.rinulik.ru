<?php

namespace App\Jobs;

use App\Models\Lead;
use App\Models\User;
use App\Services\Messaging\TelegramIntegration;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class SendLeadNotification implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function __construct(public int $leadId)
    {
        $this->onQueue('notifications');
    }

    public function handle(TelegramIntegration $telegram): void
    {
        $lead = Lead::find($this->leadId);
        if (! $lead) {
            return;
        }
        $u = User::find($lead->user_id);
        if (! $u || ! $u->lead_notifications || ! $u->telegram_chat_id || ! config('assistent.notification_token')) {
            return;
        }
        $inserted = DB::table('lead_notifications')->insertOrIgnore(['lead_id' => $lead->id, 'status' => 'sending', 'created_at' => now(), 'updated_at' => now()]);
        if (! $inserted) {
            return;
        }
        try {
            $telegram->call(config('assistent.notification_token'), 'sendMessage', ['chat_id' => $u->telegram_chat_id, 'text' => "Новый лид\nИсточник: {$lead->channel}\nТелефон: {$lead->phone}\nСообщение: ".mb_substr($lead->message, 0, 2000)."\n".url('/app/leads')]);
            DB::table('lead_notifications')->where('lead_id', $lead->id)->update(['status' => 'sent', 'updated_at' => now()]);
        } catch (\Throwable) {
            DB::table('lead_notifications')->where('lead_id', $lead->id)->update(['status' => 'uncertain', 'updated_at' => now()]);
        }
    }
}
