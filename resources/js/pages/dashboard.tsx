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

// Interface untuk props dari DashboardController
interface DashboardProps {
    stats: {
        totalOrders: number;
        totalReservations: number;
        favoriteMenus: number;
        totalReviews: number;
        totalSpent: number;
        averageRating: number;
        completedOrders: number;
        confirmedReservations: number;
    };
    recentOrders: Array<{
        id: number;
        order_code: string;
        date: string;
        items: string[];
        total: number;
        status: string;
        itemCount: number;
    }>;
    upcomingReservations: Array<{
        id: number;
        reservation_code: string;
        date: string;
        time: string;
        guests: number;
        table: string;
        status: string;
    }>;
    favoriteMenus: Array<{
        id: number;
        name: string;
        orders: number;
        rating: number;
        price: number;
        image: string;
        category: string;
    }>;
    activityTimeline: Array<{
        type: string;
        title: string;
        description: string;
        date: string;
        icon: string;
        color: string;
    }>;
    overview: {
        thisMonth: {
            orders: number;
            spent: number;
            reservations: number;
        };
        lastMonth: {
            orders: number;
            spent: number;
        };
        growth: {
            orders: number;
            spent: number;
        };
    };
    user: {
        name: string;
        email: string;
        loyalty_points: number;
        total_spent: number;
        completed_orders_count: number;
    };
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const getStatusColor = (status: string) => {
    const colors = {
        'completed': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        'confirmed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        'preparing': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
        'ready': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
        'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
};

const getStatusLabel = (status: string) => {
    const labels = {
        'completed': 'Selesai',
        'pending': 'Menunggu',
        'confirmed': 'Dikonfirmasi',
        'preparing': 'Sedang Disiapkan',
        'ready': 'Siap',
        'cancelled': 'Dibatalkan',
    };
    return labels[status as keyof typeof labels] || status;
};

const getActivityIcon = (iconName: string) => {
    const icons = {
        'shopping-bag': ShoppingBag,
        'calendar': Calendar,
        'star': Star,
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Package;
    return <IconComponent className="w-4 h-4" />;
};

const getActivityColor = (color: string) => {
    const colors = {
        'green': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        'blue': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        'purple': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
        'yellow': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
};

export default function Dashboard({ 
    stats, 
    recentOrders, 
    upcomingReservations, 
    favoriteMenus,
    activityTimeline,
    overview,
    user 
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Customer" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 text-white">
                    <h1 className="text-2xl font-bold mb-2">Selamat Datang, {user.name}!</h1>
                    <p className="text-orange-100">Nikmati pengalaman kuliner terbaik bersama kami di Cempaka Cafe</p>
                    <div className="flex items-center gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            <span>{user.loyalty_points} Poin Loyalitas</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            <span>{user.completed_orders_count} Pesanan Selesai</span>
                        </div>
                    </div>
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
                                    {stats.totalOrders}
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
                                    {stats.totalReservations}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Reservasi</p>
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
                                    {stats.averageRating}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(stats.totalSpent)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Belanja</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* This Month Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ringkasan Bulan Ini</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {overview.thisMonth.orders}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Pesanan Bulan Ini</div>
                            {overview.growth.orders !== 0 && (
                                <div className={`text-xs mt-1 ${overview.growth.orders > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {overview.growth.orders > 0 ? '+' : ''}{overview.growth.orders.toFixed(1)}% dari bulan lalu
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(overview.thisMonth.spent)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Belanja Bulan Ini</div>
                            {overview.growth.spent !== 0 && (
                                <div className={`text-xs mt-1 ${overview.growth.spent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {overview.growth.spent > 0 ? '+' : ''}{overview.growth.spent.toFixed(1)}% dari bulan lalu
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {overview.thisMonth.reservations}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Reservasi Bulan Ini</div>
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
                                    href={route('orders.history')}
                                    className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                                >
                                    Lihat Semua
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            {recentOrders.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Belum ada pesanan</p>
                                    <Link 
                                        href={route('orders.index')}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-300 rounded-lg transition-colors mt-4"
                                    >
                                        <Package className="w-4 h-4" />
                                        Buat Pesanan
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {order.order_code}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {order.items.length > 0 ? order.items.slice(0, 2).join(', ') : 'Tidak ada item'}
                                                    {order.items.length > 2 && '...'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDate(order.date)} • {order.itemCount} item
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {formatCurrency(order.total)}
                                                </p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                                    {getStatusLabel(order.status)}
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
                                    href={route('reservations.index')}
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                >
                                    Lihat Semua
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            {upcomingReservations.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Tidak ada reservasi mendatang</p>
                                    <Link 
                                        href={route('reservations.create')}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 border border-purple-200 hover:border-purple-300 rounded-lg transition-colors mt-4"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Buat Reservasi
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingReservations.map((reservation) => (
                                        <div key={reservation.id} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {reservation.reservation_code}
                                                </p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(reservation.status)}`}>
                                                    {getStatusLabel(reservation.status)}
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

                {/* Activity Timeline & Favorite Menus */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Activity Timeline */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Aktivitas Terbaru
                            </h3>
                        </div>
                        <div className="p-6">
                            {activityTimeline.length === 0 ? (
                                <div className="text-center py-8">
                                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Belum ada aktivitas</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activityTimeline.slice(0, 5).map((activity, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.color)}`}>
                                                {getActivityIcon(activity.icon)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {activity.title}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {activity.description}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {formatDate(activity.date)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Favorite Menus Preview */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Menu Favorit
                                </h3>
                                <Link 
                                    href={route('favorites.index')}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                >
                                    Lihat Semua
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            {favoriteMenus.length === 0 ? (
                                <div className="text-center py-8">
                                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Belum ada menu favorit</p>
                                    <Link 
                                        href={route('orders.index')}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-colors mt-4"
                                    >
                                        <Heart className="w-4 h-4" />
                                        Jelajahi Menu
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {favoriteMenus.map((menu) => (
                                        <div key={menu.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <img
                                                src={menu.image}
                                                alt={menu.name}
                                                className="w-12 h-12 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {menu.name}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {menu.category}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                                            {menu.rating}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        •
                                                    </span>
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                                        {menu.orders} pesanan
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                    {formatCurrency(menu.price)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Additional Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Completed Orders */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.completedOrders}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Pesanan Selesai
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Confirmed Reservations */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.confirmedReservations}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Reservasi Terkonfirmasi
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Total Reviews */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalReviews}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Total Review
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}