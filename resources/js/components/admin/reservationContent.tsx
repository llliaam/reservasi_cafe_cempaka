// components/ReservationContent.tsx - Responsive Version (Partial - Main structure)
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Clock, MapPin, Filter, Eye, Edit3, Phone,
  CheckCircle, XCircle, AlertCircle, Download, RefreshCw, Trash2,
  Check, X, Search, Plus, FileText, Star, CreditCard
} from 'lucide-react';

interface ReservationData {
  id: number;
  reservation_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  package_name: string;
  table_name?: string;
  table_number?: number;
  date: string;
  time: string;
  guests: number;
  status: string;
  payment_method: string;
  payment_method_label: string;
  total_price: string;
  special_requests?: string;
  table_location: string;
  location_detail?: string;
  proof_of_payment?: string;
  can_be_confirmed: boolean;
  can_be_cancelled: boolean;
  requires_payment_confirmation: boolean;
  package_price: number;
  menu_subtotal: number;
  raw_date: string;
  raw_time: string;
   createdBy?: {
    id: string;
    name: string;
    role: string;
  };
  confirmedBy?: {
    id: string;
    name: string;
    role: string;
    confirmedAt: string;
  };
  cancelledBy?: {
    id: string;
    name: string;
    role: string;
    cancelledAt: string;
    reason?: string;
  };
  statusHistory?: Array<{
    status: string;
    changedBy: {
      id: string;
      name: string;
      role: string;
    };
    changedAt: string;
    notes?: string;
  }>;
}

interface ReservationContentProps {
  searchTerm: string;
  openModal: (type: string, data?: any) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  reservations?: ReservationData[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const ReservationContent: React.FC<ReservationContentProps> = ({
  searchTerm,
  openModal,
  getStatusColor,
  getStatusText,
  reservations = [],
  onRefresh,
  isRefreshing = false
}) => {
  const [filteredReservations, setFilteredReservations] = useState<ReservationData[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationData | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleOpenModal = (type: string, data?: any) => {
  if (type === 'reservation' && data) {
    // GUNAKAN MODAL BARU untuk reservasi
    setSelectedReservation(data);
    setShowDetailModal(true);
  } else {
    // Untuk tipe lain, gunakan openModal yang lama
    openModal(type, data);
  }
};

  // Filter and sort logic (same as original)
  useEffect(() => {
    let filtered = [...reservations];
    
    if (searchTerm) {
      filtered = filtered.filter(reservation => 
        reservation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.reservation_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.customer_phone.includes(searchTerm) ||
        reservation.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(reservation => {
        const packageName = reservation.package_name.toLowerCase();
        if (filterType === 'acara') {
          return packageName.includes('acara') || packageName.includes('gathering') || 
                 packageName.includes('group') || packageName.includes('corporate');
        }
        if (filterType === 'private') {
          return packageName.includes('private') || packageName.includes('romantis') || 
                 packageName.includes('keluarga') || packageName.includes('couple');
        }
        return true;
      });
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === filterStatus);
    }

    if (filterPayment !== 'all') {
      if (filterPayment === 'online') {
        filtered = filtered.filter(reservation => 
          ['transfer', 'bca', 'mandiri', 'bni', 'bri', 'gopay', 'ovo', 'dana', 'shopeepay'].includes(reservation.payment_method)
        );
      } else if (filterPayment === 'cash') {
        filtered = filtered.filter(reservation => 
          ['pay-later', 'cash'].includes(reservation.payment_method)
        );
      }
    }
    
    // Sort logic
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.raw_date + ' ' + b.raw_time).getTime() - new Date(a.raw_date + ' ' + a.raw_time).getTime();
        case 'date_asc':
          return new Date(a.raw_date + ' ' + a.raw_time).getTime() - new Date(b.raw_date + ' ' + b.raw_time).getTime();
        case 'name_asc':
          return a.customer_name.localeCompare(b.customer_name);
        case 'name_desc':
          return b.customer_name.localeCompare(a.customer_name);
        case 'price_desc':
          return parseFloat(b.total_price.replace(/[^\d]/g, '')) - parseFloat(a.total_price.replace(/[^\d]/g, ''));
        case 'price_asc':
          return parseFloat(a.total_price.replace(/[^\d]/g, '')) - parseFloat(b.total_price.replace(/[^\d]/g, ''));
        default:
          return 0;
      }
    });
    
    setFilteredReservations(filtered);
    setCurrentPage(1);
  }, [reservations, searchTerm, filterType, filterStatus, filterPayment, sortBy]);

  // Calculate statistics
