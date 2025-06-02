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
        Schema::create('restaurant_tables', function (Blueprint $table) {
            $table->id();
            $table->integer('table_number')->unique()->comment('Nomor meja: 1, 2, 3, dst');
            $table->integer('capacity')->comment('Jumlah kursi maksimal');
            $table->enum('location_type', ['indoor', 'outdoor'])->comment('Tipe lokasi meja');
            $table->string('location_detail')->nullable()->comment('Detail lokasi: Window, Corner, VIP, Garden, dll');
            $table->enum('status', ['available', 'occupied', 'reserved', 'maintenance'])->default('available')->comment('Status meja saat ini');
            $table->boolean('is_active')->default(true)->comment('Apakah meja aktif digunakan');
            $table->timestamps();
            
            // Indexes
            $table->index(['location_type', 'status', 'is_active']);
            $table->index(['capacity', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurant_tables');
    }
};