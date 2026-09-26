<?php

use App\Jobs\GenerateAssistantReply;
use App\Jobs\ProcessIncomingMessage;
use App\Jobs\ProcessKnowledgeDocument;
use App\Jobs\SendIntegrationMessage;
use App\Models\User;
use App\Services\OpenRouterGateway;
use App\Services\RegisterUser;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Artisan::command('assistent:admin', function () {
    $password = config('assistent.admin_password');
    if (! $password || strlen($password) < 12) {
        $this->error('Set ADMIN_INITIAL_PASSWORD (at least 12 characters) in the server environment.');

        return 1;
    }
    $email = config('assistent.admin_email');
    if (User::where('email', $email)->exists()) {
        $this->info('Administrator already exists; password was not changed.');

        return 0;
    }
    $u = app(RegisterUser::class)->execute(['name' => 'Джон Уик', 'email' => $email, 'password' => $password]);
    $u->forceFill(['role' => 'super_admin', 'must_change_password' => true])->save();
    $this->info('Administrator created. Change initial password on first login.');
});
Artisan::command('assistent:recover', function () {
    Cache::put('scheduler-heartbeat', now()->toIso8601String(), 180);
    DB::table('webhook_events')->where('status', 'pending')->where('created_at', '<', now()->subMinute())->limit(100)->pluck('id')->each(fn ($id) => ProcessIncomingMessage::dispatch($id));
    DB::table('knowledge_documents')->where('status', 'pending')->where('created_at', '<', now()->subMinute())->limit(20)->pluck('id')->each(fn ($id) => ProcessKnowledgeDocument::dispatch($id));
    DB::table('messages')->where('role', 'user')->where('status', 'pending')->where('created_at', '<', now()->subMinutes(2))->distinct()->limit(100)->pluck('conversation_id')->each(fn ($id) => GenerateAssistantReply::dispatch($id));
    DB::table('messages')->where('status', 'pending_delivery')->where('created_at', '<', now()->subMinutes(2))->limit(100)->pluck('id')->each(fn ($id) => SendIntegrationMessage::dispatch($id));
    DB::table('connection_tokens')->where('expires_at', '<', now())->delete();
});
Artisan::command('assistent:sync-models', function () {
    $this->info((string) app(OpenRouterGateway::class)->syncModels());
});
Schedule::command('assistent:recover')->everyMinute()->withoutOverlapping();
Schedule::command('assistent:sync-models')->dailyAt('03:15')->withoutOverlapping();
