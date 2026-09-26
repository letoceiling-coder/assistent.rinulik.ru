<?php

namespace Tests\Feature;

use App\Jobs\GenerateAssistantReply;
use App\Jobs\ProcessIncomingMessage;
use App\Jobs\ProcessKnowledgeDocument;
use App\Models\Assistant;
use App\Models\Conversation;
use App\Models\Integration;
use App\Models\KnowledgeBase;
use App\Models\Message;
use App\Models\User;
use App\Services\Chunker;
use App\Services\ConversationEngine;
use App\Services\Messaging\Adapters;
use App\Services\OpenRouterGateway;
use App\Services\RegisterUser;
use App\Services\Retriever;
use App\Services\WalletLedger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class PlatformTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return app(RegisterUser::class)->execute(['name' => 'Тест', 'email' => fake()->unique()->safeEmail(), 'password' => 'TestPassword12345']);
    }

    private function assistant(User $u): Assistant
    {
        return Assistant::create(['user_id' => $u->id, 'name' => 'Консультант']);
    }

    public function test_registration_credits_exactly_one_bonus_and_login_works(): void
    {
        $data = ['name' => 'Клиент', 'email' => 'client@example.test', 'password' => 'TestPassword12345', 'password_confirmation' => 'TestPassword12345'];
        $this->postJson('/api/v1/register', $data)->assertCreated();
        $this->assertDatabaseHas('wallets', ['balance' => 50000]);
        $this->assertDatabaseCount('wallet_transactions', 1);
        $u = User::where('email', $data['email'])->first();
        app(WalletLedger::class)->post($u->id, 50000, 'registration_bonus', 'registration:'.$u->id);
        $this->assertDatabaseCount('wallet_transactions', 1);
        $this->assertDatabaseHas('wallets', ['balance' => 50000]);
        $this->postJson('/api/v1/logout')->assertOk();
        $this->postJson('/api/v1/login', ['email' => $data['email'], 'password' => $data['password']])->assertOk();
        $this->postJson('/api/v1/register', $data)->assertUnprocessable();
    }

    public function test_reserved_admin_email_cannot_be_registered(): void
    {
        $this->postJson('/api/v1/register', ['name' => 'Fake', 'email' => config('assistent.admin_email'), 'password' => 'TestPassword12345', 'password_confirmation' => 'TestPassword12345'])->assertUnprocessable();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_assistant_crud_and_tenant_isolation(): void
    {
        $a = $this->user();
        $b = $this->user();
        $id = $this->actingAs($a)->postJson('/api/v1/assistants', ['name' => 'Мой', 'settings' => []])->assertCreated()->json('id');
        $this->actingAs($b)->getJson('/api/v1/assistants')->assertJsonPath('total', 0);
        $this->putJson('/api/v1/assistants/'.$id, ['name' => 'Чужой'])->assertForbidden();
        $this->deleteJson('/api/v1/assistants/'.$id)->assertForbidden();
        $this->actingAs($a)->putJson('/api/v1/assistants/'.$id, ['name' => 'Новое имя'])->assertOk();
        $this->deleteJson('/api/v1/assistants/'.$id)->assertOk();
        $this->assertSoftDeleted('assistants', ['id' => $id]);
    }

    public function test_foreign_knowledge_cannot_be_attached_or_read(): void
    {
        $a = $this->user();
        $b = $this->user();
        $kb = KnowledgeBase::create(['user_id' => $a->id, 'name' => 'Private']);
        $this->actingAs($b)->getJson('/api/v1/knowledge/'.$kb->id)->assertForbidden();
        $this->postJson('/api/v1/assistants', ['name' => 'Attacker', 'knowledge_base_ids' => [$kb->id]])->assertForbidden();
        $this->postJson('/api/v1/knowledge/'.$kb->id.'/text', ['name' => 'Override', 'text' => 'Some content'])->assertForbidden();
    }

    public function test_foreign_conversation_and_integration_are_inaccessible(): void
    {
        $a = $this->user();
        $b = $this->user();
        $assistant = $this->assistant($a);
        $c = Conversation::create(['user_id' => $a->id, 'assistant_id' => $assistant->id]);
        $this->actingAs($b)->getJson('/api/v1/conversations/'.$c->id)->assertForbidden();
        $this->postJson('/api/v1/conversations/'.$c->id.'/messages', ['content' => 'hello', 'request_id' => fake()->uuid()])->assertForbidden();
        $this->getJson('/api/v1/admin/settings')->assertForbidden();
    }

    public function test_knowledge_text_is_queued_and_draft_is_not(): void
    {
        Queue::fake();
        $u = $this->user();
        $kb = KnowledgeBase::create(['user_id' => $u->id, 'name' => 'Тест']);
        $this->actingAs($u)->postJson('/api/v1/knowledge/'.$kb->id.'/text', ['name' => 'Тарифы', 'text' => 'Стоимость услуги — 2500 рублей.', 'draft' => true])->assertCreated();
        Queue::assertNothingPushed();
        $this->postJson('/api/v1/knowledge/'.$kb->id.'/text', ['name' => 'Тарифы', 'text' => 'Стоимость услуги — 2500 рублей.'])->assertCreated();
        Queue::assertPushed(ProcessKnowledgeDocument::class, 1);
    }

    public function test_credentials_are_encrypted_and_never_serialized(): void
    {
        $u = $this->user();
        $a = $this->assistant($u);
        $i = Integration::create(['public_id' => fake()->uuid(), 'user_id' => $u->id, 'assistant_id' => $a->id, 'channel' => 'telegram', 'name' => 'Bot', 'credentials' => ['token' => 'secret123'], 'webhook_secret' => 'hook123']);
        $raw = DB::table('integrations')->where('id', $i->id)->first();
        $this->assertStringNotContainsString('secret123', $raw->credentials);
        $this->assertNotEquals('hook123', $raw->webhook_secret);
        $this->assertSame('secret123', $i->fresh()->credentials['token']);
        $this->actingAs($u)->getJson('/api/v1/integrations')->assertDontSee('secret123')->assertDontSee('credentials')->assertDontSee('hook123');
    }

    public function test_webhooks_reject_wrong_secrets_and_deduplicate(): void
    {
        Queue::fake();
        $u = $this->user();
        $a = $this->assistant($u);
        $i = Integration::create(['public_id' => fake()->uuid(), 'user_id' => $u->id, 'assistant_id' => $a->id, 'channel' => 'telegram', 'name' => 'Bot', 'credentials' => ['token' => 'secret123'], 'webhook_secret' => 'hook123', 'status' => 'connected']);
        $event = ['update_id' => 42, 'message' => ['text' => 'Здравствуйте', 'chat' => ['id' => 101, 'type' => 'private'], 'from' => ['id' => 101, 'is_bot' => false]]];
        $url = '/webhooks/'.$i->public_id;
        $this->postJson($url, $event)->assertForbidden();
        $this->withHeader('X-Telegram-Bot-Api-Secret-Token', 'hook123')->postJson($url, $event)->assertOk();
        $this->postJson($url, $event)->assertOk();
        $this->assertDatabaseCount('webhook_events', 1);
        $job = new ProcessIncomingMessage(DB::table('webhook_events')->value('id'));
        $job->handle(app(Adapters::class));
        $job->handle(app(Adapters::class));
        $this->assertDatabaseCount('messages', 1);
        $this->assertDatabaseCount('conversations', 1);
        Queue::assertPushed(GenerateAssistantReply::class, 1);
    }

    public function test_usage_is_charged_once_and_uses_decimal_rounding(): void
    {
        $u = $this->user();
        config(['assistent.openrouter_key' => 'test-only', 'assistent.usd_rub' => '100.00', 'assistent.markup' => '1.20']);
        DB::table('ai_model_assignments')->insert(['purpose' => 'conversation', 'model' => 'test/model', 'enabled' => true, 'temperature' => 0.2, 'max_tokens' => 500, 'timeout' => 30, 'retry_count' => 0]);
        Http::fake(['openrouter.ai/*' => Http::response(['id' => 'generation1', 'model' => 'test/model', 'choices' => [['message' => ['content' => 'OK']]], 'usage' => ['cost' => '0.00125', 'prompt_tokens' => 10, 'completion_tokens' => 5]])]);
        $ai = app(OpenRouterGateway::class);
        $ai->chat($u->id, 'conversation', [['role' => 'user', 'content' => 'hello']], 'unique-request');
        $ai->chat($u->id, 'conversation', [], 'unique-request');
        Http::assertSentCount(1);
        $this->assertDatabaseHas('wallets', ['user_id' => $u->id, 'balance' => 49985]);
        $this->assertSame(1, DB::table('wallet_transactions')->where('type', 'ai_usage')->count());
        $this->assertSame(1, OpenRouterGateway::charge('0.00000001', '100', '1.2'));
    }

    public function test_low_balance_prevents_provider_request(): void
    {
        $u = $this->user();
        app(WalletLedger::class)->post($u->id, -50000, 'admin_debit', 'empty-wallet');
        config(['assistent.openrouter_key' => 'test-only']);
        DB::table('ai_model_assignments')->insert(['purpose' => 'conversation', 'model' => 'test/model', 'enabled' => true]);
        Http::fake();
        try {
            app(OpenRouterGateway::class)->chat($u->id, 'conversation', [], 'no-funds');
            $this->fail('Expected balance validation');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('balance', $e->errors());
        }
        Http::assertNothingSent();
    }

    public function test_no_knowledge_does_not_invent_and_lead_is_unique(): void
    {
        Queue::fake();
        $u = $this->user();
        $a = $this->assistant($u);
        $c = Conversation::create(['user_id' => $u->id, 'assistant_id' => $a->id]);
        Message::create(['conversation_id' => $c->id, 'role' => 'user', 'content' => 'Хочу купить. Телефон +7 999 123-45-67', 'idempotency_key' => 'lead-incoming']);
        $ai = \Mockery::mock(OpenRouterGateway::class);
        $ai->shouldNotReceive('chat');
        $retriever = \Mockery::mock(Retriever::class);
        $retriever->shouldReceive('search')->once()->andReturn([]);
        $engine = new ConversationEngine($ai, $retriever);
        $engine->reply($c);
        $engine->reply($c);
        $this->assertDatabaseCount('leads', 1);
        $this->assertSame(1, Message::where('role', 'assistant')->count());
        $this->assertStringContainsString('нет точных данных', Message::where('role', 'assistant')->value('content'));
    }

    public function test_handoff_prevents_ai_reply(): void
    {
        $u = $this->user();
        $a = $this->assistant($u);
        $c = Conversation::create(['user_id' => $u->id, 'assistant_id' => $a->id, 'status' => 'manager']);
        Message::create(['conversation_id' => $c->id, 'role' => 'user', 'content' => 'Сколько стоит?', 'idempotency_key' => 'handoff-incoming']);
        Http::fake();
        app(ConversationEngine::class)->reply($c);
        Http::assertNothingSent();
        $this->assertSame(0, Message::where('role', 'assistant')->count());
    }

    public function test_chunking_has_overlap_and_preserves_unicode(): void
    {
        config(['assistent.chunk_chars' => 100, 'assistent.chunk_overlap' => 20]);
        $text = str_repeat('Стоимость доставки — 500 рублей. ', 30);
        $chunks = app(Chunker::class)->split($text);
        $this->assertGreaterThan(2, count($chunks));
        foreach ($chunks as $chunk) {
            $this->assertTrue(mb_check_encoding($chunk));
            $this->assertLessThanOrEqual(100, mb_strlen($chunk));
        }
        $this->assertStringContainsString(mb_substr($chunks[0], -15), $chunks[1]);
    }

    public function test_blocked_users_and_non_admins_cannot_manage_settings(): void
    {
        $u = $this->user();
        $this->actingAs($u)->patchJson('/api/v1/admin/settings',['openrouter_key' => 'bad'])->assertForbidden();
        $u->forceFill(['blocked' => true])->save();
        $this->getJson('/api/v1/assistants')->assertForbidden();
    }
}
