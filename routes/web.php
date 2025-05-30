<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\FavoriteMenuController;
use App\Http\Controllers\MenuItemController;
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

// Menu Page with all data loaded
Route::get('/menu', [OrderController::class, 'index'])->name('menu.index');

// Alternative Menu Page Route (untuk backward compatibility)
Route::get('/menuPage', [OrderController::class, 'index'])->name('Menu Caffe');

// Admin Dashboard
Route::get('/dashboardAdmin', function () {
    return Inertia::render('adminDashboard');
})->name('adminDashboard');

Route::get('/staffPage', function () {
        return Inertia::render(component: 'staff/staffPage');
    })->name('StaffPage');


/*
|--------------------------------------------------------------------------
| Authentication Required Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ===== ORDER MANAGEMENT =====
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders', [OrderController::class, 'history'])->name('orders.index');
    Route::get('/orders/history', [OrderController::class, 'history'])->name('orders.history');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::get('/orders/{order}/track', [OrderController::class, 'trackOrder'])->name('orders.track');

    // ===== RESERVATION MANAGEMENT =====
    Route::get('/reservation', [ReservationController::class, 'create'])->name('reservation');
    Route::get('/reservations', [ReservationController::class, 'index'])->name('reservations.index');
    Route::get('/reservations/create', [ReservationController::class, 'create'])->name('reservations.create');
    Route::post('/reservations', [ReservationController::class, 'store'])->name('reservations.store');
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show'])->name('reservations.show');
    Route::get('/reservations/{reservation}/edit', [ReservationController::class, 'edit'])->name('reservations.edit');
    Route::put('/reservations/{reservation}', [ReservationController::class, 'update'])->name('reservations.update');
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'destroy'])->name('reservations.destroy');

    // ===== FAVORITES MANAGEMENT =====
    Route::get('/my-favorites', [FavoriteMenuController::class, 'index'])->name('favorites.index');
    Route::post('/favorites/{menuItem}/toggle', [FavoriteMenuController::class, 'toggle'])->name('favorites.toggle');
    Route::delete('/favorites/{menuItem}', [FavoriteMenuController::class, 'remove'])->name('favorites.remove');
    Route::delete('/favorites/clear', [FavoriteMenuController::class, 'clear'])->name('favorites.clear');

    // ===== REVIEW MANAGEMENT =====
    Route::prefix('reviews')->name('reviews.')->group(function () {
        Route::get('/', [ReviewController::class, 'index'])->name('index');
        Route::get('/create', [ReviewController::class, 'create'])->name('create');
        Route::post('/', [ReviewController::class, 'store'])->name('store');
        Route::get('/{review}/edit', [ReviewController::class, 'edit'])->name('edit');
        Route::put('/{review}', [ReviewController::class, 'update'])->name('update');
        Route::delete('/{review}', [ReviewController::class, 'destroy'])->name('destroy');
        Route::post('/{review}/helpful', [ReviewController::class, 'markHelpful'])->name('mark-helpful');
    });

    // ===== MENU SEARCH & FILTER (Web-based) =====
    Route::get('/menu/search', [MenuItemController::class, 'search'])->name('menu.search');
    Route::get('/menu/category/{category}', [MenuItemController::class, 'byCategory'])->name('menu.category');

    // ===== IMAGE HANDLING =====
    Route::post('/reservations/{reservation}/images', [ReservationController::class, 'uploadImages'])->name('reservations.upload-images');
    Route::delete('/reservations/{reservation}/images/{filename}', [ReservationController::class, 'deleteImage'])->name('reservations.delete-image');
    Route::get('/reservations/{reservation}/images/{filename}', [ReservationController::class, 'getImage'])->name('reservations.get-image');

    // ===== ADMIN ROUTES =====
    Route::middleware(['auth','admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/reservations', [ReservationController::class, 'adminIndex'])->name('reservations.index');
        Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus'])->name('reservations.update-status');
        Route::get('/orders', [OrderController::class, 'adminIndex'])->name('orders.index');
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
        Route::post('/reviews/{id}/response', [ReviewController::class, 'addAdminResponse'])->name('reviews.add-response');
        Route::delete('/reviews/{id}/response', [ReviewController::class, 'removeAdminResponse'])->name('reviews.remove-response');
        Route::patch('/reviews/{id}/featured', [ReviewController::class, 'markAsFeatured'])->name('reviews.mark-featured');
        Route::patch('/reviews/{id}/verified', [ReviewController::class, 'markAsVerified'])->name('reviews.mark-verified');
    });

    // ===== LEGACY ROUTES (Backward Compatibility) =====
    Route::get('/riwayat-pemesanan', [OrderController::class, 'history'])->name('riwayat-pemesanan');
    Route::get('/riwayat-reservasi', [ReservationController::class, 'index'])->name('riwayat-reservasi');
    Route::get('/menu-favorit', [FavoriteMenuController::class, 'index'])->name('menu-favorit');
    Route::get('/ulasan', [ReviewController::class, 'index'])->name('ulasan');

    // ==== PAPI ====
    // Staff Page
});

/*
|--------------------------------------------------------------------------
| Include Additional Route Files
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
