<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\ReservationMenuItem;
use App\Models\ReservationImage;
use App\Models\ReservationPackage;
use App\Models\MenuItem;
use App\Models\MenuCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    /**
     * Display a listing of the resource for user's reservation history
     */
    public function index(): Response
    {
        $reservations = Reservation::with(['user', 'menuItems', 'package'])
            ->where('user_id', Auth::id())
            ->orderBy('reservation_date', 'desc')
            ->orderBy('reservation_time', 'desc')
            ->get();

        // Transform data to match frontend expectations
        $transformedReservations = $reservations->map(function ($reservation) {
            return [
                'id' => $reservation->reservation_code,
                'date' => $reservation->reservation_date->format('Y-m-d'),
                'time' => $reservation->reservation_time->format('H:i'),
                'guests' => $reservation->number_of_people,
                'table' => $this->getTableName($reservation->table_location, $reservation->id),
                'name' => $reservation->customer_name,
                'phone' => $reservation->customer_phone,
                'status' => $reservation->status,
                'specialRequest' => $reservation->special_requests ?? '',
                'createdAt' => $reservation->created_at->format('Y-m-d'),
                'email' => $reservation->customer_email,
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
            ];
        });

        // Calculate statistics
        $stats = [
            'totalReservations' => $reservations->count(),
            'confirmedCount' => $reservations->where('status', 'confirmed')->count(),
            'completedCount' => $reservations->where('status', 'completed')->count(),
            'cancelledCount' => $reservations->where('status', 'cancelled')->count(),
            'pendingCount' => $reservations->where('status', 'pending')->count(),
            'totalGuests' => $reservations->sum('number_of_people'),
            'averageGuests' => $reservations->count() > 0 ? round($reservations->sum('number_of_people') / $reservations->count()) : 0,
        ];

        return Inertia::render('riwayatReservasi', [
            'reservations' => $transformedReservations,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new resource with all necessary data
     */
    public function create(): Response
    {
        // Get active packages
        $packages = ReservationPackage::where('is_active', true)
            ->orderBy('max_people')
            ->get()
            ->map(function ($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'price' => $package->price,
                    'image' => $package->image_url ?? null,
                    'description' => $package->description,
                    'includes' => $package->includes,
                    'duration' => $package->duration,
                    'maxPeople' => $package->max_people,
                ];
            });

        // Get menu items grouped by category
        $menuItems = [];
        $categories = MenuCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->with(['menuItems' => function($query) {
                $query->where('is_available', true)
                      ->orderBy('sort_order')
                      ->orderBy('name');
            }])
            ->get();

        foreach ($categories as $category) {
            $menuItems[$category->slug] = $category->menuItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => $item->price,
                    'image' => $item->image_url,
                    'description' => $item->description,
                ];
            });
        }

        // Get user data - hanya name dan email
        $user = Auth::user();
        $defaultData = [
            'customer_name' => $user ? $user->name : '',
            'customer_phone' => '', // Kosong karena tidak ada di database
            'customer_email' => $user ? $user->email : '',
            'special_requests' => '',
            'package_id' => $packages->isNotEmpty() ? $packages->first()['id'] : 1,
            'reservation_date' => now()->addDay()->format('Y-m-d'),
            'reservation_time' => '19:00',
            'number_of_people' => 2,
            'table_location' => 'indoor',
            'package_price' => $packages->isNotEmpty() ? $packages->first()['price'] : 0,
            'menu_subtotal' => 0,
            'total_price' => $packages->isNotEmpty() ? $packages->first()['price'] : 0,
            'payment_method' => 'transfer',
        ];

        // User profile untuk display (hanya name dan email)
        $userProfile = null;
        if ($user) {
            $userProfile = [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => '', // Kosong karena tidak ada di database
            ];
        }

        // Get query parameters for pre-filling date/time
        $queryParams = [
            'date' => request('date'),
            'time' => request('time'),
        ];

        return Inertia::render('reservation', [
            'packages' => $packages,
            'menuItems' => $menuItems,
            'defaultData' => $defaultData,
            'userProfile' => $userProfile,
            'queryParams' => $queryParams,
        ]);
    }

    /**
     * Store a newly created resource - using session flash for feedback
     */
