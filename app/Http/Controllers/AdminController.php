<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Reservation;
use App\Models\Order;
use App\Models\MenuItem;
use App\Models\ReservationPackage;
use App\Models\MenuCategory;
use App\Models\User;
use App\Models\UserReview;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Display the admin dashboard
     */
    public function index(): Response
    {
        return Inertia::render('admin/adminDashboard', [
            'user' => auth()->user(),
            'stats' => $this->getAdminStats(),
            'notifications' => $this->getAdminNotifications(),
            'recentActivity' => $this->getRecentActivity(),
            'reservations' => $this->getReservationsData(), 
            'orders' => $this->getOrdersData() ?? [],           
            'customers' => $this->getCustomersData(),       
            'staff' => $this->getStaffData(),             
            'menuItems' => $this->getMenuItemsData(),
            'menuCategories' => MenuCategory::active()->orderBy('name')->get(), 
            'packages' => $this->getPackagesData(),
        ]);
    }

   private function getCustomersData(): array
    {
        return User::where('role', 'customer')
            ->withCount(['orders', 'reservations'])
            ->with(['orders' => function($query) {
                $query->where('status', 'completed')->latest()->limit(5);
            }, 'reservations' => function($query) {
                $query->latest()->limit(5);
            }])
            ->get()
            ->map(function($user) {
                $lastOrder = $user->orders()->latest()->first();
                $lastReservation = $user->reservations()->latest()->first();
                
                // Tentukan aktivitas terakhir
                $lastActivity = null;
                $lastActivityType = null;
                $lastActivityDate = null;
                
                if ($lastOrder && $lastReservation) {
                    if ($lastOrder->created_at > $lastReservation->created_at) {
                        $lastActivity = $lastOrder;
                        $lastActivityType = 'order';
                        $lastActivityDate = $lastOrder->created_at;
                    } else {
                        $lastActivity = $lastReservation;
                        $lastActivityType = 'reservation';
                        $lastActivityDate = $lastReservation->created_at;
                    }
                } elseif ($lastOrder) {
                    $lastActivity = $lastOrder;
                    $lastActivityType = 'order';
                    $lastActivityDate = $lastOrder->created_at;
                } elseif ($lastReservation) {
                    $lastActivity = $lastReservation;
                    $lastActivityType = 'reservation';
                    $lastActivityDate = $lastReservation->created_at;
                }

                $orderSpent = $user->orders()->where('status', 'completed')->sum('total_amount') ?? 0;
                $reservationSpent = $user->reservations()->where('status', 'completed')->sum('total_price') ?? 0;
                $combinedTotal = $orderSpent + $reservationSpent;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'phone' => $user->phone ?? 'Tidak tersedia',
                    'email' => $user->email,
                    'address' => $user->address ?? 'Tidak tersedia',
                    'totalOrders' => $user->orders_count,
                    'totalReservations' => $user->reservations_count,
                    'totalSpent' => $user->orders()->where('status', 'completed')->sum('total_amount'),
                    'reservationSpent' => $user->reservations()->where('status', 'completed')->sum('total_price'),
                    'combinedTotalSpent' => $user->orders()->where('status', 'completed')->sum('total_amount') + 
                                        $user->reservations()->where('status', 'completed')->sum('total_price'), // TAMBAH INI
                    'status' => $user->is_blocked ? 'blocked' : 'active',
                    'is_blocked' => $user->is_blocked ?? false,
                    'lastActivity' => $lastActivity,
                    'lastActivityType' => $lastActivityType,
                    'lastActivityDate' => $lastActivityDate?->format('Y-m-d H:i') ?? 'Belum ada aktivitas',
                    'lastOrder' => $lastOrder?->created_at->format('Y-m-d') ?? 'Belum pernah',
                    'joinDate' => $user->created_at->format('Y-m-d'),
                    'recentOrders' => $user->orders->map(function($order) {
                        return [
                            'id' => $order->order_code,
                            'total' => $order->total_amount,
                            'status' => $order->status,
                            'date' => $order->created_at->format('Y-m-d H:i'),
                            'items' => $order->orderItems->pluck('menuItem.name')->toArray()
                        ];
                    })->toArray(),
                    'recentReservations' => $user->reservations->map(function($reservation) {
                        return [
                            'id' => $reservation->reservation_code,
                            'package' => $reservation->getPackageName(),
                            'total' => $reservation->total_price,
                            'status' => $reservation->status,
                            'date' => $reservation->reservation_date?->format('Y-m-d'),
                            'time' => $reservation->reservation_time?->format('H:i'),
                            'guests' => $reservation->number_of_people
                        ];
                    })->toArray()
                ];
            })->toArray();
    }

    private function getStaffData(): array
    {
        return User::whereIn('role', ['staff', 'admin'])
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'position' => ucfirst($user->role),
                    'phone' => $user->phone ?? 'Tidak tersedia',
                    'email' => $user->email,
                    'salary' => 0,
                    'performance' => 85,
                    'status' => $user->is_blocked ? 'blocked' : 'active',
                    'is_blocked' => $user->is_blocked ?? false,
                    'joinDate' => $user->created_at->format('Y-m-d')
                ];
            })->toArray();
    }

    private function getMenuItemsData(): array
    {
        return MenuItem::with('category')
            ->get()
            ->map(function($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'category' => $item->category->name ?? 'Uncategorized',
                    'category_id' => $item->category_id,
                    'price' => $item->price,
                    'description' => $item->description,
                    'status' => $item->is_available ? 'available' : 'unavailable',
                    'is_available' => $item->is_available,
                    'popularity' => 85, // Set default atau hitung dari data orders
                    'image' => $item->image, // Hanya nama file
                    'image_url' => $item->image ? asset('images/poto_menu/' . $item->image) : null // Full URL
                ];
            })->toArray();
    }

