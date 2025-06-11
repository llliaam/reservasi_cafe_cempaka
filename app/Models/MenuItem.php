<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'price',
        'image',
        'description',
        'is_available',
        'is_featured',
        'sort_order'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'is_featured' => 'boolean',
        'sort_order' => 'integer'
    ];

    /**
     * Boot method untuk auto-generate slug
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            if (empty($item->slug)) {
                $item->slug = Str::slug($item->name);
            }
        });
    }

    /**
     * Scope untuk item yang tersedia
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_available', true);
    }

    /**
     * Format harga ke Rupiah
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get image URL with fallback - DEBUGGING VERSION
     */
    public function getImageUrlAttribute(): string
    {
        $imageName = $this->image;
        
        // Debug log
        \Log::info('MenuItem Image Debug:', [
            'item_id' => $this->id,
            'item_name' => $this->name,
            'image_field' => $imageName,
            'public_path_check' => $imageName ? file_exists(public_path('images/poto_menu/' . $imageName)) : false
        ]);
        
        // Path 1: Check di public/images/poto_menu/ 
        if ($imageName && file_exists(public_path('images/poto_menu/' . $imageName))) {
            $url = asset('images/poto_menu/' . $imageName);
            \Log::info('Image found at public path:', ['url' => $url]);
            return $url;
        }
        
        // Path 2: Check di storage (jika ada)
        if ($imageName && file_exists(storage_path('app/public/menu_images/' . $imageName))) {
            return asset('storage/menu_images/' . $imageName);
        }
        
        // Debug: List files in directory
        $menuDir = public_path('images/poto_menu');
        if (is_dir($menuDir)) {
            $files = scandir($menuDir);
            \Log::info('Files in poto_menu directory:', [
                'total_files' => count($files),
                'first_10_files' => array_slice($files, 0, 10)
            ]);
        }
        
        // Fallback ke inline SVG
        \Log::warning('Image not found, using fallback', [
            'requested_image' => $imageName,
            'checked_path' => public_path('images/poto_menu/' . $imageName)
        ]);
        
        return 'data:image/svg+xml;base64,' . base64_encode(
            '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#e5e7eb"/>
                <text x="50%" y="40%" font-family="Arial" font-size="14" fill="#6b7280" text-anchor="middle">Menu Image</text>
                <text x="50%" y="60%" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle">' . ($imageName ?: 'Not Found') . '</text>
            </svg>'
        );
    }

    /**
     * Relasi dengan kategori
     */
    public function category()
    {
        return $this->belongsTo(MenuCategory::class, 'category_id');
    }

    /**
     * Relasi dengan reservation menu items (kompatibel dengan model yang ada)
     */
    public function reservationMenuItems()
    {
        return $this->hasMany(ReservationMenuItem::class, 'menu_item_id');
    }

    /**
     * Relasi dengan favorite menus (hasMany)
     */
    public function favoriteMenus()
    {
        return $this->hasMany(FavoriteMenu::class, 'menu_item_id');
    }

    /**
     * Relasi dengan users yang memfavoritekan menu ini (many-to-many)
     */
    public function favoritedByUsers()
    {
        return $this->belongsToMany(User::class, 'favorite_menus', 'menu_item_id', 'user_id')
                    ->withTimestamps();
    }

    /**
     * Get favorites count for this menu item
     */
    public function getFavoritesCountAttribute()
    {
        return $this->favoriteMenus()->count();
    }

    /**
     * Check if menu item is favorited by specific user
     */
    public function isFavoritedBy($userId)
    {
        return $this->favoriteMenus()->where('user_id', $userId)->exists();
    }

    /**
     * Scope untuk menu yang paling banyak difavoritekan
     */
    public function scopePopularFavorites(Builder $query, $limit = 10)
    {
        return $query->withCount('favoriteMenus')
                    ->orderBy('favorite_menus_count', 'desc')
                    ->limit($limit);
    }

    /**
     * Scope untuk menu dengan rating tinggi dan banyak difavoritekan
     */
    public function scopeTrending(Builder $query)
    {
        return $query->withCount('favoriteMenus')
                    ->where('is_available', true)
                    ->where('favorite_menus_count', '>', 0)
                    ->orderBy('favorite_menus_count', 'desc');
    }

    /**
     * Check if menu item can be deleted
     */
    public function canBeDeleted(): bool
    {
        return !$this->reservationMenuItems()->exists();
    }

    /**
     * Generate filename for uploaded image
     */
    public static function generateImageFilename($originalName, $menuName)
    {
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $cleanMenuName = Str::slug($menuName);
        $timestamp = time();
        return $cleanMenuName . '-' . $timestamp . '.' . $extension;
    }

    /**
     * Save uploaded image
     */
    public static function saveMenuImage($uploadedFile, $menuName)
    {
        if (!$uploadedFile) return null;
        
        $filename = self::generateImageFilename($uploadedFile->getClientOriginalName(), $menuName);
        $uploadedFile->move(public_path('images/poto_menu'), $filename);
        
        return $filename;
    }

    /**
     * Delete menu image
     */
    public function deleteImage()
    {
        if ($this->image && file_exists(public_path('images/poto_menu/' . $this->image))) {
            unlink(public_path('images/poto_menu/' . $this->image));
        }
    }
}