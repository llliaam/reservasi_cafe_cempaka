<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Reservation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'table_id',
        'reservation_number',
        'reservation_date',
        'reservation_time',
        'guest_count',
        'duration',
        'guest_name',
        'guest_phone',
        'guest_email',
        'status',
        'special_request',
        'notes',
        'occasion',
        'preferences',
        'confirmed_at',
        'reminder_sent_at',
        'confirmation_code',
        'deposit_amount',
        'minimum_spend',
        'deposit_status'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'reservation_date' => 'date',
        'reservation_time' => 'datetime',
        'preferences' => 'array',
        'confirmed_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
        'deposit_amount' => 'decimal:2',
        'minimum_spend' => 'decimal:2',
    ];

    // =================== RELATIONSHIPS ===================

    /**
     * Get the user that owns the reservation
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the table for this reservation
     */
    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    // =================== SCOPES ===================

    /**
     * Scope for reservations by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for confirmed reservations
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope for pending reservations
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for upcoming reservations
     */
    public function scopeUpcoming($query)
    {
        return $query->where('reservation_date', '>=', Carbon::today())
                    ->orderBy('reservation_date')
                    ->orderBy('reservation_time');
    }

    /**
     * Scope for past reservations
     */
    public function scopePast($query)
    {
        return $query->where('reservation_date', '<', Carbon::today())
                    ->orderBy('reservation_date', 'desc')
                    ->orderBy('reservation_time', 'desc');
    }

    /**
     * Scope for today's reservations
     */
    public function scopeToday($query)
    {
        return $query->where('reservation_date', Carbon::today())
                    ->orderBy('reservation_time');
    }

    /**
     * Scope for reservations by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('reservation_date', [$startDate, $endDate]);
    }

    // =================== ACCESSORS ===================

    /**
     * Get formatted reservation number
     */
    public function getFormattedReservationNumberAttribute()
    {
        return $this->reservation_number ?: 'RSV-' . str_pad($this->id, 7, '0', STR_PAD_LEFT);
    }

    /**
     * Get formatted reservation date
     */
    public function getFormattedDateAttribute()
    {
        return $this->reservation_date->format('d M Y');
    }

    /**
     * Get formatted reservation time
     */
    public function getFormattedTimeAttribute()
    {
        return $this->reservation_time->format('H:i');
    }

    /**
     * Get status text in Indonesian
     */
    public function getStatusTextAttribute()
    {
        return match($this->status) {
            'pending' => 'Menunggu Konfirmasi',
            'confirmed' => 'Dikonfirmasi',
            'seated' => 'Sudah Tiba',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            'no_show' => 'Tidak Hadir',
            default => ucfirst($this->status)
        };
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'blue',
            'seated' => 'green',
            'completed' => 'green',
            'cancelled' => 'red',
            'no_show' => 'red',
            default => 'gray'
        };
    }

    /**
     * Check if reservation can be cancelled
     */
    public function getCanBeCancelledAttribute()
    {
        if (!in_array($this->status, ['pending', 'confirmed'])) {
            return false;
        }

        // Can cancel if reservation is at least 2 hours away
        $reservationDateTime = Carbon::parse($this->reservation_date->format('Y-m-d') . ' ' . $this->reservation_time->format('H:i:s'));
        return $reservationDateTime->diffInHours(now()) >= 2;
    }

    /**
     * Check if reservation can be modified
     */
    public function getCanBeModifiedAttribute()
    {
        if (!in_array($this->status, ['pending', 'confirmed'])) {
            return false;
        }

        // Can modify if reservation is at least 4 hours away
        $reservationDateTime = Carbon::parse($this->reservation_date->format('Y-m-d') . ' ' . $this->reservation_time->format('H:i:s'));
        return $reservationDateTime->diffInHours(now()) >= 4;
    }

    /**
     * Get end time of reservation
     */
    public function getEndTimeAttribute()
    {
        return $this->reservation_time->addMinutes($this->duration);
    }

    /**
     * Get preferences as formatted string
     */
    public function getPreferencesStringAttribute()
    {
        return is_array($this->preferences) ? implode(', ', $this->preferences) : '';
    }

    /**
     * Get formatted deposit amount
     */
    public function getFormattedDepositAttribute()
    {
        return $this->deposit_amount > 0 ? 
               'Rp ' . number_format($this->deposit_amount, 0, ',', '.') : 
               '';
    }

    // =================== HELPER METHODS ===================

    /**
     * Generate reservation number
     */
    public static function generateReservationNumber()
    {
        $today = Carbon::today();
        $lastReservation = self::whereDate('created_at', $today)
                              ->orderBy('id', 'desc')
                              ->first();
        
        $sequence = $lastReservation ? (int)substr($lastReservation->reservation_number, -3) + 1 : 1;
        
        return 'RSV-' . $today->format('Ymd') . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Generate confirmation code
     */
    public static function generateConfirmationCode()
    {
        return strtoupper(substr(md5(uniqid()), 0, 8));
    }

    /**
     * Confirm reservation
     */
    public function confirm()
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
            'confirmation_code' => self::generateConfirmationCode()
        ]);

        // Mark table as reserved if assigned
        if ($this->table) {
            $this->table->markAsReserved();
        }
    }

    /**
     * Cancel reservation
     */
    public function cancel($reason = null)
    {
        if (!$this->can_be_cancelled) {
            return false;
        }

        $this->update([
            'status' => 'cancelled',
            'notes' => $this->notes . ($reason ? "\nReason: " . $reason : '')
        ]);

        // Mark table as available if assigned
        if ($this->table) {
            $this->table->markAsAvailable();
        }

        return true;
    }

    /**
     * Mark as seated
     */
    public function markAsSeated()
    {
        $this->update(['status' => 'seated']);

        // Mark table as occupied
        if ($this->table) {
            $this->table->markAsOccupied();
        }
    }

    /**
     * Mark as completed
     */
    public function markAsCompleted()
    {
        $this->update(['status' => 'completed']);

        // Mark table as available
        if ($this->table) {
            $this->table->markAsAvailable();
        }
    }

    /**
     * Mark as no show
     */
    public function markAsNoShow()
    {
        $this->update(['status' => 'no_show']);

        // Mark table as available
        if ($this->table) {
            $this->table->markAsAvailable();
        }
    }

    /**
     * Send reminder
     */
    public function sendReminder()
    {
        // Implementation for sending reminder notification
        $this->update(['reminder_sent_at' => now()]);
    }

    /**
     * Get reservation summary for display
     */
    public function getSummary()
    {
        return [
            'id' => $this->formatted_reservation_number,
            'date' => $this->formatted_date,
            'time' => $this->formatted_time,
            'guests' => $this->guest_count,
            'table' => $this->table ? $this->table->display_name : 'Akan ditentukan',
            'status' => $this->status_text,
            'status_color' => $this->status_color,
            'guest_name' => $this->guest_name,
            'guest_phone' => $this->guest_phone,
        ];
    }

    // =================== BOOT METHOD ===================

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($reservation) {
            if (!$reservation->reservation_number) {
                $reservation->reservation_number = self::generateReservationNumber();
            }
            
            if (!$reservation->duration) {
                $reservation->duration = 120; // Default 2 hours
            }
        });
    }
}