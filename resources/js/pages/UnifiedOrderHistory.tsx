import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    Users,
    MapPin,
    Phone,
    Eye,
    Edit,
    X,
    CheckCircle,
    AlertCircle,
    Search,
    Filter,
    Mail,
    CreditCard,
    Package,
    Star,
    Download,
    Coffee,
    History,
    Home,
    ArrowLeft
} from 'lucide-react';
import { useState } from 'react';

// Interfaces (same as before)
interface MenuItem {
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
}

interface OrderItem {
    id: number;
    menu_item_id: number;
    menu_name: string;
    quantity: number;
    price: number;
    subtotal: number;
    special_instructions?: string;
}

interface Reservation {
    id: string;
    date: string;
    time: string;
    guests: number;
    table: string;
    name: string;
    phone: string;
    email: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    specialRequest?: string;
    createdAt: string;
    packageName?: string;
    packagePrice?: number;
    menuSubtotal?: number;
    totalPrice?: number;
    paymentMethod?: string;
    paymentMethodLabel?: string;
    menuItems?: MenuItem[];
    proofOfPaymentUrl?: string;
    additionalImageUrls?: string[];
    type: 'reservation';
}

interface Order {
    id: number;
    order_code: string;
    order_date: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    order_type: 'dine_in' | 'takeaway' | 'delivery';
    total_amount: number;
    items: OrderItem[];
    can_be_reviewed: boolean;
    has_review: boolean;
    review?: {
        id: number;
        rating: number;
        comment: string;
        reviewed_at: string;
        can_edit: boolean;
    };
    type: 'order';
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface ReservationStats {
    totalReservations: number;
    confirmedCount: number;
    completedCount: number;
    cancelledCount: number;
    pendingCount: number;
    totalGuests: number;
    averageGuests: number;
}

interface OrderStats {
    totalOrders: number;
    completedOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    dineInCount: number;
    takeawayCount: number;
    deliveryCount: number;
    reviewsGiven: number;
    canBeReviewed: number;
}

interface UnifiedHistoryProps {
    reservations: Reservation[];
    orders: PaginatedOrders;
    reservationStats: ReservationStats;
    orderStats: OrderStats;
    auth?: {
        user?: any;
    };
}

type CombinedItem = (Reservation | Order) & {
    unified_date: string;
    unified_time: string;
    unified_status: string;
    unified_type: 'reservation' | 'order';
    unified_code: string;
    unified_total: number;
};

// Helper functions (same as before)
const getStatusColor = (status: string) => {
    switch (status) {
        case 'confirmed':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
        case 'completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
        case 'preparing':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
        case 'ready':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
};

const getStatusText = (status: string) => {
    switch (status) {
        case 'confirmed':
            return 'Dikonfirmasi';
        case 'completed':
            return 'Selesai';
        case 'cancelled':
            return 'Dibatalkan';
        case 'pending':
            return 'Menunggu';
        case 'preparing':
            return 'Sedang Disiapkan';
        case 'ready':
            return 'Siap Diambil';
        default:
            return status;
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'confirmed':
            return <CheckCircle className="w-4 h-4" />;
        case 'completed':
            return <CheckCircle className="w-4 h-4" />;
        case 'cancelled':
            return <X className="w-4 h-4" />;
        case 'pending':
            return <AlertCircle className="w-4 h-4" />;
        case 'preparing':
            return <Clock className="w-4 h-4" />;
        case 'ready':
            return <CheckCircle className="w-4 h-4" />;
        default:
            return <AlertCircle className="w-4 h-4" />;
    }
};

const getOrderTypeText = (type: string) => {
    switch (type) {
        case 'dine_in':
            return 'Dine In';
        case 'takeaway':
            return 'Take Away';
        case 'delivery':
            return 'Delivery';
        default:
            return type;
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function UnifiedOrderHistory({
    reservations = [],
    orders,
    reservationStats,
    orderStats,
    auth
}: UnifiedHistoryProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'reservations' | 'orders'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [cancellingIds, setCancellingIds] = useState(new Set<string>());
    const [localReservations, setLocalReservations] = useState(reservations);

    // Combine and normalize data
    const combineData = (): CombinedItem[] => {
        const combined: CombinedItem[] = [];

        // Add reservations
        localReservations.forEach((reservation) => {
            combined.push({
                ...reservation,
                unified_date: reservation.date,
                unified_time: reservation.time,
                unified_status: reservation.status,
                unified_type: 'reservation',
                unified_code: reservation.id,
                unified_total: reservation.totalPrice || 0,
            });
        });

        // Add orders
        orders.data.forEach((order) => {
            combined.push({
                ...order,
                unified_date: order.order_date,
                unified_time: formatTime(order.order_date),
                unified_status: order.status,
                unified_type: 'order',
                unified_code: order.order_code,
                unified_total: order.total_amount,
            });
        });

        // Sort by date (newest first)
        return combined.sort((a, b) =>
            new Date(b.unified_date).getTime() - new Date(a.unified_date).getTime()
        );
    };

    // Handle cancel reservation
    const handleCancelReservation = async (reservationId: string) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan reservasi ini?')) {
            return;
        }

        setCancellingIds(prev => new Set([...prev, reservationId]));

        try {
            router.delete(route('reservations.destroy', reservationId), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setLocalReservations(prev =>
                        prev.map(reservation =>
                            reservation.id === reservationId
                                ? { ...reservation, status: 'cancelled' as const }
                                : reservation
                        )
                    );
                },
                onError: (errors) => {
                    console.error('Cancel error:', errors);
                },
                onFinish: () => {
                    setCancellingIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(reservationId);
                        return newSet;
                    });
                }
            });
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            setCancellingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(reservationId);
                return newSet;
            });
        }
    };

    // Filter data
    const filteredData = combineData().filter(item => {
        const matchesTab = activeTab === 'all' ||
                          (activeTab === 'reservations' && item.unified_type === 'reservation') ||
                          (activeTab === 'orders' && item.unified_type === 'order');

        const matchesSearch = item.unified_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.unified_type === 'reservation' &&
                             (item as Reservation).name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (item.unified_type === 'reservation' &&
                             (item as Reservation).phone.includes(searchTerm));

        const matchesStatus = statusFilter === 'all' || item.unified_status === statusFilter;

        return matchesTab && matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Head title="Riwayat Pesanan & Reservasi" />

            {/* Header Navigation */}
            <div className="bg-white border-b border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left side - Back button and title */}
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('home')}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 transition-all rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Kembali ke Home
                            </Link>
                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                            <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Riwayat Aktivitas
                                </h1>
                            </div>
                        </div>

                        {/* Right side - User info and quick actions */}
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('reservations.create')}
                                className="items-center hidden gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-purple-600 rounded-lg sm:inline-flex hover:bg-purple-700 hover:scale-105"
                            >
                                <Calendar className="w-4 h-4" />
                                Buat Reservasi
                            </Link>
                            <Link
                                href={route('menu.index')}
                                className="items-center hidden gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-orange-600 rounded-lg sm:inline-flex hover:bg-orange-700 hover:scale-105"
                            >
                                <Package className="w-4 h-4" />
                                Pesan Menu
                            </Link>
                            {auth?.user && (
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Halo, {auth.user.name}
                                    </span>
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                                        <span className="text-sm font-medium text-white">
                                            {auth.user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8">
                    {/* Hero Section */}
                    <div className="relative p-8 overflow-hidden border bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-2xl border-gray-200/50 dark:border-gray-700/50">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
                                    <History className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Riwayat Aktivitas
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Kelola semua pesanan dan reservasi dalam satu tempat
                                    </p>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4 mt-6 md:grid-cols-4">
                                <div className="p-4 border bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border-white/20">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {reservationStats.totalReservations + orderStats.totalOrders}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Aktivitas</div>
                                </div>
                                <div className="p-4 border bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border-white/20">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(orderStats.totalSpent)}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Belanja</div>
                                </div>
                                <div className="p-4 border bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border-white/20">
                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {reservationStats.totalGuests}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Tamu</div>
                                </div>
                                <div className="p-4 border bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border-white/20">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {orderStats.reviewsGiven}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Review Diberikan</div>
                                </div>
                            </div>
                        </div>

                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 blur-3xl"></div>
                        </div>
                    </div>

                    {/* Detailed Stats Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Reservasi Stats */}
                        <div className="relative p-6 transition-all duration-300 border group bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 transition-transform bg-purple-500 rounded-xl group-hover:scale-110">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                        {reservationStats.totalReservations}
                                    </div>
                                    <div className="text-xs text-purple-600/70 dark:text-purple-400/70">
                                        {reservationStats.confirmedCount} aktif
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-purple-700 dark:text-purple-300">Total Reservasi</h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-purple-600/70 dark:text-purple-400/70">
                                    <span>✓ {reservationStats.completedCount} selesai</span>
                                    <span>⏳ {reservationStats.pendingCount} pending</span>
                                </div>
                            </div>
                        </div>

                        {/* Orders Stats */}
                        <div className="relative p-6 transition-all duration-300 border group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 transition-transform bg-blue-500 rounded-xl group-hover:scale-110">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                        {orderStats.totalOrders}
                                    </div>
                                    <div className="text-xs text-blue-600/70 dark:text-blue-400/70">
                                        {orderStats.completedOrders} selesai
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-blue-700 dark:text-blue-300">Total Pesanan</h3>
                                <div className="flex items-center gap-2 mt-2 text-sm text-blue-600/70 dark:text-blue-400/70">
                                    <span>🍽️ {orderStats.dineInCount}</span>
                                    <span>📦 {orderStats.takeawayCount}</span>
                                    <span>🚗 {orderStats.deliveryCount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Spending Stats */}
                        <div className="relative p-6 transition-all duration-300 border group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-green-200/50 dark:border-green-800/50 hover:shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 transition-transform bg-green-500 rounded-xl group-hover:scale-110">
                                    <CreditCard className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-green-900 dark:text-green-100">
                                        {formatCurrency(orderStats.totalSpent)}
                                    </div>
                                    <div className="text-xs text-green-600/70 dark:text-green-400/70">
                                        total belanja
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-green-700 dark:text-green-300">Total Pengeluaran</h3>
                                <div className="mt-2 text-sm text-green-600/70 dark:text-green-400/70">
                                    Rata-rata {formatCurrency(orderStats.avgOrderValue)}
                                </div>
                            </div>
                        </div>

                        {/* Guest Stats */}
                        <div className="relative p-6 transition-all duration-300 border group bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 rounded-xl border-orange-200/50 dark:border-orange-800/50 hover:shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 transition-transform bg-orange-500 rounded-xl group-hover:scale-110">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                        {reservationStats.totalGuests}
                                    </div>
                                    <div className="text-xs text-orange-600/70 dark:text-orange-400/70">
                                        total tamu
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-orange-700 dark:text-orange-300">Total Tamu</h3>
                                <div className="mt-2 text-sm text-orange-600/70 dark:text-orange-400/70">
                                    Rata-rata {reservationStats.averageGuests} orang/reservasi
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex-1 flex flex-col min-h-[60vh] shadow-sm">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Timeline Aktivitas
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Menampilkan {filteredData.length} aktivitas terbaru
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 sm:hidden">
                                    <Link
                                        href={route('reservations.create')}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-purple-600 rounded-lg hover:bg-purple-700 hover:scale-105"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Reservasi
                                    </Link>
                                    <Link
                                        href={route('menu.index')}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-orange-600 rounded-lg hover:bg-orange-700 hover:scale-105"
                                    >
                                        <Package className="w-4 h-4" />
                                        Pesan
                                    </Link>
                                </div>
                            </div>

                            {/* Enhanced Tabs */}
                            <div className="flex items-center gap-2 p-1 mt-6 bg-gray-100 dark:bg-gray-700 rounded-xl">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        activeTab === 'all'
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <History className="w-4 h-4" />
                                        <span className="hidden sm:inline">Semua</span> ({filteredData.length})
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('reservations')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        activeTab === 'reservations'
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="hidden sm:inline">Reservasi</span> ({reservationStats.totalReservations})
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        activeTab === 'orders'
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Package className="w-4 h-4" />
                                        <span className="hidden sm:inline">Pesanan</span> ({orderStats.totalOrders})
                                    </div>
                                </button>
                            </div>

                            {/* Search & Filter */}
                            <div className="flex flex-col gap-3 mt-6 sm:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Cari berdasarkan kode, nama, atau nomor telepon..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full py-3 pl-10 pr-4 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="confirmed">Dikonfirmasi</option>
                                        <option value="completed">Selesai</option>
                                        <option value="cancelled">Dibatalkan</option>
                                        <option value="pending">Menunggu</option>
                                        <option value="preparing">Sedang Disiapkan</option>
                                        <option value="ready">Siap Diambil</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Content List */}
                        <div className="flex-1 overflow-auto">
                            {filteredData.length === 0 ? (
                                <div className="py-16 text-center">
                                    <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                                        <Package className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <p className="mb-2 text-xl font-medium text-gray-500 dark:text-gray-400">
                                        {searchTerm || statusFilter !== 'all' ? 'Tidak ada data yang sesuai' : 'Belum ada aktivitas'}
                                    </p>
                                    <p className="mb-6 text-gray-400 dark:text-gray-500">
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'Coba ubah filter pencarian Anda'
                                            : 'Mulai dengan membuat reservasi atau memesan menu'
                                        }
                                    </p>
                                    {!searchTerm && statusFilter === 'all' && (
                                        <div className="flex items-center justify-center gap-4">
                                            <Link
                                                href={route('reservations.create')}
                                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all bg-purple-600 rounded-xl hover:bg-purple-700 hover:scale-105"
                                            >
                                                <Calendar className="w-4 h-4" />
                                                Buat Reservasi
                                            </Link>
                                            <Link
                                                href={route('menu.index')}
                                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all bg-orange-600 rounded-xl hover:bg-orange-700 hover:scale-105"
                                            >
                                                <Package className="w-4 h-4" />
                                                Pesan Menu
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredData.map((item) => (
                                        <div key={`${item.unified_type}-${item.unified_code}`} className="p-6 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    {/* Header with enhanced styling */}
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-xl ${
                                                                item.unified_type === 'reservation'
                                                                    ? 'bg-purple-100 dark:bg-purple-900/20'
                                                                    : 'bg-orange-100 dark:bg-orange-900/20'
                                                            }`}>
                                                                {item.unified_type === 'reservation' ? (
                                                                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                                ) : (
                                                                    <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                    {item.unified_code}
                                                                </h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.unified_status)}`}>
                                                                        {getStatusIcon(item.unified_status)}
                                                                        {getStatusText(item.unified_status)}
                                                                    </span>
                                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                                        item.unified_type === 'reservation'
                                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                                                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                                                    }`}>
                                                                        {item.unified_type === 'reservation' ? 'Reservasi' : 'Pesanan'}
                                                                    </span>
                                                                    {item.unified_type === 'order' && (
                                                                        <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
                                                                            {getOrderTypeText((item as Order).order_type)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Content based on type */}
                                                    {item.unified_type === 'reservation' ? (
                                                        // Enhanced Reservation Content
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                                {/* Time & Guests */}
                                                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                                    <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Waktu & Tamu</h4>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                            <Calendar className="w-4 h-4 text-purple-500" />
                                                                            <span className="font-medium">{formatDate((item as Reservation).date)}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                            <Clock className="w-4 h-4 text-purple-500" />
                                                                            <span>{(item as Reservation).time}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                            <Users className="w-4 h-4 text-purple-500" />
                                                                            <span>{(item as Reservation).guests} orang</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Contact & Location */}
                                                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                                    <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Kontak & Lokasi</h4>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                            <MapPin className="w-4 h-4 text-purple-500" />
                                                                            <span>{(item as Reservation).table}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                            <Phone className="w-4 h-4 text-purple-500" />
                                                                            <span>{(item as Reservation).phone}</span>
                                                                        </div>
                                                                        {(item as Reservation).email && (
                                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                                <Mail className="w-4 h-4 text-purple-500" />
                                                                                <span className="truncate">{(item as Reservation).email}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Package & Payment */}
                                                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                                    <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Paket & Pembayaran</h4>
                                                                    <div className="space-y-2">
                                                                        {(item as Reservation).packageName && (
                                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                                <Package className="w-4 h-4 text-purple-500" />
                                                                                <span className="truncate">{(item as Reservation).packageName}</span>
                                                                            </div>
                                                                        )}
                                                                        {(item as Reservation).totalPrice && (
                                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                                <CreditCard className="w-4 h-4 text-purple-500" />
                                                                                <span className="font-semibold text-purple-600 dark:text-purple-400">
                                                                                    {formatCurrency((item as Reservation).totalPrice)}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        {(item as Reservation).paymentMethodLabel && (
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                via {(item as Reservation).paymentMethodLabel}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Special Request */}
                                                            {(item as Reservation).specialRequest && (
                                                                <div className="p-4 border border-blue-200 rounded-xl bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                                                                    <div className="text-sm text-blue-800 dark:text-blue-400">
                                                                        <span className="font-medium">Permintaan khusus:</span> {(item as Reservation).specialRequest}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Menu Items */}
                                                            {(item as Reservation).menuItems && (item as Reservation).menuItems!.length > 0 && (
                                                                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                        <span className="block mb-2 font-medium">Menu tambahan:</span>
                                                                        <div className="grid gap-2">
                                                                            {(item as Reservation).menuItems!.map((menuItem, index) => (
                                                                                <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg dark:bg-gray-700">
                                                                                    <span className="font-medium">{menuItem.name} x{menuItem.quantity}</span>
                                                                                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                                                                                        {formatCurrency(menuItem.subtotal)}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        // Enhanced Order Content
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-6 p-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="w-4 h-4 text-orange-500" />
                                                                    <span className="font-medium">{formatDate((item as Order).order_date)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4 text-orange-500" />
                                                                    <span>{formatTime((item as Order).order_date)}</span>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Menu yang dipesan:</h4>
                                                                <div className="grid gap-2">
                                                                    {(item as Order).items.map((orderItem, index) => (
                                                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                                                            <div className="flex-1">
                                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                                    {orderItem.quantity}x {orderItem.menu_name}
                                                                                </span>
                                                                                {orderItem.special_instructions && (
                                                                                    <div className="mt-1 text-xs italic text-gray-500">
                                                                                        Note: {orderItem.special_instructions}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <span className="font-semibold text-orange-600 dark:text-orange-400">
                                                                                {formatCurrency(orderItem.subtotal)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Footer with total and actions */}
                                                    <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                                Total: {formatCurrency(item.unified_total)}
                                                            </div>
                                                            {item.unified_type === 'order' && (item as Order).review && (
                                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20">
                                                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                                                                        {(item as Order).review!.rating}/5
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {item.unified_type === 'reservation' && (
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    Dibuat {formatDate((item as Reservation).createdAt)}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {item.unified_type === 'reservation' ? (
                                                                <>
                                                                    <Link
                                                                        href={route('reservations.show', (item as Reservation).id)}
                                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-purple-600 transition-all border border-purple-200 rounded-lg hover:text-purple-700 bg-purple-50 hover:bg-purple-100 hover:border-purple-300"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                        Detail
                                                                    </Link>
                                                                    {(item as Reservation).status === 'pending' && (
                                                                        <Link
                                                                            href={route('reservations.edit', (item as Reservation).id)}
                                                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 transition-all border border-blue-200 rounded-lg hover:text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300"
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                            Edit
                                                                        </Link>
                                                                    )}
                                                                    {((item as Reservation).status === 'pending' || (item as Reservation).status === 'confirmed') && (
                                                                        <button
                                                                            onClick={() => handleCancelReservation((item as Reservation).id)}
                                                                            disabled={cancellingIds.has((item as Reservation).id)}
                                                                            className={`inline-flex items-center gap-2 px-4 py-2 text-sm border rounded-lg transition-all ${
                                                                                cancellingIds.has((item as Reservation).id)
                                                                                    ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                                                                                    : 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300'
                                                                            }`}
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                            {cancellingIds.has((item as Reservation).id) ? 'Membatalkan...' : 'Batalkan'}
                                                                        </button>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Link
                                                                        href={route('orders.show', (item as Order).id)}
                                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-orange-600 transition-all border border-orange-200 rounded-lg hover:text-orange-700 bg-orange-50 hover:bg-orange-100 hover:border-orange-300"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                        Detail
                                                                    </Link>
                                                                    {(item as Order).can_be_reviewed && (
                                                                        <Link
                                                                            href={route('reviews.create', { order_id: (item as Order).id })}
                                                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm transition-all border rounded-lg text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200 hover:border-amber-300"
                                                                        >
                                                                            <Star className="w-4 h-4" />
                                                                            Beri Rating
                                                                        </Link>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Enhanced Pagination */}
                        {activeTab === 'orders' && orders.last_page > 1 && (
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Menampilkan <span className="font-medium">{orders.from}</span> sampai <span className="font-medium">{orders.to}</span> dari <span className="font-medium">{orders.total}</span> pesanan
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {orders.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-4 py-2 text-sm rounded-lg transition-all ${
                                                    link.active
                                                        ? 'bg-orange-500 text-white shadow-sm'
                                                        : link.url
                                                        ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                                                        : 'text-gray-400 cursor-not-allowed'
                                                }`}
                                                preserveState
                                                preserveScroll
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
