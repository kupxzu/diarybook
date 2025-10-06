<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiaryComment extends Model
{
    protected $fillable = ['user_id', 'diary_id', 'comment'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function diary()
    {
        return $this->belongsTo(Diary::class);
    }
}