private function getOrdersData(): array
{
    return Order::with(['user', 'orderItems.menuItem', 'createdByStaff', 'lastUpdatedBy'])
        ->latest('order_time')
        ->get()
        ->map(function($order) {
            
            // Parse log status dari JSON
            $statusLog = $order->status_log ? json_decode($order->status_log, true) : [];
            $statusHistory = [];
            
            // Convert log menjadi format yang bisa dibaca frontend
            foreach ($statusLog as $log) {
                $statusHistory[] = [
                    'status' => $log['new_status'],
                    'changedBy' => $log['changed_by'],
                    'changedAt' => $log['changed_at'],
                    'notes' => $log['notes']
                ];
            }
            
            // Cari siapa yang konfirmasi dari log
            $confirmedBy = null;
            foreach ($statusLog as $log) {
                if ($log['new_status'] === 'confirmed') {
                    $confirmedBy = [
                        'id' => $log['changed_by']['id'],
                        'name' => $log['changed_by']['name'],
                        'role' => $log['changed_by']['role'],
                        'confirmedAt' => $log['changed_at']
                    ];
                    break;
                }
            }
            
            // Cari siapa yang batalkan dari log
            $cancelledBy = null;
            foreach ($statusLog as $log) {
                if ($log['new_status'] === 'cancelled') {
                    $cancelledBy = [
                        'id' => $log['changed_by']['id'],
                        'name' => $log['changed_by']['name'],
                        'role' => $log['changed_by']['role'],
                        'cancelledAt' => $log['changed_at'],
                        'reason' => $log['notes']
                    ];
                    break;
                }
            }
            
            return [
                // Data pesanan biasa
                'id' => $order->order_code,
                'customerName' => $order->customer_name,
                'phone' => $order->customer_phone,
                'email' => $order->customer_email,
                'service' => $order->orderItems->pluck('menuItem.name')->join(', '),
                'items' => $order->orderItems->pluck('menuItem.name')->toArray(),
                'type' => $order->order_type,
                'status' => $order->status,
                'price' => $order->total_amount,
                'date' => $order->order_time->format('Y-m-d'),
                'time' => $order->order_time->format('H:i'),
                'paymentMethod' => $order->payment_method,
                'paymentStatus' => $order->payment_status,
                'notes' => $order->notes,
                'paymentProof' => $order->payment_proof ? asset("storage/{$order->payment_proof}") : null,
                
                // Data tracking staff (INI YANG PENTING!)
                'createdBy' => $order->user_id ? [
                    'id' => $order->user_id,
                    'name' => $order->customer_name,
                    'role' => 'customer'
                ] : ($order->created_by_staff ? [
                    'id' => $order->created_by_staff,
                    'name' => $order->createdByStaff->name ?? 'Staff',
                    'role' => $order->createdByStaff->role ?? 'staff'
                ] : null),
                
                'confirmedBy' => $confirmedBy,        // Staff yang konfirmasi
                'cancelledBy' => $cancelledBy,        // Staff yang batalkan
                'statusHistory' => $statusHistory,    // Riwayat lengkap
            ];
        })->toArray();
}

