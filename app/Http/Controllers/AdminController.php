<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\OpenRouterGateway;
use App\Services\Settings;
use App\Services\WalletLedger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    private function audit(Request $r, string $action, string $entity, mixed $before, mixed $after): void
    {
        DB::table('audit_logs')->insert(['user_id' => $r->user()->id, 'action' => $action, 'entity' => $entity, 'before' => json_encode($before), 'after' => json_encode($after), 'ip' => $r->ip(), 'created_at' => now(), 'updated_at' => now()]);
    }

    public function dashboard()
    {
        $counts = [];
        foreach (['users', 'assistants', 'knowledge_bases', 'knowledge_documents', 'conversations', 'messages', 'integrations', 'leads', 'failed_jobs'] as $t) {
            $counts[$t] = DB::table($t)->count();
        }
        $counts['total_balance'] = (int) DB::table('wallets')->sum('balance');
        $counts['ai_cost_usd'] = DB::table('ai_usage')->sum('cost_usd');
        $counts['usage_charge'] = (int) DB::table('ai_usage')->sum('charge');
        $counts['daily'] = DB::table('ai_usage')->selectRaw('DATE(created_at) as day, count(*) as requests, sum(charge) as charge')->where('created_at', '>=', now()->subDays(30))->groupByRaw('DATE(created_at)')->orderBy('day')->get();

        return $counts;
    }

    public function users(Request $r)
    {
        return User::query()->select('id', 'name', 'email', 'role', 'blocked', 'created_at')->when($r->q, fn ($q) => $q->where('email', 'like', '%'.mb_substr($r->q, 0, 100).'%'))->latest()->paginate(40);
    }

    public function user(Request $r, User $user, WalletLedger $ledger)
    {
        $data = $r->validate(['blocked' => 'sometimes|boolean', 'amount' => 'sometimes|integer|between:-100000000,100000000', 'request_id' => 'required_with:amount|uuid', 'description' => 'required_with:amount|string|max:200']);
        abort_if($user->role === 'super_admin' && ($data['blocked'] ?? false), 422, 'Нельзя заблокировать системного администратора.');
        DB::transaction(function () use ($r, $user, $ledger, $data) {
            if (array_key_exists('blocked', $data)) {
                $before = $user->blocked;
                $user->forceFill(['blocked' => $data['blocked']])->save();
                $this->audit($r, 'user.block', (string) $user->id, $before, $data['blocked']);
            }
            if (isset($data['amount'])) {
                $ledger->post($user->id, $data['amount'], $data['amount'] >= 0 ? 'admin_credit' : 'admin_debit', 'admin:'.$data['request_id'], $data['description']);
                $this->audit($r, 'wallet.adjust', (string) $user->id, null, ['amount' => $data['amount'], 'reason' => $data['description']]);
            }
        });

        return ['ok' => true];
    }

    public function settings(Settings $settings)
    {
        return ['openrouter_configured' => (bool) $settings->get('openrouter_key', config('assistent.openrouter_key')), 's3_configured' => (bool) config('filesystems.disks.s3.key'), 'usd_rub' => $settings->get('usd_rub', config('assistent.usd_rub')), 'markup' => $settings->get('markup', config('assistent.markup')), 'similarity_threshold' => $settings->get('similarity_threshold', config('assistent.similarity_threshold')), 'minimum_balance' => $settings->get('minimum_balance', 0), 'request_reserve_kopecks' => $settings->get('request_reserve_kopecks', config('assistent.request_reserve_kopecks')), 'assignments' => DB::table('ai_model_assignments')->get()];
    }

    public function saveSettings(Request $r, Settings $settings)
    {
        $data = $r->validate(['openrouter_key' => 'nullable|string|max:300', 'usd_rub' => 'sometimes|numeric|min:1|max:10000', 'markup' => 'sometimes|numeric|min:1|max:100', 'similarity_threshold' => 'sometimes|numeric|min:0|max:1', 'minimum_balance' => 'sometimes|integer|min:0', 'request_reserve_kopecks' => 'sometimes|integer|min:100|max:100000']);
        foreach ($data as $key => $value) {
            if ($value === null || $value === '') {
                continue;
            } $before = $key === 'openrouter_key' ? '[redacted]' : $settings->get($key);
            $settings->set($key, $value);
            $this->audit($r, 'settings.update', $key, $before, $key === 'openrouter_key' ? '[redacted]' : $value);
        }

return ['ok' => true];
    }

    public function models(Request $r)
    {
        return DB::table('ai_models')->when($r->q, fn ($q) => $q->where('id', 'like', '%'.mb_substr($r->q, 0, 100).'%'))->orderBy('name')->paginate(100);
    }

    public function sync(OpenRouterGateway $ai)
    {
        return ['count' => $ai->syncModels()];
    }

    public function assignment(Request $r, string $purpose)
    {
        abort_unless(in_array($purpose, ['conversation', 'knowledge_processing', 'knowledge_generator', 'assistant_generator', 'embedding', 'lead_detection', 'summary', 'grounding']), 404);
        $data = $r->validate(['model' => 'required|string|max:200', 'fallback' => 'nullable|string|max:200', 'temperature' => 'required|numeric|min:0|max:2', 'max_tokens' => 'required|integer|min:100|max:16000', 'timeout' => 'required|integer|min:10|max:90', 'retry_count' => 'required|integer|min:0|max:2', 'enabled' => 'required|boolean']);
        $before = DB::table('ai_model_assignments')->where('purpose', $purpose)->first();
        DB::table('ai_model_assignments')->updateOrInsert(['purpose' => $purpose], $data + ['updated_at' => now()]);
        $this->audit($r, 'ai.routing', $purpose, $before, $data);

        return ['ok' => true];
    }

    public function auditLogs()
    {
        return DB::table('audit_logs')->latest()->paginate(50);
    }

    public function health()
    {
        $health = [];
        try {
            DB::select('select 1');
            $health['postgres'] = 'ok';
        } catch (\Throwable) {
            $health['postgres'] = 'error';
        }
        try {
            Cache::put('health-check', 'ok', 30);
            $health['redis'] = Cache::get('health-check') === 'ok' ? 'ok' : 'error';
        } catch (\Throwable) {
            $health['redis'] = 'error';
        }
        $health['scheduler'] = Cache::get('scheduler-heartbeat') ? 'ok' : 'unknown';
        $health['worker'] = Cache::get('worker-heartbeat') ? 'ok' : 'unknown';
        $health['s3'] = config('filesystems.disks.s3.key') ? 'configured_not_verified' : 'not_configured';
        $health['openrouter'] = app(Settings::class)->get('openrouter_key', config('assistent.openrouter_key')) ? 'configured_not_verified' : 'not_configured';
        $health['failed_jobs'] = DB::table('failed_jobs')->count();
        $health['uncertain_ai'] = DB::table('ai_usage')->whereIn('status',['started', 'uncertain', 'cost_pending'])->count();
        $health['pending_webhooks'] = DB::table('webhook_events')->where('status','pending')->count();

        return $health;
    }
}
