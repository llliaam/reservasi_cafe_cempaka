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
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('image_url')->nullable();
            $table->boolean('is_available')->default(true);
            $table->boolean('is_active')->default(true);
            $table->string('cooking_time')->nullable(); // e.g., "15-20 menit"
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_orders')->default(0);
            $table->json('ingredients')->nullable(); // Array of ingredients
            $table->json('allergens')->nullable(); // Array of allergens
            $table->boolean('is_spicy')->default(false);
            $table->boolean('is_vegetarian')->default(false);
            $table->boolean('is_vegan')->default(false);
            $table->integer('calories')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index(['category_id', 'is_active', 'is_available']);
            $table->index(['average_rating', 'total_orders']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};