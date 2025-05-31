<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    /**
     * Display the staff main page
     */
    public function index(): Response
    {
        return Inertia::render('staff/staffPage', [
            'user' => auth()->user(),
            'notifications' => $this->getStaffNotifications(),
        ]);
    }

    /**
     * Display staff dashboard content
     */
    public function dashboard(): Response
    {
        return Inertia::render('staff/staffDashboard', [
            'user' => auth()->user(),
            'stats' => $this->getStaffStats(),
        ]);
    }

    /**
     * Get notifications for staff
     */
    private function getStaffNotifications(): array
    {
        // Mock data - replace with real data later
        return [
            [
                'id' => 1,
                'message' => 'Pesanan baru masuk',
                'type' => 'order',
                'time' => '5 menit lalu',
                'read' => false,
            ],
            [
                'id' => 2,
                'message' => 'Reservasi untuk hari ini: 3 meja',
                'type' => 'reservation',
                'time' => '30 menit lalu',
                'read' => false,
            ],
        ];
    }

    /**
     * Get basic stats for staff
     */
    private function getStaffStats(): array
    {
        // Mock data - replace with real data later
        return [
            'pending_orders' => 5,
            'todays_reservations' => 3,
            'completed_orders_today' => 12,
            'total_revenue_today' => 850000,
        ];
    }
}