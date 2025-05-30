<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FavoriteMenu extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'menu_item_id'
    ];

    /**
     * Relasi dengan User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi dengan MenuItem
     */
    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }

    /**
     * Scope untuk mendapatkan favorite menu berdasarkan user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope untuk mendapatkan favorite menu dengan menu item yang tersedia
     */
    public function scopeWithAvailableMenus($query)
    {
        return $query->whereHas('menuItem', function($q) {
            $q->where('is_available', true);
        });
    }

    /**
     * Static method untuk toggle favorite
     */
    public static function toggleFavorite($userId, $menuItemId)
    {
        $favorite = self::where('user_id', $userId)
                       ->where('menu_item_id', $menuItemId)
                       ->first();

        if ($favorite) {
            $favorite->delete();
            return false; // Removed from favorites
        } else {
            self::create([
                'user_id' => $userId,
                'menu_item_id' => $menuItemId
            ]);
            return true; // Added to favorites
        }
    }

    /**
     * Static method untuk check apakah menu sudah di-favorite
     */
    public static function isFavorited($userId, $menuItemId)
    {
        return self::where('user_id', $userId)
                  ->where('menu_item_id', $menuItemId)
                  ->exists();
    }
}