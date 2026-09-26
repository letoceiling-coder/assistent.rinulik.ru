<?php

namespace App\Http\Controllers;

use App\Models\Assistant;
use App\Models\Integration;
use App\Services\Messaging\Adapters;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class IntegrationController extends Controller
{
    public function index(Request $r)
    {
        return Integration::where('user_id', $r->user()->id)->latest()->paginate(30);
    }

    public function store(Request $r, Adapters $adapters)
    {
        $data = $r->validate(['assistant_id' => 'required|integer', 'channel' => 'required|in:telegram,max', 'token' => 'required|string|max:500|regex:/^[A-Za-z0-9_:.\-]+$/']);
        $a = Assistant::findOrFail($data['assistant_id']);
        Gate::authorize('manage', $a);
        $adapter = $adapters->for($data['channel']);
        try {
            $identity = $adapter->validateCredentials(['token' => $data['token']]);
        } catch (\Throwable $e) {
            abort(422, $e->getMessage());
        }
        abort_if(Integration::withTrashed()->where('channel', $data['channel'])->where('external_id', (string) $identity['id'])->exists(), 422, 'Этот бот уже подключён. Откройте существующее подключение.');
        $i = Integration::create(['public_id' => (string) Str::uuid(), 'user_id' => $r->user()->id, 'assistant_id' => $a->id, 'channel' => $data['channel'], 'name' => $identity['username'] ?? $data['channel'], 'external_id' => (string) $identity['id'], 'credentials' => ['token' => $data['token']], 'webhook_secret' => Str::random(48), 'status' => 'connecting']);
        try {
            $adapter->registerWebhook($i);
            $i->update(['status' => 'connected']);
        } catch (\Throwable $e) {
            $i->update(['status' => 'error', 'last_error' => $e->getMessage()]);
        }

        return response()->json($i, 201);
    }

    public function reconnect(Integration $integration, Adapters $adapters)
    {
        Gate::authorize('manage', $integration);
        try {
            $adapters->for($integration->channel)->registerWebhook($integration);
            $integration->update(['status' => 'connected', 'last_error' => null]);
        } catch (\Throwable $e) {
            $integration->update(['status' => 'error', 'last_error' => $e->getMessage()]);
        }

        return $integration;
    }

    public function disconnect(Integration $integration, Adapters $adapters)
    {
        Gate::authorize('manage', $integration);
        try {
            $adapters->for($integration->channel)->disconnect($integration);
        } catch (\Throwable $e) {
            abort(422, $e->getMessage());
        }
        $integration->update(['status' => 'disabled']);

        return $integration;
    }
}
