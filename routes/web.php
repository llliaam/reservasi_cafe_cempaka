<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\ReviewController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Landing Page
Route::get('/', function () {
    return Inertia::render('landingPage');
})->name('home');

// Menu Page
Route::get('/menuPage', function () {
    return Inertia::render('menuPage');
})->name('Menu Caffe');

// Reservation Page
Route::get('/reservation', function () {
    return Inertia::render('reservation');
})->name('Reservasi!');

/*
|--------------------------------------------------------------------------
| Authentication Required Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard - PERBAIKAN: Gunakan controller untuk data dinamis
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile');
    
    // PERBAIKAN: Riwayat Pemesanan - gunakan OrderController bukan ReservationController
    Route::get('/riwayat-pemesanan', [OrderController::class, 'index'])->name('riwayat-pemesanan');
    
    // Riwayat Reservasi
    Route::get('/riwayat-reservasi', [ReservationController::class, 'index'])->name('riwayat-reservasi');
    
    // Menu Favorit
    Route::get('/menu-favorit', [FavoriteController::class, 'index'])->name('menu-favorit');
    
    // Ulasan
    Route::get('/ulasan', [ReviewController::class, 'index'])->name('ulasan');

    /*
    |--------------------------------------------------------------------------
    | Detailed Routes untuk Functionality Lengkap
    |--------------------------------------------------------------------------
    */
    
    // Riwayat Reservasi - Routes lengkap
    Route::prefix('riwayat-reservasi')->name('riwayat-reservasi.')->group(function () {
        Route::post('/', [ReservationController::class, 'store'])->name('store');
        Route::get('/{id}', [ReservationController::class, 'show'])->name('show');
        Route::put('/{id}', [ReservationController::class, 'update'])->name('update');
        Route::patch('/{id}/cancel', [ReservationController::class, 'cancel'])->name('cancel');
    });
    
    // Riwayat Pemesanan - Routes lengkap
    Route::prefix('riwayat-pemesanan')->name('riwayat-pemesanan.')->group(function () {
        Route::get('/{id}', [OrderController::class, 'show'])->name('show');
        Route::post('/{id}/review', [OrderController::class, 'addReview'])->name('add-review');
        Route::put('/{id}/review', [OrderController::class, 'updateReview'])->name('update-review');
        Route::get('/export', [OrderController::class, 'export'])->name('export');
    });
    
    // Menu Favorit - Routes lengkap
    Route::prefix('menu-favorit')->name('menu-favorit.')->group(function () {
        Route::post('/', [FavoriteController::class, 'store'])->name('store');
        Route::delete('/{id}', [FavoriteController::class, 'destroy'])->name('destroy');
        Route::post('/toggle', [FavoriteController::class, 'toggle'])->name('toggle');
        Route::post('/add-to-cart', [FavoriteController::class, 'addToCart'])->name('add-to-cart');
    });
    
    // Ulasan - Routes lengkap
    Route::prefix('ulasan')->name('ulasan.')->group(function () {
        Route::post('/', [ReviewController::class, 'store'])->name('store');
        Route::put('/{id}', [ReviewController::class, 'update'])->name('update');
        Route::delete('/{id}', [ReviewController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/helpful', [ReviewController::class, 'markHelpful'])->name('helpful');
    });
});

/*
|--------------------------------------------------------------------------
| API Routes untuk AJAX calls
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->prefix('api')->name('api.')->group(function () {
    
    // Favorites API
    Route::post('/favorites/toggle', [FavoriteController::class, 'toggle'])->name('favorites.toggle');
    
    // Reviews API
    Route::get('/reviews/stats', [ReviewController::class, 'getReviewStats'])->name('reviews.stats');
    Route::get('/reviews/reviewable-orders', [ReviewController::class, 'getReviewableOrders'])->name('reviews.reviewable-orders');
    Route::post('/reviews/{id}/helpful', [ReviewController::class, 'markHelpful'])->name('reviews.helpful');
    
    // Dashboard API
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats'])->name('dashboard.stats');
});

/*
|--------------------------------------------------------------------------
| Include Additional Route Files
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';