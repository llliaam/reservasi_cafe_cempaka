<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfflineOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'offline_order_id',
        'menu_item_id',
        'menu_item_name',
        'menu_item_price',
        'quantity',
        'subtotal',
        'special_instructions'
    ];

    protected $casts = [
        'menu_item_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'quantity' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($orderItem) {
            $orderItem->subtotal = $orderItem->menu_item_price * $orderItem->quantity;
        });
    }

    public function offlineOrder(): BelongsTo
    {
        return $this->belongsTo(OfflineOrder::class);
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->menu_item_price, 0, ',', '.');
    }

    public function getFormattedSubtotalAttribute(): string
    {
        return 'Rp ' . number_format($this->subtotal, 0, ',', '.');
    }
}