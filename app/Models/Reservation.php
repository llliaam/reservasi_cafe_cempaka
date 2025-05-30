<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

    // Generate unique reservation code
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($reservation) {
            $reservation->reservation_code = static::generateReservationCode();
        });
    }

    // Relationship dengan User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // TAMBAHAN: Relationship dengan ReservationPackage
    public function package(): BelongsTo
    {
        return $this->belongsTo(ReservationPackage::class, 'package_id');
    }

    // Relationship dengan Menu Items
    public function menuItems(): HasMany
    {
        return $this->hasMany(ReservationMenuItem::class);
    }

    // Generate kode reservasi unik
    public static function generateReservationCode(): string
    {
        do {
            $code = 'RSV-' . date('Ymd') . '-' . strtoupper(Str::random(4));
        } while (static::where('reservation_code', $code)->exists());
        
        return $code;
    }

    // Get URL untuk bukti pembayaran
    public function getProofOfPaymentUrlAttribute(): ?string
    {
        if (!$this->proof_of_payment) {
            return null;
        }
        
        return Storage::disk('public')->url('reservations/payments/' . $this->proof_of_payment);
    }

    // Get URLs untuk gambar tambahan
    public function getAdditionalImageUrlsAttribute(): array
    {
        if (!$this->additional_images) {
            return [];
        }
        
        return collect($this->additional_images)->map(function ($fileName) {
            return Storage::disk('public')->url('reservations/additional/' . $fileName);
        })->toArray();
    }

    // Delete gambar saat reservasi dihapus
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

    // Override delete method
    public function delete()
    {
        $this->deleteImages();
        return parent::delete();
    }

    // Accessor untuk format tanggal Indonesia
    public function getFormattedDateAttribute(): string
    {
        return $this->reservation_date->format('d F Y');
    }

    // Accessor untuk format waktu
    public function getFormattedTimeAttribute(): string
    {
        return $this->reservation_time->format('H:i');
    }

    // Accessor untuk format harga
    public function getFormattedTotalPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->total_price, 0, ',', '.');
    }

    // Get payment method label
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
        ];

        return $labels[$this->payment_method] ?? $this->payment_method;
    }

    // Check if payment method requires confirmation
    public function requiresPaymentConfirmation(): bool
    {
        $methodsRequiringConfirmation = [
            'transfer', 'bca', 'mandiri', 'bni', 'bri', 
            'gopay', 'ovo', 'dana', 'shopeepay'
        ];

        return in_array($this->payment_method, $methodsRequiringConfirmation);
    }

    // Scope untuk filter berdasarkan status
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Scope untuk filter berdasarkan tanggal
    public function scopeByDate($query, $date)
    {
        return $query->whereDate('reservation_date', $date);
    }

    // UPDATED: Method untuk mendapatkan nama paket dari database
    public function getPackageName(): string
    {
        // Coba dari relasi package dulu
        if ($this->package) {
            return $this->package->name;
        }

        // Fallback ke hardcoded jika tidak ada
        $packages = [
            1 => 'Paket Romantis (2 Orang)',
            2 => 'Paket Keluarga (4 Orang)',
            3 => 'Paket Gathering (8 Orang)',
        ];

        return $packages[$this->package_id] ?? 'Paket Tidak Dikenal';
    }

    // Method untuk mendapatkan total item menu
    public function getTotalMenuItems(): int
    {
        return $this->menuItems->sum('quantity');
    }

    // Check if reservation has images
    public function hasImages(): bool
    {
        return $this->proof_of_payment || !empty($this->additional_images);
    }

    // Get all image URLs
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
}