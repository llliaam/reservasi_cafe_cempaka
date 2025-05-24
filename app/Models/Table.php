<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Table extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'table_number',
        'capacity',
        'type',
        'status',
        'description',
        'features',
        'additional_charge',
        'location',
        'is_active'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'features' => 'array',
        'additional_charge' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // =================== RELATIONSHIPS ===================

    /**
     * Get all orders for this table
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get all reservations for this table
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get current reservation (if any)
     */
    public function currentReservation()
    {
        $now = Carbon::now();
        
        return $this->reservations()
                    ->where('reservation_date', $now->toDateString())
                    ->where('reservation_time', '<=', $now->toTimeString())
                    ->where('status', 'confirmed')
                    ->first();
    }

    /**
     * Get upcoming reservations for today
     */
    public function todayReservations()
    {
        return $this->reservations()
                    ->where('reservation_date', Carbon::today())
                    ->where('status', 'confirmed')
                    ->orderBy('reservation_time');
    }

    // =================== SCOPES ===================

    /**
     * Scope for active tables
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for available tables
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope for tables by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for tables by capacity
     */
    public function scopeByCapacity($query, $minCapacity)
    {
        return $query->where('capacity', '>=', $minCapacity);
    }

    /**
     * Scope for available tables at specific date/time
     */
    public function scopeAvailableAt($query, $date, $time, $duration = 120)
    {
        $endTime = Carbon::parse($time)->addMinutes($duration)->toTimeString();
        
        return $query->where('is_active', true)
                    ->where('status', 'available')
                    ->whereDoesntHave('reservations', function($q) use ($date, $time, $endTime) {
                        $q->where('reservation_date', $date)
                          ->where('status', 'confirmed')
                          ->where(function($timeQuery) use ($time, $endTime) {
                              $timeQuery->whereBetween('reservation_time', [$time, $endTime])
                                       ->orWhere(function($overlapQuery) use ($time, $endTime) {
                                           $overlapQuery->where('reservation_time', '<=', $time)
                                                       ->whereRaw('ADDTIME(reservation_time, SEC_TO_TIME(duration * 60)) >= ?', [$time]);
                                       });
                          });
                    });
    }

    // =================== HELPER METHODS ===================

    /**
     * Check if table is available at specific date/time
     */
    public function isAvailableAt($date, $time, $duration = 120)
    {
        if (!$this->is_active || $this->status !== 'available') {
            return false;
        }

        $endTime = Carbon::parse($time)->addMinutes($duration)->toTimeString();
        
        $conflictingReservation = $this->reservations()
                                      ->where('reservation_date', $date)
                                      ->where('status', 'confirmed')
                                      ->where(function($query) use ($time, $endTime) {
                                          $query->whereBetween('reservation_time', [$time, $endTime])
                                               ->orWhere(function($overlapQuery) use ($time, $endTime) {
                                                   $overlapQuery->where('reservation_time', '<=', $time)
                                                               ->whereRaw('ADDTIME(reservation_time, SEC_TO_TIME(duration * 60)) >= ?', [$time]);
                                               });
                                      })
                                      ->exists();

        return !$conflictingReservation;
    }

    /**
     * Get formatted additional charge
     */
    public function getFormattedAdditionalChargeAttribute()
    {
        return $this->additional_charge > 0 ? 
               '+Rp ' . number_format($this->additional_charge, 0, ',', '.') : 
               '';
    }

    /**
     * Get table display name
     */
    public function getDisplayNameAttribute()
    {
        return $this->name ?: "Table {$this->table_number}";
    }

    /**
     * Get features as comma-separated string
     */
    public function getFeaturesStringAttribute()
    {
        return is_array($this->features) ? implode(', ', $this->features) : '';
    }

    /**
     * Check if table has specific feature
     */
    public function hasFeature($feature)
    {
        return is_array($this->features) && in_array($feature, $this->features);
    }

    /**
     * Update table status
     */
    public function updateStatus($status)
    {
        $this->update(['status' => $status]);
    }

    /**
     * Mark table as occupied
     */
    public function markAsOccupied()
    {
        $this->updateStatus('occupied');
    }

    /**
     * Mark table as available
     */
    public function markAsAvailable()
    {
        $this->updateStatus('available');
    }

    /**
     * Mark table as reserved
     */
    public function markAsReserved()
    {
        $this->updateStatus('reserved');
    }
}