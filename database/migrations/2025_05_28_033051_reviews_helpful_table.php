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
        Schema::create('review_helpfuls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_review_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // Constraint: user hanya bisa mark helpful 1x per review
            $table->unique(['menu_review_id', 'user_id']);
            
            // Index untuk performa
            $table->index('menu_review_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_helpfuls');
    }
};