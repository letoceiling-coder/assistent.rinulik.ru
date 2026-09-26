<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class OwnedPolicy
{
    public function manage(User $user, Model $model): bool
    {
        return ! $user->blocked && (int) $model->user_id === (int) $user->id;
    }
}
