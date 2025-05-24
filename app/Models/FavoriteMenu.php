<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FavoriteMenu extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'menu_id'
    ];

    /**
     * The table associated with the model.
     */
    protected $table = 'favorite_menus';

    // =================== RELATIONSHIPS ===================

    /**
     * Get the user that owns the favorite menu
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the menu that is favorited
     */
    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

    // =================== SCOPES ===================

    /**
     * Scope for favorites by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for favorites of a specific menu
     */
    public function scopeByMenu($query, $menuId)
    {
        return $query->where('menu_id', $menuId);
    }

    /**
     * Scope for recent favorites
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope for favorites with active menus
     */
    public function scopeWithActiveMenus($query)
    {
        return $query->whereHas('menu', function($q) {
            $q->where('is_active', true);
        });
    }

    /**
     * Scope for favorites with available menus
     */
    public function scopeWithAvailableMenus($query)
    {
        return $query->whereHas('menu', function($q) {
            $q->where('is_active', true)
              ->where('is_available', true);
        });
    }

    // =================== HELPER METHODS ===================

    /**
     * Toggle favorite status for a user and menu
     */
    public static function toggle($userId, $menuId)
    {
        $favorite = self::where('user_id', $userId)
                       ->where('menu_id', $menuId)
                       ->first();

        if ($favorite) {
            $favorite->delete();
            return ['status' => 'removed', 'is_favorite' => false];
        } else {
            self::create([
                'user_id' => $userId,
                'menu_id' => $menuId
            ]);
            return ['status' => 'added', 'is_favorite' => true];
        }
    }

    /**
     * Check if a menu is favorited by a user
     */
    public static function isFavorited($userId, $menuId)
    {
        return self::where('user_id', $userId)
                  ->where('menu_id', $menuId)
                  ->exists();
    }

    /**
     * Get favorite count for a menu
     */
    public static function getFavoriteCount($menuId)
    {
        return self::where('menu_id', $menuId)->count();
    }

    /**
     * Get user's favorite menu IDs
     */
    public static function getUserFavoriteMenuIds($userId)
    {
        return self::where('user_id', $userId)->pluck('menu_id')->toArray();
    }

    /**
     * Get popular favorited menus
     */
    public static function getPopularFavorites($limit = 10)
    {
        return self::select('menu_id', \DB::raw('count(*) as favorite_count'))
                  ->groupBy('menu_id')
                  ->orderBy('favorite_count', 'desc')
                  ->limit($limit)
                  ->with('menu')
                  ->get();
    }

    // =================== BOOT METHOD ===================

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // When a favorite is created, we might want to do something
        static::created(function ($favorite) {
            // Could trigger notifications, analytics, etc.
        });

        // When a favorite is deleted, clean up if needed
        static::deleted(function ($favorite) {
            // Could update counters, trigger events, etc.
        });
    }
}