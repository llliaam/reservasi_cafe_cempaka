<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\User;
use App\Models\UserReview;
use App\Models\MenuItem;
use App\Models\MenuCategory;
use App\Models\OfflineOrder;      
use App\Models\OfflineOrderItem;  
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Schema;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        // Get today's date
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        
        // Today's stats
        $todayOrders = Order::whereDate('order_time', $today);
        $yesterdayOrders = Order::whereDate('order_time', $yesterday);
        
        $todayStats = [
            'totalRevenue' => $todayOrders->where('status', Order::STATUS_COMPLETED)->sum('total_amount'),
            'totalOrders' => $todayOrders->count(),
            'activeCustomers' => $todayOrders->distinct('user_id')->count('user_id'),
        ];
        
        $yesterdayStats = [
            'totalRevenue' => $yesterdayOrders->where('status', Order::STATUS_COMPLETED)->sum('total_amount'),
            'totalOrders' => $yesterdayOrders->count(),
            'activeCustomers' => $yesterdayOrders->distinct('user_id')->count('user_id'),
        ];
        
        // Calculate average order value
        $todayStats['avgOrderValue'] = $todayStats['totalOrders'] > 0 
            ? $todayStats['totalRevenue'] / $todayStats['totalOrders'] 
            : 0;
        
        // Calculate growth percentages
        $revenueGrowth = $yesterdayStats['totalRevenue'] > 0 
            ? (($todayStats['totalRevenue'] - $yesterdayStats['totalRevenue']) / $yesterdayStats['totalRevenue']) * 100 
            : 0;
        
        $ordersGrowth = $yesterdayStats['totalOrders'] > 0 
            ? (($todayStats['totalOrders'] - $yesterdayStats['totalOrders']) / $yesterdayStats['totalOrders']) * 100 
            : 0;
        
        $customerGrowth = $yesterdayStats['activeCustomers'] > 0 
            ? (($todayStats['activeCustomers'] - $yesterdayStats['activeCustomers']) / $yesterdayStats['activeCustomers']) * 100 
            : 0;
        
        // Add growth to stats
        $todayStats['revenueGrowth'] = round($revenueGrowth, 1);
        $todayStats['ordersGrowth'] = round($ordersGrowth, 1);
        $todayStats['customerGrowth'] = round($customerGrowth, 1);
        
        // Get hourly data for today
        $hourlyData = Order::whereDate('order_time', $today)
            ->select(
                DB::raw('HOUR(order_time) as hour'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(CASE WHEN status = "completed" THEN total_amount ELSE 0 END) as revenue')
            )
            ->groupBy(DB::raw('HOUR(order_time)'))
            ->orderBy('hour')
            ->get()
            ->map(function ($item) {
                return [
                    'hour' => sprintf('%02d:00', $item->hour),
                    'orders' => $item->orders,
                    'revenue' => $item->revenue
                ];
            });
        
        // Fill missing hours with 0 data
        $completeHourlyData = collect();
        for ($hour = 8; $hour <= 22; $hour++) {
            $hourStr = sprintf('%02d:00', $hour);
            $existing = $hourlyData->firstWhere('hour', $hourStr);
            
            $completeHourlyData->push([
                'hour' => $hourStr,
                'orders' => $existing['orders'] ?? 0,
                'revenue' => $existing['revenue'] ?? 0
            ]);
        }
        
        // Get recent activities (orders and reservations)
        $recentOrders = Order::with(['user', 'orderItems.menuItem'])
            ->whereDate('order_time', $today)
            ->orderBy('order_time', 'desc')
            ->limit(10)
            ->get();
        
        $recentReservations = Reservation::with(['user', 'package'])
            ->whereDate('created_at', $today)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        // Format recent activities
        $recentActivities = collect();
        
        // Add orders to activities
        foreach ($recentOrders as $order) {
            $customerName = $order->customer_name ?: ($order->user ? $order->user->name : 'Guest');
            $description = $order->orderItems->first()?->menuItem?->name ?? 'Order';
            
            if ($order->orderItems->count() > 1) {
                $description .= ' + ' . ($order->orderItems->count() - 1) . ' item lainnya';
            }
            
            $recentActivities->push([
                'id' => 'order_' . $order->id,
                'type' => $order->order_type === 'delivery' ? 'online' : 'sale',
                'description' => $description,
                'amount' => $order->status === Order::STATUS_CANCELLED ? -$order->total_amount : $order->total_amount,
                'time' => $order->order_time->diffForHumans(),
                'customer' => $customerName,
                'status' => $order->status
            ]);
        }
        
        // Add reservations to activities
        foreach ($recentReservations as $reservation) {
            $customerName = $reservation->customer_name ?: ($reservation->user ? $reservation->user->name : 'Guest');
            
            $recentActivities->push([
                'id' => 'reservation_' . $reservation->id,
                'type' => 'reservation',
                'description' => 'Reservasi - ' . $reservation->getPackageName(),
                'amount' => $reservation->total_price,
                'time' => $reservation->created_at->diffForHumans(),
                'customer' => $customerName,
                'status' => $reservation->status
            ]);
        }
        
        // Sort by time and take latest 5
        $recentActivities = $recentActivities->sortByDesc(function ($activity) {
            return $activity['time'];
        })->take(5)->values();
        
        // Get pending orders count
        $pendingOrdersCount = Order::whereIn('status', [
            Order::STATUS_PENDING, 
            Order::STATUS_CONFIRMED, 
            Order::STATUS_PREPARING
        ])->count();
        
        // Get today's reservations count
        $todayReservationsCount = Reservation::whereDate('reservation_date', $today)->count();

        // ADDED: Get reservations and tables data for StaffReservasi component
        $reservationsData = $this->getReservationsData($request);
        $tablesData = $this->getTablesDataWithRealtime(); // RESTORED: Use realtime method
        $ordersData = $this->getOrdersData($request);
        $offlineOrdersData = $this->getOfflineOrdersData($request);

        // Gabungkan online dan offline orders
        $allOrdersData = $ordersData->concat($offlineOrdersData)->sortByDesc('order_time');

         try {
            $menuItems = MenuItem::with('category')
                ->where('is_available', true)
                ->orderBy('sort_order')
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'price' => $item->price,
                        'image' => $item->image_url ?? 'default.jpg',
                        'category' => $item->category->name ?? 'Uncategorized'
                    ];
                });

            // ADDED: Get available tables untuk dine-in orders
            $availableTables = RestaurantTable::where('status', 'available')
                ->orderBy('table_number')
                ->get()
                ->map(function ($table) {
                    return [
                        'id' => $table->id,
                        'meja_name' => $table->meja_name ?? "Meja {$table->table_number}",
                        'capacity' => $table->capacity,
                        'location' => $table->full_location ?? 'Unknown'
                    ];
                });

        } catch (\Exception $e) {
            \Log::error('Error loading cashier data: ' . $e->getMessage());
            $menuItems = collect([]);
            $availableTables = collect([]);
        }
            
        // Return StaffPage with all data including reservations
        return Inertia::render('staff/staffPage', [
            'dashboardData' => [
                'todayStats' => $todayStats,
                'hourlyData' => $completeHourlyData,
                'recentActivities' => $recentActivities,
                'pendingOrdersCount' => $pendingOrdersCount,
                'todayReservationsCount' => $todayReservationsCount,
            ],
            // ADDED: Pass reservations data to StaffPage
            'reservationsData' => $reservationsData,
            'tablesData' => $tablesData,
            'ordersData' => $allOrdersData,
            'availableTables' => $availableTables,
            'menuItems' => $menuItems,
            'reservationFilters' => [
                'status' => $request->status ?? 'all',
                'date' => $request->date ?? ''
            ]
        ]);
    }

    /**
     * Helper method to get reservations data
     */
    private function getReservationsData(Request $request)
    {
        try {
            $query = Reservation::query()
                ->orderBy('reservation_date', 'desc')
                ->orderBy('reservation_time', 'desc');
            
            \Log::info('Server-side filtering applied:', [
                'status_filter' => 'handled_by_client',
                'date_filter' => 'handled_by_client' // Tanggal dihandle di client
            ]);

            // Load semua data tanpa filter apapun - biarkan client yang handle
            $reservations = $query
                ->leftJoin('reservation_packages', 'reservations.package_id', '=', 'reservation_packages.id')
                ->leftJoin('restaurant_tables', 'reservations.table_id', '=', 'restaurant_tables.id')
                ->leftJoin('users', 'reservations.user_id', '=', 'users.id')
                ->select([
                    'reservations.*',
                    'reservation_packages.name as package_name',
                    'reservation_packages.max_people as package_max_people',
                    'restaurant_tables.table_number',
                    'restaurant_tables.capacity as table_capacity',
                    'restaurant_tables.location_type as table_location_type',
                    'restaurant_tables.location_detail as table_location_detail',
                    'restaurant_tables.status as table_status',
                    'users.name as user_name',
                    'users.email as user_email'
                ])
                ->get();

            \Log::info('Query executed successfully:', [
                'total_reservations_loaded' => $reservations->count(),
                'filter_status' => $request->status ?? 'all'
            ]);

            $transformedReservations = $reservations->map(function ($reservation) {
                try {
                    return $this->transformReservationData($reservation);
                } catch (\Exception $e) {
                    \Log::warning("Error transforming reservation {$reservation->id}: " . $e->getMessage());
                    return $this->getFallbackReservationData($reservation);
                }
            });

            return $transformedReservations;

        } catch (\Exception $e) {
            \Log::error('Error getting reservations data: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return collect([]);
        }
    }

/**
 * Get tables data - DIRECT DATABASE VERSION
 */
private function getTablesData()
{
    try {
        return DB::table('restaurant_tables')
            ->leftJoin('reservations', function($join) {
                $join->on('restaurant_tables.id', '=', 'reservations.table_id')
                     ->where('reservations.status', '=', 'confirmed')
                     ->whereDate('reservations.reservation_date', '=', today());
            })
            ->select([
                'restaurant_tables.*',
                'reservations.customer_name as current_customer',
                'reservations.reservation_time as current_time'
            ])
            ->orderBy('restaurant_tables.table_number')
            ->get()
            ->map(function ($table) {
                return $this->transformTableData($table);
            });

    } catch (\Exception $e) {
        \Log::error('Error getting tables data: ' . $e->getMessage());
        return collect([]);
    }
}

private function getOfflineOrdersData(Request $request)
{
    try {
        $query = OfflineOrder::with(['staff', 'items.menuItem', 'table'])
            ->orderBy('order_time', 'desc');

        $orders = $query->get();

        $transformedOrders = $orders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_code' => $order->order_code,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'customer_email' => $order->customer_email,
                'order_type' => $order->order_type,
                'order_type_label' => $order->order_type === 'dine_in' ? 'Makan di Tempat' : 'Bawa Pulang',
                'status' => $order->status,
                'status_label' => $order->status_label,
                'payment_method' => $order->payment_method,
                'payment_method_label' => $order->payment_method === 'cash' ? 'Tunai' : 'Kartu Debit',
                'payment_status' => $order->payment_status,
                'subtotal' => $order->subtotal,
                'service_fee' => $order->service_fee,
                'total_amount' => $order->total_amount,
                'formatted_total' => $order->formatted_total,
                'order_time' => $order->order_time->format('d/m/Y H:i'),
                'items_count' => $order->items->sum('quantity'),
                'main_item' => $order->items->first()?->menu_item_name ?? 'Unknown Item',
                'table_name' => $order->table?->meja_name,
                'staff_name' => $order->staff?->name,
                'order_source' => 'Offline (Staff)',
                'items' => $order->items->map(function ($item) {
                    return [
                        'menu_name' => $item->menu_item_name,
                        'quantity' => $item->quantity,
                        'price' => $item->menu_item_price,
                        'subtotal' => $item->subtotal,
                        'special_instructions' => $item->special_instructions
                    ];
                })
            ];
        });

        return $transformedOrders;

    } catch (\Exception $e) {
        \Log::error('Error getting offline orders data: ' . $e->getMessage());
        return collect([]);
    }
}


