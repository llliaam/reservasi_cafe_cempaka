<?php

namespace App\Http\Controllers;

use App\Models\FavoriteMenu;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FavoriteMenuController extends Controller
{
    /**
     * Display user's favorite menus
     */
    public function index()
    {
        $user = Auth::user();

        $favorites = FavoriteMenu::with(['menuItem.category'])
                                ->where('user_id', $user->id)
                                ->latest()
                                ->get();

        $transformedFavorites = $favorites->map(function ($favorite) {
            $menuItem = $favorite->menuItem;

            if (!$menuItem) {
                return null; // Skip deleted menu items
            }

            return [
                'id' => $menuItem->id,
                'name' => $menuItem->name,
                'price' => $menuItem->price,
                'formatted_price' => $menuItem->formatted_price,
                'image' => $menuItem->image_url,
                'description' => $menuItem->description ?? '',
                'category' => $menuItem->category->name ?? 'Uncategorized',
                'is_available' => $menuItem->is_available,
                'is_featured' => $menuItem->is_featured,
                'favorited_at' => $favorite->created_at->format('Y-m-d H:i:s')
            ];
        })->filter(); // Remove null values

        // Calculate statistics
        $stats = [
            'total_favorites' => $transformedFavorites->count(),
            'available_favorites' => $transformedFavorites->where('is_available', true)->count(),
            'categories' => $transformedFavorites->pluck('category')->unique()->values(),
            'total_value' => $transformedFavorites->sum('price')
        ];

        return Inertia::render('menuFavorite', [
            'favorites' => $transformedFavorites,
            'stats' => $stats
        ]);
    }

    /**
     * Toggle favorite status for a menu item
     */
    public function toggle(MenuItem $menuItem)
    {
        $user = Auth::user();

        $favorite = FavoriteMenu::where('user_id', $user->id)
                              ->where('menu_item_id', $menuItem->id)
                              ->first();

        if ($favorite) {
            // Remove from favorites
            $favorite->delete();
            $message = "'{$menuItem->name}' dihapus dari favorit";
        } else {
            // Add to favorites
            FavoriteMenu::create([
                'user_id' => $user->id,
                'menu_item_id' => $menuItem->id
            ]);
            $message = "'{$menuItem->name}' ditambahkan ke favorit";
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Remove specific item from favorites
     */
    public function remove(MenuItem $menuItem)
    {
        $user = Auth::user();

        $deleted = FavoriteMenu::where('user_id', $user->id)
                             ->where('menu_item_id', $menuItem->id)
                             ->delete();

        if ($deleted) {
            return redirect()->back()->with('success', "'{$menuItem->name}' dihapus dari favorit");
        } else {
            return redirect()->back()->withErrors(['favorite' => 'Menu tidak ditemukan dalam favorit']);
        }
    }

    /**
     * Clear all user favorites
     */
    public function clear()
    {
        $user = Auth::user();

        $deletedCount = FavoriteMenu::where('user_id', $user->id)->delete();

        return redirect()->back()->with('success', "Berhasil menghapus {$deletedCount} item dari favorit");
    }
}
