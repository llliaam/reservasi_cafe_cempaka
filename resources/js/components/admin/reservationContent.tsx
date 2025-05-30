// components/ReservationContent.tsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Clock, MapPin, Filter, Eye, Edit3, Phone,
  CheckCircle, XCircle, AlertCircle, Download, RefreshCw
} from 'lucide-react';

interface ReservationContentProps {
  searchTerm: string;
  openModal: (type: string, data?: any) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

const ReservationContent: React.FC<ReservationContentProps> = ({
  searchTerm,
  openModal,
  getStatusColor,
  getStatusText
}) => {
  // Mock data for reservations
  const [mockReservations] = useState([
    {
      id: 'RSV-001',
      customerName: 'Budi Santoso',
      phone: '081234567890',
      email: 'budi@email.com',
      type: 'acara', // acara atau private
      packageName: 'Paket Ulang Tahun Premium',
      date: '2024-03-25',
      time: '19:00',
      duration: '3 jam',
      guests: 25,
      location: 'Area VIP Lt. 2',
      totalPrice: 2500000,
      downPayment: 1250000,
      status: 'confirmed',
      notes: 'Dekorasi tema unicorn, kue ulang tahun 2 tingkat',
      createdAt: '2024-03-15'
    },
    {
      id: 'RSV-002',
      customerName: 'Siti Rahayu',
      phone: '087654321098',
      email: 'siti@email.com',
      type: 'private',
      packageName: 'Private Dining Romantic',
      date: '2024-03-23',
      time: '20:00',
      duration: '2 jam',
      guests: 2,
      location: 'Private Room A',
      totalPrice: 850000,
      downPayment: 425000,
      status: 'pending',
      notes: 'Anniversary dinner, request live music',
      createdAt: '2024-03-18'
    },
    {
      id: 'RSV-003',
      customerName: 'PT. Maju Bersama',
      phone: '021-5556789',
      email: 'hrd@majubersama.com',
      type: 'acara',
      packageName: 'Paket Corporate Meeting',
      date: '2024-03-22',
      time: '13:00',
      duration: '4 jam',
      guests: 50,
      location: 'Hall Utama',
      totalPrice: 5000000,
      downPayment: 2500000,
      status: 'completed',
      notes: 'Meeting tahunan, perlu proyektor dan sound system',
      createdAt: '2024-03-10'
    },
    {
      id: 'RSV-004',
      customerName: 'Ahmad Fadli',
      phone: '085678901234',
      email: 'ahmad@email.com',
      type: 'private',
      packageName: 'Private Dining Family',
      date: '2024-03-24',
      time: '12:00',
      duration: '2 jam',
      guests: 8,
      location: 'Private Room B',
      totalPrice: 1200000,
      downPayment: 600000,
      status: 'confirmed',
      notes: 'Gathering keluarga, ada 2 anak kecil',
      createdAt: '2024-03-19'
    },
    {
      id: 'RSV-005',
      customerName: 'Dewi Lestari',
      phone: '089012345678',
      email: 'dewi@email.com',
      type: 'acara',
      packageName: 'Paket Bridal Shower',
      date: '2024-03-26',
      time: '15:00',
      duration: '3 jam',
      guests: 20,
      location: 'Area Garden',
      totalPrice: 1800000,
      downPayment: 0,
      status: 'cancelled',
      notes: 'Dibatalkan karena perubahan jadwal',
      createdAt: '2024-03-16'
    }
  ]);

  const [filteredReservations, setFilteredReservations] = useState(mockReservations);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    let filtered = mockReservations;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(reservation => reservation.type === filterType);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === filterStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(reservation => 
        reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.phone.includes(searchTerm)
      );
    }
    
    setFilteredReservations(filtered);
  }, [filterType, filterStatus, searchTerm, mockReservations]);

  // Override status colors for reservations
  const getReservationStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReservationStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Dikonfirmasi';
      case 'pending': return 'Menunggu';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Riwayat Reservasi</h2>
          <p className="text-gray-600">Kelola reservasi acara dan private dining</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{mockReservations.length}</div>
              <div className="text-sm text-gray-600">Total Reservasi</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {mockReservations.filter(r => r.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-600">Dikonfirmasi</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {mockReservations.filter(r => r.type === 'acara').length}
              </div>
              <div className="text-sm text-gray-600">Reservasi Acara</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {mockReservations.filter(r => r.type === 'private').length}
              </div>
              <div className="text-sm text-gray-600">Private Dining</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pendapatan Reservasi</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Total Pendapatan</span>
              <span className="text-sm font-medium text-gray-900">
                Rp {mockReservations.reduce((sum, r) => sum + r.totalPrice, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Total DP Diterima</span>
              <span className="text-sm font-medium text-gray-900">
                Rp {mockReservations.reduce((sum, r) => sum + r.downPayment, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Sisa Pembayaran</span>
              <span className="text-sm font-medium text-gray-900">
                Rp {mockReservations.reduce((sum, r) => sum + (r.totalPrice - r.downPayment), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Tamu</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Total Tamu (Acara)</span>
              <span className="text-sm font-medium text-gray-900">
                {mockReservations.filter(r => r.type === 'acara').reduce((sum, r) => sum + r.guests, 0)} orang
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Total Tamu (Private)</span>
              <span className="text-sm font-medium text-gray-900">
                {mockReservations.filter(r => r.type === 'private').reduce((sum, r) => sum + r.guests, 0)} orang
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Rata-rata Tamu/Reservasi</span>
              <span className="text-sm font-medium text-gray-900">
                {Math.round(mockReservations.reduce((sum, r) => sum + r.guests, 0) / mockReservations.length)} orang
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
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
          
          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-sm text-gray-600">
              Menampilkan {filteredReservations.length} dari {mockReservations.length} reservasi
            </span>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Reservasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal & Waktu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reservation.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reservation.customerName}</div>
                    <div className="text-sm text-gray-500">{reservation.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{reservation.packageName}</div>
                    <div className="text-sm text-gray-500">{reservation.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      reservation.type === 'acara' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {reservation.type === 'acara' ? 'Acara' : 'Private'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reservation.date}</div>
                    <div className="text-sm text-gray-500">{reservation.time} ({reservation.duration})</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.guests} orang</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Rp {reservation.totalPrice.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">DP: Rp {reservation.downPayment.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getReservationStatusColor(reservation.status)}`}>
                      {getReservationStatusText(reservation.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openModal('reservation', reservation)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-900">
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReservationContent;