<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WalletLedger
{
    public function post(int $userId, int $amount, string $type, string $key, string $description = ''): int
    {
        return DB::transaction(function () use ($userId, $amount, $type, $key, $description) {
            $wallet = DB::table('wallets')->where('user_id', $userId)->lockForUpdate()->first();
            if (! $wallet) {
                throw new \LogicException('Wallet missing');
            }
            $existing = DB::table('wallet_transactions')->where('idempotency_key', $key)->first();
            if ($existing) {
                if ($existing->wallet_id !== $wallet->id || (int) $existing->amount !== $amount) {
                    throw new \LogicException('Idempotency conflict');
                }

                return (int) $wallet->balance;
            }
            $balance = (int) $wallet->balance + $amount;
            if ($balance < 0 && $type !== 'ai_usage') {
                throw ValidationException::withMessages(['balance' => 'Недостаточно средств на балансе.']);
            }
            DB::table('wallet_transactions')->insert(['wallet_id' => $wallet->id, 'type' => $type, 'amount' => $amount, 'idempotency_key' => $key, 'description' => $description, 'created_at' => now(), 'updated_at' => now()]);
            DB::table('wallets')->where('id', $wallet->id)->update(['balance' => $balance, 'updated_at' => now()]);

            return $balance;
        });
    }
}
