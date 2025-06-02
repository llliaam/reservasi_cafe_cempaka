<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'special_requests',
        'package_id',
        'table_id', // ADDED: Foreign key to restaurant_tables
        'reservation_date',
        'reservation_time',
        'number_of_people',
        'table_location',
        'package_price',
        'menu_subtotal',
        'total_price',
        'payment_method',
        'proof_of_payment',
        'additional_images',
        'reservation_code',
        'status',
    ];

    protected $casts = [
        'reservation_date' => 'date',
        'reservation_time' => 'datetime:H:i',
        'package_price' => 'decimal:2',
        'menu_subtotal' => 'decimal:2',
        'total_price' => 'decimal:2',
        'additional_images' => 'array',
    ];

    // Constants for reservation statuses
    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_COMPLETED = 'completed';

    // Generate unique reservation code
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($reservation) {
            $reservation->reservation_code = static::generateReservationCode();
            
            // IMPROVED AUTO-ASSIGN TABLE dengan kriteria yang lebih ketat
            if (!$reservation->table_id) {
                $reservation->autoAssignBestTable();
            }
        });

        static::updated(function ($reservation) {
            // Update table status when reservation status changes
            if ($reservation->isDirty('status') && $reservation->table) {
                $reservation->updateTableStatus();
            }
        });
    }

    /**
 * IMPROVED: Auto-assign meja terbaik berdasarkan kriteria yang ketat
 */
public function autoAssignBestTable(): void
{
    // Validasi data yang dibutuhkan
    if (!$this->package_id || !$this->table_location || !$this->reservation_date || !$this->reservation_time) {
        \Log::warning('Incomplete data for table assignment', [
            'reservation_id' => $this->id,
            'package_id' => $this->package_id,
            'table_location' => $this->table_location,
            'reservation_date' => $this->reservation_date,
            'reservation_time' => $this->reservation_time
        ]);
        return;
    }

    try {
        // Dapatkan informasi package untuk max_people
        $package = \App\Models\ReservationPackage::find($this->package_id);
        if (!$package) {
            \Log::warning("Package not found: {$this->package_id}");
            return;
        }

        $requiredCapacity = $package->max_people;
        $location = $this->table_location;
        $reservationDate = $this->reservation_date;
        $reservationTime = $this->reservation_time;

        \Log::info('Looking for table with criteria:', [
            'location' => $location,
            'required_capacity' => $requiredCapacity,
            'date' => $reservationDate,
            'time' => $reservationTime->format('H:i')
        ]);

        // Cari meja yang cocok dengan query yang lebih spesifik
        $suitableTable = $this->findBestAvailableTable($location, $requiredCapacity, $reservationDate, $reservationTime);

        if ($suitableTable) {
            $this->table_id = $suitableTable->id;
            \Log::info("Table assigned successfully", [
                'reservation_id' => $this->id,
                'table_id' => $suitableTable->id,
                'table_number' => $suitableTable->table_number,
                'capacity' => $suitableTable->capacity
            ]);
        } else {
            \Log::warning('No suitable table found', [
                'location' => $location,
                'required_capacity' => $requiredCapacity,
                'date' => $reservationDate,
                'time' => $reservationTime->format('H:i')
            ]);
        }

    } catch (\Exception $e) {
        \Log::error('Error in auto table assignment: ' . $e->getMessage(), [
            'reservation_data' => [
                'package_id' => $this->package_id,
                'table_location' => $this->table_location,
                'number_of_people' => $this->number_of_people
            ]
        ]);
    }
}

/**
 * Cari meja terbaik yang tersedia dengan kriteria ketat
 */
