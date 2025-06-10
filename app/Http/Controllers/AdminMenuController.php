<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\MenuCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminMenuController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:menu_categories,id',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:2048'
        ]);

        $imageFilename = null;
        if ($request->hasFile('image')) {
            $imageFilename = MenuItem::saveMenuImage($request->file('image'), $request->name);
        }

        MenuItem::create([
            'name' => $request->name,
            'category_id' => $request->category_id,
            'price' => $request->price,
            'description' => $request->description,
            'image' => $imageFilename,
            'is_available' => true,
            'is_featured' => false,
            'sort_order' => 0
        ]);

        return redirect()->back()->with('success', 'Menu berhasil ditambahkan!');
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:menu_categories,id',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:2048'
        ]);

        $imageFilename = $menuItem->image;
        
        if ($request->hasFile('image')) {
            // Delete old image
            $menuItem->deleteImage();
            // Save new image
            $imageFilename = MenuItem::saveMenuImage($request->file('image'), $request->name);
        }

        $menuItem->update([
            'name' => $request->name,
            'category_id' => $request->category_id,
            'price' => $request->price,
            'description' => $request->description,
            'image' => $imageFilename
        ]);

        return redirect()->back()->with('success', 'Menu berhasil diupdate!');
    }

    public function destroy(MenuItem $menuItem)
    {
        $menuItem->deleteImage();
        $menuItem->delete();

        return redirect()->back()->with('success', 'Menu berhasil dihapus!');
    }
}