import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    Package, 
    Calendar, 
    Star, 
    Heart,
    TrendingUp,
    Clock,
    MapPin,
    ChevronRight,
    ShoppingBag,
    CreditCard
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Sample data untuk overview - ganti dengan data real dari props
const dashboardData = {
    totalOrders: 12,
    totalReservations: 4,
    favoriteMenus: 6,
    totalReviews: 8,
    totalSpent: 450000,
    averageRating: 4.7,
    recentOrders: [
        {
            id: 'ORD-2025-001',
            date: '2025-05-24',
            items: ['Nasi Goreng Special', 'Es Teh Manis'],
            total: 53000,
            status: 'completed'
        },
        {
            id: 'ORD-2025-002', 
            date: '2025-05-22',
            items: ['Mie Ayam Bakso'],
            total: 25000,
            status: 'completed'
        }
    ],
    upcomingReservations: [
        {
            id: 'RSV-2025-001',
            date: '2025-05-28',
            time: '19:00',
            guests: 4,
            table: 'Meja 12'
        }
    ],
    favoriteMenusData: [
        {
            name: 'Nasi Goreng Special',
            orders: 5,
            rating: 4.8
        },
        {
            name: 'Ayam Bakar',
            orders: 3, 
            rating: 4.7
        }
    ]
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
    });
};

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Customer" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 text-white">
                    <h1 className="text-2xl font-bold mb-2">Selamat Datang di Cemapaka Cafe!</h1>
                    <p className="text-orange-100">Nikmati pengalaman kuliner terbaik bersama kami</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData.totalOrders}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pesanan</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData.totalReservations}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Reservasi</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center">
                                <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData.favoriteMenus}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Menu Favorit</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData.averageRating}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Pesanan Terbaru
                                </h3>
                                <Link 
                                    href="/riwayat-pemesanan"
                                    className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                                >
                                    Lihat Semua
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            {dashboardData.recentOrders.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Belum ada pesanan</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {dashboardData.recentOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {order.id}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {order.items.join(', ')}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDate(order.date)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {formatCurrency(order.total)}
                                                </p>
                                                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                                                    Selesai
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Reservations */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Reservasi Mendatang
                                </h3>
                                <Link 
                                    href="/riwayat-reservasi"
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                >
                                    Lihat Semua
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            {dashboardData.upcomingReservations.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Tidak ada reservasi mendatang</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {dashboardData.upcomingReservations.map((reservation) => (
                                        <div key={reservation.id} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {reservation.id}
                                                </p>
                                                <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400 px-2 py-1 rounded-full">
                                                    Dikonfirmasi
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(reservation.date)}
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <Clock className="w-4 h-4" />
                                                    {reservation.time}
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                    <MapPin className="w-4 h-4" />
                                                    {reservation.table}
                                                </div>
                                                <div className="text-gray-600 dark:text-gray-400">
                                                    {reservation.guests} orang
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Spending Summary */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Ringkasan Pengeluaran
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(dashboardData.totalSpent)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Total pengeluaran bulan ini
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Favorite Menus */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Menu Favorit
                                </h3>
                                <Link 
                                    href="/menu-favorit"
                                    className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                                >
                                    Lihat Semua
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            {dashboardData.favoriteMenusData.length === 0 ? (
                                <div className="text-center py-8">
                                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Belum ada menu favorit</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {dashboardData.favoriteMenusData.map((menu, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Heart className="w-5 h-5 text-pink-500 fill-current" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {menu.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {menu.orders}x dipesan
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {menu.rating}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}