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
     * Get all orders for the user
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get all reservations for the user
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get all favorite menus for the user
     */
    public function favoriteMenus()
    {
        return $this->hasMany(FavoriteMenu::class);
    }

    /**
     * Get menus that user has favorited (many-to-many)
     */
    public function favoritedMenus()
    {
        return $this->belongsToMany(Menu::class, 'favorite_menus')
                    ->withTimestamps();
    }

    /**
     * Check if user has favorited a specific menu
     */
    public function hasFavorited($menuId)
    {
        return $this->favoriteMenus()->where('menu_id', $menuId)->exists();
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
        return $this->orders()
                    ->whereNotNull('rating')
                    ->avg('rating') ?? 0;
    }

    /**
     * Get total reviews count
     */
    public function getTotalReviewsAttribute()
    {
        return $this->orders()
                    ->whereNotNull('rating')
                    ->count();
    }

    /**
     * Scope for active users
     */
    public function scopeActive($query)
    {
        return $query->whereNotNull('email_verified_at');
    }
}