<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReservationController extends Controller
{
    /**
     * Display a listing of user's reservations
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Query reservations dengan filtering dan searching
        $query = $user->reservations()
            ->orderBy('reservation_date', 'desc')
            ->orderBy('reservation_time', 'desc');

        // Filter berdasarkan status jika ada
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search berdasarkan ID atau nama
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhere('guest_name', 'like', "%{$search}%")
                  ->orWhere('special_request', 'like', "%{$search}%");
            });
        }

        $reservations = $query->paginate(10);

        // Transform data untuk frontend
        $reservations->getCollection()->transform(function ($reservation) {
            return [
                'id' => 'RSV-' . str_pad($reservation->id, 7, '0', STR_PAD_LEFT),
                'date' => $reservation->reservation_date,
                'time' => $reservation->reservation_time,
                'guests' => $reservation->guest_count,
                'table' => $reservation->table ? $reservation->table->name : 'Akan ditentukan',
                'name' => $reservation->guest_name,
                'phone' => $reservation->guest_phone,
                'status' => $reservation->status,
                'specialRequest' => $reservation->special_request,
                'createdAt' => $reservation->created_at->toDateString(),
                'notes' => $reservation->notes,
            ];
        });

        // Statistics
        $stats = [
            'total' => $user->reservations()->count(),
            'confirmed' => $user->reservations()->where('status', 'confirmed')->count(),
            'completed' => $user->reservations()->where('status', 'completed')->count(),
            'cancelled' => $user->reservations()->where('status', 'cancelled')->count(),
            'totalGuests' => $user->reservations()->sum('guest_count'),
        ];

        return Inertia::render('riwayatReservasi', [
            'reservations' => $reservations,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
            ]
        ]);
    }

    /**
     * Show the form for creating a new reservation
     */
    public function create()
    {
        return Inertia::render('Reservation/Create');
    }

    /**
     * Store a newly created reservation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reservation_date' => 'required|date|after:today',
            'reservation_time' => 'required|string',
            'guest_count' => 'required|integer|min:1|max:20',
            'guest_name' => 'required|string|max:255',
            'guest_phone' => 'required|string|max:20',
            'special_request' => 'nullable|string|max:500',
        ]);

        $reservation = auth()->user()->reservations()->create([
            ...$validated,
            'status' => 'pending',
        ]);

        return redirect()->route('riwayat-reservasi')->with('success', 'Reservasi berhasil dibuat!');
    }

    /**
     * Display the specified reservation
     */
    public function show($id)
    {
        $reservation = auth()->user()->reservations()->findOrFail($id);

        return Inertia::render('Reservation/Show', [
            'reservation' => [
                'id' => 'RSV-' . str_pad($reservation->id, 7, '0', STR_PAD_LEFT),
                'date' => $reservation->reservation_date,
                'time' => $reservation->reservation_time,
                'guests' => $reservation->guest_count,
                'table' => $reservation->table ? $reservation->table->name : 'Akan ditentukan',
                'name' => $reservation->guest_name,
                'phone' => $reservation->guest_phone,
                'status' => $reservation->status,
                'specialRequest' => $reservation->special_request,
                'createdAt' => $reservation->created_at,
                'notes' => $reservation->notes,
            ]
        ]);
    }

    /**
     * Update the specified reservation
     */
    public function update(Request $request, $id)
    {
        $reservation = auth()->user()->reservations()->findOrFail($id);

        // Hanya bisa edit jika status masih pending atau confirmed
        if (!in_array($reservation->status, ['pending', 'confirmed'])) {
            return back()->with('error', 'Reservasi tidak dapat diubah.');
        }

        $validated = $request->validate([
            'reservation_date' => 'required|date|after:today',
            'reservation_time' => 'required|string',
            'guest_count' => 'required|integer|min:1|max:20',
            'guest_name' => 'required|string|max:255',
            'guest_phone' => 'required|string|max:20',
            'special_request' => 'nullable|string|max:500',
        ]);

        $reservation->update($validated);

        return back()->with('success', 'Reservasi berhasil diperbarui!');
    }

    /**
     * Cancel the specified reservation
     */
    public function cancel($id)
    {
        $reservation = auth()->user()->reservations()->findOrFail($id);

        // Hanya bisa cancel jika status masih pending atau confirmed
        if (!in_array($reservation->status, ['pending', 'confirmed'])) {
            return back()->with('error', 'Reservasi tidak dapat dibatalkan.');
        }

        // Cek apakah reservasi masih bisa dibatalkan (minimal 2 jam sebelum waktu reservasi)
        $reservationDateTime = Carbon::parse($reservation->reservation_date . ' ' . $reservation->reservation_time);
        if ($reservationDateTime->diffInHours(now()) < 2) {
            return back()->with('error', 'Reservasi hanya dapat dibatalkan minimal 2 jam sebelum waktu reservasi.');
        }

        $reservation->update(['status' => 'cancelled']);

        return back()->with('success', 'Reservasi berhasil dibatalkan.');
    }
}