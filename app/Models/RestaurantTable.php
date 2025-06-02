<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class RestaurantTable extends Model
{
    use HasFactory;

    protected $fillable = [
        'table_number',
        'capacity',
        'location_type',
        'location_detail',
        'status',
        'is_active'
    ];

    protected $casts = [
        'table_number' => 'integer',
        'capacity' => 'integer',
        'is_active' => 'boolean'
    ];

    // Constants for status
    const STATUS_AVAILABLE = 'available';
    const STATUS_OCCUPIED = 'occupied';
    const STATUS_RESERVED = 'reserved';
    const STATUS_MAINTENANCE = 'maintenance';

    // Constants for location types
    const LOCATION_INDOOR = 'indoor';
    const LOCATION_OUTDOOR = 'outdoor';

    // ==================== RELATIONSHIPS ====================

    /**
     * Relasi dengan Reservations
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'table_id');
    }

    /**
     * Relasi dengan Orders (dine-in)
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'table_id');
    }

    /**
     * Get current reservation for this table
     */
    public function currentReservation()
    {
        return $this->reservations()
                    ->where('status', 'confirmed')
                    ->where('reservation_date', today())
                    ->where('reservation_time', '<=', now()->format('H:i'))
                    ->where('reservation_time', '>=', now()->subHours(3)->format('H:i')) // 3 jam toleransi
                    ->first();
    }

    /**
     * Get upcoming reservations for today
     */
    public function todayReservations()
    {
        return $this->reservations()
                    ->where('reservation_date', today())
                    ->where('status', '!=', 'cancelled')
                    ->orderBy('reservation_time')
                    ->get();
    }

    /**
     * Get current order for this table
     */
    public function currentOrder()
    {
        return $this->orders()
                    ->where('order_type', Order::TYPE_DINE_IN)
                    ->whereIn('status', [
                        Order::STATUS_CONFIRMED,
                        Order::STATUS_PREPARING,
                        Order::STATUS_READY
                    ])
                    ->latest('order_time')
                    ->first();
    }

    // ==================== SCOPES ====================

    /**
     * Scope untuk meja yang aktif
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope untuk meja yang tersedia
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_AVAILABLE)
                    ->where('is_active', true);
    }

    /**
     * Scope berdasarkan lokasi
     */
    public function scopeByLocation(Builder $query, string $locationType): Builder
    {
        return $query->where('location_type', $locationType);
    }

    /**
     * Scope berdasarkan kapasitas minimum
     */
    public function scopeMinCapacity(Builder $query, int $minCapacity): Builder
    {
        return $query->where('capacity', '>=', $minCapacity);
    }

    /**
     * Scope untuk cari meja yang cocok untuk reservasi
     */
    public function scopeAvailableForReservation(Builder $query, string $locationType, int $requiredCapacity, Carbon $date, string $time): Builder
    {
        return $query->active()
                    ->available()
                    ->byLocation($locationType)
                    ->minCapacity($requiredCapacity)
                    ->whereDoesntHave('reservations', function ($reservationQuery) use ($date, $time) {
                        $reservationQuery->where('reservation_date', $date)
                                        ->where('status', '!=', 'cancelled')
                                        ->where(function ($timeQuery) use ($time) {
                                            // Check for time conflicts (2 hours buffer)
                                            $startTime = Carbon::createFromFormat('H:i', $time)->subHours(2)->format('H:i');
                                            $endTime = Carbon::createFromFormat('H:i', $time)->addHours(2)->format('H:i');
                                            
                                            $timeQuery->whereBetween('reservation_time', [$startTime, $endTime]);
                                        });
                    })
                    ->orderBy('capacity', 'asc'); // Prioritas meja terkecil yang cukup
    }

    // ==================== ACCESSORS & MUTATORS ====================

    /**
     * Get nama meja dengan format "Meja X"
     */
    public function getMejaNameAttribute(): string
    {
        return "Meja {$this->table_number}";
    }

    /**
     * Get status label dalam bahasa Indonesia
     */
    public function getStatusLabelAttribute(): string
    {
        $labels = [
            self::STATUS_AVAILABLE => 'Tersedia',
            self::STATUS_OCCUPIED => 'Terisi',
            self::STATUS_RESERVED => 'Direservasi',
            self::STATUS_MAINTENANCE => 'Maintenance'
        ];

        return $labels[$this->status] ?? $this->status;
    }

    /**
     * Get location type label
     */
    public function getLocationTypeLabelAttribute(): string
    {
        $labels = [
            self::LOCATION_INDOOR => 'Indoor',
            self::LOCATION_OUTDOOR => 'Outdoor'
        ];

        return $labels[$this->location_type] ?? $this->location_type;
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        $colors = [
            self::STATUS_AVAILABLE => 'green',
            self::STATUS_OCCUPIED => 'red',
            self::STATUS_RESERVED => 'yellow',
            self::STATUS_MAINTENANCE => 'gray'
        ];

        return $colors[$this->status] ?? 'gray';
    }

    /**
     * Get full location description
     */
    public function getFullLocationAttribute(): string
    {
        $base = $this->location_type_label;
        
        if ($this->location_detail) {
            $base .= " - {$this->location_detail}";
        }
        
        return $base;
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if table is available
     */
    public function isAvailable(): bool
    {
        return $this->status === self::STATUS_AVAILABLE && $this->is_active;
    }

    /**
     * Check if table is occupied
     */
    public function isOccupied(): bool
    {
        return $this->status === self::STATUS_OCCUPIED;
    }

    /**
     * Check if table is reserved
     */
    public function isReserved(): bool
    {
        return $this->status === self::STATUS_RESERVED;
    }

    /**
     * Check if table is under maintenance
     */
    public function isMaintenance(): bool
    {
        return $this->status === self::STATUS_MAINTENANCE;
    }

    /**
     * Update table status
     */
    public function updateStatus(string $status): bool
    {
        $this->status = $status;
        return $this->save();
    }

    /**
     * Mark table as available
     */
    public function markAvailable(): bool
    {
        return $this->updateStatus(self::STATUS_AVAILABLE);
    }

    /**
     * Mark table as occupied
     */
    public function markOccupied(): bool
    {
        return $this->updateStatus(self::STATUS_OCCUPIED);
    }

    /**
     * Mark table as reserved
     */
    public function markReserved(): bool
    {
        return $this->updateStatus(self::STATUS_RESERVED);
    }

    /**
     * Mark table as maintenance
     */
    public function markMaintenance(): bool
    {
        return $this->updateStatus(self::STATUS_MAINTENANCE);
    }

    /**
     * Check if table can accommodate the number of people
     */
    public function canAccommodate(int $numberOfPeople): bool
{
    return $this->capacity >= $numberOfPeople && $this->is_active && $this->status === self::STATUS_AVAILABLE;
}

public function isAvailableAtDateTime($date, $time): bool
{
    try {
        // Convert ke Carbon jika diperlukan
        if (is_string($date)) {
            $date = \Carbon\Carbon::parse($date);
        }
        if (is_string($time)) {
            $time = \Carbon\Carbon::createFromFormat('H:i', $time);
        }

        // Buffer 2 jam sebelum dan sesudah
        $startBuffer = $time->copy()->subHours(2);
        $endBuffer = $time->copy()->addHours(2);

        // Cek konflik dengan reservasi existing
        $conflictExists = \App\Models\Reservation::where('table_id', $this->id)
            ->where('reservation_date', $date->format('Y-m-d'))
            ->where('status', '!=', 'cancelled')
            ->whereBetween('reservation_time', [
                $startBuffer->format('H:i:s'),
                $endBuffer->format('H:i:s')
            ])
            ->exists();

        return !$conflictExists;

    } catch (\Exception $e) {
        \Log::error('Error checking table availability: ' . $e->getMessage());
        return false;
    }
}

public function isSuitableForReservation($reservation): bool
{
    // Cek kapasitas
    if (!$this->canAccommodate($reservation->number_of_people)) {
        return false;
    }

    // Cek lokasi
    if ($this->location_type !== $reservation->table_location) {
        return false;
    }

    // Cek status
    if ($this->status !== self::STATUS_AVAILABLE) {
        return false;
    }

    // Cek konflik waktu jika reservation memiliki waktu
    if ($reservation->reservation_date && $reservation->reservation_time) {
        return $this->isAvailableAtDateTime($reservation->reservation_date, $reservation->reservation_time);
    }

    return true;
}


    /**
     * Get table summary for display
     */
   public function getSummary(): array
{
    $summary = [
        'id' => $this->id,
        'meja_name' => $this->meja_name,
        'table_number' => $this->table_number,
        'capacity' => $this->capacity,
        'location_type' => $this->location_type,
        'location_detail' => $this->location_detail,
        'full_location' => $this->full_location,
        'status' => $this->status,
        'status_label' => $this->status_label,
        'status_color' => $this->status_color,
        'is_available' => $this->isAvailable(),
        'is_active' => $this->is_active,
        'current_reservation' => null,
        'today_reservations_count' => 0,
    ];

    // Load current reservation jika ada
    try {
        $currentReservation = $this->currentReservation();
        if ($currentReservation) {
            $summary['current_reservation'] = [
                'customer_name' => $currentReservation->customer_name,
                'time' => $currentReservation->reservation_time->format('H:i'),
                'guests' => $currentReservation->number_of_people
            ];
        }

        // Count today's reservations
        $summary['today_reservations_count'] = $this->todayReservations()->count();

    } catch (\Exception $e) {
        \Log::warning("Error loading reservation data for table {$this->id}: " . $e->getMessage());
    }

    return $summary;
}

    /**
 * IMPROVED: Static method untuk mencari meja yang cocok dengan kriteria ketat
 */
public static function findSuitableTableForReservation(string $locationType, int $requiredCapacity, $date, $time): ?self
{
    try {
        // Pastikan parameter valid
        if (empty($locationType) || $requiredCapacity <= 0) {
            \Log::warning('Invalid parameters for table search', [
                'location' => $locationType,
                'capacity' => $requiredCapacity
            ]);
            return null;
        }

        // Convert time jika perlu
        if (is_string($time)) {
            $time = \Carbon\Carbon::createFromFormat('H:i', $time);
        } elseif (is_string($date)) {
            $date = \Carbon\Carbon::parse($date);
        }

        \Log::info('Searching for suitable table', [
            'location' => $locationType,
            'required_capacity' => $requiredCapacity,
            'date' => $date->format('Y-m-d'),
            'time' => $time->format('H:i')
        ]);

        // Query dengan kriteria ketat
        $query = self::query()
            ->where('location_type', $locationType)
            ->where('capacity', '>=', $requiredCapacity)
            ->where('status', self::STATUS_AVAILABLE)
            ->where('is_active', true);

        // Exclude meja yang sudah ada reservasi pada waktu yang sama (dengan buffer)
        $query->whereNotExists(function ($subQuery) use ($date, $time) {
            $startBuffer = $time->copy()->subHours(2);
            $endBuffer = $time->copy()->addHours(2);
            
            $subQuery->select(\DB::raw(1))
                ->from('reservations')
                ->whereColumn('reservations.table_id', 'restaurant_tables.id')
                ->where('reservations.reservation_date', $date->format('Y-m-d'))
                ->where('reservations.status', '!=', 'cancelled')
                ->whereBetween('reservations.reservation_time', [
                    $startBuffer->format('H:i:s'),
                    $endBuffer->format('H:i:s')
                ]);
        });

        // Urutkan berdasarkan prioritas:
        // 1. Kapasitas terkecil yang cukup (efisiensi)
        // 2. Nomor meja (konsistensi)
        $availableTables = $query->orderBy('capacity', 'asc')
                                ->orderBy('table_number', 'asc')
                                ->get();

        \Log::info('Found available tables', [
            'count' => $availableTables->count(),
            'tables' => $availableTables->take(3)->map(function($table) {
                return [
                    'id' => $table->id,
                    'number' => $table->table_number,
                    'capacity' => $table->capacity
                ];
            })
        ]);

        return $availableTables->first();

    } catch (\Exception $e) {
        \Log::error('Error finding suitable table: ' . $e->getMessage(), [
            'location' => $locationType,
            'capacity' => $requiredCapacity
        ]);
        return null;
    }
}

public static function getAvailableTablesForCriteria(string $locationType, int $minCapacity = 1): \Illuminate\Database\Eloquent\Collection
{
    return self::where('location_type', $locationType)
              ->where('capacity', '>=', $minCapacity)
              ->where('status', self::STATUS_AVAILABLE)
              ->where('is_active', true)
              ->orderBy('capacity', 'asc')
              ->orderBy('table_number', 'asc')
              ->get();
}

    /**
     * Static method to find suitable table for reservation
     */
    public static function findSuitableTable(string $locationType, int $requiredCapacity, Carbon $date, string $time): ?self
    {
        return self::availableForReservation($locationType, $requiredCapacity, $date, $time)->first();
    }

    /**
     * Static method to get all location types
     */
    public static function getAllLocationTypes(): array
    {
        return [
            self::LOCATION_INDOOR => 'Indoor',
            self::LOCATION_OUTDOOR => 'Outdoor'
        ];
    }

    /**
     * Static method to get all statuses
     */
    public static function getAllStatuses(): array
    {
        return [
            self::STATUS_AVAILABLE => 'Tersedia',
            self::STATUS_OCCUPIED => 'Terisi',
            self::STATUS_RESERVED => 'Direservasi',
            self::STATUS_MAINTENANCE => 'Maintenance'
        ];
    }

    /**
     * Check if table can be deleted
     */
    public function canBeDeleted(): bool
    {
        return !$this->reservations()->exists() && !$this->orders()->exists();
    }
}