/**
 * Transform table data
 */
private function transformTableData($table)
{
    $statusLabels = [
        'available' => 'Tersedia',
        'occupied' => 'Terisi',
        'reserved' => 'Direservasi',
        'maintenance' => 'Maintenance'
    ];

    $statusColors = [
        'available' => 'green',
        'occupied' => 'red',
        'reserved' => 'yellow',
        'maintenance' => 'gray'
    ];

    $fullLocation = ucfirst($table->location_type);
    if ($table->location_detail) {
        $fullLocation .= " - {$table->location_detail}";
    }

    $currentReservation = null;
    if ($table->current_customer) {
        $currentReservation = [
            'customer_name' => $table->current_customer,
            'time' => date('H:i', strtotime($table->current_time))
        ];
    }

    return [
        'id' => $table->id,
        'table_number' => $table->table_number,
        'meja_name' => "Meja {$table->table_number}",
        'capacity' => $table->capacity,
        'status' => $table->status,
        'location_type' => $table->location_type,
        'location_detail' => $table->location_detail,
        'full_location' => $fullLocation,
        'status_label' => $statusLabels[$table->status] ?? $table->status,
        'status_color' => $statusColors[$table->status] ?? 'gray',
        'is_available' => $table->status === 'available',
        'current_reservation' => $currentReservation,
        'today_reservations_count' => 0, // Bisa dihitung terpisah jika diperlukan
    ];
}


    /**
     * Fallback data for broken reservations
     */
    private function getFallbackReservationData($reservation)
{
    // Coba ambil package secara manual jika ada package_id
    $packageName = 'Paket Tidak Dikenal';
    if ($reservation->package_id) {
        try {
            $package = \App\Models\ReservationPackage::find($reservation->package_id);
            if ($package) {
                $packageName = $package->name;
            } else {
                // Hard fallback
                $fallbackPackages = [
                    1 => 'Paket Romantis (2 Orang)',
                    2 => 'Paket Keluarga (4 Orang)',
                    3 => 'Paket Gathering (8 Orang)',
                ];
                $packageName = $fallbackPackages[$reservation->package_id] ?? "Paket ID {$reservation->package_id}";
            }
        } catch (\Exception $e) {
            // Ignore dan use default
        }
    }

    // Coba ambil table secara manual jika ada table_id
    $tableName = null;
    $tableNumber = null;
    if ($reservation->table_id) {
        try {
            $table = \App\Models\RestaurantTable::find($reservation->table_id);
            if ($table) {
                $tableName = $table->meja_name;
                $tableNumber = $table->table_number;
            }
        } catch (\Exception $e) {
            // Ignore dan use null
        }
    }

    // Format total price dengan fallback
    $totalPrice = 'Rp 0';
    if ($reservation->total_price && is_numeric($reservation->total_price)) {
        $totalPrice = 'Rp ' . number_format($reservation->total_price, 0, ',', '.');
    }

    return [
        'id' => $reservation->id,
        'reservation_code' => $reservation->reservation_code ?? 'RSV-ERROR-' . $reservation->id,
        'customer_name' => $reservation->customer_name ?? 'Nama tidak tersedia',
        'customer_phone' => $reservation->customer_phone ?? 'Tidak tersedia',
        'customer_email' => $reservation->customer_email ?? '',
        'date' => $reservation->reservation_date ? date('d/m/Y', strtotime($reservation->reservation_date)) : '',
        'time' => $reservation->reservation_time ? date('H:i', strtotime($reservation->reservation_time)) : '',
        'guests' => $reservation->number_of_people ?? 0,
        'status' => $reservation->status ?? 'pending',
        'package_name' => $packageName,
        'table_name' => $tableName,
        'table_number' => $tableNumber,
        'total_price' => $totalPrice,
        'table_location' => $reservation->table_location ?? '',
        'location_detail' => null,
        'payment_method' => $reservation->payment_method ?? '',
        'payment_method_label' => $reservation->payment_method ?? '',
        'proof_of_payment' => null,
        'special_requests' => $reservation->special_requests,
        'can_be_confirmed' => $reservation->status === 'pending',
        'can_be_cancelled' => in_array($reservation->status, ['pending', 'confirmed']),
        'requires_payment_confirmation' => true,
        
        // Debug info
        'is_fallback' => true,
        'package_id' => $reservation->package_id,
        'table_id' => $reservation->table_id,
    ];
}


    /**
 * IMPROVED: Fallback data for broken tables
 */
