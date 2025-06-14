<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\OfflineOrder;
use App\Models\OfflineOrderItem;
use App\Models\RestaurantTable;
use App\Models\UserReview;
use Illuminate\Http\Request;
use App\Models\MenuCategory;
use Illuminate\Support\Facades\Storage; // TAMBAH INI
use Illuminate\Support\Str; // TAMBAH INI
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Carbon\Carbon;

class OrderController extends Controller
{
    /**
     * Display the order menu page with all necessary data
     */
    public function index()
    {
        // Load all menu items with categories and reviews in one query
        $menuItems = MenuItem::with(['category'])
                           ->where('is_available', true)
                           ->orderBy('sort_order')
                           ->orderBy('name')
                           ->get();

        // Get categories
        $categories = MenuCategory::whereHas('menuItems', function ($query) {
            $query->where('is_available', true);
        })->orderBy('sort_order')->orderBy('name')->get();

        // Transform menu items with review stats
        $transformedItems = $menuItems->map(function ($item) {
            $reviewStats = UserReview::where('menu_item_id', $item->id)
                                   ->where('is_verified', true)
                                   ->selectRaw('COUNT(*) as review_count, AVG(rating) as average_rating')
                                   ->first();

            return [
                'id' => $item->id,
                'name' => $item->name,
                'price' => $item->price,
                'image' => $item->image_url,
                'description' => $item->description ?? '',
                'category' => $item->category->name ?? 'Uncategorized',
                'rating' => round($reviewStats->average_rating ?? 4.5, 1),
                'review_count' => $reviewStats->review_count ?? 0,
                'isPopular' => $item->is_featured ?? false
            ];
        });

        // Transform categories
        $transformedCategories = $categories->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug
            ];
        });

        // Get user favorites if authenticated
        $favoriteIds = [];
        if (Auth::check()) {
            $favoriteIds = Auth::user()->favoriteMenus()->pluck('menu_item_id')->toArray();
        }

        return Inertia::render('menuPage', [
            'menuItems' => $transformedItems,
            'categories' => $transformedCategories,
            'favoriteIds' => $favoriteIds,
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }

    /**
     * Display order history
     */
    public function history(Request $request)
    {
        $user = Auth::user();

        $query = Order::with([
            'orderItems.menuItem',
            'userReview'
        ])->where('user_id', $user->id);

        // Apply filters
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

        $orders = $query->latest('order_time')->paginate(10);

        // Transform orders for frontend
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
                ] : null
            ];
        });

        return Inertia::render('riwayatPemesanan', [
            'orders' => $transformedOrders,
            'filters' => [
                'status' => $request->status,
                'order_type' => $request->order_type,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to
            ]
        ]);
    }

    /**
     * Show order details
     */
    public function show(Order $order)
    {
        $user = Auth::user();

        // Check if order belongs to user
        if ($order->user_id !== $user->id) {
            abort(403, 'Unauthorized access to order');
        }

        $order->load([
            'orderItems.menuItem',
            'userReview.adminResponder'
        ]);

        $transformedOrder = [
            'id' => $order->id,
            'order_code' => $order->order_code,
            'order_date' => $order->order_time->format('Y-m-d H:i:s'),
            'status' => $order->status,
            'status_label' => $order->status_label,
            'order_type' => $order->order_type,
            'order_type_label' => $order->order_type_label,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'customer_email' => $order->customer_email,
            'delivery_address' => $order->delivery_address,
            'notes' => $order->notes,
            'subtotal' => $order->subtotal,
            'delivery_fee' => $order->delivery_fee,
            'service_fee' => $order->service_fee,
            'total_amount' => $order->total_amount,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'estimated_ready_time' => $order->estimated_ready_time?->format('Y-m-d H:i:s'),
            'completed_at' => $order->completed_at?->format('Y-m-d H:i:s'),
            'items' => $order->orderItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'menu_item_id' => $item->menu_item_id,
                    'menu_name' => $item->menuItem->name ?? 'Menu tidak ditemukan',
                    'menu_image' => $item->menuItem->image_url ?? null,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'subtotal' => $item->subtotal,
                    'special_instructions' => $item->special_instructions
                ];
            })->toArray(),
            'can_be_reviewed' => $order->canBeReviewed(),
            'has_review' => $order->hasReview(),
            'can_be_cancelled' => $order->canBeCancelled(),
            'review' => $order->userReview ? [
                'id' => $order->userReview->id,
                'rating' => $order->userReview->rating,
                'comment' => $order->userReview->comment,
                'reviewed_at' => $order->userReview->reviewed_at->format('Y-m-d H:i:s'),
                'can_edit' => $order->userReview->can_edit,
                'helpful_count' => $order->userReview->helpful_count,
                'is_verified' => $order->userReview->is_verified,
                'is_featured' => $order->userReview->is_featured,
                'admin_response' => $order->userReview->admin_response ? [
                    'text' => $order->userReview->admin_response,
                    'date' => $order->userReview->admin_response_date->format('Y-m-d H:i:s'),
                    'author' => $order->userReview->adminResponder->name ?? 'Admin Team'
                ] : null
            ] : null
        ];

        return Inertia::render('Orders/Show', [
            'order' => $transformedOrder
        ]);
    }

    /**
     * Store a new order - using session flash for feedback
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'required|email|max:255',
            'order_type' => 'required|in:dine_in,takeaway,delivery',
            'delivery_address' => 'required_if:order_type,delivery|nullable|string|max:500',
            'notes' => 'nullable|string|max:500',
            'cart_items' => 'required|array|min:1',
            'cart_items.*.id' => 'required|exists:menu_items,id',
            'cart_items.*.quantity' => 'required|integer|min:1',
            'cart_items.*.special_instructions' => 'nullable|string|max:255',
            'subtotal' => 'required|numeric|min:0',
            'delivery_fee' => 'required|numeric|min:0',
            'service_fee' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'payment_proof' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        DB::beginTransaction();
        try {
            // Create order first
            $order = Order::create([
                'user_id' => $user->id,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_email' => $request->customer_email,
                'order_type' => $request->order_type,
                'delivery_address' => $request->delivery_address,
                'notes' => $request->notes,
                'subtotal' => $request->subtotal,
                'delivery_fee' => $request->delivery_fee,
                'service_fee' => $request->service_fee,
                'total_amount' => $request->total_amount,
                'payment_method' => $request->payment_method,
                'payment_status' => Order::PAYMENT_PENDING,
                'status' => Order::STATUS_PENDING
            ]);

            // Create order items
            foreach ($request->cart_items as $cartItem) {
                $menuItem = MenuItem::find($cartItem['id']);

                if (!$menuItem || !$menuItem->is_available) {
                    $itemName = $menuItem && $menuItem->name ? $menuItem->name : 'Unknown';
                    throw ValidationException::withMessages([
                        'cart_items' => "Menu item '{$itemName}' is not available"
                    ]);
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menuItem->id,
                    'menu_item_name' => $menuItem->name,
                    'menu_item_price' => $menuItem->price,
                    'quantity' => $cartItem['quantity'],
                    'special_instructions' => $cartItem['special_instructions'] ?? null,
                ]);
            }

            // Handle payment proof upload dengan format nama yang konsisten
            if ($request->hasFile('payment_proof')) {
                $file = $request->file('payment_proof');
                $extension = $file->getClientOriginalExtension();

                // Format nama file: {order_code}_payment_{timestamp}_{random}.{ext}
                // Contoh: ORD-20250531-A1B2_payment_20250531123456_xyzk.jpg
                $fileName = $order->order_code . '_payment_' . date('YmdHis') . '_' . strtolower(Str::random(4)) . '.' . $extension;

                // Simpan ke storage/app/public/orders/payments/
                $filePath = $file->storeAs('orders/payments', $fileName, 'public');

                $order->update([
                    'payment_proof' => $filePath,
                    'payment_status' => Order::PAYMENT_PAID // Auto mark as paid when proof uploaded
                ]);
            }

            // Calculate estimated time
            $order->calculateEstimatedTime();

            DB::commit();

            // PERBAIKAN: Redirect ke menu dengan flash data untuk success modal
        $estimatedTime = $order->estimated_ready_time ? $order->estimated_ready_time->format('H:i') : '20-30 menit';

        return redirect()->route('menu.index') // atau route ke menu page
            ->with([
                'success' => true,
                'order_success' => [
                    'order_code' => $order->order_code,
                    'total_amount' => $order->total_amount,
                    'payment_method' => $order->payment_method,
                    'estimated_time' => $estimatedTime,
                    'message' => $request->payment_method === 'cash'
                        ? 'Pesanan berhasil dibuat! Silakan bayar saat pesanan siap.'
                        : 'Pesanan berhasil dibuat! Bukti pembayaran berhasil diupload.'
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollback();

            return redirect()->back()
                        ->withErrors(['order' => $e->getMessage()])
                        ->withInput();
        }
    }

    /**
 * Store offline order from staff (cashier)
 */
    public function storeOfflineOrder(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'order_type' => 'required|in:dine_in,takeaway',
            'table_id' => 'nullable|exists:restaurant_tables,id',
            'notes' => 'nullable|string|max:500',
            'cart_items' => 'required|array|min:1',
            'cart_items.*.id' => 'required|exists:menu_items,id',
            'cart_items.*.quantity' => 'required|integer|min:1',
            'cart_items.*.special_instructions' => 'nullable|string|max:255',
            'subtotal' => 'required|numeric|min:0',
            'service_fee' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,debit_card',
            'staff_id' => 'required|exists:users,id',
        ]);

        DB::beginTransaction();
        try {
            // Create offline order
            $order = OfflineOrder::create([
                'created_by_staff' => $request->staff_id,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_email' => $request->customer_email,
                'order_type' => $request->order_type,
                'table_id' => $request->table_id,
                'notes' => $request->notes,
                'subtotal' => $request->subtotal,
                'service_fee' => $request->service_fee,
                'total_amount' => $request->total_amount,
                'payment_method' => $request->payment_method,
                'payment_status' => 'paid',
                'status' => OfflineOrder::STATUS_CONFIRMED,
            ]);

            // Create order items
            foreach ($request->cart_items as $cartItem) {
                $menuItem = MenuItem::find($cartItem['id']);

                if (!$menuItem || !$menuItem->is_available) {
                    throw ValidationException::withMessages([
                        'cart_items' => "Menu item '{$menuItem->name}' is not available"
                    ]);
                }

                OfflineOrderItem::create([
                    'offline_order_id' => $order->id,
                    'menu_item_id' => $menuItem->id,
                    'menu_item_name' => $menuItem->name,
                    'menu_item_price' => $menuItem->price,
                    'quantity' => $cartItem['quantity'],
                    'special_instructions' => $cartItem['special_instructions'] ?? null,
                ]);
            }

            // Auto assign table untuk dine_in
            if ($request->order_type === 'dine_in' && $request->table_id) {
                $table = RestaurantTable::find($request->table_id);
                if ($table) {
                    $table->update(['status' => 'occupied']);
                }
            }

            // Set estimated time
            $order->calculateEstimatedTime();

            DB::commit();

            // RETURN INERTIA RESPONSE, BUKAN JSON
            return redirect()->route('StaffPage')->with([
                'success' => 'Pesanan offline berhasil dibuat!',
                'tab' => 'cashier',
                'order_details' => [
                    'order_code' => $order->order_code,
                    'total_amount' => $order->total_amount,
                    'estimated_time' => $order->estimated_ready_time?->format('H:i'),
                    'table_name' => $table->meja_name ?? null
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollback();

            return redirect()->back()->with([
                'error' => 'Gagal membuat pesanan: ' . $e->getMessage(),
                'tab' => 'cashier'
            ])->withInput();
        }
    }

    /**
     * Show payment page for online payment methods
     */
    public function showPayment(Order $order)
    {
        $user = Auth::user();

        if ($order->user_id !== $user->id) {
            abort(403, 'Unauthorized access to order');
        }

        if ($order->payment_method === 'cash') {
            return redirect()->route('orders.show', $order);
        }

        return Inertia::render('Orders/Payment', [
            'order' => [
                'id' => $order->id,
                'order_code' => $order->order_code,
                'total_amount' => $order->total_amount,
                'formatted_total' => $order->formatted_total,
                'payment_method' => $order->payment_method,
                'payment_method_label' => $order->payment_method_label,
                'payment_instructions' => $order->payment_instructions,
                'payment_status' => $order->payment_status,
                'requires_proof' => $order->requiresPaymentProof(),
                'payment_proof' => $order->payment_proof
            ]
        ]);
    }

    /**
     * Upload payment proof
     */
    public function uploadPaymentProof(Request $request, Order $order)
    {
        $user = Auth::user();

        if ($order->user_id !== $user->id) {
            abort(403, 'Unauthorized access to order');
        }

        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        try {
            $file = $request->file('payment_proof');
            $extension = $file->getClientOriginalExtension();

            // Hapus file lama jika ada
            if ($order->payment_proof && Storage::disk('public')->exists($order->payment_proof)) {
                Storage::disk('public')->delete($order->payment_proof);
            }

            // Format nama file yang konsisten
            $fileName = $order->order_code . '_payment_' . date('YmdHis') . '_' . strtolower(Str::random(4)) . '.' . $extension;

            // Simpan ke storage/app/public/orders/payments/
            $filePath = $file->storeAs('orders/payments', $fileName, 'public');

            $order->update([
                'payment_proof' => $filePath,
                'payment_status' => Order::PAYMENT_PAID
            ]);

            return redirect()->route('orders.show', $order)
                ->with('success', 'Bukti pembayaran berhasil diupload! Pesanan akan segera diproses.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['payment_proof' => 'Gagal mengupload bukti pembayaran.']);
        }
    }

    /**
     * Cancel an order
     */
    public function cancel(Order $order, Request $request)
    {
        $user = Auth::user();

        // Check if order belongs to user
        if ($order->user_id !== $user->id) {
            abort(403, 'Unauthorized access to order');
        }

        if (!$order->canBeCancelled()) {
            return redirect()->back()
                           ->withErrors(['cancel' => 'Pesanan ini tidak dapat dibatalkan']);
        }

        $request->validate([
            'reason' => 'nullable|string|max:500'
        ]);

        try {
            $order->cancel($request->reason);

            return redirect()->route('orders.index')
                           ->with('success', 'Pesanan berhasil dibatalkan');

        } catch (\Exception $e) {
            return redirect()->back()
                           ->withErrors(['cancel' => 'Gagal membatalkan pesanan']);
        }
    }

    /**
     * Track order status
     */
    public function trackOrder(Order $order)
    {
        $user = Auth::user();

        // Check if order belongs to user
        if ($order->user_id !== $user->id) {
            abort(403, 'Unauthorized access to order');
        }

        $trackingInfo = [
            'order_code' => $order->order_code,
            'status' => $order->status,
            'status_label' => $order->status_label,
            'order_time' => $order->order_time->format('Y-m-d H:i:s'),
            'estimated_ready_time' => $order->estimated_ready_time?->format('Y-m-d H:i:s'),
            'completed_at' => $order->completed_at?->format('Y-m-d H:i:s'),
            'estimated_remaining_time' => $order->estimated_remaining_time,
            'is_overdue' => $order->is_overdue,
            'order_duration' => $order->order_duration,
            'progress_percentage' => $this->calculateProgressPercentage($order->status)
        ];

        return Inertia::render('Orders/Track', [
            'tracking' => $trackingInfo,
            'order' => $order
        ]);
    }

    /**
     * Calculate progress percentage based on status
     */
    private function calculateProgressPercentage(string $status): int
    {
        $statusProgress = [
            Order::STATUS_PENDING => 10,
            Order::STATUS_CONFIRMED => 25,
            Order::STATUS_PREPARING => 50,
            Order::STATUS_READY => 75,
            Order::STATUS_COMPLETED => 100,
            Order::STATUS_CANCELLED => 0
        ];

        return $statusProgress[$status] ?? 0;
    }

    /**
     * Admin methods
     */
    public function adminIndex()
    {
        $orders = Order::with(['user', 'orderItems.menuItem'])
                      ->latest('order_time')
                      ->paginate(20);

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,ready,completed,cancelled'
        ]);

        $oldStatus = $order->status;
        $order->updateStatus($validated['status']);

        return redirect()->back()
                       ->with('success', "Status pesanan {$order->order_code} berhasil diperbarui dari {$oldStatus} ke {$validated['status']}");
    }
        /**
     * Helper method untuk generate nama file payment proof
     */
    private function generatePaymentProofFileName(Order $order, $extension): string
    {
        return $order->order_code . '_payment_' . date('YmdHis') . '_' . strtolower(Str::random(4)) . '.' . $extension;
    }

    public function updateOrderStatus(Request $request, Order $order)
{
    $validated = $request->validate([
        'status' => 'required|in:pending,confirmed,preparing,ready,completed,cancelled',
        'notes' => 'nullable|string|max:500'
    ]);
    
    $oldStatus = $order->status;
    $newStatus = $validated['status'];
    
    // Update basic status
    $order->status = $newStatus;
    
    // Track staff actions
    if ($newStatus === 'confirmed' && $oldStatus === 'pending') {
        $order->confirmed_by_staff = auth()->id();
        $order->confirmed_at = now();
    }
    
    if ($newStatus === 'cancelled') {
        $order->cancelled_by_staff = auth()->id();
        $order->cancelled_at = now();
        $order->cancelled_by_user = false;
        $order->cancellation_reason = $validated['notes'] ?? 'Dibatalkan oleh staff';
    }
    
    if ($newStatus === 'completed') {
        $order->completed_at = now();
    }
    
    $order->save();
    
    // Log the status change (if you have order_status_logs table)
    $this->logStatusChange($order, $oldStatus, $newStatus, $validated['notes'] ?? null);
    
    return redirect()->back()->with('success', 'Status pesanan berhasil diupdate!');
}

private function logStatusChange($order, $oldStatus, $newStatus, $notes = null)
{
    // Create status log entry (optional - requires order_status_logs table)
    /*
    OrderStatusLog::create([
        'order_id' => $order->id,
        'old_status' => $oldStatus,
        'new_status' => $newStatus,
        'changed_by' => auth()->id(),
        'notes' => $notes,
        'changed_at' => now()
    ]);
    */
}
}
