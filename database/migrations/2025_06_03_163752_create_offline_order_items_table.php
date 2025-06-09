<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('offline_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offline_order_id')->constrained('offline_orders')->onDelete('cascade');
            $table->foreignId('menu_item_id')->constrained('menu_items')->onDelete('cascade');
            
            // Snapshot data (untuk histori)
            $table->string('menu_item_name');
            $table->decimal('menu_item_price', 10, 2);
            
            // Order specifics
            $table->integer('quantity');
            $table->decimal('subtotal', 10, 2);
            $table->text('special_instructions')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['offline_order_id', 'menu_item_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('offline_order_items');
    }
};