private function getFallbackTableData($table)
{
    return [
        'id' => $table->id,
        'table_number' => $table->table_number,
        'meja_name' => "Meja {$table->table_number}",
        'capacity' => $table->capacity,
        'status' => $table->status,
        'location_type' => $table->location_type,
        'location_detail' => $table->location_detail,
        'full_location' => "{$table->location_type}" . ($table->location_detail ? " - {$table->location_detail}" : ''),
        'status_label' => ucfirst($table->status),
        'status_color' => 'gray',
        'is_available' => $table->status === 'available',
        'current_reservation' => null,
        'today_reservations_count' => 0,
    ];
}
    
    public function dashboard()
    {
        return $this->index();
    }

    // ==================== RESERVATION MANAGEMENT (PURE INERTIA) ====================

    /**
     * Show reservations management page with data
     */
   public function reservationsManagement(Request $request)
{
    try {
        $query = Reservation::query()
            ->orderBy('reservation_date', 'desc')
            ->orderBy('reservation_time', 'desc');
        
        $reservations = $query
            ->leftJoin('reservation_packages', 'reservations.package_id', '=', 'reservation_packages.id')
            ->leftJoin('restaurant_tables', 'reservations.table_id', '=', 'restaurant_tables.id')
            ->leftJoin('users', 'reservations.user_id', '=', 'users.id')
            ->select([
                'reservations.*',
                'reservation_packages.name as package_name',
                'reservation_packages.max_people as package_max_people',
                'restaurant_tables.table_number',
                'restaurant_tables.capacity as table_capacity',
                'restaurant_tables.location_type as table_location_type',
                'restaurant_tables.location_detail as table_location_detail',
                'restaurant_tables.status as table_status',
                'users.name as user_name',
                'users.email as user_email'
            ])
            ->get()
            ->map(function ($reservation) {
                try {
                    return $this->transformReservationData($reservation);
                } catch (\Exception $e) {
                    \Log::warning("Error transforming reservation {$reservation->id}: " . $e->getMessage());
                    return $this->getFallbackReservationData($reservation);
                }
            });

        $tables = $this->getTablesDataWithRealtime();
        return Inertia::render('staff/staffReservasi', [
            'reservations' => $reservations,
            'tables' => $tables,
            'filters' => [
                'status' => $request->status ?? 'all',
                'date' => $request->date ?? ''
            ]
        ]);

    } catch (\Exception $e) {
        \Log::error('Error in reservationsManagement: ' . $e->getMessage());

        return Inertia::render('staff/staffReservasi', [
            'reservations' => [], 
            'tables' => [],       
            'filters' => [
                'status' => $request->status ?? 'all',
                'date' => $request->date ?? ''
            ],
            'error' => 'Terjadi kesalahan saat memuat data. Silakan refresh halaman.'
        ]);
    }
}

