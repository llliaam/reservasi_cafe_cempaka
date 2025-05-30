<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Data Customer
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email');
            $table->text('special_requests')->nullable();
            
            // Data Reservasi
            $table->integer('package_id');
            $table->date('reservation_date');
            $table->time('reservation_time');
            $table->integer('number_of_people');
            $table->enum('table_location', ['indoor', 'outdoor'])->default('indoor');
            
            // Pricing
            $table->decimal('package_price', 10, 2);
            $table->decimal('menu_subtotal', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2);
            
            // Payment & Images
            $table->string('payment_method')->default('transfer');
            $table->string('proof_of_payment')->nullable(); // Bukti pembayaran
            $table->json('additional_images')->nullable(); // Array gambar tambahan (JSON)
            $table->string('reservation_code')->unique(); // Kode unik untuk reservasi
            
            // Status
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending');
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'reservation_date']);
            $table->index('status');
            $table->index('reservation_code');
            $table->index('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};