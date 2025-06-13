<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_code',
        'customer_name',
        'customer_phone',
        'customer_email',
        'order_type',
        'delivery_address',
        'notes',
        'subtotal',
        'delivery_fee',
        'service_fee',
        'total_amount',
        'payment_method',
        'payment_status',
        'payment_proof',
        'status',
        'order_time',
        'estimated_ready_time',
        'completed_at',
        'rating',
        'review',
        'reviewed_at',
        'table_id',
        'created_by_staff'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'service_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'order_time' => 'datetime',
        'estimated_ready_time' => 'datetime',
        'completed_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'rating' => 'integer'
    ];

    /**
     * Constants for order statuses
     */
    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_PREPARING = 'preparing';
    const STATUS_READY = 'ready';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Constants for order types
     */
    const TYPE_DINE_IN = 'dine_in';
    const TYPE_TAKEAWAY = 'takeaway';
    const TYPE_DELIVERY = 'delivery';

    /**
     * Constants for payment statuses
     */
    const PAYMENT_PENDING = 'pending';
    const PAYMENT_PAID = 'paid';
    const PAYMENT_FAILED = 'failed';

    /**
     * Constants for payment methods
     */
    const PAYMENT_CASH = 'cash';
    const PAYMENT_DANA = 'dana';
    const PAYMENT_GOPAY = 'gopay';
    const PAYMENT_OVO = 'ovo';
    const PAYMENT_SHOPEEPAY = 'shopeepay';
    const PAYMENT_BCA = 'bca';
    const PAYMENT_MANDIRI = 'mandiri';
    const PAYMENT_BNI = 'bni';
    const PAYMENT_BRI = 'bri';
    const PAYMENT_BSI = 'bsi';

    /**
     * Generate unique order code
     */
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

        static::updated(function ($order) {
            // Auto set completed_at when status changes to completed
            if ($order->isDirty('status') && $order->status === self::STATUS_COMPLETED && !$order->completed_at) {
                $order->completed_at = now();
                $order->saveQuietly(); // Avoid infinite loop
            }
        });
    }

    /**
     * Generate kode order unik
     */
    public static function generateOrderCode(): string
    {
        do {
            $code = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(4));
        } while (static::where('order_code', $code)->exists());

        return $code;
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Relasi dengan User (Customer)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Alternative relationship name for customer
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }


    /**
     * Relasi dengan Order Items
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Alternative relationship name for items
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Relasi dengan UserReview (jika menggunakan tabel terpisah)
     */
    public function userReview(): HasOne
    {
        return $this->hasOne(UserReview::class);
    }

    /**
     * Alternative relationship name for review
     */
    public function review(): HasOne
    {
        return $this->hasOne(UserReview::class);
    }

    /**
     * Relasi dengan Payment (jika ada tabel payment terpisah)
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Relasi dengan multiple payments (untuk partial payments)
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Relasi dengan Order Tracking/History
     */
    public function orderTracking(): HasMany
    {
        return $this->hasMany(OrderTracking::class);
    }

    /**
     * Alternative relationship name for tracking
     */
    public function trackingHistory(): HasMany
    {
        return $this->hasMany(OrderTracking::class)->orderBy('created_at', 'asc');
    }

    /**
     * Relasi dengan Delivery (jika ada tabel delivery terpisah)
     */
    public function delivery(): HasOne
    {
        return $this->hasOne(Delivery::class);
    }

    /**
     * Relasi dengan Driver (melalui delivery)
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Relasi dengan Table (jika dine-in)
     */
    public function table(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class, 'table_id');
    }

    /**
     * Relasi dengan Staff yang membuat offline order
     */
    public function createdByStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_staff');
    }

    /**
     * Relasi dengan Coupon/Discount (jika ada sistem discount)
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * Relasi dengan Order Discounts
     */
    public function discounts(): HasMany
    {
        return $this->hasMany(OrderDiscount::class);
    }

    /**
     * Relasi dengan Notifications (polymorphic)
     */
    public function notifications(): MorphMany
    {
        return $this->morphMany(Notification::class, 'notifiable');
    }

    /**
     * Relasi dengan Activities/Logs (polymorphic)
     */
    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    /**
     * Relasi dengan Files/Attachments (polymorphic) - untuk payment proof, etc
     */
    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    /**
     * Get payment proof file
     */
    public function paymentProofFile(): HasOne
    {
        return $this->hasOne(Attachment::class, 'attachable_id')
                    ->where('attachable_type', self::class)
                    ->where('type', 'payment_proof');
    }

    // ==================== SCOPES ====================

    /**
     * Scope untuk filter berdasarkan status
     */
    public function scopeByStatus(Builder $query, $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk multiple statuses
     */
    public function scopeByStatuses(Builder $query, array $statuses): Builder
    {
        return $query->whereIn('status', $statuses);
    }

    /**
     * Scope untuk filter berdasarkan order type
     */
    public function scopeByOrderType(Builder $query, $type): Builder
    {
        return $query->where('order_type', $type);
    }

    /**
     * Scope untuk filter berdasarkan payment status
     */
    public function scopeByPaymentStatus(Builder $query, $status): Builder
    {
        return $query->where('payment_status', $status);
    }

    /**
     * Scope untuk order hari ini
     */
    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('order_time', today());
    }

    /**
     * Scope untuk order dalam range tanggal
     */
    public function scopeDateRange(Builder $query, $startDate, $endDate): Builder
    {
        return $query->whereBetween('order_time', [$startDate, $endDate]);
    }

    /**
     * Scope untuk order yang sudah selesai
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope untuk order yang aktif (belum selesai/cancel)
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNotIn('status', [self::STATUS_COMPLETED, self::STATUS_CANCELLED]);
    }

    /**
     * Scope untuk order yang bisa direview
     */
    public function scopeReviewable(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_COMPLETED)
                    ->whereNull('rating');
    }

    /**
     * Scope untuk order dengan review
     */
    public function scopeWithReview(Builder $query): Builder
    {
        return $query->whereNotNull('rating');
    }

    /**
     * Scope untuk order delivery
     */
    public function scopeDelivery(Builder $query): Builder
    {
        return $query->where('order_type', self::TYPE_DELIVERY);
    }

    /**
     * Scope untuk order dine-in
     */
    public function scopeDineIn(Builder $query): Builder
    {
        return $query->where('order_type', self::TYPE_DINE_IN);
    }

    /**
     * Scope untuk order takeaway
     */
    public function scopeTakeaway(Builder $query): Builder
    {
        return $query->where('order_type', self::TYPE_TAKEAWAY);
    }

    /**
     * Scope dengan eager loading relationships yang sering digunakan
     */
    public function scopeWithCommonRelations(Builder $query): Builder
    {
        return $query->with(['user', 'orderItems.menuItem', 'userReview']);
    }

    // ==================== ACCESSORS & MUTATORS ====================

    /**
     * Get formatted total amount
     */
    public function getFormattedTotalAttribute(): string
    {
        return 'Rp ' . number_format($this->total_amount, 0, ',', '.');
    }

    /**
     * Get formatted subtotal
     */
    public function getFormattedSubtotalAttribute(): string
    {
        return 'Rp ' . number_format($this->subtotal, 0, ',', '.');
    }

    /**
     * Get formatted delivery fee
     */
    public function getFormattedDeliveryFeeAttribute(): string
    {
        return 'Rp ' . number_format($this->delivery_fee, 0, ',', '.');
    }

    /**
     * Get order type label
     */
    public function getOrderTypeLabelAttribute(): string
    {
        $labels = [
            self::TYPE_DINE_IN => 'Makan di Tempat',
            self::TYPE_TAKEAWAY => 'Bawa Pulang',
            self::TYPE_DELIVERY => 'Delivery'
        ];

        return $labels[$this->order_type] ?? $this->order_type;
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        $labels = [
            self::STATUS_PENDING => 'Menunggu Konfirmasi',
            self::STATUS_CONFIRMED => 'Dikonfirmasi',
            self::STATUS_PREPARING => 'Sedang Diproses',
            self::STATUS_READY => 'Siap Diambil',
            self::STATUS_COMPLETED => 'Selesai',
            self::STATUS_CANCELLED => 'Dibatalkan'
        ];

        return $labels[$this->status] ?? $this->status;
    }

    /**
     * Get payment status label
     */
    public function getPaymentStatusLabelAttribute(): string
    {
        $labels = [
            self::PAYMENT_PENDING => 'Belum Bayar',
            self::PAYMENT_PAID => 'Sudah Bayar',
            self::PAYMENT_FAILED => 'Gagal Bayar'
        ];

        return $labels[$this->payment_status] ?? $this->payment_status;
    }

     /**
     * Get payment method label
     */
    public function getPaymentMethodLabelAttribute(): string
    {
        $labels = [
            self::PAYMENT_CASH => 'Bayar di Tempat',
            self::PAYMENT_DANA => 'DANA',
            self::PAYMENT_GOPAY => 'GoPay',
            self::PAYMENT_OVO => 'OVO',
            self::PAYMENT_SHOPEEPAY => 'ShopeePay',
            self::PAYMENT_BCA => 'BCA Mobile/Internet Banking',
            self::PAYMENT_MANDIRI => 'Mandiri Mobile/Internet Banking',
            self::PAYMENT_BNI => 'BNI Mobile/Internet Banking',
            self::PAYMENT_BRI => 'BRI Mobile/Internet Banking',
            self::PAYMENT_BSI => 'BSI Mobile/Internet Banking',
        ];

        return $labels[$this->payment_method] ?? $this->payment_method;
    }

    /**
     * Check if payment method requires proof
     */
    public function requiresPaymentProof(): bool
    {
        return $this->payment_method !== self::PAYMENT_CASH;
    }

     /**
     * Get payment instructions based on method
     */
    public function getPaymentInstructionsAttribute(): array
    {
        $instructions = [
            self::PAYMENT_CASH => [
                'title' => 'Pembayaran di Tempat',
                'steps' => [
                    'Datang ke lokasi resto',
                    'Bayar saat pesanan siap atau saat makan'
                ]
            ],
            self::PAYMENT_DANA => [
                'title' => 'Transfer via DANA',
                'steps' => [
                    'Buka aplikasi DANA',
                    'Transfer ke nomor: 081234567890',
                    'Nominal: Rp ' . number_format($this->total_amount, 0, ',', '.'),
                    'Upload bukti transfer'
                ]
            ],
            self::PAYMENT_GOPAY => [
                'title' => 'Transfer via GoPay',
                'steps' => [
                    'Buka aplikasi Gojek/GoPay',
                    'Transfer ke nomor: 081234567890',
                    'Nominal: Rp ' . number_format($this->total_amount, 0, ',', '.'),
                    'Upload bukti transfer'
                ]
            ],
            self::PAYMENT_BCA => [
                'title' => 'Transfer via BCA',
                'steps' => [
                    'Login ke BCA Mobile/KlikBCA',
                    'Transfer ke rekening: 1234567890',
                    'Atas nama: Cempaka Cafe',
                    'Nominal: Rp ' . number_format($this->total_amount, 0, ',', '.'),
                    'Upload bukti transfer'
                ]
            ],
            // Add more payment methods...
        ];

        return $instructions[$this->payment_method] ?? [];
    }

     /**
     * Static method to get all payment methods
     */
    public static function getAllPaymentMethods(): array
    {
        return [
            self::PAYMENT_CASH => 'Bayar di Tempat',
            self::PAYMENT_DANA => 'DANA',
            self::PAYMENT_GOPAY => 'GoPay',
            self::PAYMENT_OVO => 'OVO',
            self::PAYMENT_SHOPEEPAY => 'ShopeePay',
            self::PAYMENT_BCA => 'BCA Mobile/Internet Banking',
            self::PAYMENT_MANDIRI => 'Mandiri Mobile/Internet Banking',
            self::PAYMENT_BNI => 'BNI Mobile/Internet Banking',
            self::PAYMENT_BRI => 'BRI Mobile/Internet Banking',
            self::PAYMENT_BSI => 'BSI Mobile/Internet Banking',
        ];
    }

    /**
     * Check if payment method is e-wallet
     */
    public function isEWallet(): bool
    {
        return in_array($this->payment_method, [
            self::PAYMENT_DANA,
            self::PAYMENT_GOPAY,
            self::PAYMENT_OVO,
            self::PAYMENT_SHOPEEPAY
        ]);
    }

    /**
     * Check if payment method is mobile banking
     */
    public function isMobileBanking(): bool
    {
        return in_array($this->payment_method, [
            self::PAYMENT_BCA,
            self::PAYMENT_MANDIRI,
            self::PAYMENT_BNI,
            self::PAYMENT_BRI,
            self::PAYMENT_BSI
        ]);
    }

    /**
     * Get grouped payment methods for UI
     */
    public static function getGroupedPaymentMethods(): array
    {
        return [
            'cash' => [
                'title' => 'Bayar di Tempat',
                'methods' => [
                    self::PAYMENT_CASH => 'Bayar di Tempat'
                ]
            ],
            'ewallet' => [
                'title' => 'E-Wallet',
                'methods' => [
                    self::PAYMENT_DANA => 'DANA',
                    self::PAYMENT_GOPAY => 'GoPay',
                    self::PAYMENT_OVO => 'OVO',
                    self::PAYMENT_SHOPEEPAY => 'ShopeePay',
                ]
            ],
            'banking' => [
                'title' => 'Mobile/Internet Banking',
                'methods' => [
                    self::PAYMENT_BCA => 'BCA',
                    self::PAYMENT_MANDIRI => 'Mandiri',
                    self::PAYMENT_BNI => 'BNI',
                    self::PAYMENT_BRI => 'BRI',
                    self::PAYMENT_BSI => 'BSI',
                ]
            ]
        ];
    }


    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        $colors = [
            self::STATUS_PENDING => 'yellow',
            self::STATUS_CONFIRMED => 'blue',
            self::STATUS_PREPARING => 'orange',
            self::STATUS_READY => 'green',
            self::STATUS_COMPLETED => 'gray',
            self::STATUS_CANCELLED => 'red'
        ];

        return $colors[$this->status] ?? 'gray';
    }

    /**
     * UPDATED: Get table name for dine-in orders
     */
    public function getTableName(): ?string
    {
        return $this->table ? $this->table->meja_name : null;
    }

    /**
     * UPDATED: Auto-assign table for dine-in orders
     */
    public function assignTableForDineIn(): void
    {
        if ($this->order_type !== self::TYPE_DINE_IN || $this->table_id) {
            return; // Not dine-in or already has table
        }

        // Find available table that can accommodate the order
        // For orders, we estimate 2-4 people per order (can be adjusted)
        $estimatedPeople = max(2, min(4, $this->total_items));

        $availableTable = RestaurantTable::active()
            ->available()
            ->minCapacity($estimatedPeople)
            ->orderBy('capacity', 'asc')
            ->first();

        if ($availableTable) {
            $this->table_id = $availableTable->id;
            $this->save();

            // Mark table as occupied when order is confirmed
            if (in_array($this->status, [self::STATUS_CONFIRMED, self::STATUS_PREPARING])) {
                $availableTable->markOccupied();
            }
        }
    }
     /**
     * UPDATED: Update table status based on order status
     */
    // === PERBAIKI METHOD updateTableStatus ===
