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
        Schema::create('tables', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Meja 1", "Meja VIP A"
            $table->string('table_number')->unique(); // e.g., "001", "VIP-A"
            $table->integer('capacity'); // Max number of people
            $table->enum('type', ['regular', 'vip', 'outdoor', 'private'])->default('regular');
            $table->enum('status', ['available', 'occupied', 'reserved', 'maintenance'])->default('available');
            $table->text('description')->nullable();
            $table->json('features')->nullable(); // Array: ["AC", "View", "Smoking"]
            $table->decimal('additional_charge', 8, 2)->default(0); // Extra charge for VIP tables
            $table->string('location')->nullable(); // e.g., "Lantai 1", "Outdoor Area"
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['status', 'is_active']);
            $table->index(['type', 'capacity']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tables');
    }
};