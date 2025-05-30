<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with all data loaded as props
     */
    public function index()
    {
        $user = auth()->user();
        
        // Get all dashboard data at once
        $stats = $this->getDashboardStats($user);
        $recentOrders = $this->getRecentOrders($user);
        $upcomingReservations = $this->getUpcomingReservations($user);
        $favoriteMenus = $this->getFavoriteMenusPreview($user);
        $activityTimeline = $this->getActivityTimeline($user);
        $overview = $this->getOverview($user);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'upcomingReservations' => $upcomingReservations,
            'favoriteMenus' => $favoriteMenus,
            'activityTimeline' => $activityTimeline,
            'overview' => $overview,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'loyalty_points' => $user->loyalty_points ?? 0,
                'total_spent' => $user->total_spent,
                'completed_orders_count' => $user->completed_orders_count,
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
        $totalReviews = $user->reviews()->count();
        $averageRating = $user->reviews()->avg('rating') ?? 0;

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
            ->with(['orderItems.menuItem'])
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        return $recentOrders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_code' => $order->order_code,
                'date' => $order->order_time->format('Y-m-d'),
                'items' => $order->orderItems->pluck('menuItem.name')->toArray(),
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
                'id' => $reservation->id,
                'reservation_code' => $reservation->reservation_code,
                'date' => $reservation->reservation_date->format('Y-m-d'),
                'time' => $reservation->reservation_time->format('H:i'),
                'guests' => $reservation->number_of_people,
                'table' => $reservation->table_location,
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
            ->with('menuItem.category')
            ->limit(3)
            ->get();

        return $favoriteMenus->map(function ($favorite) use ($user) {
            $menu = $favorite->menuItem;
            
            if (!$menu) {
                return null;
            }
            
            // Count how many times user ordered this menu
            $orderCount = $user->orders()
                ->whereHas('orderItems', function($q) use ($menu) {
                    $q->where('menu_item_id', $menu->id);
                })
                ->where('status', 'completed')
                ->count();

            return [
                'id' => $menu->id,
                'name' => $menu->name,
                'orders' => $orderCount,
                'rating' => 4.5, // Default or calculated rating
                'price' => $menu->price,
                'image' => $menu->image_url,
                'category' => $menu->category->name ?? 'Uncategorized',
            ];
        })->filter(); // Remove null values
    }

    /**
     * Get activity timeline for dashboard
     */
    private function getActivityTimeline($user)
    {
        $activities = collect();
        
        // Recent orders
        $recentOrders = $user->orders()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($order) {
                return [
                    'type' => 'order',
                    'title' => 'Pesanan ' . $order->order_code,
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
                    'title' => 'Reservasi untuk ' . $reservation->number_of_people . ' orang',
                    'description' => 'Tanggal: ' . $reservation->reservation_date->format('d M Y'),
                    'date' => $reservation->created_at,
                    'icon' => 'calendar',
                    'color' => 'purple',
                ];
            });
            
        // Recent reviews
        $recentReviews = $user->reviews()
            ->orderBy('reviewed_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function($review) {
                return [
                    'type' => 'review',
                    'title' => 'Review untuk ' . ($review->menuItem->name ?? 'menu'),
                    'description' => 'Rating: ' . $review->rating . '/5',
                    'date' => $review->reviewed_at,
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
            
        return $activities;
    }

    /**
     * Get quick overview data for widgets
     */
    private function getOverview($user)
    {
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

        return [
            'thisMonth' => [
                'orders' => $thisMonthOrders,
                'spent' => $thisMonthSpent,
                'reservations' => $thisMonthReservations,
            ],
            'lastMonth' => [
                'orders' => $lastMonthOrders,
                'spent' => $lastMonthSpent,
            ],
            'growth' => [
                'orders' => round($orderGrowth, 1),
                'spent' => round($spentGrowth, 1),
            ]
        ];
    }
}