private function findBestAvailableTable($location, $requiredCapacity, $reservationDate, $reservationTime)
{
    // Query untuk mencari meja yang memenuhi semua kriteria
    $query = \App\Models\RestaurantTable::query()
        ->where('location_type', $location)           // Sesuai lokasi yang dipilih user
        ->where('capacity', '>=', $requiredCapacity)  // Kapasitas minimal sesuai package
        ->where('status', 'available')                // Status available
        ->where('is_active', true);                   // Meja aktif

    // Cek konflik dengan reservasi lain pada tanggal dan waktu yang sama
    $query->whereNotExists(function ($subQuery) use ($reservationDate, $reservationTime) {
        $subQuery->select(\DB::raw(1))
            ->from('reservations')
            ->whereColumn('reservations.table_id', 'restaurant_tables.id')
            ->where('reservations.reservation_date', $reservationDate)
            ->where('reservations.status', '!=', 'cancelled')
            ->where(function ($timeQuery) use ($reservationTime) {
                // Buffer 2 jam sebelum dan sesudah untuk menghindari konflik
                $startBuffer = $reservationTime->copy()->subHours(2);
                $endBuffer = $reservationTime->copy()->addHours(2);
                
                $timeQuery->whereBetween('reservations.reservation_time', [
                    $startBuffer->format('H:i:s'),
                    $endBuffer->format('H:i:s')
                ]);
            });
    });

    // Urutkan berdasarkan kapasitas (prioritas meja terkecil yang cukup)
    // dan nomor meja (untuk konsistensi)
    $availableTables = $query->orderBy('capacity', 'asc')
                            ->orderBy('table_number', 'asc')
                            ->get();

    \Log::info('Available tables found:', [
        'count' => $availableTables->count(),
        'tables' => $availableTables->map(function($table) {
            return [
                'id' => $table->id,
                'number' => $table->table_number,
                'capacity' => $table->capacity,
                'location' => $table->location_type
            ];
        })->toArray()
    ]);

    // Ambil meja terbaik (kapasitas terkecil yang cukup)
    return $availableTables->first();
}

    // ==================== RELATIONSHIPS ====================

    /**
     * Relationship dengan User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship dengan ReservationPackage
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(ReservationPackage::class, 'package_id');
    }

    /**
     * NEW: Relationship dengan RestaurantTable
     */
    public function table(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class, 'table_id');
    }

    /**
     * Relationship dengan Menu Items
     */
    public function menuItems(): HasMany
    {
        return $this->hasMany(ReservationMenuItem::class);
    }

    // ==================== NEW: TABLE MANAGEMENT METHODS ====================

    /**
     * AUTO-ASSIGN suitable table based on package and location preference
     */
    public function assignSuitableTable(): void
    {
        if (!$this->package || !$this->table_location) {
            return;
        }

        $suitableTable = RestaurantTable::findSuitableTable(
            $this->table_location,
            $this->package->max_people,
            $this->reservation_date,
            $this->reservation_time->format('H:i')
        );

        if ($suitableTable) {
            $this->table_id = $suitableTable->id;
        }
    }

    /**
     * Manually assign table to reservation
     */
    /**
 * IMPROVED: Manually assign table dengan validasi yang lebih ketat
 */
    public function assignTable(\App\Models\RestaurantTable $table): bool
    {
        try {
            // Validasi package
            if (!$this->package) {
                $this->load('package');
            }
            
            if (!$this->package) {
                \Log::error("Cannot assign table: package not found for reservation {$this->id}");
                return false;
            }

            // Cek kapasitas
            if (!$table->canAccommodate($this->package->max_people)) {
                \Log::warning("Table capacity insufficient", [
                    'table_capacity' => $table->capacity,
                    'required_capacity' => $this->package->max_people
                ]);
                return false;
            }

            // Cek lokasi
            if ($table->location_type !== $this->table_location) {
                \Log::warning("Table location mismatch", [
                    'table_location' => $table->location_type,
                    'required_location' => $this->table_location
                ]);
                return false;
            }

            // Cek status meja
            if ($table->status !== 'available') {
                \Log::warning("Table not available", [
                    'table_status' => $table->status,
                    'table_id' => $table->id
                ]);
                return false;
            }

            // Cek konflik waktu
            if (!$this->isTableAvailableAtTime($table)) {
                \Log::warning("Table has time conflict", [
                    'table_id' => $table->id,
                    'reservation_date' => $this->reservation_date,
                    'reservation_time' => $this->reservation_time
                ]);
                return false;
            }

            // FIXED: Update old table status if exists
            if ($this->table_id && $this->table_id !== $table->id) {
                $oldTable = \App\Models\RestaurantTable::find($this->table_id);
                if ($oldTable) {
                    $oldTable->updateStatus('available');
                }
            }

            // Assign new table
            $this->table_id = $table->id;
            
            // FIXED: Clear the table relationship cache to force reload
            $this->unsetRelation('table');
            
            $result = $this->save();

            if ($result) {
                // FIXED: Load the fresh table relationship
                $this->load('table');
                $this->updateTableStatus();
                
                \Log::info("Table assigned successfully", [
                    'reservation_id' => $this->id,
                    'table_id' => $table->id,
                    'table_number' => $table->table_number
                ]);
            }

            return $result;

        } catch (\Exception $e) {
            \Log::error('Error assigning table: ' . $e->getMessage(), [
                'reservation_id' => $this->id,
                'table_id' => $table->id,
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Check if table is available at reservation time
     */
private function isTableAvailableAtTime(\App\Models\RestaurantTable $table): bool
{
    $conflictingReservations = Reservation::where('table_id', $table->id)
        ->where('reservation_date', $this->reservation_date)
        ->where('status', '!=', 'cancelled')
        ->where('id', '!=', $this->id) // Exclude current reservation
        ->where(function ($query) {
            // Check for time conflicts dengan buffer 2 jam
            $startTime = $this->reservation_time->copy()->subHours(2);
            $endTime = $this->reservation_time->copy()->addHours(2);
            
            $query->whereBetween('reservation_time', [
                $startTime->format('H:i:s'),
                $endTime->format('H:i:s')
            ]);
        })
        ->exists();

    return !$conflictingReservations;
}

    /**
     * Update table status based on reservation status
     */
    public function updateTableStatus(): void
    {
        // FIXED: Check if table_id exists and properly load the table relationship
        if (!$this->table_id) {
            return;
        }

        try {
            // FIXED: Ensure we have the actual table model, not just the ID
            $table = null;
            
            // Try to get from loaded relationship first
            if ($this->relationLoaded('table') && $this->table) {
                $table = $this->table;
            } else {
                // Load the table manually if not loaded
                $table = \App\Models\RestaurantTable::find($this->table_id);
            }

            // FIXED: Check if table object exists before calling methods
            if (!$table || !is_object($table)) {
                \Log::warning("Table not found or is not an object for reservation {$this->id}", [
                    'table_id' => $this->table_id,
                    'table_type' => gettype($table),
                    'table_value' => $table
                ]);
                return;
            }

            $now = now();
            
            // FIXED: Safe date handling with null checks
            if (!$this->reservation_date || !$this->reservation_time) {
                \Log::warning("Reservation date/time missing for reservation {$this->id}");
                return;
            }

            try {
                $reservationDateTime = $this->reservation_date->setTimeFromTimeString($this->reservation_time->format('H:i:s'));
            } catch (\Exception $e) {
                \Log::error("Error creating reservation datetime: " . $e->getMessage());
                return;
            }

            switch ($this->status) {
                case self::STATUS_CONFIRMED:
                    // If reservation is today and within 1 hour, mark as reserved
                    if ($reservationDateTime->isToday() && $reservationDateTime->diffInHours($now) <= 1) {
                        $table->updateStatus('reserved');
                    } else {
                        $table->updateStatus('available'); // Keep available until closer to time
                    }
                    break;
                    
                case self::STATUS_CANCELLED:
                    $table->updateStatus('available');
                    break;
                    
                case self::STATUS_COMPLETED:
                    $table->updateStatus('available');
                    break;
                    
                default:
                    // For pending status, don't change table status yet
                    break;
            }
            
            \Log::info("Table status updated successfully", [
                'reservation_id' => $this->id,
                'table_id' => $table->id,
                'new_status' => $table->status,
                'reservation_status' => $this->status
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error updating table status for reservation: ' . $e->getMessage(), [
                'reservation_id' => $this->id,
                'table_id' => $this->table_id,
                'status' => $this->status,
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
 * ALSO ADD this helper method to safely load table relationship
 */
public function loadTableSafely()
{
    if (!$this->table_id) {
        return null;
    }

    try {
        if (!$this->relationLoaded('table')) {
            $this->load('table');
        }
        
        return $this->table;
    } catch (\Exception $e) {
        \Log::error("Error loading table relationship: " . $e->getMessage());
        return \App\Models\RestaurantTable::find($this->table_id);
    }
}


    /**
     * NEW: Update reservation status
     */
    public function updateStatus(string $status, string $notes = null): bool
    {
        $oldStatus = $this->status;
        $this->status = $status;
        
        $result = $this->save();
        
        if ($result && $oldStatus !== $status) {
            $this->updateTableStatus();
        }
        
        return $result;
    }

    /**
     * NEW: Cancel reservation
     */
    public function cancel(string $reason = null): bool
    {
        return $this->updateStatus(self::STATUS_CANCELLED, $reason);
    }

    /**
     * NEW: Confirm reservation
     */
    public function confirm(): bool
    {
        return $this->updateStatus(self::STATUS_CONFIRMED);
    }

    /**
     * NEW: Complete reservation
     */
    public function complete(): bool
    {
        return $this->updateStatus(self::STATUS_COMPLETED);
    }

    // ==================== NEW: ENHANCED SCOPES ====================

    /**
     * Scope untuk filter berdasarkan status
     */
    public function scopeByStatus(Builder $query, $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk filter berdasarkan tanggal
     */
    public function scopeByDate(Builder $query, $date): Builder
    {
        return $query->whereDate('reservation_date', $date);
    }

    /**
     * NEW: Scope untuk filter berdasarkan range tanggal
     */
    public function scopeDateRange(Builder $query, $startDate, $endDate): Builder
    {
        return $query->whereBetween('reservation_date', [$startDate, $endDate]);
    }

    /**
     * NEW: Scope untuk reservasi hari ini
     */
    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('reservation_date', today());
    }

    /**
     * NEW: Scope untuk reservasi yang akan datang
     */
    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('reservation_date', '>=', today())
                    ->where('status', '!=', self::STATUS_CANCELLED);
    }

    /**
     * NEW: Scope untuk reservasi yang aktif (confirmed dan belum completed)
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_CONFIRMED)
                    ->where('reservation_date', '>=', today());
    }

    /**
     * NEW: Scope dengan eager loading relationships yang sering digunakan
     */
    public function scopeWithCommonRelations(Builder $query): Builder
    {
        return $query->with(['user', 'package', 'table', 'menuItems.menuItem']);
    }

    // ==================== EXISTING METHODS (Keep All Original) ====================

    /**
     * Generate kode reservasi unik
     */
    public static function generateReservationCode(): string
    {
        do {
            $code = 'RSV-' . date('Ymd') . '-' . strtoupper(Str::random(4));
        } while (static::where('reservation_code', $code)->exists());
        
        return $code;
    }

    /**
     * Get URL untuk bukti pembayaran
     */
    public function getProofOfPaymentUrlAttribute(): ?string
    {
        if (!$this->proof_of_payment) {
            return null;
        }
        
        return Storage::disk('public')->url('reservations/payments/' . $this->proof_of_payment);
    }

    /**
     * Get URLs untuk gambar tambahan
     */
    public function getAdditionalImageUrlsAttribute(): array
    {
        if (!$this->additional_images) {
            return [];
        }
        
        return collect($this->additional_images)->map(function ($fileName) {
            return Storage::disk('public')->url('reservations/additional/' . $fileName);
        })->toArray();
    }

    /**
     * Delete gambar saat reservasi dihapus
     */
    public function deleteImages(): void
    {
        // Hapus bukti pembayaran
        if ($this->proof_of_payment) {
            Storage::disk('public')->delete('reservations/payments/' . $this->proof_of_payment);
        }
        
        // Hapus gambar tambahan
        if ($this->additional_images) {
            foreach ($this->additional_images as $fileName) {
                Storage::disk('public')->delete('reservations/additional/' . $fileName);
            }
        }
    }

    /**
     * Override delete method - UPDATED to handle table
     */
    public function delete()
    {
        // NEW: Free up the table
        if ($this->table) {
            $this->table->markAvailable();
        }
        
        $this->deleteImages();
        return parent::delete();
    }

    /**
     * Accessor untuk format tanggal Indonesia
     */
    public function getFormattedDateAttribute(): string
    {
        return $this->reservation_date->format('d F Y');
    }

    /**
     * Accessor untuk format waktu
     */
    public function getFormattedTimeAttribute(): string
    {
        return $this->reservation_time->format('H:i');
    }

    /**
     * Accessor untuk format harga
     */
    public function getFormattedTotalPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->total_price, 0, ',', '.');
    }

    /**
     * Get payment method label
     */
    public function getPaymentMethodLabelAttribute(): string
{
    $labels = [
        'transfer' => 'Transfer Bank',
        'bca' => 'BCA Mobile',
        'mandiri' => 'Mandiri Online',
        'bni' => 'BNI Mobile',
        'bri' => 'BRI Mobile',
        'gopay' => 'GoPay',
        'ovo' => 'OVO',
        'dana' => 'DANA',
        'shopeepay' => 'ShopeePay',
        'pay-later' => 'Bayar di Tempat',
        'cash' => 'Tunai',
        'card' => 'Kartu Kredit',
    ];

    return $labels[$this->payment_method ?? 'unknown'] ?? ucfirst($this->payment_method ?? 'Unknown');
}

    /**
     * Check if payment method requires confirmation
     */
    public function requiresPaymentConfirmation(): bool
    {
        $methodsRequiringConfirmation = [
            'transfer', 'bca', 'mandiri', 'bni', 'bri', 
            'gopay', 'ovo', 'dana', 'shopeepay'
        ];

        return in_array($this->payment_method, $methodsRequiringConfirmation);
    }

    /**
 * IMPROVED: Method untuk mendapatkan nama paket dengan fallback yang lebih baik
 */
public function getPackageName(): string
{
    // Coba dari relasi package dulu
    if ($this->package) {
        return $this->package->name;
    }

    // Coba load manual jika package_id ada
    if ($this->package_id) {
        try {
            $package = \App\Models\ReservationPackage::find($this->package_id);
            if ($package) {
                return $package->name;
            }
        } catch (\Exception $e) {
            \Log::warning("Could not load package {$this->package_id}: " . $e->getMessage());
        }
    }

    // Fallback ke hardcoded dengan lebih banyak opsi
    $packages = [
        1 => 'Paket Romantis (2 Orang)',
        2 => 'Paket Keluarga (4 Orang)',
        3 => 'Paket Gathering (8 Orang)',
        4 => 'Paket Spesial (6 Orang)',
        5 => 'Paket VIP (10 Orang)',
        6 => 'Paket Basic (2 Orang)',
        7 => 'Paket Premium (4 Orang)',
        8 => 'Paket Deluxe (6 Orang)',
        9 => 'Paket Group (10 Orang)',
        10 => 'Paket Custom'
    ];

    return $packages[$this->package_id] ?? "Paket ID {$this->package_id}";
}


    /**
     * Method untuk mendapatkan total item menu
     */
    public function getTotalMenuItems(): int
{
    try {
        if ($this->relationLoaded('menuItems')) {
            return $this->menuItems->sum('quantity');
        }

        // Load manual jika belum ter-load
        $menuItems = \App\Models\ReservationMenuItem::where('reservation_id', $this->id)->get();
        return $menuItems->sum('quantity');
        
    } catch (\Exception $e) {
        \Log::warning("Could not get menu items count for reservation {$this->id}: " . $e->getMessage());
        return 0;
    }
}

    /**
     * Check if reservation has images
     */
    public function hasImages(): bool
    {
        return $this->proof_of_payment || !empty($this->additional_images);
    }

    /**
     * Get all image URLs
     */
    public function getAllImageUrls(): array
    {
        $urls = [];
        
        if ($this->proof_of_payment_url) {
            $urls['proof_of_payment'] = $this->proof_of_payment_url;
        }
        
        if (!empty($this->additional_image_urls)) {
            $urls['additional_images'] = $this->additional_image_urls;
        }
        
        return $urls;
    }

    // ==================== NEW: ENHANCED ACCESSORS ====================

    /**
     * NEW: Get table name
     */
    public function getTableName(): ?string
    {
        return $this->table ? $this->table->meja_name : null;
    }

    /**
     * NEW: Get status label
     */
    public function getStatusLabelAttribute(): string
{
    $labels = [
        'pending' => 'Menunggu Konfirmasi',
        'confirmed' => 'Dikonfirmasi', 
        'cancelled' => 'Dibatalkan',
        'completed' => 'Selesai'
    ];

    return $labels[$this->status ?? 'pending'] ?? ucfirst($this->status ?? 'pending');
}

    /**
     * NEW: Get status color for UI
     */
    public function getStatusColorAttribute(): string
{
    $colors = [
        'pending' => 'yellow',
        'confirmed' => 'green', 
        'cancelled' => 'red',
        'completed' => 'blue'
    ];

    return $colors[$this->status ?? 'pending'] ?? 'gray';
}

    /**
     * NEW: Check if reservation is today
     */
   public function getIsTodayAttribute(): bool
{
    if (!$this->reservation_date) {
        return false;
    }

    try {
        return $this->reservation_date->isToday();
    } catch (\Exception $e) {
        // Fallback comparison
        return date('Y-m-d') === date('Y-m-d', strtotime($this->reservation_date));
    }
}

    /**
     * NEW: Check if reservation can be cancelled
     */
    public function canBeCancelled(): bool
{
    try {
        return in_array($this->status, ['pending', 'confirmed']) 
               && $this->reservation_date 
               && $this->reservation_date->isFuture();
    } catch (\Exception $e) {
        // Fallback check
        return in_array($this->status, ['pending', 'confirmed'])
               && strtotime($this->reservation_date) > time();
    }
}

    /**
     * NEW: Check if reservation can be confirmed
     */
    public function canBeConfirmed(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * NEW: Check if reservation can be completed
     */
    public function canBeCompleted(): bool
    {
        try {
            return $this->status === 'confirmed' 
                && $this->reservation_date 
                && $this->reservation_date->isToday();
        } catch (\Exception $e) {
            // Fallback check
            return $this->status === 'confirmed'
                && date('Y-m-d') === date('Y-m-d', strtotime($this->reservation_date));
        }
    }

    // ==================== NEW: SUMMARY METHOD FOR API ====================

    /**
     * NEW: Get reservation summary for display (API-ready)
     */
    public function getSummary(): array
    {
        return [
            'id' => $this->id,
            'reservation_code' => $this->reservation_code,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'customer_email' => $this->customer_email,
            'package_name' => $this->getPackageName(),
            'table_name' => $this->getTableName(),
            'table_number' => $this->table?->table_number,
            'date' => $this->formatted_date,
            'time' => $this->formatted_time,
            'guests' => $this->number_of_people,
            'status' => $this->status,
            'status_label' => $this->status_label,
            'status_color' => $this->status_color,
            'payment_method' => $this->payment_method,
            'payment_method_label' => $this->payment_method_label,
            'total_price' => $this->formatted_total_price,
            'special_requests' => $this->special_requests,
            'table_location' => $this->table_location,
            'location_detail' => $this->table?->full_location,
            'proof_of_payment' => $this->proof_of_payment_url,
            'additional_images' => $this->additional_image_urls,
            'is_today' => $this->is_today,
            'can_be_cancelled' => $this->canBeCancelled(),
            'can_be_confirmed' => $this->canBeConfirmed(),
            'can_be_completed' => $this->canBeCompleted(),
            'requires_payment_confirmation' => $this->requiresPaymentConfirmation(),
            'menu_items_count' => $this->getTotalMenuItems(),
        ];
    }

    // ==================== NEW: STATIC HELPER METHODS ====================

    /**
     * NEW: Get all possible statuses
     */
    public static function getAllStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_CONFIRMED,
            self::STATUS_CANCELLED,
            self::STATUS_COMPLETED,
        ];
    }
}