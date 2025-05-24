import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
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
        href: '/riwayat-pemesanan',
    },
];

// Sample data - replace with real data from props
const orderHistory = [
    {
        id: 'ORD-2025-001',
        date: '2025-05-24',
        time: '14:30',
        items: [
            { name: 'Nasi Goreng Special', quantity: 2, price: 45000 },
            { name: 'Es Teh Manis', quantity: 2, price: 8000 },
            { name: 'Ayam Bakar', quantity: 1, price: 35000 }
        ],
        total: 88000,
        status: 'completed',
        type: 'dine-in',
        table: 'Meja 5',
        rating: 5,
        paymentMethod: 'cash'
    },
    {
        id: 'ORD-2025-002',
        date: '2025-05-20',
        time: '12:15',
        items: [
            { name: 'Mie Ayam Bakso', quantity: 1, price: 25000 },
            { name: 'Es Jeruk', quantity: 1, price: 12000 }
        ],
        total: 37000,
        status: 'completed',
        type: 'takeaway',
        rating: 4,
        paymentMethod: 'card'
    },
    {
        id: 'ORD-2025-003',
        date: '2025-05-18',
        time: '19:45',
        items: [
            { name: 'Sate Ayam', quantity: 2, price: 30000 },
            { name: 'Nasi Putih', quantity: 2, price: 6000 },
            { name: 'Teh Botol', quantity: 2, price: 10000 }
        ],
        total: 46000,
        status: 'cancelled',
        type: 'dine-in',
        table: 'Meja 12',
        paymentMethod: 'digital'
    },
    {
        id: 'ORD-2025-004',
        date: '2025-05-15',
        time: '11:20',
        items: [
            { name: 'Gado-gado', quantity: 1, price: 20000 },
            { name: 'Es Campur', quantity: 1, price: 15000 }
        ],
        total: 35000,
        status: 'completed',
        type: 'dine-in',
        table: 'Meja 8',
        rating: 5,
        paymentMethod: 'digital'
    },
    {
        id: 'ORD-2025-005',
        date: '2025-05-12',
        time: '18:45',
        items: [
            { name: 'Rendang', quantity: 1, price: 40000 },
            { name: 'Nasi Putih', quantity: 1, price: 3000 },
            { name: 'Es Teh', quantity: 1, price: 7000 }
        ],
        total: 50000,
        status: 'completed',
        type: 'takeaway',
        rating: 4,
        paymentMethod: 'cash'
    },
    {
        id: 'ORD-2025-006',
        date: '2025-05-10',
        time: '13:30',
        items: [
            { name: 'Ayam Geprek', quantity: 2, price: 28000 },
            { name: 'Es Jeruk', quantity: 2, price: 12000 }
        ],
        total: 40000,
        status: 'completed',
        type: 'dine-in',
        table: 'Meja 3',
        rating: 5,
        paymentMethod: 'digital'
    }
];

const getStatusColor = (status) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
        case 'processing':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
};

const getStatusText = (status) => {
    switch (status) {
        case 'completed':
            return 'Selesai';
        case 'cancelled':
            return 'Dibatalkan';
        case 'pending':
            return 'Menunggu';
        case 'processing':
            return 'Diproses';
        default:
            return status;
    }
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
        month: 'long',
        year: 'numeric'
    });
};

export default function RiwayatPemesanan() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredOrders = orderHistory.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const completedOrders = orderHistory.filter(order => order.status === 'completed');
    const totalSpent = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const avgRating = completedOrders.filter(o => o.rating).reduce((sum, o) => sum + o.rating, 0) / completedOrders.filter(o => o.rating).length;
    const dineInCount = orderHistory.filter(o => o.type === 'dine-in').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Pemesanan" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    {/* Total Pesanan */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Pesanan</p>
                                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                                    {orderHistory.length}
                                </p>
                                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                                    {completedOrders.length} selesai
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Total Belanja */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Belanja</p>
                                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                                    {formatCurrency(totalSpent)}
                                </p>
                                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                                    Rata-rata {formatCurrency(totalSpent / completedOrders.length || 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Rating Rata-rata */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Rating Rata-rata</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                                        {avgRating ? avgRating.toFixed(1) : '0'}
                                    </p>
                                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                                </div>
                                <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                                    Dari {completedOrders.filter(o => o.rating).length} ulasan
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-white fill-current" />
                            </div>
                        </div>
                    </div>

                    {/* Dine-in Count */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Dine-in</p>
                                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                                    {dineInCount}
                                </p>
                                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                                    {orderHistory.length - dineInCount} take away
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                <Coffee className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Riwayat Pemesanan */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex-1 flex flex-col min-h-[70vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Riwayat Pemesanan
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                    Lihat semua pesanan yang pernah Anda buat
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors">
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan ID pesanan atau nama menu..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                    <option value="pending">Menunggu</option>
                                    <option value="processing">Diproses</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="flex-1 overflow-auto">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    {searchTerm || statusFilter !== 'all' ? 'Tidak ada pesanan yang sesuai dengan filter' : 'Belum ada riwayat pesanan'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredOrders.map((order) => (
                                    <div key={order.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {order.id}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                        {getStatusText(order.status)}
                                                    </span>
                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                                                        {order.type === 'dine-in' ? 'Dine In' : 'Take Away'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(order.date)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {order.time}
                                                    </div>
                                                    {order.table && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {order.table}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Menu yang dipesan:</p>
                                                    <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
                                                        {order.items.map((item, index) => (
                                                            <li key={index} className="flex justify-between">
                                                                <span>{item.quantity}x {item.name}</span>
                                                                <span className="font-medium">{formatCurrency(item.price)}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <p className="font-bold text-lg text-gray-900 dark:text-white">
                                                            Total: {formatCurrency(order.total)}
                                                        </p>
                                                        {order.rating && (
                                                            <div className="flex items-center gap-1">
                                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {order.rating}/5
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-300 rounded-lg transition-colors">
                                                            <Eye className="w-4 h-4" />
                                                            Detail
                                                        </button>
                                                        {order.status === 'completed' && !order.rating && (
                                                            <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-300 rounded-lg transition-colors">
                                                                <Star className="w-4 h-4" />
                                                                Beri Rating
                                                            </button>
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
                </div>
            </div>
        </AppLayout>
    );
}