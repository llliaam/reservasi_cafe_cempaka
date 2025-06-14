//riwayatPemesanan.tsx

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    MapPin,
    CreditCard,
    Star,
    ChevronRight,
    Filter,
    Search,
    Download,
    Eye,
    Package,
    TrendingUp,
    Users,
    Coffee
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Riwayat Pemesanan',
        href: '/orders/history',
    },
];

// Interface untuk data dari OrderController->history()
interface OrderItem {
    id: number;
    menu_item_id: number;
    menu_name: string;
    quantity: number;
    price: number;
    subtotal: number;
    special_instructions?: string;
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

interface OrdersHistoryProps {
    orders: PaginatedOrders;
    filters: {
        status?: string;
        order_type?: string;
        date_from?: string;
        date_to?: string;
    };
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
        case 'confirmed':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
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
        case 'completed':
            return 'Selesai';
        case 'cancelled':
            return 'Dibatalkan';
        case 'pending':
            return 'Menunggu';
        case 'confirmed':
            return 'Dikonfirmasi';
        case 'preparing':
            return 'Sedang Disiapkan';
        case 'ready':
            return 'Siap Diambil';
        default:
            return status;
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

export default function OrdersHistory({ orders, filters }: OrdersHistoryProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [localFilters, setLocalFilters] = useState(filters);

    // Handle filter changes with router visit
    const handleFilterChange = (newFilters: typeof filters) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([key, value]) => value && value !== 'all')
        );

        router.get(route('orders.history'), cleanFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusFilter = (status: string) => {
        const newFilters = { ...localFilters, status: status === 'all' ? undefined : status };
        setLocalFilters(newFilters);
        handleFilterChange(newFilters);
    };

    const handleOrderTypeFilter = (orderType: string) => {
        const newFilters = { ...localFilters, order_type: orderType === 'all' ? undefined : orderType };
        setLocalFilters(newFilters);
        handleFilterChange(newFilters);
    };

    const handleDateFilter = (dateFrom: string, dateTo: string) => {
        const newFilters = {
            ...localFilters,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined
        };
        setLocalFilters(newFilters);
        handleFilterChange(newFilters);
    };

    // Calculate statistics
    const ordersData = orders.data || [];
    const completedOrders = ordersData.filter(order => order.status === 'completed');
    const totalSpent = completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = ordersData.length;
    const avgOrderValue = completedOrders.length > 0 ? totalSpent / completedOrders.length : 0;
    const dineInCount = ordersData.filter(o => o.order_type === 'dine_in').length;
    const takeawayCount = ordersData.filter(o => o.order_type === 'takeaway').length;
    const deliveryCount = ordersData.filter(o => o.order_type === 'delivery').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Pemesanan" />

            <div className="flex flex-col flex-1 h-full gap-4 p-4 rounded-xl">
                {/* Stats Cards */}
                <div className="grid gap-4 auto-rows-min md:grid-cols-4">
                    {/* Total Pesanan */}
                    <div className="p-6 border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border-blue-200/50 dark:border-blue-800/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Pesanan</p>
                                <p className="mt-1 text-3xl font-bold text-blue-900 dark:text-blue-100">
                                    {totalOrders}
                                </p>
                                <p className="mt-1 text-xs text-blue-600/70 dark:text-blue-400/70">
                                    {completedOrders.length} selesai
                                </p>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Total Belanja */}
                    <div className="p-6 border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-green-200/50 dark:border-green-800/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Belanja</p>
                                <p className="mt-1 text-2xl font-bold text-green-900 dark:text-green-100">
                                    {formatCurrency(totalSpent)}
                                </p>
                                <p className="mt-1 text-xs text-green-600/70 dark:text-green-400/70">
                                    Rata-rata {formatCurrency(avgOrderValue)}
                                </p>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-xl">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Reviews Given */}
                    <div className="p-6 border bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border-amber-200/50 dark:border-amber-800/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Review Diberikan</p>
                                <p className="mt-1 text-3xl font-bold text-amber-900 dark:text-amber-100">
                                    {ordersData.filter(o => o.has_review).length}
                                </p>
                                <p className="mt-1 text-xs text-amber-600/70 dark:text-amber-400/70">
                                    {ordersData.filter(o => o.can_be_reviewed).length} bisa direview
                                </p>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-amber-500 rounded-xl">
                                <Star className="w-6 h-6 text-white fill-current" />
                            </div>
                        </div>
                    </div>