const stats = {
  total: reservations.length,
  confirmed: reservations.filter(r => r.status === 'confirmed').length,
  pending: reservations.filter(r => r.status === 'pending').length,
  completed: reservations.filter(r => r.status === 'completed').length,
  cancelled: reservations.filter(r => r.status === 'cancelled').length,
  
  // PERBAIKI: Revenue calculation dengan format yang benar
  totalRevenue: reservations
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => {
      // Parse angka dari string harga yang sudah diformat
      const price = typeof r.total_price === 'string' 
        ? parseFloat(r.total_price.replace(/[^\d]/g, ''))
        : (r.total_price || 0);
      return sum + price;
    }, 0),
    
  avgOrderValue: reservations.length > 0 
    ? reservations.reduce((sum, r) => {
        const price = typeof r.total_price === 'string' 
          ? parseFloat(r.total_price.replace(/[^\d]/g, ''))
          : (r.total_price || 0);
        return sum + price;
      }, 0) / reservations.length 
    : 0,
    
  totalGuests: reservations.reduce((sum, r) => sum + r.guests, 0),
  avgGuests: reservations.length > 0 
    ? reservations.reduce((sum, r) => sum + r.guests, 0) / reservations.length 
    : 0
};

  // Pagination
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReservations.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  const exportData = () => {
  const csvHeaders = [
    'No',
    'Kode Reservasi', 
    'Nama Customer', 
    'Telepon', 
    'Email', 
    'Paket', 
    'Tanggal', 
    'Waktu', 
    'Jumlah Tamu', 
    'Status', 
    'Metode Pembayaran',
    'Total Harga',
    'Meja',
    'Lokasi',
    'Permintaan Khusus',
    'Staff Konfirmasi',
    'Waktu Konfirmasi'
  ];

  const csvData = [
    csvHeaders,
    ...filteredReservations.map((reservation, index) => {
      const price = typeof reservation.total_price === 'string' 
        ? parseFloat(reservation.total_price.replace(/[^\d]/g, ''))
        : (reservation.total_price || 0);
        
      return [
        index + 1,
        reservation.reservation_code,
        reservation.customer_name,
        reservation.customer_phone,
        reservation.customer_email,
        reservation.package_name,
        reservation.date,
        reservation.time,
        reservation.guests.toString(),
        getStatusText(reservation.status),
        reservation.payment_method_label,
        `Rp ${price.toLocaleString('id-ID')}`, // Format rupiah yang benar
        reservation.table_name || 'Belum ditentukan',
        reservation.table_location,
        reservation.special_requests || '',
        reservation.confirmedBy?.name || '',
        reservation.confirmedBy?.confirmedAt || ''
      ];
    })
  ];

  const csvContent = csvData.map(row => 
    row.map(field => {
      const stringField = String(field || '');
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return '"' + stringField.replace(/"/g, '""') + '"';
      }
      return stringField;
    }).join(',')
  ).join('\n');

  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan-reservasi-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// const handleOpenDetailModal = (reservation: ReservationData) => {
//   setSelectedReservation(reservation);
//   setShowDetailModal(true);
// };

const handleCloseDetailModal = () => {
  setSelectedReservation(null);
  setShowDetailModal(false);
};

const DetailModal = ({ reservation, onClose }: { reservation: ReservationData; onClose: () => void }) => {
  if (!reservation) return null;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return 'Tidak tersedia';
    try {
      return new Date(dateTimeString).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTimeString;
    }
  };

  const showImageInModal = (imageUrl: string) => {
    setImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const price = typeof reservation.total_price === 'string' 
    ? parseFloat(reservation.total_price.replace(/[^\d]/g, ''))
    : (reservation.total_price || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Detail Reservasi</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Basic Reservation Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Kode Reservasi</label>
            <p className="text-gray-900 font-mono">{reservation.reservation_code}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(reservation.status)}`}>
                {getStatusText(reservation.status)}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Pelanggan</label>
            <p className="text-gray-900">{reservation.customer_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">No. Telepon</label>
            <p className="text-gray-900">{reservation.customer_phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Paket</label>
            <p className="text-gray-900">{reservation.package_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Total Harga</label>
            <p className="text-gray-900 font-semibold">Rp {price.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tanggal & Waktu</label>
            <p className="text-gray-900">{reservation.date} - {reservation.time}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Jumlah Tamu</label>
            <p className="text-gray-900">{reservation.guests} orang</p>
          </div>
        </div>

        {/* Staff Tracking Section */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">Tracking Staff</label>
          <div className="space-y-3">
            {/* Reservation Creation */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">Reservasi Dibuat</p>
                <p className="text-xs text-blue-700">
                  {reservation.createdBy ? 
                    `Oleh: ${reservation.createdBy.name} (${reservation.createdBy.role === 'customer' ? 'Customer' : 'Staff'})` : 
                    `Oleh: ${reservation.customer_name} (Customer)`
                  }
                </p>
              </div>
              <span className="text-xs text-blue-600">{reservation.date} {reservation.time}</span>
            </div>

            {/* Confirmation */}
            {reservation.confirmedBy && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-900">Reservasi Dikonfirmasi</p>
                  <p className="text-xs text-green-700">
                    Oleh: {reservation.confirmedBy.name} ({reservation.confirmedBy.role})
                  </p>
                </div>
                <span className="text-xs text-green-600">
                  {formatDateTime(reservation.confirmedBy.confirmedAt)}
                </span>
              </div>
            )}

            {/* Cancellation */}
            {reservation.cancelledBy && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-red-900">Reservasi Dibatalkan</p>
                  <p className="text-xs text-red-700">
                    {reservation.cancelledBy.role === 'customer' ? 
                      'Oleh: Customer' : 
                      `Oleh: ${reservation.cancelledBy.name} (${reservation.cancelledBy.role})`
                    }
                  </p>
                  {reservation.cancelledBy.reason && (
                    <p className="text-xs text-red-600 mt-1">{reservation.cancelledBy.reason}</p>
                  )}
                </div>
                <span className="text-xs text-red-600">
                  {formatDateTime(reservation.cancelledBy.cancelledAt)}
                </span>
              </div>
            )}

            {/* Status History */}
            {reservation.statusHistory && reservation.statusHistory.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Riwayat Status</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {reservation.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                      <div>
                        <span className="font-medium">{getStatusText(history.status)}</span>
                        <span className="text-gray-600 ml-2">
                          oleh {history.changedBy.name} ({history.changedBy.role === 'customer' ? 'Customer' : 'Staff'})
                        </span>
                        {history.notes && (
                          <p className="text-gray-500 mt-1">{history.notes}</p>
                        )}
                      </div>
                      <span className="text-gray-500">
                        {formatDateTime(history.changedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment & Notes */}
        {reservation.payment_method && (
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700">Metode Pembayaran</label>
            <p className="text-gray-900">{reservation.payment_method_label}</p>
          </div>
        )}

        {reservation.special_requests && (
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700">Permintaan Khusus</label>
            <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{reservation.special_requests}</p>
          </div>
        )}

        {/* Payment Proof */}
        {reservation.proof_of_payment && (
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700">Bukti Pembayaran</label>
            <div className="mt-2">
              <img 
                src={reservation.proof_of_payment} 
                alt="Bukti Pembayaran"
                className="max-w-full h-auto max-h-64 rounded-lg border cursor-pointer"
                onClick={() => showImageInModal(reservation.proof_of_payment!)}
              />
              <p className="text-xs text-blue-600 mt-1 cursor-pointer" onClick={() => showImageInModal(reservation.proof_of_payment!)}>
                Klik untuk memperbesar
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Kelola Reservasi</h2>
          <p className="text-gray-600 text-sm sm:text-base">Kelola semua reservasi acara dan private dining</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={exportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Reservasi</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.confirmed}</div>
              <div className="text-sm text-gray-600">Dikonfirmasi</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-sm text-gray-600">Menunggu</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold text-gray-900">
                Rp {stats.totalRevenue.toLocaleString('id-ID')}
              </div>
              <div className="text-sm text-gray-600">Total Pendapatan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Semua Tipe</option>
                <option value="acara">Reservasi Acara</option>
                <option value="private">Private Dining</option>
              </select>
              
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="confirmed">Dikonfirmasi</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>

              <select 
                value={filterPayment} 
                onChange={(e) => setFilterPayment(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Semua Pembayaran</option>
                <option value="online">Online Payment</option>
                <option value="cash">Cash/Pay Later</option>
              </select>

              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="date_desc">Tanggal Terbaru</option>
                <option value="date_asc">Tanggal Terlama</option>
                <option value="name_asc">Nama A-Z</option>
                <option value="name_desc">Nama Z-A</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="price_asc">Harga Terendah</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Menampilkan {getCurrentPageItems().length} dari {filteredReservations.length} reservasi
            </span>
          </div>
        </div>
      </div>

      {/* Reservations List - Mobile & Desktop Views */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Mobile View */}
        <div className="lg:hidden">
          <div className="divide-y divide-gray-200">
            {getCurrentPageItems().map((reservation) => (
              <div key={reservation.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{reservation.reservation_code}</h3>
                    <p className="text-sm text-gray-600 truncate">{reservation.customer_name}</p>
                    <p className="text-xs text-gray-500 truncate">{reservation.customer_phone}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 flex-shrink-0 ${getStatusColor(reservation.status)}`}>
                    {getStatusText(reservation.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Paket: </span>
                    <span className="font-medium truncate block">{reservation.package_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tamu: </span>
                    <span className="font-medium">{reservation.guests} orang</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tanggal: </span>
                    <span className="font-medium">{reservation.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total: </span>
                    <span className="font-medium">
                      {(() => {
                        const price = typeof reservation.total_price === 'string' 
                          ? parseFloat(reservation.total_price.replace(/[^\d]/g, ''))
                          : (reservation.total_price || 0);
                        return `Rp ${price.toLocaleString('id-ID')}`;
                      })()}
                    </span>
                  </div>
                </div>

               <button 
                  onClick={() => handleOpenModal('reservation', reservation)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm flex items-center"
                  title="Lihat Detail"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Detail
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode Reservasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paket & Meja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal & Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCurrentPageItems().map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reservation.reservation_code}</div>
                    <div className="text-sm text-gray-500">{reservation.payment_method_label}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reservation.customer_name}</div>
                    <div className="text-sm text-gray-500">{reservation.customer_phone}</div>
                    <div className="text-sm text-gray-500">{reservation.customer_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{reservation.package_name}</div>
                    <div className="text-sm text-gray-500">
                      {reservation.table_name || 'Belum ditentukan'} • {reservation.table_location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reservation.date}</div>
                    <div className="text-sm text-gray-500">{reservation.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reservation.guests} orang
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {(() => {
                        const price = typeof reservation.total_price === 'string' 
                          ? parseFloat(reservation.total_price.replace(/[^\d]/g, ''))
                          : (reservation.total_price || 0);
                        return `Rp ${price.toLocaleString('id-ID')}`;
                      })()}
                    </div>
                    {reservation.requires_payment_confirmation && (
                      <div className="text-xs text-orange-600">
                        {reservation.proof_of_payment ? 'Perlu verifikasi' : 'Belum bayar'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleOpenModal('reservation', reservation)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Simple Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex justify-between sm:hidden w-full">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 self-center">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredReservations.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{filteredReservations.length}</span>
                  {' '}results
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredReservations.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada reservasi</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all' || filterPayment !== 'all'
              ? 'Tidak ada reservasi yang sesuai dengan filter yang dipilih.'
              : 'Belum ada reservasi yang masuk.'}
          </p>
        </div>
      )}

      {/* Detail Modal */}
{showDetailModal && selectedReservation && (
  <DetailModal 
    reservation={selectedReservation} 
    onClose={handleCloseDetailModal}
  />
)}

{/* Image Modal */}
{showImageModal && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div className="relative max-w-4xl max-h-full">
      <button
        onClick={() => setShowImageModal(false)}
        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
      >
        <X className="w-6 h-6" />
      </button>
      <img 
        src={imageUrl} 
        alt="Bukti Pembayaran" 
        className="max-w-full max-h-full object-contain"
      />
    </div>
  </div>
)}

    </div>
  );
};

export default ReservationContent;