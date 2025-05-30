import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
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
    Package
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Riwayat Reservasi',
        href: '/reservations',
    },
];

// Interface untuk data dari ReservationController->index()
interface MenuItem {
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
}

interface Reservation {
    id: string; // reservation_code
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

interface RiwayatReservasiProps {
    reservations: Reservation[];
    stats: ReservationStats;
}

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
        default:
            return <AlertCircle className="w-4 h-4" />;
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
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

export default function RiwayatReservasi({ reservations = [], stats }: RiwayatReservasiProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [cancellingIds, setCancellingIds] = useState(new Set<string>());
    const [localReservations, setLocalReservations] = useState(reservations);

    // Handle cancel reservation using Inertia form submission
    const handleCancelReservation = async (reservationId: string) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan reservasi ini?')) {
            return;
        }

        // Add to cancelling set to show loading state
        setCancellingIds(prev => new Set([...prev, reservationId]));

        try {
            // Send DELETE request to destroy method (which handles cancellation)
            router.delete(route('reservations.destroy', reservationId), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Update local state immediately for better UX
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
                    // Remove from cancelling set
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

    // Filter reservations based on search and status
    const filteredReservations = localReservations.filter(reservation => {
        const matchesSearch = reservation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            reservation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            reservation.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
                                    {stats.totalReservations}
                                </p>
                                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                                    {stats.confirmedCount} aktif
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
                                    {stats.completedCount}
                                </p>
                                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                                    {stats.totalReservations > 0 ? Math.round((stats.completedCount / stats.totalReservations) * 100) : 0}% dari total
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
                                    {stats.totalGuests}
                                </p>
                                <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">
                                    Rata-rata {stats.averageGuests} orang
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
                                <Link 
                                    href={route('reservations.create')}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Buat Reservasi
                                </Link>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan ID reservasi, nama, atau nomor telepon..."
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
                                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                                    {searchTerm || statusFilter !== 'all' ? 'Tidak ada reservasi yang sesuai dengan filter' : 'Belum ada riwayat reservasi'}
                                </p>
                                {!searchTerm && statusFilter === 'all' && (
                                    <Link 
                                        href={route('reservations.create')}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 border border-purple-200 hover:border-purple-300 rounded-lg transition-colors mt-4"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Buat Reservasi Pertama
                                    </Link>
                                )}
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
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                                                        {reservation.email && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                <Mail className="w-4 h-4" />
                                                                <span>{reservation.email}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        {reservation.packageName && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                <Package className="w-4 h-4" />
                                                                <span>{reservation.packageName}</span>
                                                            </div>
                                                        )}
                                                        {reservation.totalPrice && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                <CreditCard className="w-4 h-4" />
                                                                <span className="font-medium">{formatCurrency(reservation.totalPrice)}</span>
                                                            </div>
                                                        )}
                                                        {reservation.paymentMethodLabel && (
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Pembayaran:</span> {reservation.paymentMethodLabel}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {reservation.specialRequest && (
                                                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                        <div className="text-sm text-blue-800 dark:text-blue-400">
                                                            <span className="font-medium">Permintaan khusus:</span> {reservation.specialRequest}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Menu Items Summary */}
                                                {reservation.menuItems && reservation.menuItems.length > 0 && (
                                                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                                            <span className="font-medium">Menu tambahan:</span>
                                                            <div className="mt-1 space-y-1">
                                                                {reservation.menuItems.map((item, index) => (
                                                                    <div key={index} className="flex justify-between">
                                                                        <span>{item.name} x{item.quantity}</span>
                                                                        <span>{formatCurrency(item.subtotal)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Dibuat pada {formatDate(reservation.createdAt)}
                                                    </p>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <Link 
                                                            href={route('reservations.show', reservation.id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 border border-purple-200 hover:border-purple-300 rounded-lg transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Detail
                                                        </Link>
                                                        {reservation.status === 'pending' && (
                                                            <Link 
                                                                href={route('reservations.edit', reservation.id)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                                Edit
                                                            </Link>
                                                        )}
                                                        {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                                                            <button 
                                                                onClick={() => handleCancelReservation(reservation.id)}
                                                                disabled={cancellingIds.has(reservation.id)}
                                                                className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                                                                    cancellingIds.has(reservation.id)
                                                                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                                                        : 'text-red-600 hover:text-red-700 border-red-200 hover:border-red-300'
                                                                }`}
                                                            >
                                                                <X className="w-4 h-4" />
                                                                {cancellingIds.has(reservation.id) ? 'Membatalkan...' : 'Batalkan'}
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