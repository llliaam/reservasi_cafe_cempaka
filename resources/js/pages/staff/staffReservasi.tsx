import React, { useState } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, Eye, MapPin, CreditCard, Edit3 } from 'lucide-react';

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  guests: number;
  tableNumber?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'confirmed' | 'failed';
  paymentProof?: string;
  specialRequests?: string;
}

interface Table {
  id: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  location: string;
}

const StaffReservasi: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'tables'>('reservations');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showPaymentProof, setShowPaymentProof] = useState(false);
  const [showTableSelection, setShowTableSelection] = useState(false);

  // Mock data - dalam aplikasi nyata, ini akan dari API
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 'RSV001',
      customerName: 'Budi Santoso',
      customerPhone: '081234567890',
      date: '2024-05-28',
      time: '19:00',
      guests: 4,
      tableNumber: 5,
      status: 'pending',
      paymentStatus: 'pending',
      paymentProof: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Payment+Proof',
      specialRequests: 'Dekat jendela, anniversary dinner'
    },
    {
      id: 'RSV002',
      customerName: 'Siti Rahayu',
      customerPhone: '081987654321',
      date: '2024-05-28',
      time: '20:30',
      guests: 2,
      tableNumber: 12,
      status: 'confirmed',
      paymentStatus: 'confirmed',
      paymentProof: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Payment+Confirmed'
    },
    {
      id: 'RSV003',
      customerName: 'Ahmad Rahman',
      customerPhone: '081122334455',
      date: '2024-05-29',
      time: '18:30',
      guests: 6,
      status: 'pending',
      paymentStatus: 'pending',
      specialRequests: 'Butuh high chair untuk anak'
    }
  ]);

  const [tables, setTables] = useState<Table[]>([
    { id: 1, capacity: 2, status: 'available', location: 'Indoor - Window' },
    { id: 2, capacity: 2, status: 'occupied', location: 'Indoor - Center' },
    { id: 3, capacity: 4, status: 'available', location: 'Indoor - Corner' },
    { id: 4, capacity: 4, status: 'reserved', location: 'Indoor - VIP' },
    { id: 5, capacity: 4, status: 'reserved', location: 'Indoor - Window' },
    { id: 6, capacity: 6, status: 'available', location: 'Outdoor - Garden' },
    { id: 7, capacity: 6, status: 'available', location: 'Outdoor - Terrace' },
    { id: 8, capacity: 8, status: 'available', location: 'Private Room' },
    { id: 9, capacity: 2, status: 'available', location: 'Indoor - Bar' },
    { id: 10, capacity: 4, status: 'occupied', location: 'Indoor - Center' },
    { id: 11, capacity: 2, status: 'available', location: 'Outdoor - Garden' },
    { id: 12, capacity: 2, status: 'reserved', location: 'Indoor - Window' }
  ]);

  const updateReservationStatus = (id: string, status: 'confirmed' | 'cancelled') => {
    setReservations(prev =>
      prev.map(reservation =>
        reservation.id === id
          ? { ...reservation, status, paymentStatus: status === 'confirmed' ? 'confirmed' : 'failed' }
          : reservation
      )
    );
    setSelectedReservation(null);
  };

  const assignTableToReservation = (reservationId: string, tableId: number) => {
    // Update reservasi dengan nomor meja
    setReservations(prev =>
      prev.map(reservation =>
        reservation.id === reservationId
          ? { ...reservation, tableNumber: tableId }
          : reservation
      )
    );

    // Update status meja menjadi reserved
    setTables(prev =>
      prev.map(table => {
        if (table.id === tableId) {
          return { ...table, status: 'reserved' };
        }
        // Jika reservasi sebelumnya sudah punya meja, bebaskan meja lama
        const oldReservation = reservations.find(r => r.id === reservationId);
        if (oldReservation?.tableNumber === table.id) {
          return { ...table, status: 'available' };
        }
        return table;
      })
    );

    // Update selected reservation jika sedang dipilih
    if (selectedReservation?.id === reservationId) {
      setSelectedReservation(prev => prev ? { ...prev, tableNumber: tableId } : null);
    }

    setShowTableSelection(false);
  };

  const getAvailableTables = () => {
    if (!selectedReservation) return [];

    return tables.filter(table =>
      (table.status === 'available' || table.id === selectedReservation.tableNumber) &&
      table.capacity >= selectedReservation.guests
    ).sort((a, b) => a.capacity - b.capacity);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`;
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-orange-100 text-orange-800',
      confirmed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`;
  };

  const getTableStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-100 border-green-300 text-green-800',
      occupied: 'bg-red-100 border-red-300 text-red-800',
      reserved: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    };
    return colors[status as keyof typeof colors];
  };

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold text-amber-800">Admin Reservasi</h1>
          <p className="text-gray-600">Kelola reservasi dan meja yang tersedia</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 mb-6 space-x-1 rounded-lg bg-amber-50">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'reservations'
                ? 'bg-amber-200 text-amber-800'
                : 'text-amber-600 hover:text-amber-800'
            }`}
            onClick={() => setActiveTab('reservations')}
          >
            Daftar Reservasi
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'tables'
                ? 'bg-amber-200 text-amber-800'
                : 'text-amber-600 hover:text-amber-800'
            }`}
            onClick={() => setActiveTab('tables')}
          >
            Status Meja
          </button>
        </div>

        {activeTab === 'reservations' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Reservations List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Reservasi Terbaru</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedReservation(reservation)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{reservation.customerName}</h3>
                          <span className={getStatusBadge(reservation.status)}>
                            {reservation.status}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">#{reservation.id}</span>
                      </div>

                      <div className="flex items-center mb-2 space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar size={16} />
                          <span>{reservation.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{reservation.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users size={16} />
                          <span>{reservation.guests} orang</span>
                        </div>
                        {reservation.tableNumber ? (
                          <div className="flex items-center space-x-1">
                            <MapPin size={16} />
                            <span>Meja {reservation.tableNumber}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-orange-600">
                            <MapPin size={16} />
                            <span>Belum ada meja</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={getPaymentStatusBadge(reservation.paymentStatus)}>
                          Pembayaran: {reservation.paymentStatus}
                        </span>
                        <span className="text-sm text-gray-500">{reservation.customerPhone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reservation Details */}
            <div className="lg:col-span-1">
              {selectedReservation ? (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Detail Reservasi</h2>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Nama Pelanggan
                      </label>
                      <p className="text-gray-900">{selectedReservation.customerName}</p>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        No. Telepon
                      </label>
                      <p className="text-gray-900">{selectedReservation.customerPhone}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Tanggal
                        </label>
                        <p className="text-gray-900">{selectedReservation.date}</p>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Waktu
                        </label>
                        <p className="text-gray-900">{selectedReservation.time}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Jumlah Tamu
                        </label>
                        <p className="text-gray-900">{selectedReservation.guests} orang</p>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Nomor Meja
                        </label>
                        <div className="flex items-center space-x-2">
                          {selectedReservation.tableNumber ? (
                            <p className="text-gray-900">Meja {selectedReservation.tableNumber}</p>
                          ) : (
                            <p className="text-orange-600">Belum dipilih</p>
                          )}
                          <button
                            className="flex items-center px-2 py-1 space-x-1 text-xs transition-colors rounded bg-amber-100 text-amber-800 hover:bg-amber-200"
                            onClick={() => setShowTableSelection(true)}
                          >
                            <Edit3 size={12} />
                            <span>{selectedReservation.tableNumber ? 'Ubah' : 'Pilih'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {selectedReservation.specialRequests && (
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Permintaan Khusus
                        </label>
                        <p className="text-gray-900">{selectedReservation.specialRequests}</p>
                      </div>
                    )}

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Status Pembayaran
                      </label>
                      <span className={getPaymentStatusBadge(selectedReservation.paymentStatus)}>
                        {selectedReservation.paymentStatus}
                      </span>
                    </div>

                    {selectedReservation.paymentProof && (
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Bukti Pembayaran
                        </label>
                        <button
                          className="flex items-center px-3 py-2 space-x-2 text-sm transition-colors rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200"
                          onClick={() => setShowPaymentProof(true)}
                        >
                          <Eye size={16} />
                          <span>Lihat Bukti Pembayaran</span>
                        </button>
                      </div>
                    )}

                    {selectedReservation.status === 'pending' && (
                      <div className="flex pt-4 space-x-2">
                        <button
                          className="flex items-center justify-center flex-1 px-4 py-2 space-x-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                          onClick={() => updateReservationStatus(selectedReservation.id, 'confirmed')}
                        >
                          <CheckCircle size={16} />
                          <span>Konfirmasi</span>
                        </button>
                        <button
                          className="flex items-center justify-center flex-1 px-4 py-2 space-x-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                          onClick={() => updateReservationStatus(selectedReservation.id, 'cancelled')}
                        >
                          <XCircle size={16} />
                          <span>Tolak</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-lg shadow-sm">
                  <div className="mb-4 text-gray-400">
                    <Calendar size={48} className="mx-auto" />
                  </div>
                  <p className="text-gray-500">Pilih reservasi untuk melihat detail</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Tables View */
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Status Meja</h2>
              <p className="mt-1 text-sm text-gray-600">
                Lihat ketersediaan meja saat ini
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className={`p-4 rounded-lg border-2 ${getTableStatusColor(table.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Meja {table.id}</h3>
                      <span className="px-2 py-1 text-xs font-medium bg-white bg-opacity-50 rounded-full">
                        {table.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users size={14} />
                        <span>{table.capacity} kursi</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} />
                        <span>{table.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 pt-4 mt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
                  <span className="text-sm text-gray-600">Tersedia</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
                  <span className="text-sm text-gray-600">Direservasi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
                  <span className="text-sm text-gray-600">Terisi</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Selection Modal */}
        {showTableSelection && selectedReservation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-4xl max-h-screen overflow-auto bg-white rounded-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pilih Meja untuk {selectedReservation.customerName}
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowTableSelection(false)}
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Jumlah tamu: <span className="font-medium">{selectedReservation.guests} orang</span>
                  </p>
                  {selectedReservation.specialRequests && (
                    <p className="text-sm text-gray-600">
                      Permintaan khusus: <span className="font-medium">{selectedReservation.specialRequests}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {getAvailableTables().map((table) => (
                    <div
                      key={table.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        table.id === selectedReservation.tableNumber
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                      onClick={() => assignTableToReservation(selectedReservation.id, table.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Meja {table.id}</h4>
                        {table.id === selectedReservation.tableNumber && (
                          <div className="px-2 py-1 text-xs font-medium rounded-full bg-amber-200 text-amber-800">
                            Terpilih
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>{table.capacity} kursi</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{table.location}</span>
                        </div>
                      </div>
                      {table.capacity >= selectedReservation.guests && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                            Sesuai kapasitas
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {getAvailableTables().length === 0 && (
                  <div className="py-8 text-center">
                    <div className="mb-4 text-gray-400">
                      <MapPin size={48} className="mx-auto" />
                    </div>
                    <p className="text-gray-500">
                      Tidak ada meja yang tersedia untuk {selectedReservation.guests} orang
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Proof Modal */}
        {showPaymentProof && selectedReservation?.paymentProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-2xl max-h-screen overflow-auto bg-white rounded-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Bukti Pembayaran</h3>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPaymentProof(false)}
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-4">
                <img
                  src={selectedReservation.paymentProof}
                  alt="Bukti Pembayaran"
                  className="w-full h-auto rounded-lg"
                />
                <div className="flex mt-4 space-x-2">
                  <button
                    className="flex items-center justify-center flex-1 px-4 py-2 space-x-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                    onClick={() => {
                      updateReservationStatus(selectedReservation.id, 'confirmed');
                      setShowPaymentProof(false);
                    }}
                  >
                    <CheckCircle size={16} />
                    <span>Konfirmasi Pembayaran</span>
                  </button>
                  <button
                    className="px-4 py-2 text-gray-800 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                    onClick={() => setShowPaymentProof(false)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffReservasi;
