<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReservationPackage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminReservationPackageController extends Controller
{

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|string|max:50',
            'max_people' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'includes' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $data = $request->only(['name', 'price', 'duration', 'max_people', 'description']);
        
        // Convert includes to array
        $data['includes'] = $request->includes ? array_map('trim', explode(',', $request->includes)) : [];
        
        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('images/paket_reservasi'), $imageName);
            $data['image'] = $imageName;
        }

        $data['is_active'] = true; // default active

        ReservationPackage::create($data);

        return redirect()->back()->with('success', 'Paket reservasi berhasil ditambahkan!');
    }

    public function update(Request $request, $id)
    {
        $package = ReservationPackage::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|string|max:50',
            'max_people' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'includes' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $data = $request->only(['name', 'price', 'duration', 'max_people', 'description']);
        
        // Convert includes to array
        $data['includes'] = $request->includes ? array_map('trim', explode(',', $request->includes)) : [];
        
        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($package->image && file_exists(public_path('images/paket_reservasi/' . $package->image))) {
                unlink(public_path('images/paket_reservasi/' . $package->image));
            }
            
            $image = $request->file('image');
            $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('images/paket_reservasi'), $imageName);
            $data['image'] = $imageName;
        }

        $package->update($data);

        return redirect()->back()->with('success', 'Paket reservasi berhasil diupdate!');
    }

    public function destroy($id)
    {
        $package = ReservationPackage::findOrFail($id);
        
        if (!$package->canBeDeleted()) {
            return redirect()->back()->with('error', 'Paket tidak dapat dihapus karena sudah ada reservasi!');
        }
        
        // Delete image if exists
        if ($package->image && file_exists(public_path('images/paket_reservasi/' . $package->image))) {
            unlink(public_path('images/paket_reservasi/' . $package->image));
        }
        
        $package->delete();

        return redirect()->back()->with('success', 'Paket reservasi berhasil dihapus!');
    }

    public function toggleStatus($id)
    {
        $package = ReservationPackage::findOrFail($id);
        $package->update(['is_active' => !$package->is_active]);

        return redirect()->back()->with('success', 'Status paket berhasil diupdate!');
    }
}