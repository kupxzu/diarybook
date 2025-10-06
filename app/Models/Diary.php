<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Diary extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'message',
        'status',
    ];

    protected $appends = ['likes_count', 'comments_count'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likes()
    {
        return $this->hasMany(DiaryLike::class);
    }

    public function comments()
    {
        return $this->hasMany(DiaryComment::class);
    }

    public function getLikesCountAttribute()
    {
        // Use loaded relationship if available
        if ($this->relationLoaded('likes')) {
            return $this->likes->count();
        }
        return $this->likes()->count();
    }

    public function getCommentsCountAttribute()
    {
        return $this->comments()->count();
    }
    
    // Check if a specific user has liked this diary
    public function isLikedByUser($userId)
    {
        if (!$userId) {
            return false;
        }
        
        // If likes are loaded, use the collection (faster!)
        if ($this->relationLoaded('likes')) {
            return $this->likes->where('user_id', $userId)->isNotEmpty();
        }
        
        // Otherwise query database
        return $this->likes()->where('user_id', $userId)->exists();
    }
}