public function store(Request $request)
{
    // Parse menu_items JSON if it's a string
    if ($request->has('menu_items') && is_string($request->menu_items)) {
        $menuItems = json_decode($request->menu_items, true);
        $request->merge(['menu_items' => $menuItems]);
    }

    // Get active package and menu item IDs for validation
    $activePackageIds = ReservationPackage::where('is_active', true)->pluck('id')->toArray();
    $activeMenuItemIds = MenuItem::where('is_available', true)->pluck('id')->toArray();

    $validated = $request->validate([
        'customer_name' => 'required|string|max:255',
        'customer_phone' => 'required|string|max:20',
        'customer_email' => 'required|email|max:255',
        'special_requests' => 'nullable|string',
        'package_id' => ['required', 'integer', 'in:' . implode(',', $activePackageIds)],
        'reservation_date' => 'required|date|after_or_equal:today',
        'reservation_time' => 'required',
        'number_of_people' => 'required|integer|min:1',
        'table_location' => 'required|in:indoor,outdoor',
        'package_price' => 'required|numeric|min:0',
        'menu_subtotal' => 'required|numeric|min:0',
        'total_price' => 'required|numeric|min:0',
        'payment_method' => 'required|string',
        'requires_confirmation' => 'nullable|in:true,false,1,0',
        'menu_items' => 'nullable|array',
        'menu_items.*.id' => ['required_with:menu_items', 'integer', 'in:' . implode(',', $activeMenuItemIds)],
        'menu_items.*.name' => 'required_with:menu_items|string',
        'menu_items.*.price' => 'required_with:menu_items|numeric|min:0',
        'menu_items.*.quantity' => 'required_with:menu_items|integer|min:1',
        // Image validation
        'proof_of_payment' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        'additional_images' => 'nullable|array|max:5',
        'additional_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    // Verify package exists
    $package = ReservationPackage::where('is_active', true)->find($validated['package_id']);
    if (!$package) {
        return redirect()->back()
                       ->withErrors(['package_id' => 'Paket reservasi tidak ditemukan atau tidak aktif.'])
                       ->withInput();
    }

    // Verify menu items if any
    if (!empty($validated['menu_items'])) {
        $menuItemIds = collect($validated['menu_items'])->pluck('id');
        $validMenuItems = MenuItem::where('is_available', true)->whereIn('id', $menuItemIds)->get();

        if ($validMenuItems->count() !== $menuItemIds->count()) {
            return redirect()->back()
                           ->withErrors(['menu_items' => 'Beberapa menu item tidak ditemukan atau tidak tersedia.'])
                           ->withInput();
        }
    }

    // Validate payment proof for certain methods
    $paymentMethodsRequiringProof = [
        'transfer', 'bca', 'mandiri', 'bni', 'bri',
        'gopay', 'ovo', 'dana', 'shopeepay'
    ];

    if (in_array($validated['payment_method'], $paymentMethodsRequiringProof)) {
        if (!$request->hasFile('proof_of_payment')) {
            return redirect()->back()
                           ->withErrors(['proof_of_payment' => 'Bukti pembayaran wajib diupload untuk metode pembayaran ini.'])
                           ->withInput();
        }
    }

    try {
        DB::beginTransaction();

        // Determine initial status based on payment method
        $initialStatus = 'pending';
        if ($validated['payment_method'] === 'pay-later') {
            $initialStatus = 'confirmed';
        }

        // Create reservation
        $reservation = Reservation::create([
            'user_id' => Auth::id(),
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_email' => $validated['customer_email'],
            'special_requests' => $validated['special_requests'],
            'package_id' => $validated['package_id'],
            'reservation_date' => $validated['reservation_date'],
            'reservation_time' => $validated['reservation_time'],
            'number_of_people' => $validated['number_of_people'],
            'table_location' => $validated['table_location'],
            'package_price' => $validated['package_price'],
            'menu_subtotal' => $validated['menu_subtotal'],
            'total_price' => $validated['total_price'],
            'payment_method' => $validated['payment_method'],
            'status' => $initialStatus,
        ]);

        // Create menu items if any
        if (!empty($validated['menu_items'])) {
            foreach ($validated['menu_items'] as $menuItem) {
                ReservationMenuItem::create([
                    'reservation_id' => $reservation->id,
                    'menu_item_id' => $menuItem['id'],
                    'menu_item_name' => $menuItem['name'],
                    'menu_item_price' => $menuItem['price'],
                    'quantity' => $menuItem['quantity'],
                    'subtotal' => $menuItem['price'] * $menuItem['quantity'],
                ]);
            }
        }

        // Handle image uploads
        $this->handleImageUploads($request, $reservation);

        DB::commit();

        $message = $initialStatus === 'confirmed'
            ? 'Reservasi berhasil dibuat dan dikonfirmasi!'
            : 'Reservasi berhasil dibuat! Menunggu konfirmasi pembayaran.';

        // Log successful creation
        \Log::info('Reservation created successfully:', [
            'reservation_code' => $reservation->reservation_code,
            'user_id' => Auth::id(),
            'total_price' => $validated['total_price']
        ]);

        // ⭐ PERBAIKAN: Ganti bagian return ini ⭐
        return redirect()->back()->with([
            'success' => $message,
            'reservation' => [
                'reservation_code' => $reservation->reservation_code,
                'id' => $reservation->id,
                'status' => $reservation->status
            ],
            'reservation_code' => $reservation->reservation_code, // Duplicate untuk fallback
            'reservation_success' => true
        ]);

    } catch (\Exception $e) {
        DB::rollBack();

        \Log::error('Reservation creation failed:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'request_data' => $request->except(['proof_of_payment', 'additional_images']),
            'user_id' => Auth::id()
        ]);

        return redirect()->back()
                       ->withErrors(['reservation' => 'Terjadi kesalahan saat membuat reservasi.'])
                       ->withInput();
    }
}

    /**
     * Display the specified resource.
     */
    public function show(Reservation $reservation): Response
    {
        // Check if user owns this reservation
        if ($reservation->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to reservation.');
        }

        $reservation->load(['menuItems', 'package']);

        // Transform data for frontend
        $transformedReservation = [
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
            'tableLocation' => $reservation->table_location,
            'menuItems' => $reservation->menuItems->map(function ($item) {
                return [
                    'id' => $item->menu_item_id,
                    'name' => $item->menu_item_name,
                    'price' => $item->menu_item_price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->subtotal,
                ];
            }),
            'proofOfPaymentUrl' => $reservation->proof_of_payment_url,
            'additionalImageUrls' => $reservation->additional_image_urls,
        ];

        return Inertia::render('Reservations/Show', [
            'reservation' => $transformedReservation
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Reservation $reservation): Response
    {
        // Check if user owns this reservation
        if ($reservation->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to reservation.');
        }

        // Only allow editing if status is pending
        if ($reservation->status !== 'pending') {
            return redirect()->route('reservations.show', $reservation)
                ->with('error', 'Reservasi tidak dapat diubah karena sudah dikonfirmasi.');
        }

        $reservation->load(['menuItems', 'package']);

        // Get packages and menu items for the form
        $packages = ReservationPackage::where('is_active', true)
            ->orderBy('max_people')
            ->get()
            ->map(function ($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'price' => $package->price,
                    'image' => $package->image_url,
                    'description' => $package->description,
                    'includes' => $package->includes,
                    'duration' => $package->duration,
                    'maxPeople' => $package->max_people,
                ];
            });

        $menuItems = [];
        $categories = MenuCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->with(['menuItems' => function($query) {
                $query->where('is_available', true)
                      ->orderBy('sort_order')
                      ->orderBy('name');
            }])
            ->get();

        foreach ($categories as $category) {
            $menuItems[$category->slug] = $category->menuItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => $item->price,
                    'image' => $item->image_url,
                    'description' => $item->description,
                ];
            });
        }

        // Transform reservation data
        $transformedReservation = [
            'id' => $reservation->id,
            'reservation_code' => $reservation->reservation_code,
            'customer_name' => $reservation->customer_name,
            'customer_phone' => $reservation->customer_phone,
            'customer_email' => $reservation->customer_email,
            'special_requests' => $reservation->special_requests,
            'package_id' => $reservation->package_id,
            'reservation_date' => $reservation->reservation_date->format('Y-m-d'),
            'reservation_time' => $reservation->reservation_time->format('H:i'),
            'number_of_people' => $reservation->number_of_people,
            'table_location' => $reservation->table_location,
            'package_price' => $reservation->package_price,
            'menu_subtotal' => $reservation->menu_subtotal,
            'total_price' => $reservation->total_price,
            'payment_method' => $reservation->payment_method,
            'menuItems' => $reservation->menuItems->map(function ($item) {
                return [
                    'id' => $item->menu_item_id,
                    'name' => $item->menu_item_name,
                    'price' => $item->menu_item_price,
                    'quantity' => $item->quantity,
                ];
            }),
            'proofOfPaymentUrl' => $reservation->proof_of_payment_url,
            'additionalImageUrls' => $reservation->additional_image_urls,
        ];

        return Inertia::render('Reservations/Edit', [
            'reservation' => $transformedReservation,
            'packages' => $packages,
            'menuItems' => $menuItems,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Reservation $reservation)
    {
        // Check if user owns this reservation
        if ($reservation->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to reservation.');
        }

        // Only allow updating if status is pending
        if ($reservation->status !== 'pending') {
            return redirect()->back()
                           ->withErrors(['reservation' => 'Reservasi tidak dapat diubah karena sudah dikonfirmasi.']);
        }

        // Get active package and menu item IDs for validation
        $activePackageIds = ReservationPackage::where('is_active', true)->pluck('id')->toArray();
        $activeMenuItemIds = MenuItem::where('is_available', true)->pluck('id')->toArray();

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'required|email|max:255',
            'special_requests' => 'nullable|string',
            'package_id' => ['required', 'integer', 'in:' . implode(',', $activePackageIds)],
            'reservation_date' => 'required|date|after_or_equal:today',
            'reservation_time' => 'required',
            'number_of_people' => 'required|integer|min:1',
            'table_location' => 'required|in:indoor,outdoor',
            'package_price' => 'required|numeric|min:0',
            'menu_subtotal' => 'required|numeric|min:0',
            'total_price' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'menu_items' => 'nullable|array',
            'menu_items.*.id' => ['required_with:menu_items', 'integer', 'in:' . implode(',', $activeMenuItemIds)],
            'menu_items.*.name' => 'required_with:menu_items|string',
            'menu_items.*.price' => 'required_with:menu_items|numeric|min:0',
            'menu_items.*.quantity' => 'required_with:menu_items|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            // Update reservation
            $reservation->update([
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_email' => $validated['customer_email'],
                'special_requests' => $validated['special_requests'],
                'package_id' => $validated['package_id'],
                'reservation_date' => $validated['reservation_date'],
                'reservation_time' => $validated['reservation_time'],
                'number_of_people' => $validated['number_of_people'],
                'table_location' => $validated['table_location'],
                'package_price' => $validated['package_price'],
                'menu_subtotal' => $validated['menu_subtotal'],
                'total_price' => $validated['total_price'],
                'payment_method' => $validated['payment_method'],
            ]);

            // Delete existing menu items
            $reservation->menuItems()->delete();

            // Create new menu items if any
            if (!empty($validated['menu_items'])) {
                foreach ($validated['menu_items'] as $menuItem) {
                    ReservationMenuItem::create([
                        'reservation_id' => $reservation->id,
                        'menu_item_id' => $menuItem['id'],
                        'menu_item_name' => $menuItem['name'],
                        'menu_item_price' => $menuItem['price'],
                        'quantity' => $menuItem['quantity'],
                        'subtotal' => $menuItem['price'] * $menuItem['quantity'],
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('reservations.show', $reservation)
                           ->with('success', 'Reservasi berhasil diperbarui!');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                           ->withErrors(['reservation' => 'Terjadi kesalahan saat memperbarui reservasi.'])
                           ->withInput();
        }
    }

    /**
     * Cancel reservation
     */
    public function destroy(Reservation $reservation)
    {
        // Check if user owns this reservation
        if ($reservation->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to reservation.');
        }

        // Only allow cancellation if status allows it
        if (!in_array($reservation->status, ['pending', 'confirmed'])) {
            return redirect()->back()
                           ->withErrors(['cancel' => 'Reservasi tidak dapat dibatalkan dengan status saat ini.']);
        }

        try {
            DB::beginTransaction();

            // Update status to cancelled instead of deleting
            $reservation->update(['status' => 'cancelled']);

            DB::commit();

            return redirect()->route('reservations.index')
                           ->with('success', 'Reservasi berhasil dibatalkan.');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                           ->withErrors(['cancel' => 'Terjadi kesalahan saat membatalkan reservasi.']);
        }
    }

    /**
     * Handle image uploads for reservation
     */
    private function handleImageUploads(Request $request, Reservation $reservation): void
    {
        // Handle proof of payment upload
        if ($request->hasFile('proof_of_payment')) {
            $file = $request->file('proof_of_payment');

            // Generate unique filename
            $filename = $this->generateImageFileName($reservation->reservation_code, 'payment', $file->getClientOriginalExtension());

            // Store file
            $path = $file->storeAs('reservations/payments', $filename, 'public');

            // Update reservation with filename
            $reservation->update(['proof_of_payment' => $filename]);
        }

        // Handle additional images upload
        if ($request->hasFile('additional_images')) {
            $files = $request->file('additional_images');
            $additionalImageNames = [];

            foreach ($files as $index => $file) {
                // Generate unique filename
                $filename = $this->generateImageFileName(
                    $reservation->reservation_code,
                    'additional',
                    $file->getClientOriginalExtension(),
                    $index
                );

                // Store file
                $path = $file->storeAs('reservations/additional', $filename, 'public');
                $additionalImageNames[] = $filename;
            }

            // Update reservation with filenames
            $reservation->update(['additional_images' => $additionalImageNames]);
        }
    }

    /**
     * Generate unique filename for images
     */
    private function generateImageFileName(string $reservationCode, string $type, string $extension, int $index = null): string
    {
        $timestamp = now()->format('YmdHis');
        $randomString = substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyz'), 0, 4);
        $suffix = $index !== null ? "_{$index}" : '';

        return "{$reservationCode}_{$type}_{$timestamp}_{$randomString}{$suffix}.{$extension}";
    }

    /**
     * Upload additional images to existing reservation
     */
    public function uploadImages(Request $request, Reservation $reservation)
    {
        // Check if user owns this reservation
        if ($reservation->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to reservation.');
        }

        $validated = $request->validate([
            'images' => 'required|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            $uploadedImages = [];
            $existingImages = $reservation->additional_images ?? [];

            foreach ($validated['images'] as $index => $file) {
                $filename = $this->generateImageFileName(
                    $reservation->reservation_code,
                    'additional',
                    $file->getClientOriginalExtension(),
                    count($existingImages) + $index
                );

                $path = $file->storeAs('reservations/additional', $filename, 'public');
                $uploadedImages[] = $filename;
            }

            // Merge with existing images
            $allImages = array_merge($existingImages, $uploadedImages);
            $reservation->update(['additional_images' => $allImages]);

            return redirect()->back()->with('success', 'Gambar berhasil diupload!');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['upload' => 'Terjadi kesalahan saat upload gambar.']);
        }
    }

    /**
     * Delete specific image
     */
    public function deleteImage(Reservation $reservation, $filename)
    {
        // Check if user owns this reservation
        if ($reservation->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to reservation.');
        }

        try {
            // Remove from proof of payment
            if ($reservation->proof_of_payment === $filename) {
                Storage::disk('public')->delete('reservations/payments/' . $filename);
                $reservation->update(['proof_of_payment' => null]);

                return redirect()->back()->with('success', 'Bukti pembayaran berhasil dihapus!');
            }

            // Remove from additional images
            $additionalImages = $reservation->additional_images ?? [];
            if (in_array($filename, $additionalImages)) {
                Storage::disk('public')->delete('reservations/additional/' . $filename);

                $updatedImages = array_filter($additionalImages, function($img) use ($filename) {
                    return $img !== $filename;
                });

                $reservation->update(['additional_images' => array_values($updatedImages)]);

                return redirect()->back()->with('success', 'Gambar berhasil dihapus!');
            }

            return redirect()->back()->withErrors(['delete' => 'Gambar tidak ditemukan.']);

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['delete' => 'Terjadi kesalahan saat menghapus gambar.']);
        }
    }

    /**
     * Get image by filename (for secure access)
     */
    public function getImage(Reservation $reservation, $filename)
    {
        // Check if user owns this reservation or is admin
        if ($reservation->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            abort(403, 'Unauthorized access to image.');
        }

        $paths = [
            'reservations/payments/' . $filename,
            'reservations/additional/' . $filename,
        ];

        foreach ($paths as $path) {
            if (Storage::disk('public')->exists($path)) {
                return Storage::disk('public')->response($path);
            }
        }

        abort(404, 'Image not found.');
    }

    /**
     * Get table name based on location and reservation ID
     */
    private function getTableName($location, $reservationId): string
    {
        // Simple table assignment logic - you can modify this based on your needs
        $tableNumber = ($reservationId % 20) + 1;
        $locationText = $location === 'indoor' ? 'Indoor' : 'Outdoor';
        return "Meja {$tableNumber} ({$locationText})";
    }

    /**
     * Get reservations for admin
     */
    public function adminIndex(): Response
    {
        $reservations = Reservation::with(['user', 'menuItems'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Reservations/Index', [
            'reservations' => $reservations
        ]);
    }

    /**
     * Update reservation status (admin only)
     */
    public function updateStatus(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled'
        ]);

        $oldStatus = $reservation->status;
        $reservation->update(['status' => $validated['status']]);

        // Log status change
        \Log::info("Reservation {$reservation->reservation_code} status changed from {$oldStatus} to {$validated['status']}");

        return redirect()->back()
                       ->with('success', "Status reservasi {$reservation->reservation_code} berhasil diperbarui dari {$oldStatus} ke {$validated['status']}");
    }
}