private function getOrderStatusHistory($order): array
{
    $history = [];
    
    // Order created
    $history[] = [
        'status' => 'pending',
        'changedBy' => [
            'id' => $order->user_id ?? $order->created_by_staff,
            'name' => $order->user_id ? $order->customer_name : ($order->createdByStaff->name ?? 'Staff'),
            'role' => $order->user_id ? 'customer' : 'staff'
        ],
        'changedAt' => $order->created_at->toISOString(),
        'notes' => 'Pesanan dibuat'
    ];
    
    // If status changed from pending
    if ($order->status !== 'pending') {
        $history[] = [
            'status' => $order->status,
            'changedBy' => [
                'id' => auth()->id() ?? 'system',
                'name' => auth()->user()->name ?? 'System',
                'role' => auth()->user()->role ?? 'system'
            ],
            'changedAt' => $order->updated_at->toISOString(),
            'notes' => "Status diubah menjadi " . $this->getStatusLabel($order->status)
        ];
    }
    
    return $history;
}

private function getStatusLabel($status): string
{
    $labels = [
        'pending' => 'Menunggu Konfirmasi',
        'confirmed' => 'Dikonfirmasi',
        'preparing' => 'Sedang Diproses',
        'ready' => 'Siap Diambil',
        'completed' => 'Selesai',
        'cancelled' => 'Dibatalkan'
    ];
    
    return $labels[$status] ?? $status;
}


    /**
     * Get reservations data for admin dashboard
     */
   private function getReservationsData(): array
    {
        try {
            $reservations = Reservation::with(['user', 'package', 'table'])
                ->orderBy('reservation_date', 'desc')
                ->orderBy('reservation_time', 'desc')
                ->get();

            return $reservations->map(function ($reservation) {
                return $this->transformReservationDataWithStaffTracking($reservation);
            })->toArray();

        } catch (\Exception $e) {
            \Log::error('Error getting reservations data for admin: ' . $e->getMessage());
            return [];
        }
    }

    /**
 * TUJUAN: Transform reservation data dengan staff tracking
 */
private function transformReservationDataWithStaffTracking($reservation): array
{
    // Basic transformation (sama seperti sebelumnya)
    $basic = $this->transformReservationData($reservation);
    
    // TAMBAHAN: Staff tracking data
    $staffTracking = $this->getReservationStaffTracking($reservation);
    
    return array_merge($basic, $staffTracking);
}

/**
 * SAMA seperti getOrdersData: Parse status log dari JSON
 */
