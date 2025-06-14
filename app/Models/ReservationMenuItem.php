<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReservationMenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'menu_item_id',
        'menu_item_name',
        'menu_item_price',
        'quantity',
        'subtotal',
    ];

    protected $casts = [
        'menu_item_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    /**
     * Relasi dengan reservation
     */
    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    /**
     * TAMBAHAN: Relasi dengan menu item
     */
    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->menu_item_price, 0, ',', '.');
    }

    /**
     * Get formatted subtotal
     */
    public function getFormattedSubtotalAttribute(): string
    {
        return 'Rp ' . number_format($this->subtotal, 0, ',', '.');
    }

    /**
     * Calculate subtotal automatically before saving
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($reservationMenuItem) {
            $reservationMenuItem->subtotal = $reservationMenuItem->menu_item_price * $reservationMenuItem->quantity;
        });
    }
}
