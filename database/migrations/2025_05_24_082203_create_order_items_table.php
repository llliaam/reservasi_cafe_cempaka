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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('menu_id')->constrained()->onDelete('cascade');
            $table->string('menu_name'); // Snapshot of menu name at time of order
            $table->decimal('menu_price', 10, 2); // Snapshot of menu price at time of order
            $table->integer('quantity');
            $table->decimal('price', 10, 2); // menu_price at time of order
            $table->decimal('total_price', 10, 2); // quantity * price
            $table->text('special_instructions')->nullable();
            $table->json('customizations')->nullable(); // Array of customizations
            $table->enum('status', ['pending', 'preparing', 'ready', 'served'])->default('pending');
            $table->timestamps();
            
            $table->index(['order_id', 'menu_id']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};