private function getReservationStaffTracking($reservation): array
{
    // Parse status log dari JSON (SAMA seperti Order)
    $statusLog = $reservation->status_log ? json_decode($reservation->status_log, true) : [];
    $statusHistory = [];
    
    // Convert log menjadi format yang bisa dibaca frontend (SAMA seperti Order)
    foreach ($statusLog as $log) {
        $statusHistory[] = [
            'status' => $log['new_status'],
            'changedBy' => $log['changed_by'],
            'changedAt' => $log['changed_at'],
            'notes' => $log['notes']
        ];
    }
    
    // Cari siapa yang konfirmasi dari log (SAMA seperti Order)
    $confirmedBy = null;
    foreach ($statusLog as $log) {
        if ($log['new_status'] === 'confirmed') {
            $confirmedBy = [
                'id' => $log['changed_by']['id'],
                'name' => $log['changed_by']['name'],
                'role' => $log['changed_by']['role'],
                'confirmedAt' => $log['changed_at']
            ];
            break;
        }
    }
    
    // Cari siapa yang batalkan dari log (SAMA seperti Order)
    $cancelledBy = null;
    foreach ($statusLog as $log) {
        if ($log['new_status'] === 'cancelled') {
            $cancelledBy = [
                'id' => $log['changed_by']['id'],
                'name' => $log['changed_by']['name'],
                'role' => $log['changed_by']['role'],
                'cancelledAt' => $log['changed_at'],
                'reason' => $log['notes']
            ];
            break;
        }
    }
    
    return [
        // Data tracking staff (SAMA seperti Order)
        'createdBy' => $reservation->user_id ? [
            'id' => $reservation->user_id,
            'name' => $reservation->customer_name,
            'role' => 'customer'
        ] : null,
        
        'confirmedBy' => $confirmedBy,
        'cancelledBy' => $cancelledBy,
        'statusHistory' => $statusHistory,
    ];
}

    /**
     * Transform reservation data for frontend
     */
    private function transformReservationData($reservation): array
    {
        // Format table name
        $tableName = null;
        if ($reservation->table) {
            $tableName = "Meja {$reservation->table->table_number}";
        }

        // Format package name dengan fallback
        $packageName = $reservation->package ? $reservation->package->name : $this->getPackageNameFallback($reservation->package_id);

        // Format total price
        $totalPrice = 'Rp 0';
        if ($reservation->total_price && is_numeric($reservation->total_price)) {
            $totalPrice = 'Rp ' . number_format($reservation->total_price, 0, ',', '.');
        }

        // Format tanggal dan waktu
        $formattedDate = '';
        $formattedTime = '';
        $rawDate = '';
        $rawTime = '';

        try {
            if ($reservation->reservation_date) {
                $formattedDate = $reservation->reservation_date->format('d/m/Y');
                $rawDate = $reservation->reservation_date->format('Y-m-d');
            }

            if ($reservation->reservation_time) {
                $formattedTime = $reservation->reservation_time->format('H:i');
                $rawTime = $reservation->reservation_time->format('H:i');
            }
        } catch (\Exception $e) {
            \Log::error("Date formatting error for reservation {$reservation->id}: " . $e->getMessage());
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

        // Location detail
        $locationDetail = $reservation->table_location;
        if ($reservation->table && $reservation->table->location_detail) {
            $locationDetail .= " - {$reservation->table->location_detail}";
        }

        return [
            'id' => $reservation->id,
            'reservation_code' => $reservation->reservation_code,
            'customer_name' => $reservation->customer_name,
            'customer_phone' => $reservation->customer_phone ?: 'Tidak tersedia',
            'customer_email' => $reservation->customer_email,
            'package_name' => $packageName,
            'table_name' => $tableName,
            'table_number' => $reservation->table ? $reservation->table->table_number : null,
            'date' => $formattedDate,
            'raw_date' => $rawDate,
            'time' => $formattedTime,
            'raw_time' => $rawTime,
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
            'package_price' => $reservation->package_price,
            'menu_subtotal' => $reservation->menu_subtotal,
        ];
    }

    /**
     * Fallback untuk package name
     */
    private function getPackageNameFallback($packageId): string
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
     * Get admin statistics
     */
    private function getAdminStats(): array
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth();

        // Orders statistics
        $totalOrders = Order::count();
        $todayOrders = Order::whereDate('order_time', $today)->count();
        $thisMonthOrders = Order::whereDate('order_time', '>=', $thisMonth)->count();
        
        // Revenue statistics
        $totalRevenue = Order::where('status', Order::STATUS_COMPLETED)->sum('total_amount');
        $todayRevenue = Order::where('status', Order::STATUS_COMPLETED)
                            ->whereDate('order_time', $today)
                            ->sum('total_amount');
        $thisMonthRevenue = Order::where('status', Order::STATUS_COMPLETED)
                                ->whereDate('order_time', '>=', $thisMonth)
                                ->sum('total_amount');
        $lastMonthRevenue = Order::where('status', Order::STATUS_COMPLETED)
                                ->whereBetween('order_time', [$lastMonth->startOfMonth(), $lastMonth->endOfMonth()])
                                ->sum('total_amount');

        // Reservations statistics
        $totalReservations = Reservation::count();
        $todayReservations = Reservation::whereDate('reservation_date', $today)->count();
        $pendingReservations = Reservation::where('status', 'pending')->count();
        $confirmedReservations = Reservation::where('status', 'confirmed')->count();

        // Customers statistics
        $totalCustomers = User::where('role', 'customer')->count();
        $newCustomersThisMonth = User::where('role', 'customer')
                                    ->whereDate('created_at', '>=', $thisMonth)
                                    ->count();

        // Staff statistics
        $totalStaff = User::whereIn('role', ['staff', 'admin'])->count();

        // Calculate growth
        $monthlyGrowth = $lastMonthRevenue > 0 
            ? (($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 
            : 0;

        // Average order value
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Popular menu items
        $popularMenuItems = MenuItem::withCount(['favoriteMenus'])
            ->orderBy('favorite_menus_count', 'desc')
            ->take(3)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'favorites' => $item->favorite_menus_count
                ];
            });

        return [
            'total_orders' => $totalOrders,
            'today_orders' => $todayOrders,
            'total_revenue' => $totalRevenue,
            'today_revenue' => $todayRevenue,
            'total_customers' => $totalCustomers,
            'new_customers_this_month' => $newCustomersThisMonth,
            'total_staff' => $totalStaff,
            'total_reservations' => $totalReservations,
            'today_reservations' => $todayReservations,
            'pending_reservations' => $pendingReservations,
            'confirmed_reservations' => $confirmedReservations,
            'monthly_growth' => round($monthlyGrowth, 1),
            'avg_order_value' => round($avgOrderValue),
            'popular_menu_items' => $popularMenuItems,
        ];
    }

    /**
     * Get admin notifications
     */
    private function getAdminNotifications(): array
    {
        $notifications = [];

        // Pending reservations
        $pendingReservations = Reservation::where('status', 'pending')->count();
        if ($pendingReservations > 0) {
            $notifications[] = [
                'id' => 'pending_reservations',
                'message' => "{$pendingReservations} reservasi menunggu konfirmasi",
                'type' => 'reservation',
                'time' => 'Sekarang',
                'read' => false,
            ];
        }

        // New orders today
        $todayOrders = Order::whereDate('order_time', today())->count();
        if ($todayOrders > 0) {
            $notifications[] = [
                'id' => 'today_orders',
                'message' => "{$todayOrders} pesanan hari ini",
                'type' => 'order',
                'time' => '1 jam lalu',
                'read' => false,
            ];
        }

        // Low stock (mock data - you can implement actual inventory tracking)
        $notifications[] = [
            'id' => 'low_stock',
            'message' => 'Stok beberapa menu mulai menipis',
            'type' => 'inventory',
            'time' => '2 jam lalu',
            'read' => false,
        ];

        // New reviews
        $newReviews = UserReview::whereDate('created_at', today())->count();
        if ($newReviews > 0) {
            $notifications[] = [
                'id' => 'new_reviews',
                'message' => "{$newReviews} review baru hari ini",
                'type' => 'review',
                'time' => '3 jam lalu',
                'read' => true,
            ];
        }

        return $notifications;
    }

    /**
     * Get recent activity
     */
    private function getRecentActivity(): array
    {
        $activities = [];

        // Recent orders
        $recentOrders = Order::with(['user'])
            ->whereDate('order_time', today())
            ->orderBy('order_time', 'desc')
            ->take(5)
            ->get();

        foreach ($recentOrders as $order) {
            $customerName = $order->customer_name ?: ($order->user ? $order->user->name : 'Guest');
            
            $activities[] = [
                'id' => 'order_' . $order->id,
                'user' => $customerName,
                'action' => 'membuat pesanan',
                'details' => $order->order_code,
                'amount' => $order->total_amount,
                'time' => $order->order_time->diffForHumans(),
                'type' => 'order',
            ];
        }

        // Recent reservations
        $recentReservations = Reservation::with(['user'])
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get();

        foreach ($recentReservations as $reservation) {
            $customerName = $reservation->customer_name ?: ($reservation->user ? $reservation->user->name : 'Guest');
            
            $activities[] = [
                'id' => 'reservation_' . $reservation->id,
                'user' => $customerName,
                'action' => 'membuat reservasi',
                'details' => $reservation->reservation_code,
                'amount' => $reservation->total_price,
                'time' => $reservation->created_at->diffForHumans(),
                'type' => 'reservation',
            ];
        }

        // Recent reviews
        $recentReviews = UserReview::with(['user'])
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->take(2)
            ->get();

        foreach ($recentReviews as $review) {
            $activities[] = [
                'id' => 'review_' . $review->id,
                'user' => $review->user->name,
                'action' => 'memberikan review',
                'details' => "Rating {$review->rating} bintang",
                'amount' => null,
                'time' => $review->created_at->diffForHumans(),
                'type' => 'review',
            ];
        }

        // Sort by time and limit
        usort($activities, function ($a, $b) {
            return strtotime($b['time']) - strtotime($a['time']);
        });

        return array_slice($activities, 0, 8);
    }

    /**
     * Refresh reservations data (for AJAX calls)
     */
    public function refreshReservations(): \Illuminate\Http\JsonResponse
    {
        try {
            $reservations = $this->getReservationsData();
            
            return response()->json([
                'success' => true,
                'data' => $reservations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error refreshing reservations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle menu availability status
     */
    public function toggleMenuStatus($id)
    {
        $menuItem = MenuItem::findOrFail($id);
        
        $menuItem->update([
            'is_available' => !$menuItem->is_available
        ]);

        return redirect()->back()->with('success', 'Status menu berhasil diupdate!');
    }

    /**
     * Toggle user block status
     */
    public function toggleUserBlock($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent admin from blocking themselves
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat memblokir akun Anda sendiri!');
        }
        
        $user->toggleBlock();
        
        $status = $user->is_blocked ? 'diblokir' : 'diaktifkan';
        
        return redirect()->back()->with([
            'success' => "Akun {$user->name} berhasil {$status}!",
            'customers' => $this->getCustomersData(),
            'staff' => $this->getStaffData()
        ]);
    }

    /**
     * Export customers data to CSV
     */
    public function exportCustomers()
    {
        $customers = User::where('role', 'customer')
            ->withCount(['orders', 'reservations'])
            ->with(['orders' => function($query) {
                $query->where('status', 'completed');
            }, 'reservations' => function($query) {
                $query->where('status', 'completed');
            }])
            ->get();

        $csvData = [];
        $csvData[] = [
            'Nama',
            'Email', 
            'Telepon',
            'Alamat',
            'Status',
            'Total Pesanan',
            'Total Reservasi',
            'Total Belanja Pesanan (Rp)',
            'Total Belanja Reservasi (Rp)',
            'Total Belanja Keseluruhan (Rp)',
            'Terakhir Order',
            'Bergabung Sejak',
            'Detail Pesanan Terakhir',
            'Detail Reservasi Terakhir'
        ];

        foreach ($customers as $customer) {
            $lastOrder = $customer->orders()->latest()->first();
            $lastReservation = $customer->reservations()->latest()->first();
            
            $orderSpent = $customer->orders()->where('status', 'completed')->sum('total_amount');
            $reservationSpent = $customer->reservations()->where('status', 'completed')->sum('total_price');
            
            $orderDetails = $lastOrder ? 
                "#{$lastOrder->order_code} - Rp " . number_format($lastOrder->total_amount) . " ({$lastOrder->created_at->format('d/m/Y')})" : 
                'Belum ada';
                
            $reservationDetails = $lastReservation ? 
                "#{$lastReservation->reservation_code} - Rp " . number_format($lastReservation->total_price) . " ({$lastReservation->reservation_date?->format('d/m/Y')})" : 
                'Belum ada';

            $csvData[] = [
                $customer->name,
                $customer->email,
                $customer->phone ?? 'Tidak tersedia',
                $customer->address ?? 'Tidak tersedia',
                $customer->is_blocked ? 'Diblokir' : 'Aktif',
                $customer->orders_count,
                $customer->reservations_count,
                $orderSpent,
                $reservationSpent,
                $orderSpent + $reservationSpent,
                $lastOrder?->created_at->format('d/m/Y H:i') ?? 'Belum pernah',
                $customer->created_at->format('d/m/Y'),
                $orderDetails,
                $reservationDetails
            ];
        }

        $filename = 'data-pelanggan-' . date('Y-m-d-H-i-s') . '.csv';
        
        $output = fopen('php://output', 'w');
        
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        
        // BOM untuk Excel agar UTF-8 terbaca dengan benar
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        
        foreach ($csvData as $row) {
            fputcsv($output, $row);
        }
        
        fclose($output);
        exit;
    }

    private function getPackagesData(): array
    {
        return ReservationPackage::orderBy('created_at', 'desc')
            ->get()
            ->map(function($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'type' => $package->type,
                    'category' => $package->category,
                    'price' => $package->price,
                    'minGuests' => 1,
                    'maxGuests' => $package->max_people, // sesuaikan dengan field di model
                    'duration' => $package->duration,
                    'description' => $package->description,
                    'facilities' => $package->includes, // sesuaikan dengan field di model
                    'menuIncluded' => $package->includes, // jika sama dengan facilities
                    'popularity' => 85, // default atau hitung dari data reservasi
                    'totalBookings' => $package->reservations_count,
                    'status' => $package->is_active ? 'active' : 'inactive',
                    'createdAt' => $package->created_at->format('Y-m-d'),
                    'image_url' => $package->image_url
                ];
            })->toArray();
    }
}