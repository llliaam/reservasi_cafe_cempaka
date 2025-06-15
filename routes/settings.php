<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    // Rute utama untuk pengaturan, akan menampilkan komponen Settings.tsx
    // Ganti Route::redirect atau buat rute baru untuk langsung merender Settings.tsx

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('settings', function () {
        return Inertia::render('settings'); // Ini akan merender settings.tsx
    })->name('settings'); // Berikan nama rute yang umum jika Anda ingin menggunakannya

    // Rute profil yang sudah ada, mungkin masih diperlukan untuk backend atau API
    // Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    // Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // // Rute password yang sudah ada
    // Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    // Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    // Rute appearance yang sudah ada
    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});