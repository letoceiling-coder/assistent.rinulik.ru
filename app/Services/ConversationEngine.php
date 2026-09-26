<?php

namespace App\Services;

use App\Jobs\SendIntegrationMessage;
use App\Jobs\SendLeadNotification;
use App\Models\Conversation;
use App\Models\Lead;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ConversationEngine
{
    public function __construct(private OpenRouterGateway $ai, private Retriever $retriever) {}

    public function reply(Conversation $c): void
    {
        $c->refresh();
        $assistant = $c->assistant;
        if ($c->status !== 'bot_active' || ! $assistant || ! $assistant->active || User::find($c->user_id)?->blocked) {
            return;
        }
        $pending = $c->messages()->where('role', 'user')->where('status', 'pending')->orderBy('id')->get();
        if ($pending->isEmpty()) {
            return;
        }
        $last = $pending->last();
        $key = 'reply:'.$c->id.':'.$last->id;
        if (Message::where('idempotency_key', $key)->exists()) {
            return;
        }
        $question = $pending->pluck('content')->implode("\n");
        $settings = $assistant->settings ?? [];
        $limit = max(2, min(30, (int) ($settings['context_messages'] ?? 12)));
        $history = $c->messages()->where('id', '<=', $last->id)->whereIn('role', ['user', 'assistant'])->latest('id')->limit($limit)->get()->reverse()->map(fn ($m) => ['role' => $m->role, 'content' => $m->content])->values()->all();
        $query = $question;
        if (count($history) > 2 && mb_strlen($question) < 150) {
            $rewritten = $this->ai->chat($c->user_id, 'conversation', [['role' => 'system', 'content' => 'Сформулируй поисковый запрос по последнему сообщению и истории. Не отвечай на вопрос, не добавляй факты. Максимум 300 символов.'], ...$history], $key.':rewrite');
            $query = mb_substr($rewritten['choices'][0]['message']['content'] ?? $question, 0, 500);
        }
        $chunks = $this->retriever->search($assistant, $query, $key.':search');
        $greeting = trim($settings['greeting'] ?? '') ?: 'Здравствуйте! Чем могу помочь?';
        $content = null;
        if (preg_match('/^(привет|здравствуйте|добрый день|добрый вечер|доброе утро|спасибо|благодарю)[.! ]*$/ui', trim($question))) {
            $content = preg_match('/спасибо|благодарю/ui', $question) ? 'Пожалуйста! Если появятся вопросы, я рядом.' : $greeting;
        } else {
            // Build a human-like system prompt that pushes the assistant to think, clarify, and offer options.
            $system = "РОЛЬ\nТы — живой, внимательный помощник компании «{$assistant->name}». Общаешься как человек: тепло, естественно и по существу.\nЦЕЛЬ\nПомочь клиенту разобраться в вопросе и подвести его к нужному результату (запись, заказ, консультация).\nИСТОЧНИКИ\nФакты о компании (цены, услуги, адреса, сроки, условия) бери ТОЛЬКО из раздела ЗНАНИЯ. Если нужных данных там нет — честно скажи, что уточнишь, и задай встречный вопрос, чтобы помочь клиенту.\nОБЩЕНИЕ\n- Отвечай на языке клиента, коротко и живо, как человек в переписке.\n- Если вопрос неполный или данных не хватает — задай ОДИН уточняющий вопрос и предложи 2–3 варианта на выбор.\n- Если информация есть — дай точный ответ и мягко предложи следующий шаг.\n- Не будь роботом: используй естественные фразы, эмодзи уместно, но не перегружай.\n- Учитывай историю диалога и контекст, будь последовательным.\nКОНТЕКСТ КОМПАНИИ\n".json_encode(['name' => $assistant->name, 'goal' => $assistant->goal, 'instructions' => $assistant->instructions, 'style' => $settings], JSON_UNESCAPED_UNICODE)."\nИСТОРИЯ ДИАЛОГА (контекст)\n".($c->summary ?: '—')."\nЗНАНИЯ (проверенные данные о компании)\n".(count($chunks) ? json_encode($chunks, JSON_UNESCAPED_UNICODE) : '—')."\nВАЖНО: не выдумывай факты, которых нет в ЗНАНИЯХ. Если не знаешь — уточни у клиента или предложи передать менеджеру.";
            $res = $this->ai->chat($c->user_id, 'conversation', [['role' => 'system', 'content' => $system], ...$history], $key.':answer');
            $candidate = trim($res['choices'][0]['message']['content'] ?? '');
            if ($candidate !== '') {
                $content = $candidate;
            }
        }
        // Fallback only when the model produced nothing usable.
        if ($content === null || trim($content) === '') {
            $fallback = trim($settings['no_knowledge'] ?? '') ?: 'Чтобы помочь точнее, уточните, пожалуйста: что именно вас интересует?';
            $content = $fallback;
        }
        $maxChars = max(200, min(3900, (int) ($settings['max_length'] ?? 2000)));
        $content = mb_substr($content, 0, $maxChars);
        $this->detectLead($c, $question, $key);
        DB::transaction(function () use ($c, $pending, $key, $content, $chunks) {
            $reply = Message::create(['conversation_id' => $c->id, 'role' => 'assistant', 'content' => $content, 'idempotency_key' => $key, 'status' => $c->integration_id ? 'pending_delivery' : 'delivered', 'metadata' => ['chunks' => $chunks, 'grounded' => (bool) $chunks]]);
            Message::whereIn('id', $pending->pluck('id'))->update(['status' => 'processed']);
            if ($c->integration_id) {
                SendIntegrationMessage::dispatch($reply->id)->afterCommit();
            }
        });
        $this->summarize($c, $limit, $key);
    }

    private function detectLead(Conversation $c, string $text, string $key): void
    {
        if (Lead::withTrashed()->where('conversation_id', $c->id)->exists()) {
            return;
        }
        preg_match('/(?:\+?7|8)[\s(\-]*\d{3}[\s)\-]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}/u', $text, $phone);
        preg_match('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', $text, $email);
        $intent = (bool) preg_match('/хочу (купить|заказать|записаться)|оформить (заказ|услугу)|связаться с менеджером|рассчитайте|передайте менеджеру/ui', $text);
        if (! $intent && ! $phone && ! $email) {
            return;
        }
        $lead = Lead::firstOrCreate(['conversation_id' => $c->id], ['user_id' => $c->user_id, 'assistant_id' => $c->assistant_id, 'channel' => $c->channel, 'message' => $text, 'phone' => $phone[0] ?? null, 'email' => $email[0] ?? null, 'interest' => mb_substr($text, 0, 500)]);
        if ($lead->wasRecentlyCreated) {
            SendLeadNotification::dispatch($lead->id)->afterCommit();
        }
    }

    private function summarize(Conversation $c, int $limit, string $key): void
    {
        $older = $c->messages()->where('id', '>', $c->summarized_through)->orderByDesc('id')->skip($limit)->take(40)->get()->reverse();
        if ($older->count() < 12) {
            return;
        }
        try {
            $res = $this->ai->chat($c->user_id, 'summary', [
                ['role' => 'system', 'content' => 'Сожми историю до 1500 символов. Сохрани вопросы, намерения и контакты клиента. Не добавляй факты. Явно отделяй утверждения клиента от подтверждённых ответов.'],
                ['role' => 'user', 'content' => json_encode(['previous' => $c->summary, 'messages' => $older->map->only(['role', 'content'])], JSON_UNESCAPED_UNICODE)],
            ], $key.':summary');
            $c->update(['summary' => mb_substr($res['choices'][0]['message']['content'] ?? '',0,2000), 'summarized_through' => $older->max('id')]);
        } catch (\Throwable) { /* The delivered answer remains valid; summary can be retried on next turn. */
        }
    }
}
