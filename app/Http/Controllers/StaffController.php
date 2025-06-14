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

        $period = $request->get('period', 'today');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        switch ($period) {
            case 'week':
                $start = Carbon::now()->startOfWeek();
                $end = Carbon::now()->endOfWeek();
                break;
            case 'month':
                $start = Carbon::now()->startOfMonth();
                $end = Carbon::now()->endOfMonth();
                break;
            case 'custom':
                $start = $startDate ? Carbon::parse($startDate) : Carbon::today();
                $end = $endDate ? Carbon::parse($endDate) : Carbon::today();
                break;
            default: // today
                $start = Carbon::today();
                $end = Carbon::today();
        }

         \Log::info('Dashboard filter applied:', [
            'period' => $period,
            'start_date' => $start->format('Y-m-d'),
            'end_date' => $end->format('Y-m-d')
        ]);

         $filteredStats = $this->getStatsForPeriod($start, $end);
        //  $filteredHourlyData = $this->getHourlyDataForPeriod($start, $end, $period);

        try {
            $filteredHourlyData = $this->getHourlyDataForPeriod($start, $end, $period);
            
            \Log::info('Chart data generated successfully:', [
                'data_count' => $filteredHourlyData->count(),
                'period' => $period
            ]);
        } catch (\Exception $e) {
            \Log::error('Error generating chart data: ' . $e->getMessage());
            $filteredHourlyData = collect([]);
        }

         \Log::info('Filtered chart data:', [
            'period' => $period,
            'chart_data_count' => $filteredHourlyData->count(),
            'sample_data' => $filteredHourlyData->take(3)->toArray()
        ]);
        
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
                    'image' => $item->image_url, // ✅ Ini akan return full URL
                    'category' => $item->category->name ?? 'Uncategorized'
                ];
            })->toArray(); // ✅ TAMBAH toArray()
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
            
       // ✅ PERBAIKAN: Pastikan data dalam format array/collection yang benar
        $ordersData = $this->getOrdersData($request);
        $offlineOrdersData = $this->getOfflineOrdersData($request);
        $reservationsData = $this->getReservationsData($request);
        $tablesData = $this->getTablesDataWithRealtime();

        // Gabungkan online dan offline orders
        $allOrdersData = collect($ordersData)->concat(collect($offlineOrdersData))->sortByDesc('order_time')->values();

        // Pastikan semua data dalam format yang benar
        $finalOrdersData = $allOrdersData->toArray();
        $finalReservationsData = collect($reservationsData)->toArray();
        $finalTablesData = collect($tablesData)->toArray();

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
                        'image' => $item->image_url ?? '/images/poto_menu/default-food.jpg',
                        'category' => $item->category->name ?? 'Uncategorized'
                    ];
                })->toArray();

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
                })->toArray();

        } catch (\Exception $e) {
            \Log::error('Error loading cashier data: ' . $e->getMessage());
            $menuItems = [];
            $availableTables = [];
        }

        $pendingOrdersData = $this->getPendingOrdersData();
        $popularMenusData = $this->getPopularMenus(Carbon::today(), Carbon::today());
        $pendingReservationsData = $this->getPendingReservationsData();

        \Log::info('Data being sent to frontend:', [
            'pending_orders_count' => $pendingOrdersData->count(),
            'pending_reservations_count' => $pendingReservationsData->count(),
            'popular_count' => $popularMenusData->count(),
        ]);

        // Tambahkan try-catch untuk debug
        try {
            $pendingOrdersData = $this->getPendingOrdersData();
            $popularMenusData = $this->getPopularMenus(Carbon::today(), Carbon::today());
            
            // Debug log
            \Log::info('About to pass to frontend:', [
                'pending_count' => $pendingOrdersData->count(),
                'popular_count' => $popularMenusData->count(),
                'pending_sample' => $pendingOrdersData->first(),
                'popular_sample' => $popularMenusData->first()
            ]);

            $pendingReservationsData = $this->getPendingReservationsData();

            return Inertia::render('staff/staffPage', [
                'dashboardData' => [
                    'todayStats' => $filteredStats, 
                    'hourlyData' => $filteredHourlyData->toArray(),
                    'recentActivities' => $recentActivities->toArray(),
                    'pendingOrdersCount' => $pendingOrdersCount,
                    'todayReservationsCount' => $todayReservationsCount,
                ],
                'reservationsData' => $finalReservationsData,
                'tablesData' => $finalTablesData,
                'ordersData' => $finalOrdersData,
                'availableTables' => $availableTables,
                'menuItems' => $menuItems,
                'pendingReservations' => $pendingReservationsData->toArray(),
                'pendingOrders' => $pendingOrdersData->toArray(),
                'popularMenus' => $this->getPopularMenus($start, $end)->toArray(),
                'currentPeriod' => $period, // TAMBAH INI
                'currentDateRange' => [
                    'start' => $start->format('Y-m-d'),
                    'end' => $end->format('Y-m-d'),
                    'period' => $period
                ],               
                 'reservationFilters' => [
                    'status' => $request->status ?? 'all',
                    'date' => $request->date ?? ''
                 ]
                
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in StaffController index: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            // Return with empty data if error
            return Inertia::render('staff/staffPage', [
                'dashboardData' => [
                    'todayStats' => $todayStats,
                    'hourlyData' => $filteredHourlyData->toArray(),
                    'recentActivities' => $recentActivities->toArray(),
                    'pendingOrdersCount' => $pendingOrdersCount,
                    'todayReservationsCount' => $todayReservationsCount,
                ],
                'pendingOrders' => [],
                'popularMenus' => [],
                // ... other data
            ]);
        }
    }

    /**
     * Get pending reservations data
     */
    private function getPendingReservationsData()
    {
        try {
            $pendingReservations = Reservation::where('status', 'pending')
                ->leftJoin('reservation_packages', 'reservations.package_id', '=', 'reservation_packages.id')
                ->select([
                    'reservations.*',
                    'reservation_packages.name as package_name'
                ])
                ->orderBy('reservations.created_at', 'asc')
                ->get();

            \Log::info('Pending reservations found:', [
                'count' => $pendingReservations->count(),
                'sample' => $pendingReservations->first()
            ]);

            return $pendingReservations->map(function ($reservation) {
                // Safe date formatting
                $formattedDate = '';
                $formattedTime = '';
                
                try {
                    if ($reservation->reservation_date) {
                        $formattedDate = date('d/m/Y', strtotime($reservation->reservation_date));
                    }
                    if ($reservation->reservation_time) {
                        $formattedTime = date('H:i', strtotime($reservation->reservation_time));
                    }
                } catch (\Exception $e) {
                    \Log::warning("Date formatting error for reservation {$reservation->id}");
                    $formattedDate = 'Invalid Date';
                    $formattedTime = 'Invalid Time';
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

                // Package name with fallback
                $packageName = $reservation->package_name;
                if (!$packageName && $reservation->package_id) {
                    $fallbackPackages = [
                        1 => 'Paket Romantis (2 Orang)',
                        2 => 'Paket Keluarga (4 Orang)',
                        3 => 'Paket Gathering (8 Orang)',
                    ];
                    $packageName = $fallbackPackages[$reservation->package_id] ?? "Paket ID {$reservation->package_id}";
                }

                return [
                    'id' => $reservation->id,
                    'reservation_code' => $reservation->reservation_code,
                    'customer_name' => $reservation->customer_name,
                    'date' => $formattedDate,
                    'time' => $formattedTime,
                    'guests' => $reservation->number_of_people,
                    'package_name' => $packageName,
                    'total_price' => 'Rp ' . number_format($reservation->total_price, 0, ',', '.'),
                    'payment_method' => $reservation->payment_method,
                    'payment_method_label' => $paymentMethodLabel,
                    'status' => $reservation->status,
                    'minutes_since_created' => now()->diffInMinutes($reservation->created_at),
                ];
            });

        } catch (\Exception $e) {
            \Log::error('Error getting pending reservations: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get popular items dari orders + popular packages dari reservations
     */
    private function getPopularMenus($startDate, $endDate)
        {
            try {
                // POPULAR MENU ITEMS dari Orders
                $popularMenus = DB::table('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->whereBetween('orders.order_time', [$startDate, $endDate])
                    ->where('orders.status', 'completed')
                    ->select([
                        'order_items.menu_item_id',
                        DB::raw('SUM(order_items.quantity) as total_sold'),
                        DB::raw('SUM(order_items.subtotal) as total_revenue'),
                        DB::raw('"menu" as type')
                    ])
                    ->groupBy('order_items.menu_item_id')
                    ->orderBy('total_sold', 'desc')
                    ->limit(3)
                    ->get();

                // POPULAR RESERVATION PACKAGES
                $popularPackages = DB::table('reservations')
                    ->join('reservation_packages', 'reservations.package_id', '=', 'reservation_packages.id')
                    ->whereBetween('reservations.reservation_date', [$startDate, $endDate])
                    ->where('reservations.status', 'completed')
                    ->select([
                        'reservation_packages.id as package_id',
                        'reservation_packages.name as package_name',
                        DB::raw('COUNT(*) as total_sold'),
                        DB::raw('SUM(reservations.total_price) as total_revenue'),
                        DB::raw('"package" as type')
                    ])
                    ->groupBy('reservation_packages.id', 'reservation_packages.name')
                    ->orderBy('total_sold', 'desc')
                    ->limit(2)
                    ->get();

                $allPopular = collect();
                
                // Process menu items
                foreach ($popularMenus as $item) {
                    $menuItem = MenuItem::find($item->menu_item_id);
                    if ($menuItem) {
                        $allPopular->push([
                            'name' => $menuItem->name,
                            'image_url' => $menuItem->image_url ?: '/images/poto_menu/default-food.jpg',
                            'total_sold' => $item->total_sold,
                            'total_revenue' => $item->total_revenue,
                            'type' => 'Menu'
                        ]);
                    }
                }
                
                // Process packages
                foreach ($popularPackages as $package) {
                    $allPopular->push([
                        'name' => $package->package_name,
                        'image_url' => '/images/packages/default-package.jpg',
                        'total_sold' => $package->total_sold,
                        'total_revenue' => $package->total_revenue,
                        'type' => 'Paket Reservasi'
                    ]);
                }

                return $allPopular;

            } catch (\Exception $e) {
                \Log::error('Error getting popular items: ' . $e->getMessage());
                return collect([]);
            }
        }

/**
 * Get pending orders dari database ASLI
 */
private function getPendingOrdersData()
{
    try {
        // Query online orders
        $onlineOrders = Order::whereIn('status', ['pending', 'confirmed', 'preparing'])
            ->with(['orderItems']) // Load relation untuk count items
            ->orderBy('order_time', 'asc')
            ->get();

        $allPendingOrders = collect();
        
        foreach ($onlineOrders as $order) {
            $allPendingOrders->push([
                'id' => $order->id,
                'order_code' => $order->order_code,
                'customer_name' => $order->customer_name ?: 'Guest',
                'status' => $order->status,
                'status_label' => ucfirst($order->status),
                'total_amount' => $order->total_amount,
                'order_time' => $order->order_time->format('H:i'),
                'minutes_ago' => $order->order_time->diffInMinutes(now()),
                'items_count' => $order->orderItems->sum('quantity'),
                'is_urgent' => $order->order_time->diffInMinutes(now()) > 30,
                'type' => 'online'
            ]);
        }

        // Query offline orders jika ada
        if (Schema::hasTable('offline_orders')) {
            $offlineOrders = OfflineOrder::whereIn('status', ['confirmed', 'preparing'])
                ->with(['items'])
                ->orderBy('order_time', 'asc')
                ->get();

            foreach ($offlineOrders as $order) {
                $allPendingOrders->push([
                    'id' => $order->id,
                    'order_code' => $order->order_code,
                    'customer_name' => $order->customer_name,
                    'status' => $order->status,
                    'status_label' => ucfirst($order->status),
                    'total_amount' => $order->total_amount,
                    'order_time' => $order->order_time->format('H:i'),
                    'minutes_ago' => $order->order_time->diffInMinutes(now()),
                    'items_count' => $order->items->sum('quantity'),
                    'is_urgent' => $order->order_time->diffInMinutes(now()) > 30,
                    'type' => 'offline'
                ]);
            }
        }
        
        return $allPendingOrders->sortBy('order_time');

    } catch (\Exception $e) {
        \Log::error('Error getting pending orders: ' . $e->getMessage());
        return collect([]);
    }
}

    /**
     * Calculate growth percentage
     */
    private function calculateGrowth($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Get stats untuk semua revenue sources
     */
    private function getStatsForPeriod($startDate, $endDate)
    {
        // ORDERS (Online)
        $orders = Order::whereBetween('order_time', [$startDate, $endDate]);
        $orderRevenue = $orders->where('status', 'completed')->sum('total_amount');
        $orderCount = $orders->count();
        
        // OFFLINE ORDERS 
        $offlineOrders = OfflineOrder::whereBetween('order_time', [$startDate, $endDate]);
        $offlineRevenue = $offlineOrders->where('status', 'completed')->sum('total_amount');
        $offlineCount = $offlineOrders->count();
        
        // RESERVATIONS
        $reservations = Reservation::whereBetween('reservation_date', [$startDate, $endDate]);
        $reservationRevenue = $reservations->where('status', 'completed')->sum('total_price');
        $reservationCount = $reservations->count();
        
        // TOTAL GABUNGAN
        $totalRevenue = $orderRevenue + $offlineRevenue + $reservationRevenue;
        $totalTransactions = $orderCount + $offlineCount + $reservationCount;
        
        // CUSTOMER COUNT (gabungan)
        $onlineCustomers = $orders->distinct('user_id')->count('user_id');
        $offlineCustomers = $offlineOrders->distinct('customer_name')->count('customer_name');
        $reservationCustomers = $reservations->distinct('customer_name')->count('customer_name');
        $totalCustomers = $onlineCustomers + $offlineCustomers + $reservationCustomers;
        
        // Previous period untuk growth calculation
        $diffDays = $startDate->diffInDays($endDate) + 1;
        $previousStart = $startDate->copy()->subDays($diffDays);
        $previousEnd = $startDate->copy()->subDay();
        
        $previousOrderRevenue = Order::whereBetween('order_time', [$previousStart, $previousEnd])
            ->where('status', 'completed')->sum('total_amount');
        $previousOfflineRevenue = OfflineOrder::whereBetween('order_time', [$previousStart, $previousEnd])
            ->where('status', 'completed')->sum('total_amount');
        $previousReservationRevenue = Reservation::whereBetween('reservation_date', [$previousStart, $previousEnd])
            ->where('status', 'completed')->sum('total_price');
        
        $previousTotalRevenue = $previousOrderRevenue + $previousOfflineRevenue + $previousReservationRevenue;
        
        $previousOrderCount = Order::whereBetween('order_time', [$previousStart, $previousEnd])->count();
        $previousOfflineCount = OfflineOrder::whereBetween('order_time', [$previousStart, $previousEnd])->count();
        $previousReservationCount = Reservation::whereBetween('reservation_date', [$previousStart, $previousEnd])->count();
        $previousTotalTransactions = $previousOrderCount + $previousOfflineCount + $previousReservationCount;
        
        // Calculate stats
        $currentStats = [
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $totalTransactions,
            'activeCustomers' => $totalCustomers,
            'avgOrderValue' => $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0,
            
            // BREAKDOWN PER SOURCE
            'orderRevenue' => $orderRevenue,
            'offlineRevenue' => $offlineRevenue,
            'reservationRevenue' => $reservationRevenue,
            'orderCount' => $orderCount,
            'offlineCount' => $offlineCount,
            'reservationCount' => $reservationCount,
        ];
        
        // Calculate growth
        $currentStats['revenueGrowth'] = $this->calculateGrowth($totalRevenue, $previousTotalRevenue);
        $currentStats['ordersGrowth'] = $this->calculateGrowth($totalTransactions, $previousTotalTransactions);
        $currentStats['customerGrowth'] = 0; // Simplified for now
        
        return $currentStats;
    }

    /**
     * Get hourly data for period
     */
    private function getHourlyDataForPeriod($startDate, $endDate, $period)
    {
        $diffDays = $startDate->diffInDays($endDate);
        
        // Determine chart type based on period
        if ($period === 'today' || $diffDays <= 1) {
            // Show hourly data (08:00, 09:00, etc)
            return $this->getHourlyDataCombined($startDate);
        } elseif ($period === 'week' || $diffDays <= 7) {
            // Show daily data (Sen, Sel, Rab, etc)
            return $this->getDailyDataCombined($startDate, $endDate, 'days');
        } elseif ($period === 'month' || $diffDays <= 31) {
            // Show daily data (1, 2, 3, ... 31)
            return $this->getDailyDataCombined($startDate, $endDate, 'dates');
        } else {
            // Show monthly data (Apr, Mei, Jun, etc) for long periods
            return $this->getMonthlyDataCombined($startDate, $endDate);
        }
    }

    /**
     * Get daily data dengan format yang berbeda
     */
    private function getDailyDataCombined($startDate, $endDate, $format = 'dates')
    {
        try {
            // ORDERS
            $orderData = Order::whereBetween('order_time', [$startDate, $endDate])
                ->select(
                    DB::raw('DATE(order_time) as date'),
                    DB::raw('COUNT(*) as orders'),
                    DB::raw('SUM(CASE WHEN status = "completed" THEN total_amount ELSE 0 END) as revenue')
                )
                ->groupBy(DB::raw('DATE(order_time)'))
                ->get()
                ->keyBy('date');

            // OFFLINE ORDERS  
            $offlineData = OfflineOrder::whereBetween('order_time', [$startDate, $endDate])
                ->select(
                    DB::raw('DATE(order_time) as date'),
                    DB::raw('COUNT(*) as orders'),
                    DB::raw('SUM(CASE WHEN status = "completed" THEN total_amount ELSE 0 END) as revenue')
                )
                ->groupBy(DB::raw('DATE(order_time)'))
                ->get()
                ->keyBy('date');

            // RESERVATIONS
            $reservationData = Reservation::whereBetween('reservation_date', [$startDate, $endDate])
                ->select(
                    DB::raw('DATE(reservation_date) as date'),
                    DB::raw('COUNT(*) as orders'),
                    DB::raw('SUM(CASE WHEN status = "completed" THEN total_price ELSE 0 END) as revenue')
                )
                ->groupBy(DB::raw('DATE(reservation_date)'))
                ->get()
                ->keyBy('date');

            // GABUNGKAN DATA
            $combinedData = collect();
            $currentDate = $startDate->copy();
            
            while ($currentDate->lte($endDate)) {
                $dateStr = $currentDate->format('Y-m-d');
                
                $orderDay = $orderData->get($dateStr);
                $offlineDay = $offlineData->get($dateStr);
                $reservationDay = $reservationData->get($dateStr);
                
                // Format label berdasarkan tipe
               if ($format === 'days') {
                    // Format: Sen, Sel, Rab (nama hari)
                    $dayNames = ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
                    $label = $dayNames[$currentDate->dayOfWeek];
                } else {
                    // Format: 1, 2, 3 (tanggal)
                    $label = $currentDate->format('j');
                }
                
                $combinedData->push([
                    'hour' => $label,
                    'orders' => ($orderDay->orders ?? 0) + ($offlineDay->orders ?? 0) + ($reservationDay->orders ?? 0),
                    'revenue' => ($orderDay->revenue ?? 0) + ($offlineDay->revenue ?? 0) + ($reservationDay->revenue ?? 0),
                    'full_date' => $currentDate->format('d/m/Y') // For tooltip
                ]);
                
                $currentDate->addDay();
            }

            return $combinedData;

        } catch (\Exception $e) {
            \Log::error('Error in getDailyDataCombined: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get monthly data untuk periode panjang
     */
    private function getMonthlyDataCombined($startDate, $endDate)
    {
        try {
            // ORDERS
            $orderData = Order::whereBetween('order_time', [$startDate, $endDate])
                ->select(
                    DB::raw('YEAR(order_time) as year'),
                    DB::raw('MONTH(order_time) as month'),
                    DB::raw('COUNT(*) as orders'),
                    DB::raw('SUM(CASE WHEN status = "completed" THEN total_amount ELSE 0 END) as revenue')
                )
                ->groupBy(DB::raw('YEAR(order_time)'), DB::raw('MONTH(order_time)'))
                ->get()
                ->keyBy(function ($item) {
                    return $item->year . '-' . str_pad($item->month, 2, '0', STR_PAD_LEFT);
                });

            // OFFLINE ORDERS
            $offlineData = OfflineOrder::whereBetween('order_time', [$startDate, $endDate])
                ->select(
                    DB::raw('YEAR(order_time) as year'),
                    DB::raw('MONTH(order_time) as month'),
                    DB::raw('COUNT(*) as orders'),
                    DB::raw('SUM(CASE WHEN status = "completed" THEN total_amount ELSE 0 END) as revenue')
                )
                ->groupBy(DB::raw('YEAR(order_time)'), DB::raw('MONTH(order_time)'))
                ->get()
                ->keyBy(function ($item) {
                    return $item->year . '-' . str_pad($item->month, 2, '0', STR_PAD_LEFT);
                });

            // RESERVATIONS
            $reservationData = Reservation::whereBetween('reservation_date', [$startDate, $endDate])
                ->select(
                    DB::raw('YEAR(reservation_date) as year'),
                    DB::raw('MONTH(reservation_date) as month'),
                    DB::raw('COUNT(*) as orders'),
                    DB::raw('SUM(CASE WHEN status = "completed" THEN total_price ELSE 0 END) as revenue')
                )
                ->groupBy(DB::raw('YEAR(reservation_date)'), DB::raw('MONTH(reservation_date)'))
                ->get()
                ->keyBy(function ($item) {
                    return $item->year . '-' . str_pad($item->month, 2, '0', STR_PAD_LEFT);
                });

            // GABUNGKAN DATA PER BULAN
            $combinedData = collect();
            $currentMonth = $startDate->copy()->startOfMonth();
            $endMonth = $endDate->copy()->endOfMonth();
            
            while ($currentMonth->lte($endMonth)) {
                $monthKey = $currentMonth->format('Y-m');
                
                $orderMonth = $orderData->get($monthKey);
                $offlineMonth = $offlineData->get($monthKey);
                $reservationMonth = $reservationData->get($monthKey);
                
                $combinedData->push([
                    'hour' => $currentMonth->locale('id')->format('M'), // Jan, Feb, Mar
                    'orders' => ($orderMonth->orders ?? 0) + ($offlineMonth->orders ?? 0) + ($reservationMonth->orders ?? 0),
                    'revenue' => ($orderMonth->revenue ?? 0) + ($offlineMonth->revenue ?? 0) + ($reservationMonth->revenue ?? 0),
                    'full_date' => $currentMonth->format('M Y') // For tooltip
                ]);
                
                $currentMonth->addMonth();
            }

            return $combinedData;

        } catch (\Exception $e) {
            \Log::error('Error in getMonthlyDataCombined: ' . $e->getMessage());
            return collect([]);
        }
    }

    private function getHourlyDataCombined($date)
    {
        // ORDERS
        $orderData = Order::whereDate('order_time', $date)
            ->select(
                DB::raw('HOUR(order_time) as hour'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(CASE WHEN status = "completed" THEN total_amount ELSE 0 END) as revenue')
            )
            ->groupBy(DB::raw('HOUR(order_time)'))
            ->get()
            ->keyBy('hour');
        
        // OFFLINE ORDERS
        $offlineData = OfflineOrder::whereDate('order_time', $date)
            ->select(
                DB::raw('HOUR(order_time) as hour'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(CASE WHEN status = "completed" THEN total_amount ELSE 0 END) as revenue')
            )
            ->groupBy(DB::raw('HOUR(order_time)'))
            ->get()
            ->keyBy('hour');
        
        // RESERVATIONS (berdasarkan reservation_time)
        $reservationData = Reservation::whereDate('reservation_date', $date)
            ->select(
                DB::raw('HOUR(reservation_time) as hour'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(CASE WHEN status = "completed" THEN total_price ELSE 0 END) as revenue')
            )
            ->groupBy(DB::raw('HOUR(reservation_time)'))
            ->get()
            ->keyBy('hour');

        // GABUNGKAN DATA
        $completeHourlyData = collect();
        for ($hour = 8; $hour <= 22; $hour++) {
            $orderHour = $orderData->get($hour);
            $offlineHour = $offlineData->get($hour);
            $reservationHour = $reservationData->get($hour);
            
            $completeHourlyData->push([
                'hour' => sprintf('%02d:00', $hour),
                'orders' => ($orderHour->orders ?? 0) + ($offlineHour->orders ?? 0) + ($reservationHour->orders ?? 0),
                'revenue' => ($orderHour->revenue ?? 0) + ($offlineHour->revenue ?? 0) + ($reservationHour->revenue ?? 0)
            ]);
        }

        return $completeHourlyData;
    }


    /**
     * Get dashboard data with date filtering
     */
    public function getDashboardData(Request $request)
    {
        $dateRange = $request->get('date_range', 'today'); // today, week, month, custom
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        
        // Set date range berdasarkan filter
        switch ($dateRange) {
            case 'week':
                $start = Carbon::now()->startOfWeek();
                $end = Carbon::now()->endOfWeek();
                break;
            case 'month':
                $start = Carbon::now()->startOfMonth();
                $end = Carbon::now()->endOfMonth();
                break;
            case 'custom':
                $start = $startDate ? Carbon::parse($startDate) : Carbon::today();
                $end = $endDate ? Carbon::parse($endDate) : Carbon::today();
                break;
            default: // today
                $start = Carbon::today();
                $end = Carbon::today();
        }
        
        return response()->json([
            'stats' => $this->getStatsForPeriod($start, $end),
            'chartData' => $this->getChartData($start, $end, $dateRange),
            'pendingOrders' => $this->getPendingOrders(),
            'popularMenus' => $this->getPopularMenus($start, $end),
            'paymentBreakdown' => $this->getPaymentBreakdown($start, $end),
            'peakHours' => $this->getPeakHoursAnalysis($start, $end)
        ]);
    }

    /**
 * Get chart data based on date range
 */
private function getChartData($startDate, $endDate, $dateRange)
{
    if ($dateRange === 'today') {
        // Hourly data untuk hari ini
        return $this->getHourlyData($startDate);
    } elseif ($dateRange === 'week') {
        // Daily data untuk seminggu
        return $this->getDailyData($startDate, $endDate);
    } elseif ($dateRange === 'month') {
        // Daily data untuk sebulan
        return $this->getDailyData($startDate, $endDate);
    } else {
        // Custom range - pilih format berdasarkan range
        $days = $startDate->diffInDays($endDate);
        if ($days <= 1) {
            return $this->getHourlyData($startDate);
        } else {
            return $this->getDailyData($startDate, $endDate);
        }
    }
}

    private function getHourlyData($date)
    {
        $hourlyData = Order::whereDate('order_time', $date)
            ->select(
                DB::raw('HOUR(order_time) as hour'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(CASE WHEN status = "completed" THEN total_amount ELSE 0 END) as revenue')
            )
            ->groupBy(DB::raw('HOUR(order_time)'))
            ->orderBy('hour')
            ->get();

        $completeHourlyData = collect();
        for ($hour = 8; $hour <= 22; $hour++) {
            $existing = $hourlyData->firstWhere('hour', $hour);
            $completeHourlyData->push([
                'hour' => sprintf('%02d:00', $hour),
                'orders' => $existing->orders ?? 0,
                'revenue' => $existing->revenue ?? 0
            ]);
        }

        return $completeHourlyData;
    }

    private function getDailyData($startDate, $endDate)
    {
        return Order::whereBetween('order_time', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(order_time) as date'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(CASE WHEN status = "completed" THEN total_amount ELSE 0 END) as revenue')
            )
            ->groupBy(DB::raw('DATE(order_time)'))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'hour' => Carbon::parse($item->date)->format('d/m'),
                    'orders' => $item->orders,
                    'revenue' => $item->revenue
                ];
            });
    }


/**
 * Quick update order status
 */
public function updateOrderStatusQuick(Request $request, $orderId)
{
    $request->validate([
        'status' => 'required|in:confirmed,preparing,ready,completed,cancelled'
    ]);

    try {
        $order = Order::findOrFail($orderId);
        $order->updateStatus($request->status);
        
        return response()->json([
            'success' => true,
            'message' => "Status pesanan berhasil diubah ke {$request->status}"
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Terjadi kesalahan: ' . $e->getMessage()
        ], 500);
    }
}

/**
 * Get payment method breakdown
 */
private function getPaymentBreakdown($startDate, $endDate)
{
    return Order::whereBetween('order_time', [$startDate, $endDate])
        ->where('status', Order::STATUS_COMPLETED)
        ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
        ->groupBy('payment_method')
        ->get()
        ->map(function ($item) {
            return [
                'method' => $item->payment_method,
                'label' => $this->getPaymentMethodLabel($item->payment_method),
                'count' => $item->count,
                'total' => $item->total
            ];
        });
}

/**
 * Get peak hours analysis
 */
private function getPeakHoursAnalysis($startDate, $endDate)
{
    return Order::whereBetween('order_time', [$startDate, $endDate])
        ->select(
            DB::raw('HOUR(order_time) as hour'),
            DB::raw('COUNT(*) as order_count'),
            DB::raw('AVG(total_amount) as avg_order_value')
        )
        ->groupBy(DB::raw('HOUR(order_time)'))
        ->orderBy('order_count', 'desc')
        ->limit(3)
        ->get()
        ->map(function ($item) {
            return [
                'hour' => sprintf('%02d:00', $item->hour),
                'order_count' => $item->order_count,
                'avg_order_value' => round($item->avg_order_value, 0)
            ];
        });
}

private function getPaymentMethodLabel($method)
{
    $labels = [
        'cash' => 'Tunai',
        'dana' => 'DANA',
        'gopay' => 'GoPay',
        'ovo' => 'OVO',
        'shopeepay' => 'ShopeePay',
        'bca' => 'BCA',
        'mandiri' => 'Mandiri',
        'bni' => 'BNI',
        'bri' => 'BRI'
    ];
    
    return $labels[$method] ?? ucfirst($method);
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

  /**
 * TUJUAN: Update status pesanan dengan response Inertia (bukan JSON)
 */
public function updateOrderStatus(Request $request, $orderId)
{
    try {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,ready,completed,cancelled',
            'notes' => 'nullable|string|max:500'
        ]);
        
        $order = Order::findOrFail($orderId);
        $oldStatus = $order->status;
        $newStatus = $validated['status'];
        
        // Log status change
        $order->addStatusLog(
            $oldStatus, 
            $newStatus, 
            $validated['notes'] ?? $this->getDefaultStatusNote($newStatus, auth()->user()->name),
            auth()->id()
        );
        
        // Update status utama
        $order->status = $newStatus;
        
        // Update completed_at jika selesai
        if ($newStatus === 'completed') {
            $order->completed_at = now();
        }
        
        $order->save();
        
        // PERBAIKAN: Return redirect dengan flash message, BUKAN JSON
        return redirect()->back()->with('success', 'Status pesanan berhasil diupdate!');
        
    } catch (\Exception $e) {
        \Log::error('Error updating order status: ' . $e->getMessage());
        
        // PERBAIKAN: Return redirect dengan error message, BUKAN JSON  
        return redirect()->back()->with('error', 'Gagal mengupdate status pesanan: ' . $e->getMessage());
    }
}

private function getDefaultStatusNote($status, $staffName)
{
    $notes = [
        'confirmed' => "Pesanan dikonfirmasi oleh {$staffName}",
        'preparing' => "Pesanan sedang diproses oleh {$staffName}", 
        'ready' => "Pesanan siap diambil - diupdate oleh {$staffName}",
        'completed' => "Pesanan selesai - diupdate oleh {$staffName}",
        'cancelled' => "Pesanan dibatalkan oleh {$staffName}"
    ];
    
    return $notes[$status] ?? "Status diubah menjadi {$status} oleh {$staffName}";
}
    

   /**
 * TUJUAN: Update reservation status SAMA seperti updateOrderStatus
 */
public function updateReservationStatus(Request $request, $reservationId)
{
    try {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,ready,completed,cancelled',
            'notes' => 'nullable|string|max:500'
        ]);
        
        $reservation = Reservation::findOrFail($reservationId);
        $oldStatus = $reservation->status;
        $newStatus = $validated['status'];
        
        // SAMA seperti Order: Log status change dulu
        $reservation->addStatusLog(
            $oldStatus, 
            $newStatus, 
            $request->input('notes') ?? $this->getDefaultReservationStatusNote($newStatus, auth()->user()->name),
            auth()->id() // ID staff yang sedang login
        );
        
        // Update status utama
        $reservation->status = $newStatus;
        
        // Update completed_at jika selesai (SAMA seperti Order)
        if ($newStatus === 'completed') {
            $reservation->completed_at = now();
        }
        
        $reservation->save();
        
        // Update table status jika perlu
        $reservation->updateTableStatus();
        
        // PENTING: Return redirect dengan flash message, BUKAN JSON (SAMA seperti Order)
        return redirect()->back()->with('success', 'Status reservasi berhasil diupdate!');
        
    } catch (\Exception $e) {
        \Log::error('Error updating reservation status: ' . $e->getMessage());
        
        // PENTING: Return redirect dengan error message, BUKAN JSON (SAMA seperti Order)
        return redirect()->back()->with('error', 'Gagal mengupdate status reservasi: ' . $e->getMessage());
    }
}

/**
 * SAMA seperti Order: Default notes
 */
private function getDefaultReservationStatusNote($status, $staffName)
{
    $notes = [
        'confirmed' => "Reservasi dikonfirmasi oleh {$staffName}",
        'preparing' => "Reservasi sedang diproses oleh {$staffName}",
        'ready' => "Reservasi siap - diupdate oleh {$staffName}",
        'completed' => "Reservasi selesai - diupdate oleh {$staffName}",
        'cancelled' => "Reservasi dibatalkan oleh {$staffName}"
    ];
    
    return $notes[$status] ?? "Status diubah menjadi {$status} oleh {$staffName}";
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