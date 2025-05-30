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
            $table->foreignId('menu_item_id')->constrained()->onDelete('restrict');
            
            // Item details (denormalized untuk history)
            $table->string('menu_item_name'); // Nama menu saat order
            $table->decimal('menu_item_price', 10, 2); // Harga saat order
            $table->integer('quantity'); // Jumlah item
            $table->decimal('subtotal', 10, 2); // Price * quantity
            
            // Customization
            $table->text('special_instructions')->nullable(); // Instruksi khusus per item
            $table->json('modifications')->nullable(); // Modifikasi menu (extra, less, etc)
            
            $table->timestamps();
            
            // Indexes
            $table->index('order_id');
            $table->index('menu_item_id');
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