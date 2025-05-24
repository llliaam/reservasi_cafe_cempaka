<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with overview data
     */
    public function index()
    {
        $user = auth()->user();
        
        // Get dashboard statistics
        $stats = $this->getDashboardStats($user);
        
        // Get recent orders (last 3)
        $recentOrders = $this->getRecentOrders($user);
        
        // Get upcoming reservations
        $upcomingReservations = $this->getUpcomingReservations($user);
        
        // Get favorite menus preview
        $favoriteMenus = $this->getFavoriteMenusPreview($user);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'upcomingReservations' => $upcomingReservations,
            'favoriteMenus' => $favoriteMenus,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    /**
     * Get dashboard statistics
     */
    private function getDashboardStats($user)
    {
        // Orders statistics
        $totalOrders = $user->orders()->count();
        $completedOrders = $user->orders()->where('status', 'completed')->get();
        $totalSpent = $completedOrders->sum('total_amount');
        
        // Reservations statistics
        $totalReservations = $user->reservations()->count();
        $confirmedReservations = $user->reservations()->where('status', 'confirmed')->count();
        
        // Favorites statistics
        $totalFavorites = $user->favoriteMenus()->count();
        
        // Reviews statistics
        $reviewedOrders = $completedOrders->whereNotNull('rating');
        $averageRating = $reviewedOrders->avg('rating') ?? 0;
        $totalReviews = $reviewedOrders->count();

        return [
            'totalOrders' => $totalOrders,
            'totalReservations' => $totalReservations,
            'favoriteMenus' => $totalFavorites,
            'totalReviews' => $totalReviews,
            'totalSpent' => $totalSpent,
            'averageRating' => round($averageRating, 1),
            'completedOrders' => $completedOrders->count(),
            'confirmedReservations' => $confirmedReservations,
        ];
    }

    /**
     * Get recent orders for dashboard
     */
    private function getRecentOrders($user)
    {
        $recentOrders = $user->orders()
            ->with(['orderItems.menu'])
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        return $recentOrders->map(function ($order) {
            return [
                'id' => 'ORD-' . date('Y') . '-' . str_pad($order->id, 3, '0', STR_PAD_LEFT),
                'date' => $order->created_at->toDateString(),
                'items' => $order->orderItems->pluck('menu.name')->toArray(),
                'total' => $order->total_amount,
                'status' => $order->status,
                'itemCount' => $order->orderItems->count(),
            ];
        });
    }

    /**
     * Get upcoming reservations
     */
    private function getUpcomingReservations($user)
    {
        $upcomingReservations = $user->reservations()
            ->where('reservation_date', '>=', Carbon::today())
            ->where('status', 'confirmed')
            ->orderBy('reservation_date')
            ->orderBy('reservation_time')
            ->limit(3)
            ->get();

        return $upcomingReservations->map(function ($reservation) {
            return [
                'id' => 'RSV-' . str_pad($reservation->id, 7, '0', STR_PAD_LEFT),
                'date' => $reservation->reservation_date,
                'time' => $reservation->reservation_time,
                'guests' => $reservation->guest_count,
                'table' => $reservation->table ? $reservation->table->name : 'Akan ditentukan',
                'status' => $reservation->status,
            ];
        });
    }

    /**
     * Get favorite menus preview
     */
    private function getFavoriteMenusPreview($user)
    {
        $favoriteMenus = $user->favoriteMenus()
            ->with('menu')
            ->limit(3)
            ->get();

        return $favoriteMenus->map(function ($favorite) use ($user) {
            $menu = $favorite->menu;
            
            // Count how many times user ordered this menu
            $orderCount = $user->orders()
                ->whereHas('orderItems', function($q) use ($menu) {
                    $q->where('menu_id', $menu->id);
                })
                ->where('status', 'completed')
                ->count();

            return [
                'name' => $menu->name,
                'orders' => $orderCount,
                'rating' => $menu->average_rating ?? 0,
                'price' => $menu->price,
                'image' => $menu->image_url,
            ];
        });
    }

    /**
     * Get dashboard stats via API
     */
    public function getStats()
    {
        $user = auth()->user();
        $stats = $this->getDashboardStats($user);
        
        return response()->json($stats);
    }

    /**
     * Get quick overview data for widgets
     */
    public function getOverview()
    {
        $user = auth()->user();
        
        // This month's data
        $thisMonth = Carbon::now()->startOfMonth();
        
        $thisMonthOrders = $user->orders()
            ->where('created_at', '>=', $thisMonth)
            ->where('status', 'completed')
            ->count();
            
        $thisMonthSpent = $user->orders()
            ->where('created_at', '>=', $thisMonth)
            ->where('status', 'completed')
            ->sum('total_amount');
            
        $thisMonthReservations = $user->reservations()
            ->where('created_at', '>=', $thisMonth)
            ->count();

        // Last month's data for comparison
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();
        
        $lastMonthOrders = $user->orders()
            ->whereBetween('created_at', [$lastMonth, $lastMonthEnd])
            ->where('status', 'completed')
            ->count();
            
        $lastMonthSpent = $user->orders()
            ->whereBetween('created_at', [$lastMonth, $lastMonthEnd])
            ->where('status', 'completed')
            ->sum('total_amount');

        // Calculate percentage changes
        $orderGrowth = $lastMonthOrders > 0 ? 
            (($thisMonthOrders - $lastMonthOrders) / $lastMonthOrders) * 100 : 0;
            
        $spentGrowth = $lastMonthSpent > 0 ? 
            (($thisMonthSpent - $lastMonthSpent) / $lastMonthSpent) * 100 : 0;

        return response()->json([
            'thisMonth' => [
                'orders' => $thisMonthOrders,
                'spent' => $thisMonthSpent,
                'reservations' => $thisMonthReservations,
            ],
            'growth' => [
                'orders' => round($orderGrowth, 1),
                'spent' => round($spentGrowth, 1),
            ]
        ]);
    }

    /**
     * Get activity timeline for dashboard
     */
    public function getActivityTimeline()
    {
        $user = auth()->user();
        
        // Get recent activities (orders, reservations, reviews)
        $activities = collect();
        
        // Recent orders
        $recentOrders = $user->orders()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($order) {
                return [
                    'type' => 'order',
                    'title' => 'Pesanan ' . $order->id,
                    'description' => 'Status: ' . ucfirst($order->status),
                    'date' => $order->created_at,
                    'icon' => 'shopping-bag',
                    'color' => $order->status === 'completed' ? 'green' : 'blue',
                ];
            });
            
        // Recent reservations
        $recentReservations = $user->reservations()
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function($reservation) {
                return [
                    'type' => 'reservation',
                    'title' => 'Reservasi untuk ' . $reservation->guest_count . ' orang',
                    'description' => 'Tanggal: ' . $reservation->reservation_date,
                    'date' => $reservation->created_at,
                    'icon' => 'calendar',
                    'color' => 'purple',
                ];
            });
            
        // Recent reviews
        $recentReviews = $user->orders()
            ->whereNotNull('rating')
            ->orderBy('updated_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function($order) {
                return [
                    'type' => 'review',
                    'title' => 'Review untuk pesanan ' . $order->id,
                    'description' => 'Rating: ' . $order->rating . '/5',
                    'date' => $order->updated_at,
                    'icon' => 'star',
                    'color' => 'yellow',
                ];
            });
            
        $activities = $activities
            ->merge($recentOrders)
            ->merge($recentReservations)
            ->merge($recentReviews)
            ->sortByDesc('date')
            ->take(10)
            ->values();
            
        return response()->json($activities);
    }
}