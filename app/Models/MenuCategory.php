<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class MenuCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer'
    ];

    /**
     * Boot method untuk auto-generate slug
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    /**
     * Scope untuk kategori yang aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Relasi dengan menu items
     */
    public function menuItems()
    {
        return $this->hasMany(MenuItem::class, 'category_id');
    }

    /**
     * Get available menu items in this category
     */
    public function availableMenuItems()
    {
        return $this->menuItems()->where('is_available', true);
    }

    /**
     * Get image URL with fallback
     */
    public function getImageUrlAttribute()
    {
        if ($this->image && file_exists(public_path('images/categories/' . $this->image))) {
            return asset('images/categories/' . $this->image);
        }
        
        return "https://via.placeholder.com/300x200/fbbf24/ffffff?text=" . urlencode($this->name);
    }

    /**
     * Get menu items count
     */
    public function getMenuItemsCountAttribute()
    {
        return $this->menuItems()->count();
    }

    /**
     * Get available menu items count
     */
    public function getAvailableMenuItemsCountAttribute()
    {
        return $this->availableMenuItems()->count();
    }
}