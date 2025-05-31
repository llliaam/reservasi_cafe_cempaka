<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Display the admin dashboard
     */
    public function index(): Response
    {
        return Inertia::render('admin/adminDashboard', [
            'user' => auth()->user(),
            'stats' => $this->getAdminStats(),
            'notifications' => $this->getAdminNotifications(),
            'recentActivity' => $this->getRecentActivity(),
        ]);
    }

    /**
     * Get admin statistics
     */
    private function getAdminStats(): array
    {
        // Mock data - replace with real data later
        return [
            'total_orders' => 150,
            'total_revenue' => 15750000,
            'total_customers' => 85,
            'total_staff' => 8,
            'pending_orders' => 12,
            'pending_reservations' => 5,
            'monthly_growth' => 15.5,
            'daily_revenue' => 850000,
            'popular_menu_items' => [
                ['name' => 'Nasi Goreng Special', 'orders' => 45],
                ['name' => 'Ayam Bakar', 'orders' => 38],
                ['name' => 'Mie Ayam', 'orders' => 32],
            ],
        ];
    }

    /**
     * Get admin notifications
     */
    private function getAdminNotifications(): array
    {
        // Mock data - replace with real data later
        return [
            [
                'id' => 1,
                'message' => 'Pesanan baru dari Budi Santoso',
                'type' => 'order',
                'time' => '5 menit lalu',
                'read' => false,
            ],
            [
                'id' => 2,
                'message' => 'Stok Kopi hampir habis',
                'type' => 'inventory',
                'time' => '30 menit lalu',
                'read' => false,
            ],
            [
                'id' => 3,
                'message' => 'Review baru dengan rating 5 bintang',
                'type' => 'review',
                'time' => '1 jam lalu',
                'read' => true,
            ],
            [
                'id' => 4,
                'message' => 'Reservasi untuk besok: 8 meja',
                'type' => 'reservation',
                'time' => '2 jam lalu',
                'read' => true,
            ],
        ];
    }

    /**
     * Get recent activity
     */
    private function getRecentActivity(): array
    {
        // Mock data - replace with real data later
        return [
            [
                'id' => 1,
                'user' => 'Siti Rahayu',
                'action' => 'membuat pesanan',
                'details' => 'Nasi Goreng Special + Es Teh Manis',
                'amount' => 35000,
                'time' => '10 menit lalu',
                'type' => 'order',
            ],
            [
                'id' => 2,
                'user' => 'Ahmad Fadli',
                'action' => 'membuat reservasi',
                'details' => 'Paket Ulang Tahun - 20 orang',
                'amount' => 500000,
                'time' => '25 menit lalu',
                'type' => 'reservation',
            ],
            [
                'id' => 3,
                'user' => 'Dewi Lestari',
                'action' => 'memberikan review',
                'details' => 'Rating 5 bintang untuk Ayam Bakar',
                'amount' => null,
                'time' => '45 menit lalu',
                'type' => 'review',
            ],
            [
                'id' => 4,
                'user' => 'Budi Santoso',
                'action' => 'menyelesaikan pembayaran',
                'details' => 'Order #ORD-001',
                'amount' => 55000,
                'time' => '1 jam lalu',
                'type' => 'payment',
            ],
        ];
    }
}