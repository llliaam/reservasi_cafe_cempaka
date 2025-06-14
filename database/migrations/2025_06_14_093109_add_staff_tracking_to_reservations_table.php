<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * TUJUAN: Menambahkan kolom untuk tracking staff di reservasi
     */
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Tracking staff actions
            $table->unsignedBigInteger('last_updated_by')->nullable()->after('status');
            $table->json('status_log')->nullable()->after('last_updated_by');
            
            // Konfirmasi oleh staff  
            $table->unsignedBigInteger('confirmed_by_staff')->nullable()->after('status_log');
            $table->timestamp('confirmed_at')->nullable()->after('confirmed_by_staff');
            
            // Pembatalan oleh staff
            $table->unsignedBigInteger('cancelled_by_staff')->nullable()->after('confirmed_at');
            $table->timestamp('cancelled_at')->nullable()->after('cancelled_by_staff');
            $table->boolean('cancelled_by_user')->default(false)->after('cancelled_at');
            $table->text('cancellation_reason')->nullable()->after('cancelled_by_user');
            
            // Foreign keys
            $table->foreign('last_updated_by')->references('id')->on('users');
            $table->foreign('confirmed_by_staff')->references('id')->on('users');
            $table->foreign('cancelled_by_staff')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['last_updated_by']);
            $table->dropForeign(['confirmed_by_staff']);
            $table->dropForeign(['cancelled_by_staff']);
            
            $table->dropColumn([
                'last_updated_by', 
                'status_log',
                'confirmed_by_staff',
                'confirmed_at',
                'cancelled_by_staff',
                'cancelled_at',
                'cancelled_by_user',
                'cancellation_reason'
            ]);
        });
    }
};