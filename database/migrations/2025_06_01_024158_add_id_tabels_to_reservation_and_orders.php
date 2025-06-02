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
        // Add table_id to reservations table
        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignId('table_id')->nullable()->after('table_location')->constrained('restaurant_tables')->onDelete('set null');
            $table->index('table_id');
        });

        // Add table_id to orders table (for dine-in orders)
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('table_id')->nullable()->after('order_type')->constrained('restaurant_tables')->onDelete('set null');
            $table->index(['order_type', 'table_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['table_id']);
            $table->dropColumn('table_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['table_id']);
            $table->dropColumn('table_id');
        });
    }
};