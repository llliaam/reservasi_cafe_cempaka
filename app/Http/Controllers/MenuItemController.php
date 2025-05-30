<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\MenuCategory;
use App\Models\UserReview;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    /**
     * Search menu items (web-based for AJAX search)
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $category = $request->get('category');
        
        $menuItemsQuery = MenuItem::with('category')
                                ->where('is_available', true);

        if (!empty($query)) {
            $menuItemsQuery->where(function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%");
            });
        }

        if (!empty($category) && $category !== 'All Menu') {
            $menuItemsQuery->whereHas('category', function($q) use ($category) {
                $q->where('name', $category);
            });
        }

        $menuItems = $menuItemsQuery->orderBy('sort_order')
                                   ->orderBy('name')
                                   ->get();

        $transformedItems = $menuItems->map(function ($item) {
            $reviewStats = UserReview::where('menu_item_id', $item->id)
                                   ->where('is_verified', true)
                                   ->selectRaw('
                                       COUNT(*) as review_count,
                                       AVG(rating) as average_rating
                                   ')
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

        // Return as Inertia props for seamless navigation
        return Inertia::render('MenuSearch', [
            'searchResults' => $transformedItems,
            'searchQuery' => $query,
            'selectedCategory' => $category
        ]);
    }

    /**
     * Show menu by category
     */
    public function byCategory(MenuCategory $category)
    {
        $menuItems = MenuItem::with('category')
                           ->where('category_id', $category->id)
                           ->where('is_available', true)
                           ->orderBy('sort_order')
                           ->orderBy('name')
                           ->get();

        $transformedItems = $menuItems->map(function ($item) {
            $reviewStats = UserReview::where('menu_item_id', $item->id)
                                   ->where('is_verified', true)
                                   ->selectRaw('
                                       COUNT(*) as review_count,
                                       AVG(rating) as average_rating
                                   ')
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

        return Inertia::render('MenuCategory', [
            'menuItems' => $transformedItems,
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description
            ]
        ]);
    }

    /**
     * Show single menu item details
     */
    public function show(MenuItem $menuItem)
    {
        $menuItem->load('category');
        
        // Get review statistics
        $reviewStats = UserReview::where('menu_item_id', $menuItem->id)
                               ->where('is_verified', true)
                               ->selectRaw('
                                   COUNT(*) as review_count,
                                   AVG(rating) as average_rating
                               ')
                               ->first();

        // Get recent reviews
        $recentReviews = UserReview::with(['user'])
                                 ->where('menu_item_id', $menuItem->id)
                                 ->where('is_verified', true)
                                 ->latest('reviewed_at')
                                 ->take(5)
                                 ->get();

        return Inertia::render('MenuItem/Show', [
            'menuItem' => [
                'id' => $menuItem->id,
                'name' => $menuItem->name,
                'slug' => $menuItem->slug,
                'price' => $menuItem->price,
                'formatted_price' => $menuItem->formatted_price,
                'image' => $menuItem->image_url,
                'description' => $menuItem->description ?? '',
                'category' => $menuItem->category->name ?? 'Uncategorized',
                'category_slug' => $menuItem->category->slug ?? '',
                'rating' => round($reviewStats->average_rating ?? 4.5, 1),
                'review_count' => $reviewStats->review_count ?? 0,
                'isPopular' => $menuItem->is_featured ?? false,
                'is_available' => $menuItem->is_available,
            ],
            'recentReviews' => $recentReviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'reviewer_name' => $review->user->name,
                    'reviewed_at' => $review->reviewed_at->format('d M Y'),
                    'helpful_count' => $review->helpful_count,
                ];
            })
        ]);
    }
}