                    {/* Order Types Breakdown */}
                    <div className="p-6 border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border-purple-200/50 dark:border-purple-800/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Jenis Pesanan</p>
                                <p className="mt-1 text-2xl font-bold text-purple-900 dark:text-purple-100">
                                    {dineInCount}
                                </p>
                                <p className="mt-1 text-xs text-purple-600/70 dark:text-purple-400/70">
                                    Dine In • {takeawayCount} Take Away • {deliveryCount} Delivery
                                </p>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-xl">
                                <Coffee className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex-1 flex flex-col min-h-[70vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Riwayat Pemesanan
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Menampilkan {orders.from}-{orders.to} dari {orders.total} pesanan
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={localFilters.status || 'all'}
                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                    <option value="pending">Menunggu</option>
                                    <option value="confirmed">Dikonfirmasi</option>
                                    <option value="preparing">Sedang Disiapkan</option>
                                    <option value="ready">Siap Diambil</option>
                                </select>
                            </div>

                            {/* Order Type Filter */}
                            <select
                                value={localFilters.order_type || 'all'}
                                onChange={(e) => handleOrderTypeFilter(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="all">Semua Jenis</option>
                                <option value="dine_in">Dine In</option>
                                <option value="takeaway">Take Away</option>
                                <option value="delivery">Delivery</option>
                            </select>

                            {/* Date From Filter */}
                            <input
                                type="date"
                                value={localFilters.date_from || ''}
                                onChange={(e) => handleDateFilter(e.target.value, localFilters.date_to || '')}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Dari tanggal"
                            />

                            {/* Date To Filter */}
                            <input
                                type="date"
                                value={localFilters.date_to || ''}
                                onChange={(e) => handleDateFilter(localFilters.date_from || '', e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Sampai tanggal"
                            />
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="flex-1 overflow-auto">
                        {ordersData.length === 0 ? (
                            <div className="py-12 text-center">
                                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="mb-4 text-gray-500 dark:text-gray-400">
                                    {Object.keys(localFilters).some(key => localFilters[key as keyof typeof localFilters])
                                        ? 'Tidak ada pesanan yang sesuai dengan filter'
                                        : 'Belum ada riwayat pesanan'
                                    }
                                </p>
                                {!Object.keys(localFilters).some(key => localFilters[key as keyof typeof localFilters]) && (
                                    <Link
                                        href={route('orders.index')}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700"
                                    >
                                        <Package className="w-4 h-4" />
                                        Buat Pesanan Pertama
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {ordersData.map((order) => (
                                    <div key={order.id} className="p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {order.order_code}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                        {getStatusText(order.status)}
                                                    </span>
                                                    <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
                                                        {getOrderTypeText(order.order_type)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-6 mb-3 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(order.order_date)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {formatTime(order.order_date)}
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Menu yang dipesan:</p>
                                                    <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                                                        {order.items.map((item, index) => (
                                                            <li key={index} className="flex justify-between">
                                                                <span>
                                                                    {item.quantity}x {item.menu_name}
                                                                    {item.special_instructions && (
                                                                        <span className="ml-1 text-xs text-gray-500">
                                                                            ({item.special_instructions})
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                            Total: {formatCurrency(order.total_amount)}
                                                        </p>
                                                        {order.review && (
                                                            <div className="flex items-center gap-1">
                                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {order.review.rating}/5
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={route('orders.show', order.id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-300 rounded-lg transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Detail
                                                        </Link>
                                                        {order.can_be_reviewed && (
                                                            <Link
                                                                href={route('reviews.create', { order_id: order.id })}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-300 rounded-lg transition-colors"
                                                            >
                                                                <Star className="w-4 h-4" />
                                                                Beri Rating
                                                            </Link>
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

                    {/* Pagination */}
                    {orders.last_page > 1 && (
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Menampilkan {orders.from} sampai {orders.to} dari {orders.total} pesanan
                                </p>
                                <div className="flex items-center gap-2">
                                    {orders.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                                link.active
                                                    ? 'bg-orange-500 text-white'
                                                    : link.url
                                                    ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
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
        </AppLayout>
    );
}
