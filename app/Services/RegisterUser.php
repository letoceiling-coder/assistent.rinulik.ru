<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class RegisterUser
{
    public function execute(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create($data);
            DB::table('wallets')->insert(['user_id' => $user->id, 'balance' => 0, 'created_at' => now(), 'updated_at' => now()]);
            app(WalletLedger::class)->post($user->id, 50000, 'registration_bonus', 'registration:'.$user->id, 'Бонус за регистрацию');

            return $user;
        });
    }
}
