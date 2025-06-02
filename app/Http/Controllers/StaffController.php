<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\User;
use App\Models\UserReview;
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
        $tablesData = $this->getTablesData();
        
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

            $tables = $this->getTablesData();

            return Inertia::render('staff/staffReservasi', [
                'reservations' => $reservations,
                'tables' => $tables,
                'filters' => [
                    'status' => $request->status ?? 'all',
                    'date' => $request->date ?? '' // Tetap pass untuk initial state
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in reservationsManagement: ' . $e->getMessage());

            return Inertia::render('staff/staffReservasi', [
                'reservations' => [],
                'tables' => [],
                'filters' => [
                    'status' => 'all',
                    'date' => ''
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
            // FIXED: Load reservation with all necessary relationships
            $reservation = Reservation::with(['package', 'table'])->findOrFail($id);
            
            \Log::info('Reservation found:', [
                'id' => $reservation->id,
                'current_status' => $reservation->status,
                'new_status' => $request->status,
                'has_table_id' => !!$reservation->table_id,
                'has_table_relation' => !!$reservation->table,
                'package_id' => $reservation->package_id,
                'table_location' => $reservation->table_location
            ]);

            $oldStatus = $reservation->status;
            $newStatus = $request->status;

            // FIXED: Use direct update instead of model method to avoid relationship issues
            DB::beginTransaction();

            // Update reservation status directly
            $reservation->status = $newStatus;
            $saved = $reservation->save();

            if (!$saved) {
                DB::rollBack();
                return redirect()->back()->with('error', 'Gagal menyimpan status reservasi');
            }

            \Log::info('Reservation status updated successfully');

            // AUTO-ASSIGN TABLE jika status menjadi confirmed dan belum ada meja
            if ($newStatus === 'confirmed' && !$reservation->table_id) {
                \Log::info('Auto-assigning table for confirmed reservation');
                
                try {
                    // Get package for capacity requirements
                    if (!$reservation->package) {
                        $reservation->load('package');
                    }

                    if ($reservation->package) {
                        // Find suitable table
                        $suitableTable = \App\Models\RestaurantTable::findSuitableTableForReservation(
                            $reservation->table_location,
                            $reservation->package->max_people,
                            $reservation->reservation_date,
                            $reservation->reservation_time->format('H:i')
                        );

                        if ($suitableTable) {
                            $reservation->table_id = $suitableTable->id;
                            $reservation->save();
                            
                            // Update table status
                            $suitableTable->updateStatus('reserved');
                            
                            \Log::info('Table auto-assigned successfully', [
                                'reservation_id' => $reservation->id,
                                'table_id' => $suitableTable->id,
                                'table_number' => $suitableTable->table_number
                            ]);
                        } else {
                            \Log::warning('No suitable table found for auto-assignment', [
                                'reservation_id' => $reservation->id,
                                'package_max_people' => $reservation->package->max_people,
                                'table_location' => $reservation->table_location
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    \Log::error('Error in auto table assignment: ' . $e->getMessage(), [
                        'reservation_id' => $reservation->id,
                        'trace' => $e->getTraceAsString()
                    ]);
                    // Don't fail the status update if table assignment fails
                }
            }

            // ENHANCED TABLE STATUS UPDATE for all status changes
            if ($reservation->table_id && $reservation->table) {
                try {
                    switch ($newStatus) {
                        case 'confirmed':
                            $reservation->table->updateStatus('reserved');
                            break;
                        case 'cancelled':
                        case 'completed': // NEW: Handle completed status
                            $reservation->table->updateStatus('available');
                            \Log::info('Table marked as available', [
                                'reservation_id' => $reservation->id,
                                'table_id' => $reservation->table->id,
                                'reason' => $newStatus === 'completed' ? 'reservation_completed' : 'reservation_cancelled'
                            ]);
                            break;
                    }
                } catch (\Exception $e) {
                    \Log::error('Error updating table status: ' . $e->getMessage());
                    // Don't fail the main operation
                }
            }

            DB::commit();

            // Enhanced success message based on status
            $statusMessages = [
                'confirmed' => 'dikonfirmasi',
                'cancelled' => 'dibatalkan', 
                'completed' => 'diselesaikan'
            ];
            
            $statusMessage = $statusMessages[$newStatus] ?? "diubah ke {$newStatus}";

            return redirect()->back()->with('success', 
                "Reservasi {$reservation->reservation_code} berhasil {$statusMessage}" .
                ($newStatus === 'completed' && $reservation->table ? " dan meja {$reservation->table->meja_name} tersedia kembali" : "")
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
    \Log::info('=== UPDATING TABLE STATUS ===', [
        'table_id' => $tableId,
        'request_data' => $request->all(),
        'method' => $request->method(),
        'url' => $request->url(),
        'content_type' => $request->header('Content-Type'),
        'raw_input' => $request->getContent()
    ]);

    try {
        // Validate the request
        $validated = $request->validate([
            'status' => 'required|in:available,occupied,reserved,maintenance'
        ]);

        \Log::info('Validation passed:', $validated);

        // Find the table
        $table = RestaurantTable::findOrFail($tableId);
        \Log::info('Table found:', [
            'table_id' => $table->id,
            'current_status' => $table->status,
            'table_number' => $table->table_number,
            'table_name' => $table->meja_name
        ]);
        
        $oldStatus = $table->status;
        $newStatus = $validated['status'];
        
        // Update the status directly
        $table->status = $newStatus;
        $saved = $table->save();
        
        \Log::info('Save operation result:', [
            'saved' => $saved,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'table_after_save' => $table->fresh()->toArray()
        ]);

        if ($saved) {
            // Get fresh table data
            $freshTable = $table->fresh();
            
            \Log::info('Update successful - redirecting back with success message');
            
            return redirect()->back()->with([
                'success' => "Status {$freshTable->meja_name} berhasil diubah dari {$oldStatus} ke {$newStatus}",
                'updated_table_id' => $freshTable->id,
                'updated_table_status' => $freshTable->status
            ]);
        }

        \Log::error('Save operation returned false');
        return redirect()->back()->with('error', 'Gagal menyimpan perubahan status meja');
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('Validation failed:', [
            'errors' => $e->errors(),
            'input' => $request->all()
        ]);
        
        // FIXED: Ganti array_flatten dengan collect()->flatten()
        $errorMessages = collect($e->errors())->flatten()->implode(', ');
        
        return redirect()->back()
            ->withErrors($e->errors())
            ->withInput()
            ->with('error', 'Data tidak valid: ' . $errorMessages);
        
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        \Log::error('Table not found:', [
            'table_id' => $tableId,
            'error' => $e->getMessage()
        ]);
        
        return redirect()->back()->with('error', 'Meja tidak ditemukan');
        
    } catch (\Exception $e) {
        \Log::error('Unexpected error updating table status:', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return redirect()->back()->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage());
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
}