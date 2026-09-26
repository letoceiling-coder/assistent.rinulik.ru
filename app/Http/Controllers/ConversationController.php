<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateAssistantReply;
use App\Models\Assistant;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;

class ConversationController extends Controller
{
    public function index(Request $r)
    {
        return Conversation::where('user_id', $r->user()->id)->with('assistant:id,name')->when($r->channel, fn ($q) => $q->where('channel', $r->channel))->latest('updated_at')->paginate(30);
    }

    public function create(Request $r, Assistant $assistant)
    {
        Gate::authorize('manage', $assistant);

        return response()->json(Conversation::create(['user_id' => $r->user()->id, 'assistant_id' => $assistant->id, 'channel' => 'playground']), 201);
    }

    public function show(Conversation $conversation)
    {
        Gate::authorize('manage', $conversation);

        return ['conversation' => $conversation, 'messages' => $conversation->messages()->latest('id')->limit(100)->get()->reverse()->values()];
    }

    public function send(Request $r, Conversation $conversation)
    {
        Gate::authorize('manage', $conversation);
        abort_unless($conversation->channel === 'playground', 422, 'Отправка доступна в тестовом диалоге.');
        $data = $r->validate(['content' => 'required|string|max:12000', 'request_id' => 'required|uuid']);
        $m = Message::firstOrCreate(['idempotency_key' => 'playground:'.$conversation->id.':'.$data['request_id']], ['conversation_id' => $conversation->id, 'role' => 'user', 'content' => $data['content']]);
        if ($m->wasRecentlyCreated) {
            $conversation->update(['last_message_at' => now()]);
            GenerateAssistantReply::dispatch($conversation->id)->delay(now()->addSeconds(2));
        }

        return response()->json($m, 202);
    }

    public function status(Request $r, Conversation $conversation)
    {
        Gate::authorize('manage', $conversation);
        $data = $r->validate(['status' => 'required|in:bot_active,manager,closed']);
        Cache::lock('laravel-queue-overlap:conversation:'.$conversation->id, 660)->block(3, function () use ($conversation, $data) {
            $conversation->update($data);
        });
        if ($data['status'] === 'bot_active') {
            GenerateAssistantReply::dispatch($conversation->id);
        }

        return $conversation;
    }
}
