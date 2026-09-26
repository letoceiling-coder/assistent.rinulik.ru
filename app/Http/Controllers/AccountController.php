<?php

namespace App\Http\Controllers;

use App\Models\Assistant;
use App\Models\Conversation;
use App\Models\Integration;
use App\Models\KnowledgeBase;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class AccountController extends Controller
{
    public function me(Request $r)
    {
        return ['user' => $r->user()->only(['id', 'name', 'email', 'role', 'must_change_password', 'lead_notifications']), 'balance' => (int) DB::table('wallets')->where('user_id', $r->user()->id)->value('balance'), 'telegram_connected' => (bool) $r->user()->telegram_chat_id];
    }

    public function dashboard(Request $r)
    {
        $id = $r->user()->id;

        return ['assistants' => Assistant::where('user_id', $id)->count(), 'knowledge_bases' => KnowledgeBase::where('user_id', $id)->count(), 'conversations' => Conversation::where('user_id', $id)->count(), 'leads' => Lead::where('user_id', $id)->count(), 'channels' => Integration::where('user_id', $id)->where('status', 'connected')->count(), 'today_cost' => (int) DB::table('ai_usage')->where('user_id', $id)->whereDate('created_at', today())->sum('charge'), 'month_cost' => (int) DB::table('ai_usage')->where('user_id', $id)->where('created_at', '>=', now()->startOfMonth())->sum('charge'), 'messages_today' => DB::table('messages')->join('conversations', 'conversations.id', '=', 'messages.conversation_id')->where('conversations.user_id', $id)->whereDate('messages.created_at', today())->count(), 'recent' => Conversation::where('user_id', $id)->with('assistant:id,name')->latest()->limit(5)->get()];
    }

    public function wallet(Request $r)
    {
        $w = DB::table('wallets')->where('user_id', $r->user()->id)->first();

        return ['balance' => (int) $w->balance, 'transactions' => DB::table('wallet_transactions')->where('wallet_id', $w->id)->latest()->paginate(40)];
    }

    public function usage(Request $r)
    {
        return DB::table('ai_usage')->where('user_id', $r->user()->id)->select('id', 'purpose', 'model', 'input_tokens', 'output_tokens', 'charge', 'latency_ms', 'status', 'created_at')->latest()->paginate(40);
    }

    public function leads(Request $r)
    {
        return Lead::where('user_id', $r->user()->id)->when($r->status, fn ($q) => $q->where('status', $r->status))->when($r->q, fn ($q) => $q->where('message', 'like', '%'.mb_substr($r->q, 0, 100).'%'))->latest()->paginate(40);
    }

    public function lead(Request $r, Lead $lead)
    {
        Gate::authorize('manage', $lead);
        $lead->update($r->validate(['status' => 'required|in:new,contacted,qualified,won,lost']));

        return $lead;
    }

    public function notifications(Request $r)
    {
        $r->validate(['enabled' => 'required|boolean']);
        $r->user()->forceFill(['lead_notifications' => $r->boolean('enabled')])->save();

        return ['ok' => true];
    }

    public function connectNotifications(Request $r)
    {
        abort_unless(config('assistent.notification_bot') && config('assistent.notification_token'), 503, 'Системный бот уведомлений ещё не настроен.');
        $token = Str::random(48);
        DB::table('connection_tokens')->where('user_id', $r->user()->id)->delete();
        DB::table('connection_tokens')->insert(['token_hash' => hash('sha256', $token), 'user_id' => $r->user()->id, 'expires_at' => now()->addMinutes(15)]);

        return ['url' => 'https://t.me/'.config('assistent.notification_bot').'?start='.$token];
    }
}
