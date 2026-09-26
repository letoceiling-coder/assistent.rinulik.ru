<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Integration extends Model
{
    use SoftDeletes;

    protected $hidden = ['credentials', 'webhook_secret'];

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['credentials' => 'encrypted:array', 'webhook_secret' => 'encrypted'];
    }
}
