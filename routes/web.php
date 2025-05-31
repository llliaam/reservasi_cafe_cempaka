<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\FavoriteMenuController;
use App\Http\Controllers\MenuItemController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

// Landing Page
Route::get('/', function () {
    return Inertia::render('landingPage');
})->name('home');

// Public Menu Page - Anyone can view menu
Route::get('/menu', [OrderController::class, 'index'])->name('menu.index');

// Alternative Menu Page Route (untuk backward compatibility)
Route::get('/menuPage', [OrderController::class, 'index'])->name('Menu Caffe');

/*
|--------------------------------------------------------------------------
| Guest Routes (Only for non-authenticated users)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    // Login, Register, dll akan otomatis redirect berdasarkan role jika sudah login
});

/*
|--------------------------------------------------------------------------
| Role-Based Dashboard Routes (Authenticated + Verified)
|--------------------------------------------------------------------------
*/

// Admin Dashboard - Only accessible by admin
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/dashboardAdmin', [AdminController::class, 'index'])->name('adminDashboard');
});

// Staff Page - Only accessible by staff and admin
Route::middleware(['auth', 'verified', 'role:staff,admin'])->group(function () {
    Route::get('/staffPage', [StaffController::class, 'index'])->name('StaffPage');
});

// Customer Dashboard - Only accessible by customer
Route::middleware(['auth', 'verified', 'role:customer'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

/*
|--------------------------------------------------------------------------
| Common Authenticated Routes (All Roles)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // ===== ORDER MANAGEMENT (All authenticated users can order) =====
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders', [OrderController::class, 'history'])->name('orders.index');
    Route::get('/orders/history', [OrderController::class, 'history'])->name('orders.history');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::get('/orders/{order}/track', [OrderController::class, 'trackOrder'])->name('orders.track');
    Route::get('/orders/{order}/payment', [OrderController::class, 'showPayment'])->name('orders.payment');
    Route::post('/orders/{order}/payment-proof', [OrderController::class, 'uploadPaymentProof'])->name('orders.payment-proof');

    // ===== RESERVATION MANAGEMENT (All authenticated users can make reservations) =====
    Route::get('/reservation', [ReservationController::class, 'create'])->name('reservation');
    Route::get('/reservations', [ReservationController::class, 'index'])->name('reservations.index');
    Route::get('/reservations/create', [ReservationController::class, 'create'])->name('reservations.create');
    Route::post('/reservations', [ReservationController::class, 'store'])->name('reservations.store');
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show'])->name('reservations.show');
    Route::get('/reservations/{reservation}/edit', [ReservationController::class, 'edit'])->name('reservations.edit');
    Route::put('/reservations/{reservation}', [ReservationController::class, 'update'])->name('reservations.update');
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'destroy'])->name('reservations.destroy');

    // ===== MENU SEARCH & FILTER =====
    Route::get('/menu/search', [MenuItemController::class, 'search'])->name('menu.search');
    Route::get('/menu/category/{category}', [MenuItemController::class, 'byCategory'])->name('menu.category');

    // ===== IMAGE HANDLING =====
    Route::post('/reservations/{reservation}/images', [ReservationController::class, 'uploadImages'])->name('reservations.upload-images');
    Route::delete('/reservations/{reservation}/images/{filename}', [ReservationController::class, 'deleteImage'])->name('reservations.delete-image');
    Route::get('/reservations/{reservation}/images/{filename}', [ReservationController::class, 'getImage'])->name('reservations.get-image');
});

/*
|--------------------------------------------------------------------------
| Customer-Only Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'role:customer'])->group(function () {
    
    // ===== FAVORITES MANAGEMENT (Only customers have favorites) =====
    Route::get('/my-favorites', [FavoriteMenuController::class, 'index'])->name('favorites.index');
    Route::post('/favorites/{menuItem}/toggle', [FavoriteMenuController::class, 'toggle'])->name('favorites.toggle');
    Route::delete('/favorites/{menuItem}', [FavoriteMenuController::class, 'remove'])->name('favorites.remove');
    Route::delete('/favorites/clear', [FavoriteMenuController::class, 'clear'])->name('favorites.clear');

    // ===== REVIEW MANAGEMENT (Only customers can write reviews) =====
    Route::prefix('reviews')->name('reviews.')->group(function () {
        Route::get('/', [ReviewController::class, 'index'])->name('index');
        Route::get('/create', [ReviewController::class, 'create'])->name('create');
        Route::post('/', [ReviewController::class, 'store'])->name('store');
        Route::get('/{review}/edit', [ReviewController::class, 'edit'])->name('edit');
        Route::put('/{review}', [ReviewController::class, 'update'])->name('update');
        Route::delete('/{review}', [ReviewController::class, 'destroy'])->name('destroy');
        Route::post('/{review}/helpful', [ReviewController::class, 'markHelpful'])->name('mark-helpful');
    });

    // ===== LEGACY ROUTES (Customer backward compatibility) =====
    Route::get('/riwayat-pemesanan', [OrderController::class, 'history'])->name('riwayat-pemesanan');
    Route::get('/riwayat-reservasi', [ReservationController::class, 'index'])->name('riwayat-reservasi');
    Route::get('/menu-favorit', [FavoriteMenuController::class, 'index'])->name('menu-favorit');
    Route::get('/ulasan', [ReviewController::class, 'index'])->name('ulasan');
});

/*
|--------------------------------------------------------------------------
| Staff Routes (Staff + Admin can access)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'role:staff,admin'])->prefix('staff')->name('staff.')->group(function () {
    
    // ===== STAFF ORDER MANAGEMENT =====
    Route::get('/orders', [OrderController::class, 'staffIndex'])->name('orders.index');
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateOrderStatus'])->name('orders.update-status');
    Route::get('/orders/{order}', [OrderController::class, 'staffShow'])->name('orders.show');
    
    // ===== STAFF RESERVATION MANAGEMENT =====
    Route::get('/reservations', [ReservationController::class, 'staffIndex'])->name('reservations.index');
    Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateReservationStatus'])->name('reservations.update-status');
    Route::get('/reservations/{reservation}', [ReservationController::class, 'staffShow'])->name('reservations.show');
    
    // ===== STAFF DASHBOARD/REPORTS =====
    Route::get('/dashboard', [StaffController::class, 'dashboard'])->name('dashboard');
});

/*
|--------------------------------------------------------------------------
| Admin-Only Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    
    // ===== ADMIN ORDER MANAGEMENT =====
    Route::get('/orders', [OrderController::class, 'adminIndex'])->name('orders.index');
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::delete('/orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');
    
    // ===== ADMIN RESERVATION MANAGEMENT =====
    Route::get('/reservations', [ReservationController::class, 'adminIndex'])->name('reservations.index');
    Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus'])->name('reservations.update-status');
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'adminDestroy'])->name('reservations.destroy');
    
    // ===== ADMIN REVIEW MANAGEMENT =====
    Route::post('/reviews/{id}/response', [ReviewController::class, 'addAdminResponse'])->name('reviews.add-response');
    Route::delete('/reviews/{id}/response', [ReviewController::class, 'removeAdminResponse'])->name('reviews.remove-response');
    Route::patch('/reviews/{id}/featured', [ReviewController::class, 'markAsFeatured'])->name('reviews.mark-featured');
    Route::patch('/reviews/{id}/verified', [ReviewController::class, 'markAsVerified'])->name('reviews.mark-verified');
    Route::delete('/reviews/{id}', [ReviewController::class, 'adminDestroy'])->name('reviews.destroy');
    
    // ===== ADMIN USER MANAGEMENT =====
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.update-role');
    Route::patch('/users/{user}/status', [UserController::class, 'updateStatus'])->name('users.update-status');
    
    // ===== ADMIN MENU MANAGEMENT =====
    Route::get('/menu', [MenuItemController::class, 'adminIndex'])->name('menu.index');
    Route::post('/menu', [MenuItemController::class, 'store'])->name('menu.store');
    Route::get('/menu/create', [MenuItemController::class, 'create'])->name('menu.create');
    Route::get('/menu/{menuItem}/edit', [MenuItemController::class, 'edit'])->name('menu.edit');
    Route::put('/menu/{menuItem}', [MenuItemController::class, 'update'])->name('menu.update');
    Route::delete('/menu/{menuItem}', [MenuItemController::class, 'destroy'])->name('menu.destroy');
    Route::patch('/menu/{menuItem}/status', [MenuItemController::class, 'updateStatus'])->name('menu.update-status');
    
    // ===== ADMIN ANALYTICS & REPORTS =====
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
    Route::get('/reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
    Route::get('/reports/customers', [ReportController::class, 'customers'])->name('reports.customers');
    Route::get('/reports/menu', [ReportController::class, 'menu'])->name('reports.menu');
    
    // ===== ADMIN SETTINGS =====
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings', [SettingsController::class, 'update'])->name('settings.update');
});

/*
|--------------------------------------------------------------------------
| Testing Routes (Remove in production)
|--------------------------------------------------------------------------
*/

if (app()->environment('local')) {
    Route::middleware(['auth'])->group(function () {
        Route::get('/test-role', function () {
            $user = auth()->user();
            return response()->json([
                'user' => $user->name,
                'role' => $user->role,
                'isAdmin' => $user->isAdmin(),
                'isStaff' => $user->isStaff(),
                'isCustomer' => $user->isCustomer(),
            ]);
        });
    });
}

/*
|--------------------------------------------------------------------------
| Include Additional Route Files
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';