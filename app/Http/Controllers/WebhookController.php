<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessIncomingMessage;
use App\Models\Integration;
use App\Services\Messaging\Adapters;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WebhookController extends Controller
{
    public function receive(Request $r, string $id, Adapters $adapters)
    {
        abort_if(strlen($r->getContent()) > 262144, 413);
        $i = Integration::where('public_id', $id)->where('status', 'connected')->firstOrFail();
        $header = $i->channel === 'telegram' ? 'X-Telegram-Bot-Api-Secret-Token' : 'X-Max-Bot-Api-Secret';
        abort_unless(hash_equals($i->webhook_secret, (string) $r->header($header)), 403);
        $data = $adapters->for($i->channel)->parseIncomingMessage($r->json()->all());
        if (! $data) {
            return ['ok' => true];
        }
        DB::table('webhook_events')->insertOrIgnore(['integration_id' => $i->id, 'external_id' => $data['id'], 'payload' => json_encode($r->json()->all()), 'status' => 'pending', 'created_at' => now(), 'updated_at' => now()]);
        $event = DB::table('webhook_events')->where('integration_id', $i->id)->where('external_id', $data['id'])->first();
        if ($event->status === 'pending') {
            ProcessIncomingMessage::dispatch($event->id);
        }

        return ['ok' => true];
    }

    public function notification(Request $r)
    {
        $secret = config('assistent.notification_secret');
        abort_unless($secret && hash_equals($secret, (string) $r->header('X-Telegram-Bot-Api-Secret-Token')), 403);
        $m = $r->input('message', []);
        if (($m['chat']['type'] ?? '') !== 'private') {
            return ['ok' => true];
        }
        if (! preg_match('/^\/start ([A-Za-z0-9]{48})$/', $m['text'] ?? '', $match)) {
            return ['ok' => true];
        }
        DB::transaction(function () use ($match, $m) {
            $hash = hash('sha256', $match[1]);
            $t = DB::table('connection_tokens')->where('token_hash', $hash)->where('expires_at', '>', now())->lockForUpdate()->first();
            if (! $t) {
                return;
            }
            DB::table('users')->where('id', $t->user_id)->update(['telegram_chat_id' => (string) $m['chat']['id'], 'lead_notifications' => true]);
            DB::table('connection_tokens')->where('token_hash', $hash)->delete();
        });

        return ['ok' => true];
    }
}
