<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of user's orders
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Query orders dengan relasi dan filtering
        $query = $user->orders()
            ->with(['orderItems.menu', 'table'])
            ->orderBy('created_at', 'desc');

        // Filter berdasarkan status jika ada
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search berdasarkan ID order atau nama menu
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('orderItems.menu', function($menuQuery) use ($search) {
                      $menuQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->paginate(10);

        // Transform data untuk frontend
        $orders->getCollection()->transform(function ($order) {
            return [
                'id' => 'ORD-' . date('Y') . '-' . str_pad($order->id, 3, '0', STR_PAD_LEFT),
                'date' => $order->created_at->toDateString(),
                'time' => $order->created_at->format('H:i'),
                'items' => $order->orderItems->map(function ($item) {
                    return [
                        'name' => $item->menu->name,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                    ];
                }),
                'total' => $order->total_amount,
                'status' => $order->status,
                'type' => $order->type, // 'dine-in' atau 'takeaway'
                'table' => $order->table ? $order->table->name : null,
                'rating' => $order->rating,
                'review' => $order->review,
                'paymentMethod' => $order->payment_method,
                'notes' => $order->notes,
            ];
        });

        // Statistics
        $completedOrders = $user->orders()->where('status', 'completed')->get();
        $stats = [
            'total' => $user->orders()->count(),
            'completed' => $completedOrders->count(),
            'cancelled' => $user->orders()->where('status', 'cancelled')->count(),
            'totalSpent' => $completedOrders->sum('total_amount'),
            'averageRating' => $completedOrders->where('rating', '>', 0)->avg('rating') ?? 0,
            'dineInCount' => $user->orders()->where('type', 'dine-in')->count(),
        ];

        return Inertia::render('riwayatPemesanan', [
            'orders' => $orders,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
            ]
        ]);
    }

    /**
     * Display the specified order
     */
    public function show($id)
    {
        $order = auth()->user()->orders()
            ->with(['orderItems.menu', 'table'])
            ->findOrFail($id);

        return Inertia::render('Order/Show', [
            'order' => [
                'id' => 'ORD-' . date('Y') . '-' . str_pad($order->id, 3, '0', STR_PAD_LEFT),
                'date' => $order->created_at->toDateString(),
                'time' => $order->created_at->format('H:i'),
                'items' => $order->orderItems->map(function ($item) {
                    return [
                        'name' => $item->menu->name,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'subtotal' => $item->quantity * $item->price,
                    ];
                }),
                'total' => $order->total_amount,
                'status' => $order->status,
                'type' => $order->type,
                'table' => $order->table ? $order->table->name : null,
                'rating' => $order->rating,
                'review' => $order->review,
                'paymentMethod' => $order->payment_method,
                'notes' => $order->notes,
                'createdAt' => $order->created_at,
                'updatedAt' => $order->updated_at,
            ]
        ]);
    }

    /**
     * Add rating and review to completed order
     */
    public function addReview(Request $request, $id)
    {
        $order = auth()->user()->orders()->findOrFail($id);

        // Hanya bisa review jika order sudah completed dan belum ada review
        if ($order->status !== 'completed' || $order->rating) {
            return back()->with('error', 'Order tidak dapat direview.');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
        ]);

        $order->update([
            'rating' => $validated['rating'],
            'review' => $validated['review'],
        ]);

        return back()->with('success', 'Review berhasil ditambahkan!');
    }

    /**
     * Update rating and review
     */
    public function updateReview(Request $request, $id)
    {
        $order = auth()->user()->orders()->findOrFail($id);

        if ($order->status !== 'completed' || !$order->rating) {
            return back()->with('error', 'Review tidak dapat diubah.');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
        ]);

        $order->update([
            'rating' => $validated['rating'],
            'review' => $validated['review'],
        ]);

        return back()->with('success', 'Review berhasil diperbarui!');
    }

    /**
     * Export orders to CSV/Excel
     */
    public function export(Request $request)
    {
        $user = auth()->user();
        $orders = $user->orders()
            ->with(['orderItems.menu'])
            ->when($request->status !== 'all', function($query) use ($request) {
                return $query->where('status', $request->status);
            })
            ->get();

        // Logic untuk export CSV/Excel
        // Bisa menggunakan package seperti Laravel Excel
        
        return response()->json(['message' => 'Export functionality to be implemented']);
    }
}