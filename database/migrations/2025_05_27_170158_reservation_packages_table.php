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
        Schema::create('reservation_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->string('image')->nullable(); // Nama file gambar saja
            $table->text('description')->nullable();
            $table->json('includes')->nullable(); // Array of included items
            $table->string('duration');
            $table->integer('max_people')->default(2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Index
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservation_packages');
    }
};