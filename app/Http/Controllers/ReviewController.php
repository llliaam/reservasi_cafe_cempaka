<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\UserReview;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReviewController extends Controller
{
    /**
     * Display user's reviews
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = UserReview::with([
            'order.orderItems.menuItem',
            'menuItem',
            'adminResponder'
        ])->where('user_id', $user->id);

        // Filter by rating
        if ($request->filled('rating') && $request->rating !== 'all') {
            $query->where('rating', $request->rating);
        }

        // Search by menu name or comment
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('menuItem', function ($menuQuery) use ($searchTerm) {
                    $menuQuery->where('name', 'like', "%{$searchTerm}%");
                })->orWhere('comment', 'like', "%{$searchTerm}%");
            });
        }

        $reviews = $query->latest('reviewed_at')->paginate(10);

        // Transform reviews for frontend
        $transformedReviews = $reviews->through(function ($review) {
            $orderItems = $review->order->orderItems ?? collect();
            
            return [
                'id' => $review->id,
                'orderId' => $review->order->order_code ?? 'N/A',
                'menuName' => $review->menuItem->name ?? 'Menu tidak ditemukan',
                'menuItems' => $orderItems->pluck('menuItem.name')->toArray(),
                'rating' => $review->rating,
                'comment' => $review->comment,
                'date' => $review->reviewed_at->format('Y-m-d'),
                'helpful' => $review->helpful_count,
                'response' => $review->admin_response ? [
                    'text' => $review->admin_response,
                    'date' => $review->admin_response_date->format('Y-m-d'),
                    'author' => $review->adminResponder->name ?? 'Admin Team'
                ] : null,
                'canEdit' => $review->can_edit,
                'orderDate' => $review->order->order_time->format('Y-m-d'),
                'totalAmount' => $review->order->total_amount,
                'isVerified' => $review->is_verified,
                'isFeatured' => $review->is_featured,
            ];
        });

        // Get statistics
        $stats = [
            'totalReviews' => $user->reviews()->count(),
            'averageRating' => round($user->reviews()->avg('rating') ?? 0, 1),
            'totalHelpful' => $user->reviews()->sum('helpful_count'),
            'reviewsWithResponse' => $user->reviews()->whereNotNull('admin_response')->count(),
            'ratingDistribution' => UserReview::getRatingDistribution($user->id)
        ];

        return Inertia::render('ulasanPengguna', [
            'reviews' => $transformedReviews,
            'stats' => $stats,
            'filters' => [
                'rating' => $request->rating ?? 'all',
                'search' => $request->search ?? ''
            ]
        ]);
    }

    /**
     * Store a new review - using session flash for feedback
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'menu_item_id' => 'required|exists:menu_items,id',
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000'
        ]);

        // Verify order belongs to user and can be reviewed
        $order = Order::where('id', $request->order_id)
                      ->where('user_id', $user->id)
                      ->first();

        if (!$order) {
            return redirect()->back()
                           ->withErrors(['order' => 'Pesanan tidak ditemukan']);
        }

        if (!$order->canBeReviewed()) {
            return redirect()->back()
                           ->withErrors(['order' => 'Pesanan ini tidak dapat direview']);
        }

        // Check if review already exists
        $existingReview = UserReview::where('user_id', $user->id)
                                   ->where('order_id', $request->order_id)
                                   ->first();

        if ($existingReview) {
            return redirect()->back()
                           ->withErrors(['review' => 'Anda sudah memberikan ulasan untuk pesanan ini']);
        }

        // Verify menu item exists in the order
        $orderHasMenuItem = $order->orderItems()
                                  ->where('menu_item_id', $request->menu_item_id)
                                  ->exists();

        if (!$orderHasMenuItem) {
            return redirect()->back()
                           ->withErrors(['menu_item' => 'Menu item tidak ditemukan dalam pesanan ini']);
        }

        DB::beginTransaction();
        try {
            // Create review
            $review = UserReview::create([
                'user_id' => $user->id,
                'order_id' => $request->order_id,
                'menu_item_id' => $request->menu_item_id,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'reviewed_at' => now()
            ]);

            DB::commit();

            return redirect()->route('reviews.index')
                           ->with('success', 'Ulasan berhasil disimpan');

        } catch (\Exception $e) {
            DB::rollback();
            
            return redirect()->back()
                           ->withErrors(['review' => 'Gagal menyimpan ulasan'])
                           ->withInput();
        }
    }

    /**
     * Update an existing review
     */
    public function update(Request $request, UserReview $review)
    {
        $user = Auth::user();

        // Check if review belongs to user
        if ($review->user_id !== $user->id) {
            abort(403, 'Unauthorized access to review');
        }

        // Check if review can still be edited
        if (!$review->canBeEdited()) {
            return redirect()->back()
                           ->withErrors(['review' => 'Ulasan ini tidak dapat diubah lagi']);
        }

        $request->validate([
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000'
        ]);

        try {
            $review->update([
                'rating' => $request->rating,
                'comment' => $request->comment
            ]);

            return redirect()->route('reviews.index')
                           ->with('success', 'Ulasan berhasil diperbarui');

        } catch (\Exception $e) {
            return redirect()->back()
                           ->withErrors(['review' => 'Gagal memperbarui ulasan'])
                           ->withInput();
        }
    }

    /**
     * Delete a review
     */
    public function destroy(UserReview $review)
    {
        $user = Auth::user();

        // Check if review belongs to user
        if ($review->user_id !== $user->id) {
            abort(403, 'Unauthorized access to review');
        }

        // Check if review can still be deleted
        if (!$review->canBeDeleted()) {
            return redirect()->back()
                           ->withErrors(['review' => 'Ulasan ini tidak dapat dihapus lagi']);
        }

        try {
            $review->delete();

            return redirect()->route('reviews.index')
                           ->with('success', 'Ulasan berhasil dihapus');

        } catch (\Exception $e) {
            return redirect()->back()
                           ->withErrors(['review' => 'Gagal menghapus ulasan']);
        }
    }

    /**
     * Mark review as helpful
     */
    public function markHelpful(UserReview $review)
    {
        $user = Auth::user();

        // Prevent users from marking their own reviews as helpful
        if ($review->user_id === $user->id) {
            return redirect()->back()
                           ->withErrors(['helpful' => 'Anda tidak dapat menandai ulasan sendiri sebagai membantu']);
        }

        try {
            $review->incrementHelpful();

            return redirect()->back()
                           ->with('success', 'Terima kasih atas feedback Anda');

        } catch (\Exception $e) {
            return redirect()->back()
                           ->withErrors(['helpful' => 'Gagal memproses feedback']);
        }
    }

    /**
     * Create review form with all necessary data
     */
    public function create(Request $request)
    {
        $user = Auth::user();
        $orderId = $request->get('order_id');
        
        $selectedOrder = null;
        if ($orderId) {
            $selectedOrder = Order::with(['orderItems.menuItem'])
                          ->where('id', $orderId)
                          ->where('user_id', $user->id)
                          ->first();
                          
            if (!$selectedOrder || !$selectedOrder->canBeReviewed()) {
                return redirect()->route('orders.history')
                               ->with('error', 'Pesanan tidak dapat direview');
            }
        }

        $reviewableOrders = Order::with(['orderItems.menuItem'])
                                ->where('user_id', $user->id)
                                ->where('status', Order::STATUS_COMPLETED)
                                ->whereDoesntHave('userReview')
                                ->latest('completed_at')
                                ->take(10)
                                ->get();

        return Inertia::render('Reviews/Create', [
            'selectedOrder' => $selectedOrder ? [
                'id' => $selectedOrder->id,
                'order_code' => $selectedOrder->order_code,
                'order_date' => $selectedOrder->order_time->format('d M Y'),
                'total_amount' => $selectedOrder->formatted_total,
                'items' => $selectedOrder->orderItems->map(function ($item) {
                    return [
                        'id' => $item->menu_item_id,
                        'name' => $item->menuItem->name,
                        'quantity' => $item->quantity
                    ];
                })
            ] : null,
            'reviewableOrders' => $reviewableOrders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_code' => $order->order_code,
                    'order_date' => $order->order_time->format('d M Y'),
                    'total_amount' => $order->formatted_total,
                    'items' => $order->orderItems->map(function ($item) {
                        return [
                            'id' => $item->menu_item_id,
                            'name' => $item->menuItem->name,
                            'quantity' => $item->quantity
                        ];
                    })
                ];
            })
        ]);
    }

    /**
     * Edit review form
     */
    public function edit(UserReview $review)
    {
        $user = Auth::user();

        if ($review->user_id !== $user->id) {
            abort(403);
        }

        if (!$review->canBeEdited()) {
            return redirect()->route('reviews.index')
                           ->with('error', 'Ulasan ini tidak dapat diubah lagi');
        }

        $review->load(['order.orderItems.menuItem', 'menuItem']);

        return Inertia::render('Reviews/Edit', [
            'review' => [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'menu_item_id' => $review->menu_item_id,
                'order' => [
                    'id' => $review->order->id,
                    'order_code' => $review->order->order_code,
                    'order_date' => $review->order->order_time->format('d M Y'),
                    'items' => $review->order->orderItems->map(function ($item) {
                        return [
                            'id' => $item->menu_item_id,
                            'name' => $item->menuItem->name,
                            'quantity' => $item->quantity
                        ];
                    })
                ]
            ]
        ]);
    }

    /**
     * Get menu reviews (for public display) - for MenuReviews component
     */
    public function getMenuReviews(MenuItem $menuItem)
    {
        $reviews = UserReview::with(['user', 'order'])
                           ->where('menu_item_id', $menuItem->id)
                           ->where('is_verified', true)
                           ->latest('reviewed_at')
                           ->paginate(10);

        $transformedReviews = $reviews->through(function ($review) {
            return [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'reviewer_name' => $review->user->name,
                'reviewed_at' => $review->reviewed_at->format('d M Y'),
                'helpful_count' => $review->helpful_count,
                'is_featured' => $review->is_featured,
                'admin_response' => $review->admin_response ? [
                    'text' => $review->admin_response,
                    'date' => $review->admin_response_date->format('d M Y'),
                    'author' => $review->adminResponder->name ?? 'Admin Team'
                ] : null
            ];
        });

        $stats = [
            'total_reviews' => UserReview::where('menu_item_id', $menuItem->id)->count(),
            'average_rating' => UserReview::where('menu_item_id', $menuItem->id)->avg('rating') ?? 0,
            'rating_distribution' => []
        ];

        // Calculate rating distribution
        for ($i = 1; $i <= 5; $i++) {
            $stats['rating_distribution'][$i] = UserReview::where('menu_item_id', $menuItem->id)
                                                         ->where('rating', $i)
                                                         ->count();
        }

        return Inertia::render('MenuReviews', [
            'reviews' => $transformedReviews,
            'stats' => $stats,
            'menuItem' => [
                'id' => $menuItem->id,
                'name' => $menuItem->name
            ]
        ]);
    }

    /**
     * Get reviewable orders for dropdown/selection
     */
    public function getReviewableOrders()
    {
        $user = Auth::user();
        
        $orders = Order::with(['orderItems.menuItem'])
                      ->where('user_id', $user->id)
                      ->where('status', Order::STATUS_COMPLETED)
                      ->whereDoesntHave('userReview')
                      ->latest('completed_at')
                      ->get();

        return Inertia::render('Reviews/ReviewableOrders', [
            'orders' => $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_code' => $order->order_code,
                    'order_date' => $order->order_time->format('Y-m-d'),
                    'completed_date' => $order->completed_at->format('Y-m-d'),
                    'total_amount' => $order->total_amount,
                    'can_review_until' => $order->completed_at->addDays(7)->format('Y-m-d'),
                    'items' => $order->orderItems->map(function ($item) {
                        return [
                            'id' => $item->menu_item_id,
                            'name' => $item->menuItem->name,
                            'quantity' => $item->quantity,
                            'price' => $item->price
                        ];
                    })
                ];
            })
        ]);
    }

    /**
     * Admin methods
     */
    public function addAdminResponse(Request $request, $id)
    {
        $request->validate([
            'response' => 'required|string|max:1000'
        ]);

        $review = UserReview::findOrFail($id);
        $review->addAdminResponse($request->response);

        return redirect()->back()
                       ->with('success', 'Response admin berhasil ditambahkan');
    }

    public function removeAdminResponse($id)
    {
        $review = UserReview::findOrFail($id);
        $review->removeAdminResponse();

        return redirect()->back()
                       ->with('success', 'Response admin berhasil dihapus');
    }

    public function markAsFeatured($id)
    {
        $review = UserReview::findOrFail($id);
        $review->markAsFeatured();

        return redirect()->back()
                       ->with('success', 'Review berhasil ditandai sebagai featured');
    }

    public function markAsVerified($id)
    {
        $review = UserReview::findOrFail($id);
        $review->markAsVerified();

        return redirect()->back()
                       ->with('success', 'Review berhasil diverifikasi');
    }
}