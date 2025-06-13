<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Order;
use App\Models\UserReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UnifiedHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        try {
            $user = Auth::user();

            // Get reservations with the same transformation as ReservationController
            $reservations = $this->getTransformedReservations($user);

            // Get orders with pagination and filters like OrderController
            $orders = $this->getTransformedOrders($user, $request);

            // Calculate reservation stats
            $reservationStats = $this->calculateReservationStats($user);

            // Calculate order stats
            $orderStats = $this->calculateOrderStats($user);

            return Inertia::render('UnifiedOrderHistory', [
                'reservations' => $reservations,
                'orders' => $orders,
                'reservationStats' => $reservationStats,
                'orderStats' => $orderStats
            ]);

        } catch (\Exception $e) {
            // Log error untuk debugging
            \Log::error('UnifiedHistoryController error: ' . $e->getMessage());

            // Return error page atau redirect
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memuat halaman.');
        }
    }

    /**
     * Get transformed reservations exactly like ReservationController->index()
     */
    private function getTransformedReservations($user): array
    {
        $reservations = Reservation::with(['user', 'menuItems', 'package'])
            ->where('user_id', $user->id)
            ->orderBy('reservation_date', 'desc')
            ->orderBy('reservation_time', 'desc')
            ->get();

        return $reservations->map(function ($reservation) {
            return [
                'id' => $reservation->reservation_code,
                'date' => $reservation->reservation_date->format('Y-m-d'),
                'time' => $reservation->reservation_time->format('H:i'),
                'guests' => $reservation->number_of_people,
                'table' => $this->getTableName($reservation->table_location, $reservation->id),
                'name' => $reservation->customer_name,
                'phone' => $reservation->customer_phone,
                'email' => $reservation->customer_email,
                'status' => $reservation->status,
                'specialRequest' => $reservation->special_requests ?? '',
                'createdAt' => $reservation->created_at->format('Y-m-d'),
                'packageName' => $reservation->package ? $reservation->package->name : $reservation->getPackageName(),
                'packagePrice' => $reservation->package_price,
                'menuSubtotal' => $reservation->menu_subtotal,
                'totalPrice' => $reservation->total_price,
                'paymentMethod' => $reservation->payment_method,
                'paymentMethodLabel' => $reservation->payment_method_label,
                'menuItems' => $reservation->menuItems->map(function ($item) {
                    return [
                        'name' => $item->menu_item_name,
                        'price' => $item->menu_item_price,
                        'quantity' => $item->quantity,
                        'subtotal' => $item->subtotal,
                    ];
                }),
                'proofOfPaymentUrl' => $reservation->proof_of_payment_url,
                'additionalImageUrls' => $reservation->additional_image_urls,
                'type' => 'reservation'
            ];
        })->toArray();
    }

    /**
     * Get transformed orders exactly like OrderController->history()
     */
    private function getTransformedOrders($user, Request $request): array
    {
        $query = Order::with([
            'orderItems.menuItem',
            'userReview'
        ])->where('user_id', $user->id);

        // Apply filters from request (same as OrderController)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('order_type')) {
            $query->where('order_type', $request->order_type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('order_time', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('order_time', '<=', $request->date_to);
        }

        // Get paginated results
        $orders = $query->latest('order_time')->paginate(10);

        // Transform orders for frontend (same as OrderController)
        $transformedOrders = $orders->through(function ($order) {
            $review = $order->userReview;

            return [
                'id' => $order->id,
                'order_code' => $order->order_code,
                'order_date' => $order->order_time->format('Y-m-d H:i:s'),
                'status' => $order->status,
                'order_type' => $order->order_type,
                'total_amount' => $order->total_amount,
                'items' => $order->orderItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'menu_item_id' => $item->menu_item_id,
                        'menu_name' => $item->menuItem->name ?? 'Menu tidak ditemukan',
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'subtotal' => $item->subtotal,
                        'special_instructions' => $item->special_instructions
                    ];
                })->toArray(),
                'can_be_reviewed' => $order->canBeReviewed(),
                'has_review' => $order->hasReview(),
                'review' => $review ? [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'reviewed_at' => $review->reviewed_at->format('Y-m-d H:i:s'),
                    'can_edit' => $review->can_edit
                ] : null,
                'type' => 'order'
            ];
        });

        // Return the same structure as paginated orders
        return [
            'data' => $transformedOrders->items(),
            'current_page' => $orders->currentPage(),
            'last_page' => $orders->lastPage(),
            'per_page' => $orders->perPage(),
            'total' => $orders->total(),
            'from' => $orders->firstItem(),
            'to' => $orders->lastItem(),
            'links' => $orders->linkCollection()->toArray()
        ];
    }

    /**
     * Calculate reservation stats exactly like ReservationController
     */
    private function calculateReservationStats($user): array
    {
        $reservations = Reservation::where('user_id', $user->id)->get();

        return [
            'totalReservations' => $reservations->count(),
            'confirmedCount' => $reservations->where('status', 'confirmed')->count(),
            'completedCount' => $reservations->where('status', 'completed')->count(),
            'cancelledCount' => $reservations->where('status', 'cancelled')->count(),
            'pendingCount' => $reservations->where('status', 'pending')->count(),
            'totalGuests' => $reservations->sum('number_of_people'),
            'averageGuests' => $reservations->count() > 0 ? round($reservations->sum('number_of_people') / $reservations->count()) : 0,
        ];
    }

    /**
     * Calculate order stats exactly like OrderController
     */
    private function calculateOrderStats($user): array
    {
        $orders = Order::where('user_id', $user->id)->get();
        $completedOrders = $orders->where('status', 'completed');
        $totalSpent = $completedOrders->sum('total_amount');

        return [
            'totalOrders' => $orders->count(),
            'completedOrders' => $completedOrders->count(),
            'totalSpent' => $totalSpent,
            'avgOrderValue' => $completedOrders->count() > 0 ? $totalSpent / $completedOrders->count() : 0,
            'dineInCount' => $orders->where('order_type', 'dine_in')->count(),
            'takeawayCount' => $orders->where('order_type', 'takeaway')->count(),
            'deliveryCount' => $orders->where('order_type', 'delivery')->count(),
            'reviewsGiven' => $orders->filter(function ($order) {
                return $order->hasReview();
            })->count(),
            'canBeReviewed' => $orders->filter(function ($order) {
                return $order->canBeReviewed();
            })->count(),
        ];
    }

    /**
     * Get table name based on location and reservation ID
     * Same logic as ReservationController
     */
    private function getTableName($location, $reservationId): string
    {
        // Simple table assignment logic - same as ReservationController
        $tableNumber = ($reservationId % 20) + 1;
        $locationText = $location === 'indoor' ? 'Indoor' : 'Outdoor';
        return "Meja {$tableNumber} ({$locationText})";
    }
}
