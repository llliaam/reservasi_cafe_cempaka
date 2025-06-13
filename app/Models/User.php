<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'role',
        'password',
        'phone',
        'date_of_birth',
        'address',
        'avatar',
        'preferences',
        'loyalty_points',
        'is_active'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'preferences' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is staff
     */
    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }

    /**
     * Check if user is customer
     */
    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    /**
     * Check if user has admin or staff role
     */
    public function hasManagementAccess(): bool
    {
        return in_array($this->role, ['admin', 'staff']);
    }

    /**
     * Get all orders for the user
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get all reviews for the user
     */
    public function reviews()
    {
        return $this->hasMany(UserReview::class);
    }

    /**
     * Get all reservations for the user
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get all favorite menus for the user (hasMany relationship)
     */
    public function favoriteMenus()
    {
        return $this->hasMany(FavoriteMenu::class);
    }

    /**
     * Get menus that user has favorited (many-to-many through pivot)
     */
    public function favoritedMenuItems()
    {
        return $this->belongsToMany(MenuItem::class, 'favorite_menus', 'user_id', 'menu_item_id')
                    ->withTimestamps();
    }

    /**
     * Check if user has favorited a specific menu
     */
    public function hasFavorited($menuItemId)
    {
        return $this->favoriteMenus()->where('menu_item_id', $menuItemId)->exists();
    }

    /**
     * Add menu to favorites
     */
    public function addToFavorites($menuItemId)
    {
        if (!$this->hasFavorited($menuItemId)) {
            return $this->favoriteMenus()->create([
                'menu_item_id' => $menuItemId
            ]);
        }
        return false;
    }

    /**
     * Remove menu from favorites
     */
    public function removeFromFavorites($menuItemId)
    {
        return $this->favoriteMenus()->where('menu_item_id', $menuItemId)->delete();
    }

    /**
     * Toggle favorite status
     */
    public function toggleFavorite($menuItemId)
    {
        return FavoriteMenu::toggleFavorite($this->id, $menuItemId);
    }

    /**
     * Get favorite menus count
     */
    public function getFavoriteMenusCountAttribute()
    {
        return $this->favoriteMenus()->count();
    }

    /**
     * Get completed orders count
     */
    public function getCompletedOrdersCountAttribute()
    {
        return $this->orders()->where('status', 'completed')->count();
    }

    /**
     * Get total spent amount
     */
    public function getTotalSpentAttribute()
    {
        return $this->orders()
                    ->where('status', 'completed')
                    ->sum('total_amount');
    }

    /**
     * Get average rating given by user
     */
    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    /**
     * Get total reviews count
     */
    public function getTotalReviewsAttribute()
    {
        return $this->reviews()->count();
    }

    /**
     * Get total helpful count from all reviews
     */
    public function getTotalHelpfulAttribute()
    {
        return $this->reviews()->sum('helpful_count');
    }

    /**
     * Get reviews with admin response count
     */
    public function getReviewsWithResponseCountAttribute()
    {
        return $this->reviews()->whereNotNull('admin_response')->count();
    }

    /**
     * Get pending orders count
     */
    public function getPendingOrdersCountAttribute()
    {
        return $this->orders()->whereIn('status', ['pending', 'confirmed', 'preparing'])->count();
    }

    /**
     * Get rating distribution for user's reviews
     */
    public function getRatingDistributionAttribute()
    {
        return UserReview::getRatingDistribution($this->id);
    }

    /**
     * Get orders that can be reviewed
     */
    public function getReviewableOrdersAttribute()
    {
        return $this->orders()
                    ->where('status', 'completed')
                    ->whereDoesntHave('userReview')
                    ->with(['orderItems.menu'])
                    ->orderBy('created_at', 'desc')
                    ->get();
    }

    /**
     * Get recent reviews
     */
    public function getRecentReviewsAttribute($limit = 5)
    {
        return $this->reviews()
                    ->with(['order.orderItems.menu', 'menuItem'])
                    ->latest('reviewed_at')
                    ->limit($limit)
                    ->get();
    }

    /**
     * Check if user can review a specific order
     */
    public function canReviewOrder($orderId)
    {
        $order = $this->orders()->find($orderId);

        if (!$order || $order->status !== 'completed') {
            return false;
        }

        return !$this->reviews()->where('order_id', $orderId)->exists();
    }

    /**
     * Create a review for an order
     */
    public function createReview($orderId, $rating, $comment = null, $menuItemId = null)
    {
        if (!$this->canReviewOrder($orderId)) {
            return false;
        }

        $order = $this->orders()->find($orderId);

        // Jika menu_item_id tidak disediakan, ambil item pertama dari order
        if (!$menuItemId && $order->orderItems->isNotEmpty()) {
            $menuItemId = $order->orderItems->first()->menu_item_id;
        }

        return $this->reviews()->create([
            'order_id' => $orderId,
            'menu_item_id' => $menuItemId,
            'rating' => $rating,
            'comment' => $comment,
        ]);
    }

    /**
     * Scope for active users
     */
    public function scopeActive($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    /**
     * Scope for admins
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    /**
     * Scope for staff
     */
    public function scopeStaff($query)
    {
        return $query->where('role', 'staff');
    }

    /**
     * Scope for customers
     */
    public function scopeCustomers($query)
    {
        return $query->where('role', 'customer');
    }

    /**
     * Scope for management (admin + staff)
     */
    public function scopeManagement($query)
    {
        return $query->whereIn('role', ['admin', 'staff']);
    }
}
