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
            $table->foreignId('table_id')->nullable()->constrained()->onDelete('set null');
            $table->string('reservation_number')->unique(); // e.g., "RSV-2025-001"
            
            // Reservation Details
            $table->date('reservation_date');
            $table->time('reservation_time');
            $table->integer('guest_count');
            $table->integer('duration')->default(120); // Duration in minutes
            
            // Guest Information
            $table->string('guest_name');
            $table->string('guest_phone');
            $table->string('guest_email')->nullable();
            
            // Reservation Status
            $table->enum('status', ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'])->default('pending');
            
            // Special Requests
            $table->text('special_request')->nullable();
            $table->text('notes')->nullable(); // Internal notes from staff
            
            // Occasion & Preferences
            $table->string('occasion')->nullable(); // birthday, anniversary, etc.
            $table->json('preferences')->nullable(); // Array: ["quiet_area", "window_seat", "high_chair"]
            
            // Confirmation & Communication
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('reminder_sent_at')->nullable();
            $table->string('confirmation_code')->nullable();
            
            // Pricing (for premium tables or special packages)
            $table->decimal('deposit_amount', 10, 2)->default(0);
            $table->decimal('minimum_spend', 10, 2)->default(0);
            $table->enum('deposit_status', ['none', 'pending', 'paid', 'refunded'])->default('none');
            
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index(['reservation_date', 'reservation_time']);
            $table->index(['status', 'reservation_date']);
            $table->unique(['table_id', 'reservation_date', 'reservation_time']);
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