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
        Schema::create('menu_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('menu_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->string('order_code')->nullable(); // Untuk referensi order (ORD-2025-001)
            $table->tinyInteger('rating')->unsigned(); // 1-5 bintang
            $table->text('comment'); // Komentar ulasan
            $table->integer('helpful_count')->default(0); // Jumlah orang yang merasa terbantu
            $table->boolean('is_verified')->default(false); // Apakah dari pembelian yang terverifikasi
            $table->json('images')->nullable(); // Foto ulasan jika ada
            $table->timestamp('reviewed_at'); // Kapan review dibuat
            $table->timestamps();
            
            // Index untuk performa
            $table->index(['menu_item_id', 'rating']);
            $table->index(['user_id', 'created_at']);
            $table->index('is_verified');
            
            // Constraint: user hanya bisa review 1x per menu per order
            $table->unique(['user_id', 'menu_item_id', 'order_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_reviews');
    }
};