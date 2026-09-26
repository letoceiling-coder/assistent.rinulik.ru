<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->string('role')->default('user');
            $t->boolean('blocked')->default(false);
            $t->boolean('must_change_password')->default(false);
            $t->string('telegram_chat_id')->nullable();
            $t->boolean('lead_notifications')->default(false);
        });
        Schema::create('wallets', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained();
            $t->bigInteger('balance')->default(0);
            $t->timestamps();
        });
        Schema::create('wallet_transactions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('wallet_id')->constrained();
            $t->string('type');
            $t->bigInteger('amount');
            $t->string('idempotency_key')->unique();
            $t->string('description')->nullable();
            $t->timestamps();
        });
        Schema::create('assistants', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->index();
            $t->string('name');
            $t->text('description')->nullable();
            $t->text('goal')->nullable();
            $t->text('instructions')->nullable();
            $t->json('settings')->nullable();
            $t->boolean('active')->default(true);
            $t->timestamps();
            $t->softDeletes();
        });
        Schema::create('knowledge_bases', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->index();
            $t->string('name');
            $t->text('description')->nullable();
            $t->string('status')->default('empty');
            $t->timestamp('indexed_at')->nullable();
            $t->timestamps();
            $t->softDeletes();
        });
        Schema::create('assistant_knowledge_base', function (Blueprint $t) {
            $t->foreignId('assistant_id')->constrained()->cascadeOnDelete();
            $t->foreignId('knowledge_base_id')->constrained()->cascadeOnDelete();
            $t->primary(['assistant_id', 'knowledge_base_id']);
        });
        Schema::create('knowledge_documents', function (Blueprint $t) {
            $t->id();
            $t->foreignId('knowledge_base_id')->constrained()->cascadeOnDelete();
            $t->string('name');
            $t->string('disk')->default('s3');
            $t->string('object_key')->nullable();
            $t->string('mime')->nullable();
            $t->unsignedBigInteger('size')->default(0);
            $t->string('checksum')->nullable();
            $t->longText('extracted_text')->nullable();
            $t->string('status')->default('pending');
            $t->text('error')->nullable();
            $t->timestamp('processing_started_at')->nullable();
            $t->timestamps();
        });
        Schema::create('knowledge_chunks', function (Blueprint $t) {
            $t->id();
            $t->foreignId('knowledge_base_id')->constrained()->cascadeOnDelete();
            $t->foreignId('document_id')->constrained('knowledge_documents')->cascadeOnDelete();
            $t->unsignedInteger('chunk_index');
            $t->text('text');
            $t->unsignedInteger('token_count');
            $t->json('metadata');
            $t->string('embedding_model');
            $t->timestamps();
            $t->unique(['document_id', 'chunk_index']);
        });
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE EXTENSION IF NOT EXISTS vector');
            $dimensions = (int) config('assistent.embedding_dimensions');
            DB::statement("ALTER TABLE knowledge_chunks ADD COLUMN embedding vector($dimensions)");
            DB::statement('CREATE INDEX knowledge_chunks_embedding_idx ON knowledge_chunks USING hnsw (embedding vector_cosine_ops)');
        } else {
            Schema::table('knowledge_chunks', fn (Blueprint $t) => $t->text('embedding')->nullable());
        }
        Schema::create('integrations', function (Blueprint $t) {
            $t->id();
            $t->uuid('public_id')->unique();
            $t->foreignId('user_id')->constrained();
            $t->foreignId('assistant_id')->constrained();
            $t->string('channel');
            $t->string('name');
            $t->text('credentials');
            $t->text('webhook_secret');
            $t->string('status')->default('connecting');
            $t->string('external_id')->nullable();
            $t->text('last_error')->nullable();
            $t->timestamp('last_message_at')->nullable();
            $t->timestamps();
            $t->softDeletes();
            $t->unique(['channel', 'external_id']);
        });
        Schema::create('conversations', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->index();
            $t->foreignId('assistant_id')->constrained();
            $t->foreignId('integration_id')->nullable()->constrained();
            $t->string('channel')->default('playground');
            $t->string('external_chat_id')->nullable();
            $t->string('external_user_id')->nullable();
            $t->string('status')->default('bot_active');
            $t->text('summary')->nullable();
            $t->unsignedBigInteger('summarized_through')->default(0);
            $t->timestamp('last_message_at')->nullable();
            $t->timestamps();
            $t->unique(['integration_id', 'external_chat_id']);
        });
        Schema::create('messages', function (Blueprint $t) {
            $t->id();
            $t->foreignId('conversation_id')->constrained();
            $t->string('role');
            $t->text('content');
            $t->string('idempotency_key')->unique();
            $t->string('status')->default('pending');
            $t->json('metadata')->nullable();
            $t->timestamps();
        });
        Schema::create('ai_models', function (Blueprint $t) {
            $t->string('id')->primary();
            $t->string('name');
            $t->json('pricing');
            $t->unsignedInteger('context_length')->default(0);
            $t->boolean('enabled')->default(false);
            $t->timestamps();
        });
        Schema::create('ai_model_assignments', function (Blueprint $t) {
            $t->string('purpose')->primary();
            $t->string('model')->nullable();
            $t->string('fallback')->nullable();
            $t->decimal('temperature', 3, 2)->default(0.2);
            $t->unsignedInteger('max_tokens')->default(1200);
            $t->unsignedInteger('timeout')->default(60);
            $t->unsignedInteger('retry_count')->default(1);
            $t->boolean('enabled')->default(false);
            $t->timestamps();
        });
        Schema::create('ai_usage', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->string('request_key')->unique();
            $t->string('provider_request_id')->nullable();
            $t->string('purpose');
            $t->string('model');
            $t->string('provider')->nullable();
            $t->unsignedInteger('input_tokens')->default(0);
            $t->unsignedInteger('output_tokens')->default(0);
            $t->decimal('cost_usd', 18, 10)->nullable();
            $t->decimal('conversion_rate', 12, 4);
            $t->decimal('markup', 8, 4);
            $t->bigInteger('charge')->default(0);
            $t->unsignedInteger('latency_ms')->default(0);
            $t->string('status');
            $t->json('response')->nullable();
            $t->timestamps();
        });
        Schema::create('webhook_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('integration_id')->constrained();
            $t->string('external_id');
            $t->json('payload');
            $t->string('status')->default('pending');
            $t->text('error')->nullable();
            $t->timestamps();
            $t->unique(['integration_id', 'external_id']);
        });
        Schema::create('leads', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->foreignId('assistant_id')->constrained();
            $t->foreignId('conversation_id')->unique()->constrained();
            $t->string('channel');
            $t->string('name')->nullable();
            $t->string('phone')->nullable();
            $t->string('email')->nullable();
            $t->text('interest')->nullable();
            $t->text('message');
            $t->string('status')->default('new');
            $t->timestamps();
            $t->softDeletes();
        });
        Schema::create('lead_notifications', function (Blueprint $t) {
            $t->id();
            $t->foreignId('lead_id')->unique()->constrained();
            $t->string('status')->default('pending');
            $t->timestamps();
        });
        Schema::create('connection_tokens', function (Blueprint $t) {
            $t->string('token_hash')->primary();
            $t->foreignId('user_id')->constrained();
            $t->timestamp('expires_at');
        });
        Schema::create('system_settings', function (Blueprint $t) {
            $t->string('key')->primary();
            $t->text('value');
            $t->timestamps();
        });
        Schema::create('audit_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained();
            $t->string('action');
            $t->string('entity')->nullable();
            $t->json('before')->nullable();
            $t->json('after')->nullable();
            $t->string('ip')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['audit_logs', 'system_settings', 'connection_tokens', 'lead_notifications', 'leads', 'webhook_events', 'ai_usage', 'ai_model_assignments', 'ai_models', 'messages', 'conversations', 'integrations', 'knowledge_chunks', 'knowledge_documents', 'assistant_knowledge_base', 'knowledge_bases', 'assistants', 'wallet_transactions', 'wallets'] as $table) {
            Schema::dropIfExists($table);
        }
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['role', 'blocked', 'must_change_password', 'telegram_chat_id', 'lead_notifications']));
    }
};
