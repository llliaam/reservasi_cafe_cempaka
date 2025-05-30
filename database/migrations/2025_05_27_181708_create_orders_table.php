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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Order identification
            $table->string('order_code')->unique(); // Kode unik pesanan
            
            // Customer info
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email');
            
            // Order details
            $table->enum('order_type', ['dine_in', 'takeaway', 'delivery'])->default('dine_in');
            $table->text('delivery_address')->nullable(); // Untuk delivery
            $table->text('notes')->nullable(); // Catatan khusus
            
            // Pricing
            $table->decimal('subtotal', 10, 2); // Total harga menu
            $table->decimal('delivery_fee', 10, 2)->default(0); // Ongkir
            $table->decimal('service_fee', 10, 2)->default(0); // Biaya layanan
            $table->decimal('total_amount', 10, 2); // Total keseluruhan
            
            // Payment
            $table->string('payment_method')->default('cash'); // cash, transfer, e-wallet
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->string('payment_proof')->nullable(); // Bukti bayar
            
            // Order status
            $table->enum('status', [
                'pending', 
                'confirmed', 
                'preparing', 
                'ready', 
                'completed', 
                'cancelled'
            ])->default('pending');
            
            // Timing
            $table->timestamp('order_time')->useCurrent(); // Waktu pesan
            $table->timestamp('estimated_ready_time')->nullable(); // Estimasi siap
            $table->timestamp('completed_at')->nullable(); // Waktu selesai
            
            // Rating & Review (setelah completed)
            $table->integer('rating')->nullable(); // 1-5 stars
            $table->text('review')->nullable(); // Review text
            $table->timestamp('reviewed_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index('order_code');
            $table->index(['order_type', 'status']);
            $table->index('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};