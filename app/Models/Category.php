<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'image_url',
        'is_active',
        'sort_order'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    // =================== RELATIONSHIPS ===================

    /**
     * Get all menus for this category
     */
    public function menus()
    {
        return $this->hasMany(Menu::class);
    }

    /**
     * Get active menus for this category
     */
    public function activeMenus()
    {
        return $this->hasMany(Menu::class)->where('is_active', true);
    }

    /**
     * Get available menus for this category
     */
    public function availableMenus()
    {
        return $this->hasMany(Menu::class)
                    ->where('is_active', true)
                    ->where('is_available', true);
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

    // =================== SCOPES ===================

    /**
     * Scope for active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordered categories
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
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
     * Get menu count for this category
     */
    public function getMenuCountAttribute()
    {
        return $this->menus()->count();
    }

    /**
     * Get active menu count for this category
     */
    public function getActiveMenuCountAttribute()
    {
        return $this->activeMenus()->count();
    }
}