/**
 * Fallback untuk package name
 */
private function getPackageNameFallback($packageId)
{
    $fallbackPackages = [
        1 => 'Paket Romantis (2 Orang)',
        2 => 'Paket Keluarga (4 Orang)',
        3 => 'Paket Gathering (8 Orang)',
        4 => 'Paket Spesial (6 Orang)',
        5 => 'Paket VIP (10 Orang)',
    ];

    return $fallbackPackages[$packageId] ?? "Paket ID {$packageId}";
}

/**
 * Transform reservation data ke format yang dibutuhkan frontend
 */
private function transformReservationData($reservation)
{
    // Format table name
    $tableName = null;
    if ($reservation->table_number) {
        $tableName = "Meja {$reservation->table_number}";
    }

    // Format package name dengan fallback
    $packageName = $reservation->package_name ?? $this->getPackageNameFallback($reservation->package_id);

    // Format total price
    $totalPrice = 'Rp 0';
    if ($reservation->total_price && is_numeric($reservation->total_price)) {
        $totalPrice = 'Rp ' . number_format($reservation->total_price, 0, ',', '.');
    }

    // PERBAIKAN: Format tanggal dan waktu dengan error handling yang lebih baik
    $formattedDate = '';
    $formattedTime = '';
    $rawDate = '';
    $rawTime = '';

    try {
        if ($reservation->reservation_date) {
            // Pastikan format konsisten
            if (is_string($reservation->reservation_date)) {
                $dateObj = new \Carbon\Carbon($reservation->reservation_date);
                $formattedDate = $dateObj->format('d/m/Y');
                $rawDate = $dateObj->format('Y-m-d'); // Format untuk filter
            } else {
                // Sudah Carbon object
                $formattedDate = $reservation->reservation_date->format('d/m/Y');
                $rawDate = $reservation->reservation_date->format('Y-m-d');
            }
        }

        if ($reservation->reservation_time) {
            if (is_string($reservation->reservation_time)) {
                $timeObj = new \Carbon\Carbon($reservation->reservation_time);
                $formattedTime = $timeObj->format('H:i');
                $rawTime = $timeObj->format('H:i');
            } else {
                $formattedTime = $reservation->reservation_time->format('H:i');
                $rawTime = $reservation->reservation_time->format('H:i');
            }
        }
    } catch (\Exception $e) {
        \Log::error("Date formatting error for reservation {$reservation->id}: " . $e->getMessage());
        $formattedDate = 'Invalid Date';
        $formattedTime = 'Invalid Time';
        $rawDate = '';
        $rawTime = '';
    }

    // Payment method label
    $paymentMethodLabels = [
        'transfer' => 'Transfer Bank',
        'bca' => 'BCA Mobile',
        'mandiri' => 'Mandiri Online',
        'bni' => 'BNI Mobile',
        'bri' => 'BRI Mobile',
        'gopay' => 'GoPay',
        'ovo' => 'OVO',
        'dana' => 'DANA',
        'shopeepay' => 'ShopeePay',
        'pay-later' => 'Bayar di Tempat',
    ];
    $paymentMethodLabel = $paymentMethodLabels[$reservation->payment_method] ?? $reservation->payment_method;

    // Location detail
    $locationDetail = $reservation->table_location_type;
    if ($reservation->table_location_detail) {
        $locationDetail .= " - {$reservation->table_location_detail}";
    }

    return [
        'id' => $reservation->id,
        'reservation_code' => $reservation->reservation_code,
        'customer_name' => $reservation->customer_name,
        'customer_phone' => $reservation->customer_phone ?: 'Tidak tersedia',
        'customer_email' => $reservation->customer_email,
        'package_name' => $packageName,
        'table_name' => $tableName,
        'table_number' => $reservation->table_number,
        'date' => $formattedDate,  // Format display (dd/mm/yyyy)
        'raw_date' => $rawDate,    // TAMBAHAN: Format untuk filtering (yyyy-mm-dd)
        'time' => $formattedTime,
        'raw_time' => $rawTime,    // TAMBAHAN: Format raw time
        'guests' => $reservation->number_of_people,
        'status' => $reservation->status,
        'payment_method' => $reservation->payment_method,
        'payment_method_label' => $paymentMethodLabel,
        'total_price' => $totalPrice,
        'special_requests' => $reservation->special_requests,
        'table_location' => $reservation->table_location,
        'location_detail' => $locationDetail,
        'proof_of_payment' => $reservation->proof_of_payment ? asset("storage/reservations/payments/{$reservation->proof_of_payment}") : null,
        'can_be_confirmed' => $reservation->status === 'pending',
        'can_be_cancelled' => in_array($reservation->status, ['pending', 'confirmed']),
        'requires_payment_confirmation' => in_array($reservation->payment_method, ['transfer', 'bca', 'mandiri', 'bni', 'bri', 'gopay', 'ovo', 'dana', 'shopeepay']),
    ];
}

