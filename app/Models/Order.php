<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Order extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'table_id',
        'order_number',
        'type',
        'status',
        'subtotal',
        'tax_amount',
        'service_charge',
        'discount_amount',
        'total_amount',
        'payment_method',
        'payment_status',
        'notes',
        'special_requests',
        'customer_name',
        'customer_phone',
        'delivery_address',
        'rating',
        'review',
        'helpful_count',
        'admin_response',
        'admin_response_date',
        'confirmed_at',
        'ready_at',
        'completed_at'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'service_charge' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'ready_at' => 'datetime',
        'completed_at' => 'datetime',
        'admin_response_date' => 'datetime',
    ];

    // =================== RELATIONSHIPS ===================

    /**
     * Get the user that owns the order
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the table for this order (if dine-in)
     */
    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    /**
     * Get all order items for this order
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // =================== SCOPES ===================

    /**
     * Scope for orders by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for completed orders
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for pending orders
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for orders by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for dine-in orders
     */
    public function scopeDineIn($query)
    {
        return $query->where('type', 'dine-in');
    }

    /**
     * Scope for takeaway orders
     */
    public function scopeTakeaway($query)
    {
        return $query->where('type', 'takeaway');
    }

    /**
     * Scope for orders with reviews
     */
    public function scopeWithReviews($query)
    {
        return $query->whereNotNull('rating');
    }

    /**
     * Scope for orders by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope for today's orders
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', Carbon::today());
    }

    /**
     * Scope for this month's orders
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year);
    }

    // =================== ACCESSORS ===================

    /**
     * Get formatted total amount
     */
    public function getFormattedTotalAttribute()
    {
        return 'Rp ' . number_format($this->total_amount, 0, ',', '.');
    }

    /**
     * Get formatted order number
     */
    public function getFormattedOrderNumberAttribute()
    {
        return $this->order_number ?: 'ORD-' . date('Y') . '-' . str_pad($this->id, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'blue',
            'preparing' => 'orange',
            'ready' => 'purple',
            'completed' => 'green',
            'cancelled' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get status text in Indonesian
     */
    public function getStatusTextAttribute()
    {
        return match($this->status) {
            'pending' => 'Menunggu',
            'confirmed' => 'Dikonfirmasi',
            'preparing' => 'Sedang Diproses',
            'ready' => 'Siap',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default => ucfirst($this->status)
        };
    }

    /**
     * Check if order can be reviewed
     */
    public function getCanBeReviewedAttribute()
    {
        return $this->status === 'completed' && is_null($this->rating);
    }

    /**
     * Check if order can be cancelled
     */
    public function getCanBeCancelledAttribute()
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }

    // =================== HELPER METHODS ===================

    /**
     * Generate order number
     */
    public static function generateOrderNumber()
    {
        $today = Carbon::today();
        $lastOrder = self::whereDate('created_at', $today)
                        ->orderBy('id', 'desc')
                        ->first();
        
        $sequence = $lastOrder ? (int)substr($lastOrder->order_number, -3) + 1 : 1;
        
        return 'ORD-' . $today->format('Ymd') . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Calculate total amount
     */
    public function calculateTotal()
    {
        $subtotal = $this->orderItems->sum('total_price');
        $tax = $subtotal * 0.1; // 10% tax
        $service = $this->type === 'dine-in' ? $subtotal * 0.05 : 0; // 5% service charge for dine-in
        
        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $tax,
            'service_charge' => $service,
            'total_amount' => $subtotal + $tax + $service - $this->discount_amount
        ]);
    }

    /**
     * Update status
     */
    public function updateStatus($status)
    {
        $this->update(['status' => $status]);
        
        // Set timestamp based on status
        switch($status) {
            case 'confirmed':
                $this->update(['confirmed_at' => now()]);
                break;
            case 'ready':
                $this->update(['ready_at' => now()]);
                break;
            case 'completed':
                $this->update(['completed_at' => now()]);
                break;
        }
    }

    /**
     * Add review to order
     */
    public function addReview($rating, $review = null)
    {
        if ($this->status !== 'completed' || !is_null($this->rating)) {
            return false;
        }

        $this->update([
            'rating' => $rating,
            'review' => $review
        ]);

        // Update menu average ratings
        foreach ($this->orderItems as $item) {
            $item->menu->updateAverageRating();
        }

        return true;
    }

    /**
     * Get order summary for display
     */
    public function getSummary()
    {
        return [
            'id' => $this->formatted_order_number,
            'date' => $this->created_at->format('d M Y'),
            'time' => $this->created_at->format('H:i'),
            'items_count' => $this->orderItems->count(),
            'total' => $this->formatted_total,
            'status' => $this->status_text,
            'status_color' => $this->status_color,
        ];
    }

    // =================== BOOT METHOD ===================

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (!$order->order_number) {
                $order->order_number = self::generateOrderNumber();
            }
        });
    }
}