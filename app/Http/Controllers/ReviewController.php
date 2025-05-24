<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    /**
     * Display user's reviews
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Query orders yang sudah memiliki review
        $query = $user->orders()
            ->with(['orderItems.menu'])
            ->whereNotNull('rating')
            ->orderBy('updated_at', 'desc');

        // Filter berdasarkan rating jika ada
        if ($request->has('rating') && $request->rating !== 'all') {
            $query->where('rating', $request->rating);
        }

        // Search berdasarkan nama menu atau review
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('review', 'like', "%{$search}%")
                  ->orWhereHas('orderItems.menu', function($menuQuery) use ($search) {
                      $menuQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $reviews = $query->paginate(10);

        // Transform data untuk frontend
        $reviews->getCollection()->transform(function ($order) {
            // Ambil nama menu utama (yang pertama) untuk simplifikasi
            $mainMenu = $order->orderItems->first()->menu ?? null;
            
            return [
                'id' => $order->id,
                'orderId' => 'ORD-' . date('Y') . '-' . str_pad($order->id, 3, '0', STR_PAD_LEFT),
                'menuName' => $mainMenu ? $mainMenu->name : 'Multiple Items',
                'menuItems' => $order->orderItems->map(function($item) {
                    return $item->menu->name;
                }),
                'rating' => $order->rating,
                'comment' => $order->review,
                'date' => $order->updated_at->toDateString(),
                'helpful' => $order->helpful_count ?? 0,
                'response' => $order->admin_response ? [
                    'text' => $order->admin_response,
                    'date' => $order->admin_response_date ? $order->admin_response_date->toDateString() : null,
                    'author' => 'Cemapaka Cafe Team'
                ] : null,
                'canEdit' => $order->updated_at->diffInDays(now()) <= 7, // Bisa edit dalam 7 hari
                'orderDate' => $order->created_at->toDateString(),
                'totalAmount' => $order->total_amount,
            ];
        });

        // Statistics
        $allReviews = $user->orders()->whereNotNull('rating')->get();
        $stats = [
            'totalReviews' => $allReviews->count(),
            'averageRating' => $allReviews->avg('rating') ?? 0,
            'totalHelpful' => $allReviews->sum('helpful_count') ?? 0,
            'reviewsWithResponse' => $allReviews->whereNotNull('admin_response')->count(),
            'ratingDistribution' => [
                5 => $allReviews->where('rating', 5)->count(),
                4 => $allReviews->where('rating', 4)->count(),
                3 => $allReviews->where('rating', 3)->count(),
                2 => $allReviews->where('rating', 2)->count(),
                1 => $allReviews->where('rating', 1)->count(),
            ]
        ];

        return Inertia::render('ulasanPengguna', [
            'reviews' => $reviews,
            'stats' => $stats,
            'filters' => [
                'rating' => $request->rating ?? 'all',
                'search' => $request->search ?? '',
            ]
        ]);
    }

    /**
     * Store a new review
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $user = auth()->user();
        $order = $user->orders()->findOrFail($validated['order_id']);

        // Cek apakah order sudah completed dan belum ada review
        if ($order->status !== 'completed') {
            return back()->with('error', 'Hanya pesanan yang sudah selesai yang bisa direview.');
        }

        if ($order->rating) {
            return back()->with('error', 'Pesanan ini sudah memiliki review.');
        }

        $order->update([
            'rating' => $validated['rating'],
            'review' => $validated['comment'],
        ]);

        return back()->with('success', 'Review berhasil ditambahkan!');
    }

    /**
     * Update an existing review
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $user = auth()->user();
        $order = $user->orders()->findOrFail($id);

        // Cek apakah review bisa diedit (dalam 7 hari)
        if (!$order->rating || $order->updated_at->diffInDays(now()) > 7) {
            return back()->with('error', 'Review tidak dapat diubah atau sudah melewati batas waktu.');
        }

        $order->update([
            'rating' => $validated['rating'],
            'review' => $validated['comment'],
        ]);

        return back()->with('success', 'Review berhasil diperbarui!');
    }

    /**
     * Delete a review
     */
    public function destroy($id)
    {
        $user = auth()->user();
        $order = $user->orders()->findOrFail($id);

        // Cek apakah review bisa dihapus (dalam 7 hari)
        if (!$order->rating || $order->updated_at->diffInDays(now()) > 7) {
            return back()->with('error', 'Review tidak dapat dihapus atau sudah melewati batas waktu.');
        }

        $order->update([
            'rating' => null,
            'review' => null,
        ]);

        return back()->with('success', 'Review berhasil dihapus!');
    }

    /**
     * Mark review as helpful
     */
    public function markHelpful(Request $request, $id)
    {
        $user = auth()->user();
        $order = $user->orders()->findOrFail($id);

        if (!$order->rating) {
            return response()->json(['error' => 'Review tidak ditemukan'], 404);
        }

        // Logic untuk menandai sebagai helpful
        // Bisa menggunakan tabel terpisah untuk tracking siapa yang menandai helpful
        
        $order->increment('helpful_count');

        return response()->json([
            'message' => 'Review ditandai sebagai helpful',
            'helpful_count' => $order->helpful_count
        ]);
    }

    /**
     * Get orders that can be reviewed
     */
    public function getReviewableOrders()
    {
        $user = auth()->user();
        
        $orders = $user->orders()
            ->with(['orderItems.menu'])
            ->where('status', 'completed')
            ->whereNull('rating')
            ->orderBy('created_at', 'desc')
            ->get();

        $reviewableOrders = $orders->map(function ($order) {
            return [
                'id' => $order->id,
                'orderId' => 'ORD-' . date('Y') . '-' . str_pad($order->id, 3, '0', STR_PAD_LEFT),
                'date' => $order->created_at->toDateString(),
                'items' => $order->orderItems->map(function($item) {
                    return [
                        'name' => $item->menu->name,
                        'quantity' => $item->quantity,
                    ];
                }),
                'total' => $order->total_amount,
            ];
        });

        return response()->json($reviewableOrders);
    }

    /**
     * Get review statistics for dashboard
     */
    public function getReviewStats()
    {
        $user = auth()->user();
        
        $reviews = $user->orders()->whereNotNull('rating')->get();
        
        $stats = [
            'total_reviews' => $reviews->count(),
            'average_rating' => $reviews->avg('rating') ?? 0,
            'rating_distribution' => [
                5 => $reviews->where('rating', 5)->count(),
                4 => $reviews->where('rating', 4)->count(),
                3 => $reviews->where('rating', 3)->count(),
                2 => $reviews->where('rating', 2)->count(),
                1 => $reviews->where('rating', 1)->count(),
            ],
            'recent_reviews' => $reviews->take(3)->map(function($order) {
                return [
                    'rating' => $order->rating,
                    'comment' => $order->review,
                    'date' => $order->updated_at->toDateString(),
                    'menu' => $order->orderItems->first()->menu->name ?? 'Multiple Items'
                ];
            })
        ];

        return response()->json($stats);
    }
}