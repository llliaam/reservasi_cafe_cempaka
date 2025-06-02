<?php

namespace App\Http\Controllers;

use App\Models\RestaurantTable;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class RestaurantTableController extends Controller
{
    /**
     * Get all tables with their current status
     */
    public function index(Request $request): JsonResponse
    {
        $query = RestaurantTable::query()->with(['currentReservation', 'currentOrder']);

        // Filter by location type if provided
        if ($request->has('location_type')) {
            $query->where('location_type', $request->location_type);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by capacity if provided
        if ($request->has('min_capacity')) {
            $query->where('capacity', '>=', $request->min_capacity);
        }

        $tables = $query->orderBy('table_number')->get();

        return response()->json([
            'success' => true,
            'data' => $tables->map(function ($table) {
                return $table->getSummary();
            })
        ]);
    }

    /**
     * Get available tables for specific criteria
     */
    public function getAvailableTables(Request $request): JsonResponse
    {
        $request->validate([
            'location_type' => 'required|in:indoor,outdoor',
            'required_capacity' => 'required|integer|min:1',
            'date' => 'required|date',
            'time' => 'required|date_format:H:i'
        ]);

        $date = Carbon::parse($request->date);
        $time = $request->time;

        $availableTables = RestaurantTable::availableForReservation(
            $request->location_type,
            $request->required_capacity,
            $date,
            $time
        )->get();

        return response()->json([
            'success' => true,
            'data' => $availableTables->map(function ($table) {
                return $table->getSummary();
            })
        ]);
    }

    /**
     * Update table status
     */
    public function updateStatus(Request $request, RestaurantTable $table): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:available,occupied,reserved,maintenance'
        ]);

        $table->updateStatus($request->status);

        return response()->json([
            'success' => true,
            'message' => "Status meja {$table->meja_name} berhasil diubah ke {$table->status_label}",
            'data' => $table->getSummary()
        ]);
    }

    /**
     * Assign table to reservation
     */
    public function assignToReservation(Request $request, RestaurantTable $table): JsonResponse
    {
        $request->validate([
            'reservation_id' => 'required|exists:reservations,id'
        ]);

        $reservation = Reservation::with('package')->findOrFail($request->reservation_id);

        // Check if table can accommodate the reservation
        if (!$table->canAccommodate($reservation->package->max_people)) {
            return response()->json([
                'success' => false,
                'message' => "Meja {$table->meja_name} tidak dapat menampung {$reservation->package->max_people} orang (kapasitas: {$table->capacity})"
            ], 400);
        }

        // Assign table to reservation
        $success = $reservation->assignTable($table);

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => "Meja {$table->meja_name} berhasil ditetapkan untuk reservasi {$reservation->reservation_code}",
                'data' => [
                    'table' => $table->getSummary(),
                    'reservation' => $reservation->getSummary()
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Gagal menetapkan meja ke reservasi'
        ], 400);
    }

    /**
     * Get table details with reservations and orders
     */
    public function show(RestaurantTable $table): JsonResponse
    {
        $table->load([
            'todayReservations',
            'currentReservation',
            'currentOrder.orderItems.menuItem'
        ]);

        $summary = $table->getSummary();
        $summary['today_reservations'] = $table->todayReservations->map(function ($reservation) {
            return $reservation->getSummary();
        });
        $summary['current_order'] = $table->currentOrder?->getSummary();

        return response()->json([
            'success' => true,
            'data' => $summary
        ]);
    }

    /**
     * Create new table
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'table_number' => 'required|integer|unique:restaurant_tables,table_number',
            'capacity' => 'required|integer|min:1|max:20',
            'location_type' => 'required|in:indoor,outdoor',
            'location_detail' => 'nullable|string|max:255'
        ]);

        $table = RestaurantTable::create($request->all());

        return response()->json([
            'success' => true,
            'message' => "Meja {$table->meja_name} berhasil ditambahkan",
            'data' => $table->getSummary()
        ], 201);
    }

    /**
     * Update table details
     */
    public function update(Request $request, RestaurantTable $table): JsonResponse
    {
        $request->validate([
            'capacity' => 'sometimes|integer|min:1|max:20',
            'location_type' => 'sometimes|in:indoor,outdoor',
            'location_detail' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean'
        ]);

        $table->update($request->only([
            'capacity', 'location_type', 'location_detail', 'is_active'
        ]));

        return response()->json([
            'success' => true,
            'message' => "Meja {$table->meja_name} berhasil diperbarui",
            'data' => $table->getSummary()
        ]);
    }

    /**
     * Delete table (only if no reservations/orders)
     */
    public function destroy(RestaurantTable $table): JsonResponse
    {
        if (!$table->canBeDeleted()) {
            return response()->json([
                'success' => false,
                'message' => "Meja {$table->meja_name} tidak dapat dihapus karena masih memiliki reservasi atau pesanan"
            ], 400);
        }

        $tableName = $table->meja_name;
        $table->delete();

        return response()->json([
            'success' => true,
            'message' => "Meja {$tableName} berhasil dihapus"
        ]);
    }

    /**
     * Get table statistics
     */
    public function getStatistics(): JsonResponse
    {
        $stats = [
            'total_tables' => RestaurantTable::count(),
            'active_tables' => RestaurantTable::where('is_active', true)->count(),
            'available_tables' => RestaurantTable::where('status', RestaurantTable::STATUS_AVAILABLE)->count(),
            'occupied_tables' => RestaurantTable::where('status', RestaurantTable::STATUS_OCCUPIED)->count(),
            'reserved_tables' => RestaurantTable::where('status', RestaurantTable::STATUS_RESERVED)->count(),
            'maintenance_tables' => RestaurantTable::where('status', RestaurantTable::STATUS_MAINTENANCE)->count(),
            'indoor_tables' => RestaurantTable::where('location_type', 'indoor')->count(),
            'outdoor_tables' => RestaurantTable::where('location_type', 'outdoor')->count(),
            'total_capacity' => RestaurantTable::sum('capacity'),
            'average_capacity' => round(RestaurantTable::avg('capacity'), 1),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}