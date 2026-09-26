<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Assistant extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['settings' => 'array', 'active' => 'boolean'];
    }

    public function knowledgeBases()
    {
        return $this->belongsToMany(KnowledgeBase::class);
    }
}
