<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Menu extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'image_url',
        'is_available',
        'is_active',
        'cooking_time',
        'average_rating',
        'total_orders',
        'ingredients',
        'allergens',
        'is_spicy',
        'is_vegetarian',
        'is_vegan',
        'calories',
        'sort_order'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'is_active' => 'boolean',
        'is_spicy' => 'boolean',
        'is_vegetarian' => 'boolean',
        'is_vegan' => 'boolean',
        'average_rating' => 'decimal:2',
        'ingredients' => 'array',
        'allergens' => 'array',
    ];

    // =================== RELATIONSHIPS ===================

    /**
     * Get the category that owns the menu
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all order items for this menu
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get users who favorited this menu (many-to-many)
     */
    public function favoriteUsers()
    {
        return $this->belongsToMany(User::class, 'favorite_menus')
                    ->withTimestamps();
    }

    /**
     * Get favorite menu records
     */
    public function favorites()
    {
        return $this->hasMany(FavoriteMenu::class);
    }

    // =================== MUTATORS ===================

    /**
     * Set the name attribute and auto-generate slug
     */
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = $value;
        $this->attributes['slug'] = Str::slug($value);
    }

    // =================== ACCESSORS ===================

    /**
     * Get the formatted price
     */
    public function getFormattedPriceAttribute()
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get the image URL or default
     */
    public function getImageAttribute()
    {
        return $this->image_url ?: '/images/default-menu.jpg';
    }

    /**
     * Check if menu is favorited by specific user
     */
    public function isFavoritedByUser($userId)
    {
        return $this->favoriteUsers()->where('user_id', $userId)->exists();
    }

    // =================== SCOPES ===================

    /**
     * Scope for active menus
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for available menus
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope for popular menus
     */
    public function scopePopular($query, $limit = 10)
    {
        return $query->orderBy('total_orders', 'desc')
                    ->orderBy('average_rating', 'desc')
                    ->limit($limit);
    }

    /**
     * Scope for highly rated menus
     */
    public function scopeHighlyRated($query, $minRating = 4.0)
    {
        return $query->where('average_rating', '>=', $minRating)
                    ->orderBy('average_rating', 'desc');
    }

    /**
     * Scope for search
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    /**
     * Scope for dietary filters
     */
    public function scopeVegetarian($query)
    {
        return $query->where('is_vegetarian', true);
    }

    public function scopeVegan($query)
    {
        return $query->where('is_vegan', true);
    }

    public function scopeSpicy($query)
    {
        return $query->where('is_spicy', true);
    }

    // =================== HELPER METHODS ===================

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    /**
     * Update average rating
     */
    public function updateAverageRating()
    {
        $avgRating = $this->orderItems()
                          ->whereHas('order', function($query) {
                              $query->whereNotNull('rating');
                          })
                          ->join('orders', 'order_items.order_id', '=', 'orders.id')
                          ->avg('orders.rating');

        $this->update(['average_rating' => $avgRating ?? 0]);
    }

    /**
     * Increment total orders
     */
    public function incrementTotalOrders($quantity = 1)
    {
        $this->increment('total_orders', $quantity);
    }
}