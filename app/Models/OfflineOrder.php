<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Carbon\Carbon;

class OfflineOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_code',
        'created_by_staff',
        'customer_name',
        'customer_phone',
        'customer_email',
        'order_type',
        'table_id',
        'notes',
        'subtotal',
        'service_fee',
        'total_amount',
        'payment_method',
        'payment_status',
        'status',
        'order_time',
        'estimated_ready_time',
        'completed_at'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'service_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'order_time' => 'datetime',
        'estimated_ready_time' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Constants
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_PREPARING = 'preparing';
    const STATUS_READY = 'ready';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($order) {
            if (!$order->order_code) {
                $order->order_code = static::generateOrderCode();
            }
            if (!$order->order_time) {
                $order->order_time = now();
            }
        });
    }

    public static function generateOrderCode(): string
    {
        do {
            $code = 'OFF-' . date('Ymd') . '-' . strtoupper(Str::random(4));
        } while (static::where('order_code', $code)->exists());
        
        return $code;
    }

    // Relationships
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_staff');
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class, 'table_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OfflineOrderItem::class);
    }

    // Accessors
    public function getFormattedTotalAttribute(): string
    {
        return 'Rp ' . number_format($this->total_amount, 0, ',', '.');
    }

    public function getStatusLabelAttribute(): string
    {
        $labels = [
            self::STATUS_CONFIRMED => 'Dikonfirmasi',
            self::STATUS_PREPARING => 'Sedang Diproses',
            self::STATUS_READY => 'Siap Diambil',
            self::STATUS_COMPLETED => 'Selesai',
            self::STATUS_CANCELLED => 'Dibatalkan'
        ];

        return $labels[$this->status] ?? $this->status;
    }

    public function calculateEstimatedTime(): void
    {
        $totalItems = $this->items->sum('quantity');
        $baseTime = 15; // 15 minutes base time
        $additionalTime = max(0, ($totalItems - 1) * 3); // 3 minutes per additional item
        
        $this->estimated_ready_time = $this->order_time->addMinutes($baseTime + $additionalTime);
        $this->save();
    }

    public function updateStatus(string $status): bool
    {
        $this->status = $status;
        
        if ($status === self::STATUS_COMPLETED && !$this->completed_at) {
            $this->completed_at = now();
        }
        
        $result = $this->save();
        
        // Update table status
        if ($result && $this->table_id) {
            $this->updateTableStatus();
        }
        
        return $result;
    }

    private function updateTableStatus(): void
    {
        if (!$this->table_id || $this->order_type !== 'dine_in') {
            return;
        }

        $table = $this->table;
        if (!$table) return;

        switch ($this->status) {
            case self::STATUS_CONFIRMED:
            case self::STATUS_PREPARING:
            case self::STATUS_READY:
                $table->update(['status' => 'occupied']);
                break;
                
            case self::STATUS_COMPLETED:
            case self::STATUS_CANCELLED:
                $table->update(['status' => 'available']);
                break;
        }
    }
}