public function updateTableStatus(): void
{
    // CEK APAKAH ADA TABLE DAN ORDER TYPE DINE IN
    if (!$this->table_id || $this->order_type !== self::TYPE_DINE_IN) {
        return;
    }

    // AMBIL TABLE OBJECT, BUKAN STRING
    $table = $this->table; // Ini akan return RestaurantTable object melalui relationship

    if (!$table) {
        return; // Table tidak ditemukan
    }

    switch ($this->status) {
        case self::STATUS_CONFIRMED:
        case self::STATUS_PREPARING:
        case self::STATUS_READY:
            // PASTIKAN GUNAKAN METHOD YANG ADA DI MODEL RestaurantTable
            $table->update(['status' => 'occupied']);
            break;

        case self::STATUS_COMPLETED:
        case self::STATUS_CANCELLED:
            $table->update(['status' => 'available']);
            break;

        default:
            // For pending status, don't change table status yet
            break;
    }
}

    /**
     * Get total items count
     */
    public function getTotalItemsAttribute(): int
    {
        return $this->orderItems->sum('quantity');
    }

    /**
     * Get main menu name (first item)
     */
    public function getMainMenuNameAttribute(): ?string
    {
        return $this->orderItems->first()?->menuItem?->name;
    }

    /**
     * Get order duration (from order to completion)
     */
    public function getOrderDurationAttribute(): ?int
    {
        if (!$this->completed_at) {
            return null;
        }

        return $this->order_time->diffInMinutes($this->completed_at);
    }

    /**
     * Get estimated remaining time
     */
    public function getEstimatedRemainingTimeAttribute(): ?int
    {
        if (!$this->estimated_ready_time || $this->status === self::STATUS_COMPLETED) {
            return null;
        }

        $remaining = now()->diffInMinutes($this->estimated_ready_time, false);
        return max(0, $remaining);
    }

    /**
     * Check if order is overdue
     */
    public function getIsOverdueAttribute(): bool
    {
        return $this->estimated_ready_time &&
               now()->isAfter($this->estimated_ready_time) &&
               $this->status !== self::STATUS_COMPLETED;
    }

    /**
     * Get short order code (last 4 characters)
     */
    public function getShortCodeAttribute(): string
    {
        return substr($this->order_code, -4);
    }

    // ==================== HELPER METHODS ====================

    /**
 * Check if this is an offline order (created by staff)
 */
