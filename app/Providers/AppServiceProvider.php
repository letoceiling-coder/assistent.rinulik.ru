<?php

namespace App\Providers;

use App\Models\Assistant;
use App\Models\Conversation;
use App\Models\Integration;
use App\Models\KnowledgeBase;
use App\Models\Lead;
use App\Policies\OwnedPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Gate::define('admin', fn ($u) => $u->role === 'super_admin' && ! $u->blocked);
        foreach ([Assistant::class, KnowledgeBase::class, Conversation::class, Lead::class, Integration::class] as $model) {
            Gate::policy($model, OwnedPolicy::class);
        }
        RateLimiter::for('auth', fn (Request $r) => [Limit::perMinute(8)->by($r->ip()), Limit::perMinute(5)->by(mb_strtolower((string) $r->email).$r->ip())]);
        Queue::looping(fn () => Cache::put('worker-heartbeat', now()->toIso8601String(), 120));
    }
}
