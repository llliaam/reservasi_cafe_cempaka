<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * TUJUAN: Menambahkan kolom yang hilang untuk tracking staff
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Cek dan tambahkan kolom hanya jika belum ada
            if (!Schema::hasColumn('orders', 'confirmed_by_staff')) {
                $table->unsignedBigInteger('confirmed_by_staff')->nullable();
                $table->foreign('confirmed_by_staff')->references('id')->on('users');
            }
            
            if (!Schema::hasColumn('orders', 'confirmed_at')) {
                $table->timestamp('confirmed_at')->nullable();
            }
            
            if (!Schema::hasColumn('orders', 'cancelled_by_staff')) {
                $table->unsignedBigInteger('cancelled_by_staff')->nullable();
                $table->foreign('cancelled_by_staff')->references('id')->on('users');
            }
            
            if (!Schema::hasColumn('orders', 'cancelled_at')) {
                $table->timestamp('cancelled_at')->nullable();
            }
            
            if (!Schema::hasColumn('orders', 'cancelled_by_user')) {
                $table->boolean('cancelled_by_user')->default(false);
            }
            
            if (!Schema::hasColumn('orders', 'cancellation_reason')) {
                $table->text('cancellation_reason')->nullable();
            }
        });
    }

    /**
     * TUJUAN: Rollback yang aman
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Drop foreign keys dulu jika ada
            $foreignKeys = [
                'orders_confirmed_by_staff_foreign',
                'orders_cancelled_by_staff_foreign'
            ];
            
            foreach ($foreignKeys as $key) {
                try {
                    $table->dropForeign($key);
                } catch (\Exception $e) {
                    // Skip jika foreign key tidak ada
                }
            }
            
            // Drop kolom jika ada
            $columns = [
                'confirmed_by_staff',
                'confirmed_at', 
                'cancelled_by_staff',
                'cancelled_at',
                'cancelled_by_user',
                'cancellation_reason'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('orders', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};