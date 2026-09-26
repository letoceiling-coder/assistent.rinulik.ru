<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KnowledgeDocument extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [];
    }

    public function knowledgeBase()
    {
        return $this->belongsTo(KnowledgeBase::class);
    }
}
