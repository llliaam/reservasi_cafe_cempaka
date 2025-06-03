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
use App\Http\Controllers\RestaurantTableController;
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
    
     // ===== STAFF DASHBOARD/REPORTS =====
    Route::get('/dashboard', [StaffController::class, 'dashboard'])->name('dashboard');
    
    // ===== STAFF ORDER MANAGEMENT =====
    Route::get('/orders', [OrderController::class, 'staffIndex'])->name('orders.index');
    // Route::patch('/orders/{order}/status', [OrderController::class, 'updateOrderStatus'])->name('orders.update-status');
    Route::get('/orders/{order}', [OrderController::class, 'staffShow'])->name('orders.show');
    Route::patch('/orders/{order}/status', [StaffController::class, 'updateOrderStatus'])->name('orders.update-status');

     // ===== STAFF OFFLINE ORDER =====
    Route::post('/orders/offline', [OrderController::class, 'storeOfflineOrder'])->name('orders.offline');
    Route::get('/tables/available-now', [RestaurantTableController::class, 'getAvailableTablesNow'])->name('tables.available-now');
    
    // ===== STAFF RESERVATION MANAGEMENT (PURE INERTIA) =====
    Route::get('/reservations', [StaffController::class, 'reservationsManagement'])->name('reservations.management');
    Route::patch('/reservations/{id}/status', [StaffController::class, 'updateReservationStatus'])->name('reservations.update-status');
    Route::patch('/reservations/{id}/assign-table', [StaffController::class, 'assignTableToReservation'])->name('reservations.assign-table');
    Route::get('/reservations/{id}/available-tables', [StaffController::class, 'getAvailableTablesForReservation'])->name('reservations.available-tables');
    
    // ===== STAFF TABLE MANAGEMENT (PURE INERTIA) =====
    Route::patch('/tables/{tableId}/status', [StaffController::class, 'updateTableStatus'])->name('tables.update-status');
    Route::get('/reservations/today', [StaffController::class, 'getTodayReservations'])->name('reservations.today');
    Route::get('/reservations/stats', [StaffController::class, 'getReservationStats'])->name('reservations.stats');
    Route::patch('/tables/{tableId}/status', [StaffController::class, 'updateTableStatus'])->name('tables.update-status');
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
    
    // ===== ADMIN TABLE MANAGEMENT (NEW) =====
    Route::get('/tables', [RestaurantTableController::class, 'index'])->name('tables.index');
    Route::post('/tables', [RestaurantTableController::class, 'store'])->name('tables.store');
    Route::get('/tables/create', function () {
        return Inertia::render('admin/tables/Create');
    })->name('tables.create');
    Route::get('/tables/{table}', [RestaurantTableController::class, 'show'])->name('tables.show');
    Route::get('/tables/{table}/edit', function ($table) {
        return Inertia::render('admin/tables/Edit', ['table' => $table]);
    })->name('tables.edit');
    Route::put('/tables/{table}', [RestaurantTableController::class, 'update'])->name('tables.update');
    Route::delete('/tables/{table}', [RestaurantTableController::class, 'destroy'])->name('tables.destroy');
    Route::patch('/tables/{table}/status', [RestaurantTableController::class, 'updateStatus'])->name('tables.update-status');
    Route::get('/tables/available', [RestaurantTableController::class, 'getAvailableTables'])->name('tables.available');
    Route::post('/tables/{table}/assign-reservation', [RestaurantTableController::class, 'assignToReservation'])->name('tables.assign-reservation');
    Route::get('/tables/statistics', [RestaurantTableController::class, 'getStatistics'])->name('tables.statistics');
    
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
| Enhanced Reservation Routes (for automatic table assignment)
|--------------------------------------------------------------------------
*/

// Override existing reservation store to include auto table assignment
Route::middleware(['auth', 'verified'])->group(function () {
    // This will automatically assign tables when reservations are created
    // The auto-assignment is handled in the Reservation model's boot method
    
    // Staff-specific reservation management pages
    Route::middleware('role:staff,admin')->group(function () {
        Route::get('/staff/reservations-management', function () {
            return Inertia::render('staff/staffReservasi');
        })->name('staff.reservations.management');
        
        Route::get('/staff/tables-overview', function () {
            return Inertia::render('staff/TablesOverview');
        })->name('staff.tables.overview');
    });
    
    // Admin-specific table management pages
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/tables-management', function () {
            return Inertia::render('admin/tables/Index');
        })->name('admin.tables.management');
        
        Route::get('/admin/reservations-overview', function () {
            return Inertia::render('admin/reservations/Overview');
        })->name('admin.reservations.overview');
    });
});

/*
|--------------------------------------------------------------------------
| Public Table Availability Check (for customers making reservations)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // Customers can check table availability when making reservations
    Route::get('/tables/available-for-reservation', [RestaurantTableController::class, 'getAvailableTables'])
         ->name('tables.available-for-reservation');
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

        Route::get('/update-tables-realtime', function() {
        $updated = \App\Models\RestaurantTable::updateAllRealtimeStatuses();
        return response()->json([
            'success' => true,
            'updated_tables' => $updated,
            'message' => "Updated {$updated} tables with realtime status"
        ]);
        })->middleware(['auth', 'role:staff,admin']);
        
        // Test table assignment
        Route::get('/test-table-assignment', function () {
            $reservation = \App\Models\Reservation::with(['package', 'table'])->first();
            if ($reservation) {
                return response()->json([
                    'reservation' => $reservation->getSummary(),
                    'package' => $reservation->package,
                    'table' => $reservation->table?->getSummary(),
                ]);
            }
            return response()->json(['message' => 'No reservations found']);
        });
        
        // Test available tables
        Route::get('/test-available-tables', function () {
            $tables = \App\Models\RestaurantTable::available()
                ->byLocation('indoor')
                ->minCapacity(2)
                ->get();
                
            return response()->json([
                'available_tables' => $tables->map(function ($table) {
                    return $table->getSummary();
                })
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