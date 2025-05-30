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
        Schema::create('user_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('menu_item_id')->nullable()->constrained()->onDelete('set null'); // Menu utama yang direview
            $table->tinyInteger('rating')->comment('Rating 1-5');
            $table->text('comment')->nullable();
            $table->integer('helpful_count')->default(0);
            $table->boolean('is_verified')->default(false); // Apakah review sudah diverifikasi
            $table->boolean('is_featured')->default(false); // Apakah review ditampilkan sebagai featured
            
            // Admin response
            $table->text('admin_response')->nullable();
            $table->timestamp('admin_response_date')->nullable();
            $table->unsignedBigInteger('admin_response_by')->nullable();
            
            // Metadata
            $table->json('metadata')->nullable(); // Data tambahan seperti photos, tags, etc
            $table->timestamp('reviewed_at'); // Kapan review dibuat
            $table->timestamps();
            
            // Indexes untuk performa
            $table->index(['user_id', 'rating']);
            $table->index(['order_id']);
            $table->index(['menu_item_id', 'rating']);
            $table->index(['rating', 'created_at']);
            $table->index(['is_featured', 'rating']);
            
            // Unique constraint: satu user hanya bisa review satu order sekali
            $table->unique(['user_id', 'order_id']);
            
            // Foreign key untuk admin response
            $table->foreign('admin_response_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_reviews');
    }
};