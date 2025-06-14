<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class ReservationPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'image',
        'description',
        'includes',
        'duration',
        'max_people',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'includes' => 'array',
        'is_active' => 'boolean',
        'max_people' => 'integer'
    ];

    /**
     * Scope untuk paket yang aktif
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Format harga ke Rupiah
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get image URL with fallback (kompatibel dengan struktur folder yang ada)
     */
    public function getImageUrlAttribute(): string
    {
        if ($this->image && file_exists(public_path('images/paket_reservasi/' . $this->image))) {
            return asset('images/paket_reservasi/' . $this->image);
        }

        // Fallback sederhana berdasarkan jumlah orang
        if ($this->max_people <= 2) {
            $fallbackImage = 'default-couple.jpg';
        } elseif ($this->max_people <= 6) {
            $fallbackImage = 'default-family.jpg';
        } else {
            $fallbackImage = 'default-group.jpg';
        }

        // Cek apakah file ada, jika tidak pakai default umum
        if (file_exists(public_path('images/paket_reservasi/' . $fallbackImage))) {
            return asset('images/paket_reservasi/' . $fallbackImage);
        }

        return asset('images/paket_reservasi/default-package.jpg');
    }

    /**
     * Relasi dengan reservations (kompatibel dengan model Reservation yang ada)
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'package_id');
    }

    /**
     * Check if package can be deleted (ada reservasi atau tidak)
     */
    public function canBeDeleted(): bool
    {
        return !$this->reservations()->exists();
    }

    /**
     * Get reservations count
     */
    public function getReservationsCountAttribute(): int
    {
        return $this->reservations()->count();
    }
}
