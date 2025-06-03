<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('offline_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            
            // Staff yang input order
            $table->foreignId('created_by_staff')->constrained('users')->onDelete('cascade');
            
            // Customer info (input manual)
            $table->string('customer_name');
            $table->string('customer_phone')->nullable();
            $table->string('customer_email')->nullable();
            
            // Order details
            $table->enum('order_type', ['dine_in', 'takeaway']);
            $table->foreignId('table_id')->nullable()->constrained('restaurant_tables')->onDelete('set null');
            $table->text('notes')->nullable();
            
            // Pricing
            $table->decimal('subtotal', 10, 2);
            $table->decimal('service_fee', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            
            // Payment
            $table->enum('payment_method', ['cash', 'debit_card']);
            $table->enum('payment_status', ['paid'])->default('paid'); // Offline orders always paid
            
            // Status
            $table->enum('status', ['confirmed', 'preparing', 'ready', 'completed', 'cancelled'])->default('confirmed');
            
            // Timestamps
            $table->timestamp('order_time')->useCurrent();
            $table->timestamp('estimated_ready_time')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['created_by_staff', 'order_time']);
            $table->index(['status', 'order_time']);
            $table->index('order_time');
        });
    }

    public function down()
    {
        Schema::dropIfExists('offline_orders');
    }
};