<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class UserReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'menu_item_id',
        'rating',
        'comment',
        'helpful_count',
        'is_verified',
        'is_featured',
        'admin_response',
        'admin_response_date',
        'admin_response_by',
        'metadata',
        'reviewed_at'
    ];

    protected $casts = [
        'rating' => 'integer',
        'helpful_count' => 'integer',
        'is_verified' => 'boolean',
        'is_featured' => 'boolean',
        'admin_response_date' => 'datetime',
        'reviewed_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($review) {
            if (!$review->reviewed_at) {
                $review->reviewed_at = now();
            }
        });
    }

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function adminResponder()
    {
        return $this->belongsTo(User::class, 'admin_response_by');
    }

    /**
     * Scopes
     */
    public function scopeByRating(Builder $query, $rating)
    {
        return $query->where('rating', $rating);
    }

    public function scopeVerified(Builder $query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeFeatured(Builder $query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeWithResponse(Builder $query)
    {
        return $query->whereNotNull('admin_response');
    }

    public function scopeRecent(Builder $query, $days = 30)
    {
        return $query->where('reviewed_at', '>=', now()->subDays($days));
    }

    public function scopePopular(Builder $query)
    {
        return $query->where('helpful_count', '>', 0)
                    ->orderBy('helpful_count', 'desc');
    }

    /**
     * Accessor & Mutators
     */
    public function getCanEditAttribute()
    {
        return $this->reviewed_at->diffInDays(now()) <= 7;
    }

    public function getFormattedDateAttribute()
    {
        return $this->reviewed_at->format('d M Y');
    }

    public function getFormattedDateTimeAttribute()
    {
        return $this->reviewed_at->format('d M Y H:i');
    }

    public function getHasResponseAttribute()
    {
        return !is_null($this->admin_response);
    }

    public function getResponseInfoAttribute()
    {
        if (!$this->admin_response) {
            return null;
        }

        return [
            'text' => $this->admin_response,
            'date' => $this->admin_response_date ? $this->admin_response_date->format('d M Y') : null,
            'author' => $this->adminResponder ? $this->adminResponder->name : 'Admin Team'
        ];
    }

    /**
     * Helper Methods
     */
    public function canBeEdited()
    {
        return $this->can_edit;
    }

    public function canBeDeleted()
    {
        return $this->can_edit;
    }

    public function incrementHelpful()
    {
        $this->increment('helpful_count');
        return $this;
    }

    public function markAsVerified()
    {
        $this->update(['is_verified' => true]);
        return $this;
    }

    public function markAsFeatured()
    {
        $this->update(['is_featured' => true]);
        return $this;
    }

    public function addAdminResponse($response, $adminId = null)
    {
        $this->update([
            'admin_response' => $response,
            'admin_response_date' => now(),
            'admin_response_by' => $adminId ?? auth()->id(),
        ]);

        return $this;
    }

    public function removeAdminResponse()
    {
        $this->update([
            'admin_response' => null,
            'admin_response_date' => null,
            'admin_response_by' => null,
        ]);

        return $this;
    }

    /**
     * Static methods
     */
    public static function getAverageRating($userId = null)
    {
        $query = static::query();
        
        if ($userId) {
            $query->where('user_id', $userId);
        }
        
        return $query->avg('rating') ?? 0;
    }

    public static function getRatingDistribution($userId = null)
    {
        $query = static::query();
        
        if ($userId) {
            $query->where('user_id', $userId);
        }
        
        $distribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $distribution[$i] = (clone $query)->where('rating', $i)->count();
        }
        
        return $distribution;
    }

    public static function getRecentStats($days = 30)
    {
        $recent = static::recent($days)->get();
        
        return [
            'total' => $recent->count(),
            'average_rating' => $recent->avg('rating') ?? 0,
            'total_helpful' => $recent->sum('helpful_count'),
            'with_response' => $recent->whereNotNull('admin_response')->count(),
        ];
    }
}