<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [];
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function assistant()
    {
        return $this->belongsTo(Assistant::class);
    }
}
