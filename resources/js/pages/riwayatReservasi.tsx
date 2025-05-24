import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
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
    Filter
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Riwayat Reservasi',
        href: '/riwayat-reservasi',
    },
];

// Sample data reservasi
const reservationHistory = [
    {
        id: 'RSV-2025-001',
        date: '2025-05-28',
        time: '19:00',
        guests: 4,
        table: 'Meja 12',
        name: 'William Benediktus',
        phone: '081234567890',
        status: 'confirmed',
        specialRequest: 'Meja dekat jendela',
        createdAt: '2025-05-20'
    },
    {
        id: 'RSV-2025-002',
        date: '2025-05-25',
        time: '12:30',
        guests: 2,
        table: 'Meja 5',
        name: 'William Benediktus',
        phone: '081234567890',
        status: 'completed',
        specialRequest: '',
        createdAt: '2025-05-18'
    },
    {
        id: 'RSV-2025-003',
        date: '2025-05-22',
        time: '20:00',
        guests: 6,
        table: 'Meja 15',
        name: 'William Benediktus',
        phone: '081234567890',
        status: 'cancelled',
        specialRequest: 'Acara ulang tahun',
        createdAt: '2025-05-15'
    },
    {
        id: 'RSV-2025-004',
        date: '2025-05-20',
        time: '18:30',
        guests: 3,
        table: 'Meja 8',
        name: 'William Benediktus',
        phone: '081234567890',
        status: 'completed',
        specialRequest: '',
        createdAt: '2025-05-12'
    }
];

const getStatusColor = (status) => {
    switch (status) {
        case 'confirmed':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
        case 'completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
};

const getStatusText = (status) => {
    switch (status) {
        case 'confirmed':
            return 'Dikonfirmasi';
        case 'completed':
            return 'Selesai';
        case 'cancelled':
            return 'Dibatalkan';
        case 'pending':
            return 'Menunggu';
        default:
            return status;
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'confirmed':
            return <CheckCircle className="w-4 h-4" />;
        case 'completed':
            return <CheckCircle className="w-4 h-4" />;
        case 'cancelled':
            return <X className="w-4 h-4" />;
        case 'pending':
            return <AlertCircle className="w-4 h-4" />;
        default:
            return <AlertCircle className="w-4 h-4" />;
    }
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

export default function RiwayatReservasi() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredReservations = reservationHistory.filter(reservation => {
        const matchesSearch = reservation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            reservation.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const confirmedCount = reservationHistory.filter(r => r.status === 'confirmed').length;
    const completedCount = reservationHistory.filter(r => r.status === 'completed').length;
    const totalGuests = reservationHistory.reduce((sum, r) => sum + r.guests, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Reservasi" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Total Reservasi */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Reservasi</p>
                                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                                    {reservationHistory.length}
                                </p>
                                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                                    {confirmedCount} aktif
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Reservasi Selesai */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">Selesai</p>
                                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                                    {completedCount}
                                </p>
                                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                                    {Math.round((completedCount / reservationHistory.length) * 100)}% dari total
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Total Tamu */}
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 rounded-xl border border-orange-200/50 dark:border-orange-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Tamu</p>
                                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                                    {totalGuests}
                                </p>
                                <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">
                                    Rata-rata {Math.round(totalGuests / reservationHistory.length)} orang
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex-1 flex flex-col min-h-[70vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Riwayat Reservasi
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                    Kelola semua reservasi meja yang pernah Anda buat
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                                    <Calendar className="w-4 h-4" />
                                    Buat Reservasi
                                </button>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan ID reservasi atau nama..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="confirmed">Dikonfirmasi</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                    <option value="pending">Menunggu</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Reservations List */}
                    <div className="flex-1 overflow-auto">
                        {filteredReservations.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    {searchTerm || statusFilter !== 'all' ? 'Tidak ada reservasi yang sesuai dengan filter' : 'Belum ada riwayat reservasi'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredReservations.map((reservation) => (
                                    <div key={reservation.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {reservation.id}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                                                        {getStatusIcon(reservation.status)}
                                                        {getStatusText(reservation.status)}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{formatDate(reservation.date)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{reservation.time}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <Users className="w-4 h-4" />
                                                            <span>{reservation.guests} orang</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{reservation.table}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <Phone className="w-4 h-4" />
                                                            <span>{reservation.phone}</span>
                                                        </div>
                                                        {reservation.specialRequest && (
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Permintaan khusus:</span> {reservation.specialRequest}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Dibuat pada {formatDate(reservation.createdAt)}
                                                    </p>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 border border-purple-200 hover:border-purple-300 rounded-lg transition-colors">
                                                            <Eye className="w-4 h-4" />
                                                            Detail
                                                        </button>
                                                        {reservation.status === 'confirmed' && (
                                                            <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors">
                                                                <Edit className="w-4 h-4" />
                                                                Edit
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