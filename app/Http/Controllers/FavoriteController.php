<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Menu;

class FavoriteController extends Controller
{
    /**
     * Display user's favorite menus
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Query favorite menus
        $query = $user->favoriteMenus()
            ->with(['menu.category'])
            ->whereHas('menu', function($q) {
                $q->where('is_active', true);
            });

        // Filter berdasarkan kategori jika ada
        if ($request->has('category') && $request->category !== 'all') {
            $query->whereHas('menu.category', function($q) use ($request) {
                $q->where('name', $request->category);
            });
        }

        // Search berdasarkan nama menu
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->whereHas('menu', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $favorites = $query->paginate(12);

        // Transform data untuk frontend
        $favorites->getCollection()->transform(function ($favorite) use ($user) {
            $menu = $favorite->menu;
            
            // Hitung total orders untuk menu ini oleh user
            $totalOrders = $user->orders()
                ->whereHas('orderItems', function($q) use ($menu) {
                    $q->where('menu_id', $menu->id);
                })
                ->where('status', 'completed')
                ->count();

            // Ambil tanggal order terakhir
            $lastOrder = $user->orders()
                ->whereHas('orderItems', function($q) use ($menu) {
                    $q->where('menu_id', $menu->id);
                })
                ->where('status', 'completed')
                ->latest()
                ->first();

            return [
                'id' => $menu->id,
                'name' => $menu->name,
                'category' => $menu->category->name,
                'price' => $menu->price,
                'image' => $menu->image_url ?? '/images/default-menu.jpg',
                'rating' => $menu->average_rating ?? 0,
                'totalOrders' => $totalOrders,
                'lastOrdered' => $lastOrder ? $lastOrder->created_at->toDateString() : null,
                'description' => $menu->description,
                'isAvailable' => $menu->is_available,
                'cookingTime' => $menu->cooking_time ?? '15-20 menit',
                'favoriteId' => $favorite->id,
                'addedToFavoriteAt' => $favorite->created_at,
            ];
        });

        // Get categories untuk filter
        $categories = $user->favoriteMenus()
            ->with('menu.category')
            ->get()
            ->pluck('menu.category.name')
            ->unique()
            ->values();

        // Statistics
        $stats = [
            'totalFavorites' => $user->favoriteMenus()->count(),
            'availableFavorites' => $user->favoriteMenus()
                ->whereHas('menu', function($q) {
                    $q->where('is_available', true);
                })
                ->count(),
            'totalOrdersFromFavorites' => $user->orders()
                ->whereHas('orderItems.menu.favoriteUsers', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->where('status', 'completed')
                ->count(),
            'averageRating' => $user->favoriteMenus()
                ->with('menu')
                ->get()
                ->avg('menu.average_rating') ?? 0,
        ];

        return Inertia::render('menuFavorit', [
            'favorites' => $favorites, 
            'categories' => $categories,
            'stats' => $stats,
            'filters' => [
                'category' => $request->category ?? 'all',
                'search' => $request->search ?? '',
            ]
        ]);
    }

    /**
     * Add menu to favorites
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => 'required|exists:menus,id'
        ]);

        $user = auth()->user();
        $menuId = $validated['menu_id'];

        // Cek apakah sudah ada di favorit
        if ($user->favoriteMenus()->where('menu_id', $menuId)->exists()) {
            return back()->with('error', 'Menu sudah ada di favorit!');
        }

        // Tambah ke favorit
        $user->favoriteMenus()->create([
            'menu_id' => $menuId
        ]);

        return back()->with('success', 'Menu berhasil ditambahkan ke favorit!');
    }

    /**
     * Remove menu from favorites
     */
    public function destroy($id)
    {
        $user = auth()->user();
        $favorite = $user->favoriteMenus()->findOrFail($id);
        
        $favorite->delete();

        return back()->with('success', 'Menu berhasil dihapus dari favorit!');
    }

    /**
     * Toggle favorite status
     */
    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => 'required|exists:menus,id'
        ]);

        $user = auth()->user();
        $menuId = $validated['menu_id'];

        $favorite = $user->favoriteMenus()->where('menu_id', $menuId)->first();

        if ($favorite) {
            // Remove from favorites
            $favorite->delete();
            $message = 'Menu dihapus dari favorit';
            $isFavorite = false;
        } else {
            // Add to favorites
            $user->favoriteMenus()->create(['menu_id' => $menuId]);
            $message = 'Menu ditambahkan ke favorit';
            $isFavorite = true;
        }

        return response()->json([
            'message' => $message,
            'is_favorite' => $isFavorite
        ]);
    }

    /**
     * Add favorite menu to cart
     */
    public function addToCart(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => 'required|exists:menus,id',
            'quantity' => 'required|integer|min:1|max:10'
        ]);

        $user = auth()->user();
        $menu = Menu::findOrFail($validated['menu_id']);

        // Cek ketersediaan menu
        if (!$menu->is_available) {
            return back()->with('error', 'Menu tidak tersedia saat ini.');
        }

        // Cek apakah menu ada di favorit user
        if (!$user->favoriteMenus()->where('menu_id', $menu->id)->exists()) {
            return back()->with('error', 'Menu tidak ada di favorit Anda.');
        }

        // Add to cart logic
        // Implementasi sesuai dengan sistem cart yang Anda gunakan
        // Contoh: session-based cart atau database cart
        
        $cart = session()->get('cart', []);
        $cartKey = 'menu_' . $menu->id;

        if (isset($cart[$cartKey])) {
            $cart[$cartKey]['quantity'] += $validated['quantity'];
        } else {
            $cart[$cartKey] = [
                'menu_id' => $menu->id,
                'name' => $menu->name,
                'price' => $menu->price,
                'quantity' => $validated['quantity'],
                'image' => $menu->image_url,
            ];
        }

        session()->put('cart', $cart);

        return back()->with('success', 'Menu berhasil ditambahkan ke keranjang!');
    }
}