public function isOfflineOrder(): bool
{
    return is_null($this->user_id) && !is_null($this->created_by_staff);
}

/**
 * Check if this is an online order (created by customer)
 */
public function isOnlineOrder(): bool
{
    return !is_null($this->user_id) && is_null($this->created_by_staff);
}

/**
 * Get order source label
 */
public function getOrderSourceAttribute(): string
{
    if ($this->isOfflineOrder()) {
        return 'Offline (Staff)';
    } elseif ($this->isOnlineOrder()) {
        return 'Online (Customer)';
    } else {
        return 'Unknown';
    }
}

    /**
     * Check if order can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }

    /**
     * Check if order can be reviewed
     */
    public function canBeReviewed(): bool
    {
        return $this->status === self::STATUS_COMPLETED && !$this->rating && !$this->userReview;
    }

    /**
     * Check if order has review
     */
    public function hasReview(): bool
    {
        return $this->rating || $this->userReview;
    }

    /**
     * Check if order is paid
     */
    public function isPaid(): bool
    {
        return $this->payment_status === self::PAYMENT_PAID;
    }

    /**
     * Check if order needs payment
     */
    public function needsPayment(): bool
    {
        return $this->payment_status === self::PAYMENT_PENDING;
    }

    /**
     * Check if order is delivery
     */
    public function isDelivery(): bool
    {
        return $this->order_type === self::TYPE_DELIVERY;
    }

    /**
     * Check if order is dine-in
     */
    public function isDineIn(): bool
    {
        return $this->order_type === self::TYPE_DINE_IN;
    }

    /**
     * Check if order is takeaway
     */
    public function isTakeaway(): bool
    {
        return $this->order_type === self::TYPE_TAKEAWAY;
    }

    /**
     * Calculate estimated ready time
     */
    public function calculateEstimatedTime(): void
    {
        $totalItems = $this->total_items;
        $baseTime = 15; // 15 minutes base time
        $additionalTime = max(0, ($totalItems - 1) * 3); // 3 minutes per additional item

        // Add extra time for delivery orders
        if ($this->isDelivery()) {
            $additionalTime += 10; // Extra 10 minutes for delivery prep
        }

        $this->estimated_ready_time = $this->order_time->addMinutes($baseTime + $additionalTime);
        $this->save();
    }

    /**
     * UPDATED: Override updateStatus to handle table status
     */
    public function updateStatus(string $status, string $notes = null): bool
    {
        $oldStatus = $this->status;
        $this->status = $status;

        if ($status === self::STATUS_COMPLETED && !$this->completed_at) {
            $this->completed_at = now();
        }

        $result = $this->save();

        // Update table status when order status changes
        if ($result && $oldStatus !== $status) {
            $this->updateTableStatus();
            $this->logStatusChange($oldStatus, $status, $notes);
        }

        return $result;
    }

    /**
     * Log status change to tracking history
     */
    protected function logStatusChange(string $oldStatus, string $newStatus, string $notes = null): void
    {
        if (class_exists('App\Models\OrderTracking')) {
            $this->orderTracking()->create([
                'status' => $newStatus,
                'notes' => $notes,
                'changed_by' => auth()->id(),
                'changed_at' => now(),
            ]);
        }
    }

    /**
     * Cancel order
     */
    public function cancel(string $reason = null): bool
    {
        if (!$this->canBeCancelled()) {
            return false;
        }

        return $this->updateStatus(self::STATUS_CANCELLED, $reason);
    }

    /**
     * Complete order
     */
    public function complete(): bool
    {
        return $this->updateStatus(self::STATUS_COMPLETED);
    }

     /**
     * UPDATED: Get order summary for display (includes table info)
     */
    public function getSummary(): array
    {
        return [
            'code' => $this->order_code,
            'short_code' => $this->short_code,
            'customer' => $this->customer_name,
            'type' => $this->order_type_label,
            'status' => $this->status_label,
            'payment_status' => $this->payment_status_label,
            'total' => $this->formatted_total,
            'items_count' => $this->total_items,
            'order_time' => $this->order_time->format('d/m/Y H:i'),
            'estimated_ready' => $this->estimated_ready_time?->format('H:i'),
            'is_overdue' => $this->is_overdue,
            'table_name' => $this->getTableName(), // ADDED
            'table_number' => $this->table?->table_number, // ADDED
            'table_location' => $this->table?->full_location, // ADDED
        ];
    }

    /**
     * Get order items summary
     */
    public function getItemsSummary(): array
    {
        return $this->orderItems->map(function ($item) {
            return [
                'name' => $item->menuItem->name,
                'quantity' => $item->quantity,
                'price' => $item->formatted_price,
                'subtotal' => $item->formatted_subtotal,
                'notes' => $item->notes,
            ];
        })->toArray();
    }

    /**
     * Static method to get all possible statuses
     */
    public static function getAllStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_CONFIRMED,
            self::STATUS_PREPARING,
            self::STATUS_READY,
            self::STATUS_COMPLETED,
            self::STATUS_CANCELLED,
        ];
    }

    /**
     * Static method to get all order types
     */
    public static function getAllOrderTypes(): array
    {
        return [
            self::TYPE_DINE_IN,
            self::TYPE_TAKEAWAY,
            self::TYPE_DELIVERY,
        ];
    }

    /**
     * Static method to get all payment statuses
     */
    public static function getAllPaymentStatuses(): array
    {
        return [
            self::PAYMENT_PENDING,
            self::PAYMENT_PAID,
            self::PAYMENT_FAILED,
        ];
    }
}
