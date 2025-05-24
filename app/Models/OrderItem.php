<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'order_id',
        'menu_id',
        'menu_name',
        'menu_price',
        'quantity',
        'price',
        'total_price',
        'special_instructions',
        'customizations',
        'status'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'menu_price' => 'decimal:2',
        'price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'customizations' => 'array',
    ];

    // =================== RELATIONSHIPS ===================

    /**
     * Get the order that owns the order item
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the menu that this order item refers to
     */
    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

    // =================== SCOPES ===================

    /**
     * Scope for items by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for pending items
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for ready items
     */
    public function scopeReady($query)
    {
        return $query->where('status', 'ready');
    }

    // =================== ACCESSORS ===================

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute()
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get formatted total price
     */
    public function getFormattedTotalPriceAttribute()
    {
        return 'Rp ' . number_format($this->total_price, 0, ',', '.');
    }

    /**
     * Get status text in Indonesian
     */
    public function getStatusTextAttribute()
    {
        return match($this->status) {
            'pending' => 'Menunggu',
            'preparing' => 'Sedang Diproses',
            'ready' => 'Siap',
            'served' => 'Disajikan',
            default => ucfirst($this->status)
        };
    }

    /**
     * Get customizations as formatted string
     */
    public function getCustomizationsStringAttribute()
    {
        return is_array($this->customizations) ? implode(', ', $this->customizations) : '';
    }

    // =================== HELPER METHODS ===================

    /**
     * Calculate total price based on quantity and price
     */
    public function calculateTotalPrice()
    {
        $this->total_price = $this->quantity * $this->price;
        $this->save();
    }

    /**
     * Update status
     */
    public function updateStatus($status)
    {
        $this->update(['status' => $status]);
    }

    // =================== BOOT METHOD ===================

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($orderItem) {
            // Auto-calculate total price
            $orderItem->total_price = $orderItem->quantity * $orderItem->price;
        });

        static::updating(function ($orderItem) {
            // Recalculate total price if quantity or price changes
            if ($orderItem->isDirty(['quantity', 'price'])) {
                $orderItem->total_price = $orderItem->quantity * $orderItem->price;
            }
        });

        static::saved(function ($orderItem) {
            // Update order total when order item is saved
            $orderItem->order->calculateTotal();
        });
    }
}