// === UPDATE METHOD updateOrderStatus ===
    public function updateOrderStatus(Request $request, $orderId)
{
    $request->validate([
        'status' => 'required|in:confirmed,cancelled,completed',
        'notes' => 'nullable|string|max:500'
    ]);

    try {
        $order = Order::findOrFail($orderId);
        $order->status = $request->status;
        
        if ($request->status === 'completed' && !$order->completed_at) {
            $order->completed_at = now();
        }
        
        $order->save();

        $statusMessages = [
            'confirmed' => 'dikonfirmasi',
            'cancelled' => 'ditolak/dibatalkan', 
            'completed' => 'diselesaikan'
        ];
        
        $statusMessage = $statusMessages[$request->status] ?? "diubah";

        // === REDIRECT KE URL BEDA (BUKAN BACK) ===
        return redirect()->route('StaffPage')->with([
            'success' => "Pesanan {$order->order_code} berhasil {$statusMessage}",
            'tab' => 'online-orders'  // Pass tab info
        ]);

    } catch (\Exception $e) {
        return redirect()->route('StaffPage')->with([
            'error' => 'Terjadi kesalahan: ' . $e->getMessage(),
            'tab' => 'online-orders'
        ]);
    }
}
    

    /**
     * Update reservation status
     */
    public function updateReservationStatus(Request $request, $id): RedirectResponse
    {
        \Log::info('=== UPDATE RESERVATION STATUS ===', [
            'reservation_id' => $id,
            'request_data' => $request->all()
        ]);

        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
            'notes' => 'nullable|string|max:500'
        ]);

       try {
        $reservation = Reservation::with(['package', 'table'])->findOrFail($id);
        
        $oldStatus = $reservation->status;
        $newStatus = $request->status;

        DB::beginTransaction();

        // Update reservation status
        $reservation->status = $newStatus;
        $saved = $reservation->save();

        if (!$saved) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menyimpan status reservasi');
        }

        // Auto-free table when completed/cancelled
        if ($reservation->table_id && in_array($newStatus, ['completed', 'cancelled'])) {
            $table = RestaurantTable::find($reservation->table_id);
            if ($table) {
                $table->updateRealtimeStatus(); // Update berdasarkan kondisi realtime
                
                \Log::info('Table status auto-updated after reservation status change', [
                    'reservation_id' => $reservation->id,
                    'table_id' => $table->id,
                    'new_table_status' => $table->fresh()->status,
                    'reason' => $newStatus
                ]);
            }
        }

        // Auto-assign table for confirmed reservations
        if ($newStatus === 'confirmed' && !$reservation->table_id) {
            // ... existing auto-assign logic ...
        }

        DB::commit();

        $statusMessages = [
            'confirmed' => 'dikonfirmasi',
            'cancelled' => 'dibatalkan', 
            'completed' => 'diselesaikan'
        ];
        
        $statusMessage = $statusMessages[$newStatus] ?? "diubah ke {$newStatus}";

        return redirect()->back()->with('success', 
            "Reservasi {$reservation->reservation_code} berhasil {$statusMessage}"
        );

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Reservation not found: ' . $id);
            return redirect()->back()->with('error', 'Reservasi tidak ditemukan');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed:', ['errors' => $e->errors()]);
            return redirect()->back()->withErrors($e->errors())->withInput();
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Error updating reservation status: ' . $e->getMessage(), [
                'reservation_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengubah status reservasi: ' . $e->getMessage());
        }
    }

    /**
     * Assign table to reservation
     */
    public function assignTableToReservation(Request $request, $id): RedirectResponse
{
    \Log::info('=== ASSIGN TABLE TO RESERVATION ===', [
        'reservation_id' => $id,
        'table_id' => $request->table_id
    ]);

    $request->validate([
        'table_id' => 'required|exists:restaurant_tables,id'
    ]);

    try {
        $reservation = Reservation::with('package')->findOrFail($id);
        $table = RestaurantTable::findOrFail($request->table_id);

        \Log::info('Assignment details:', [
            'reservation_id' => $reservation->id,
            'table_id' => $table->id,
            'table_number' => $table->table_number,
            'table_status' => $table->status,
            'table_capacity' => $table->capacity,
            'required_capacity' => $reservation->package?->max_people ?? $reservation->number_of_people
        ]);

        $success = $reservation->assignTable($table);

        if ($success) {
            \Log::info('Table assigned successfully');
            
            return redirect()->back()->with('success', 
                "Meja {$table->meja_name} berhasil ditetapkan untuk reservasi {$reservation->reservation_code}"
            );
        }

        \Log::warning('Table assignment failed');
        return redirect()->back()->with('error', 
            'Gagal menetapkan meja ke reservasi. Pastikan meja tersedia dan dapat menampung jumlah tamu.'
        );

    } catch (\Exception $e) {
        \Log::error('Error assigning table: ' . $e->getMessage(), [
            'reservation_id' => $id,
            'table_id' => $request->table_id,
            'trace' => $e->getTraceAsString()
        ]);

        return redirect()->back()->with('error', 'Terjadi kesalahan saat menetapkan meja: ' . $e->getMessage());
    }
}

    /**
     * Get available tables for reservation (returns to same page with additional data)
     */
    public function getAvailableTablesForReservation($id, Request $request)
    {
        $reservation = Reservation::with('package')->findOrFail($id);

        $availableTables = RestaurantTable::availableForReservation(
            $reservation->table_location,
            $reservation->package->max_people,
            $reservation->reservation_date,
            $reservation->reservation_time->format('H:i')
        )->get()->map(function ($table) {
            return $table->getSummary();
        });

        // Return the same page with additional available tables data
        return $this->reservationsManagement($request)->with([
            'availableTablesForReservation' => $availableTables
        ]);
    }

    /**
     * Get table status overview (for tables tab)
     */
    public function getTableStatus(Request $request)
    {
        // Just redirect back to reservations management page with tables focus
        return redirect()->route('staff.reservations.management', ['tab' => 'tables']);
    }

 /**
 * Update table status manually
 */
    public function updateTableStatus(Request $request, $tableId): RedirectResponse
    {
        \Log::info('=== MANUAL TABLE STATUS UPDATE DEBUG ===', [
            'table_id' => $tableId,
            'request_all' => $request->all(),
            'request_method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'csrf_token' => $request->header('X-CSRF-TOKEN'),
            'raw_input' => $request->getContent()
        ]);

        try {
            // Validate
            $validated = $request->validate([
                'status' => 'required|in:available,occupied,reserved,maintenance'
            ]);

            \Log::info('Validation passed:', $validated);

            // Find table - debug current state
            $table = RestaurantTable::findOrFail($tableId);
            
            \Log::info('BEFORE UPDATE - Table state:', [
                'id' => $table->id,
                'table_number' => $table->table_number,
                'current_status' => $table->status,
                'new_status' => $validated['status'],
                'has_reservations' => $table->reservations()->where('status', 'confirmed')->exists(),
                'reservation_count' => $table->reservations()->where('status', 'confirmed')->count()
            ]);
            
            $oldStatus = $table->status;
            $newStatus = $validated['status'];
            
            // Method 1: Eloquent update
            $table->status = $newStatus;
            $saved = $table->save();
            
            \Log::info('Eloquent update result:', [
                'saved' => $saved,
                'table_status_after_save' => $table->status
            ]);

            // Method 2: Query builder update (fallback)
            if (!$saved) {
                \Log::info('Eloquent failed, trying query builder...');
                
                $updated = DB::table('restaurant_tables')
                            ->where('id', $tableId)
                            ->update([
                                'status' => $newStatus,
                                'updated_at' => now()
                            ]);
                
                \Log::info('Query builder update result:', ['affected_rows' => $updated]);
            }

            // Verify in database
            $freshTable = DB::table('restaurant_tables')->where('id', $tableId)->first();
            
            \Log::info('AFTER UPDATE - Database verification:', [
                'database_status' => $freshTable->status,
                'database_updated_at' => $freshTable->updated_at,
                'update_successful' => $freshTable->status === $newStatus
            ]);
            
            if ($freshTable->status === $newStatus) {
                return redirect()->back()->with([
                    'success' => "Status {$table->meja_name} berhasil diubah dari {$oldStatus} ke {$newStatus}",
                    'debug_info' => "Database confirmed: {$freshTable->status}",
                    'updated_table_id' => $tableId,
                    'updated_table_status' => $newStatus
                ]);
            } else {
                \Log::error('UPDATE FAILED - Status not changed in database');
                return redirect()->back()->with('error', 'Status tidak berubah di database. Debug: ' . json_encode([
                    'expected' => $newStatus,
                    'actual' => $freshTable->status,
                    'eloquent_saved' => $saved ?? false
                ]));
            }
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error:', $e->errors());
            return redirect()->back()->withErrors($e->errors())->with('error', 'Validasi gagal');
            
        } catch (\Exception $e) {
            \Log::error('Unexpected error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Get today's reservation schedule
     */
    public function getTodayReservations(Request $request)
    {
        return $this->reservationsManagement($request->merge(['date' => today()->format('Y-m-d')]));
    }
    

    /**
     * Get reservation statistics (redirect to management page with stats)
     */
    public function getReservationStats(Request $request)
    {
        $startDate = $request->get('start_date', today()->startOfMonth());
        $endDate = $request->get('end_date', today()->endOfMonth());

        $query = Reservation::whereBetween('reservation_date', [$startDate, $endDate]);

        $stats = [
            'total_reservations' => $query->count(),
            'confirmed_reservations' => (clone $query)->where('status', 'confirmed')->count(),
            'pending_reservations' => (clone $query)->where('status', 'pending')->count(),
            'cancelled_reservations' => (clone $query)->where('status', 'cancelled')->count(),
            'completed_reservations' => (clone $query)->where('status', 'completed')->count(),
            'total_revenue' => (clone $query)->where('status', 'completed')->sum('total_price'),
            'average_party_size' => round((clone $query)->avg('number_of_people'), 1),
        ];

        return $this->reservationsManagement($request)->with(['reservationStats' => $stats]);
    }

    private function getTablesDataWithRealtime()
{
    try {
        \Log::info('=== GETTING TABLES WITH REALTIME UPDATE ===');
        
        // Update all tables berdasarkan reservasi confirmed
        $updatedCount = RestaurantTable::updateAllRealtimeStatuses();
        
        \Log::info('Realtime update completed:', [
            'tables_updated' => $updatedCount
        ]);
        
        // Get fresh table data
        $tables = RestaurantTable::active()
            ->orderBy('table_number')
            ->get()
            ->map(function ($table) {
                $summary = $table->getSummary();
                
                \Log::info("Table {$table->table_number} status:", [
                    'status' => $summary['status'],
                    'has_reservations' => count($summary['all_reservations']) > 0,
                    'reservations_count' => count($summary['all_reservations'])
                ]);
                
                return $summary;
            });

        return $tables;

    } catch (\Exception $e) {
        \Log::error('Error in getTablesDataWithRealtime: ' . $e->getMessage());
        return collect([]);
    }
}

/**
 * Get orders data for staff interface
 */
// === UPDATE METHOD getOrdersData ===
private function getOrdersData(Request $request)
{
    try {
        $query = Order::with(['user', 'orderItems.menuItem'])
            ->orderBy('order_time', 'desc');

        $orders = $query->get();

        $transformedOrders = $orders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_code' => $order->order_code,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'customer_email' => $order->customer_email,
                'order_type' => $order->order_type,
                'order_type_label' => $order->order_type_label,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'payment_method' => $order->payment_method,
                'payment_method_label' => $order->payment_method_label,
                'payment_status' => $order->payment_status,
                'payment_proof' => $order->payment_proof ? asset("storage/{$order->payment_proof}") : null, // === TAMBAH INI ===

                'subtotal' => $order->subtotal,
                'delivery_fee' => $order->delivery_fee ?? 0,
                'service_fee' => $order->service_fee ?? 0,
                'total_amount' => $order->total_amount,
                'delivery_address' => $order->delivery_address,
                'notes' => $order->notes,

                'total_amount' => $order->total_amount,
                'formatted_total' => $order->formatted_total,
                'order_time' => $order->order_time->format('d/m/Y H:i'),
                'items_count' => $order->orderItems->sum('quantity'),
                'main_item' => $order->orderItems->first()?->menuItem?->name ?? 'Unknown Item',
                'items' => $order->orderItems->map(function ($item) {
                    return [
                        'menu_name' => $item->menuItem?->name ?? 'Unknown Item',
                        'quantity' => $item->quantity,
                        'price' => $item->menu_item_price,
                        'subtotal' => $item->subtotal,
                        'special_instructions' => $item->special_instructions
                    ];
                })
            ];
        });

        return $transformedOrders;

    } catch (\Exception $e) {
        \Log::error('Error getting orders data: ' . $e->getMessage());
        return collect([]);
    }
}
}