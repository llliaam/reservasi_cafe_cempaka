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
        Schema::create('review_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_review_id')->constrained()->onDelete('cascade');
            $table->string('author_name')->default('Cemapaka Cafe Team'); // Nama yang merespon
            $table->text('response_text'); // Isi respon
            $table->timestamp('responded_at'); // Kapan respon dibuat
            $table->timestamps();
            
            // Index untuk performa
            $table->index('menu_review_id');
            $table->index('responded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_responses');
    }
};