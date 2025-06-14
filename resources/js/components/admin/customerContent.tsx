// components/CustomersContent.tsx - Updated Version
import React, { useState, useEffect } from 'react';
import { Plus, Upload, Users, Star, TrendingUp, Eye, Download, Shield, ShieldOff } from 'lucide-react';
import { router } from '@inertiajs/react';


interface CustomersContentProps {
  customers: any[];
  setCustomers: (customers: any[]) => void; // TAMBAH INI
  searchTerm: string;
  openModal: (type: string, data?: any) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

const CustomersContent: React.FC<CustomersContentProps> = ({
  customers = [],
  setCustomers, // TAMBAH INI
  searchTerm,
  openModal,
  getStatusColor,
  getStatusText
}) => {
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState({
    customerId: 0,
    customerName: '',
    isBlocked: false,
    action: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let filtered = customers;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(customer => {
        const name = customer.name || '';
        const phone = customer.phone || '';
        const email = customer.email || '';
        
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               phone.includes(searchTerm) ||
               email.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(customer => customer.status === filterStatus);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          break;
        case 'totalSpent':
          aVal = (a.totalSpent || 0) + (a.reservationSpent || 0);
          bVal = (b.totalSpent || 0) + (b.reservationSpent || 0);
          break;
        case 'lastOrder':
          aVal = new Date(a.lastActivityDate || '1970-01-01');
          bVal = new Date(b.lastActivityDate || '1970-01-01');
          break;
        case 'joinDate':
          aVal = new Date(a.joinDate || '1970-01-01');
          bVal = new Date(b.joinDate || '1970-01-01');
          break;
        default:
          aVal = a[sortBy] || '';
          bVal = b[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredCustomers(filtered);
  }, [searchTerm, customers, filterStatus, sortBy, sortOrder]);

 const handleToggleBlock = (customerId: number, customerName: string, isBlocked: boolean) => {
  const action = isBlocked ? 'membuka blokir' : 'memblokir';
  
  setConfirmData({
    customerId,
    customerName,
    isBlocked,
    action
  });
  setShowConfirmModal(true);
  };

const confirmToggleBlock = () => {
  setIsProcessing(true);
  
  router.patch(`/admin/users/${confirmData.customerId}/toggle-block`, {}, {
    preserveState: true,
    preserveScroll: true,
    onSuccess: (page) => {
      console.log(`Akun ${confirmData.customerName} berhasil ${confirmData.isBlocked ? 'dibuka blokirnya' : 'diblokir'}`);
      
      // Update state customers
      const updatedCustomers = customers.map(customer => 
        customer.id === confirmData.customerId 
          ? { 
              ...customer, 
              is_blocked: !customer.is_blocked,
              status: customer.is_blocked ? 'active' : 'blocked'
            }
          : customer
      );
      
      setCustomers(updatedCustomers);
      setShowConfirmModal(false);
      setIsProcessing(false);
    },
    onError: (errors) => {
      console.error('Error toggling block status:', errors);
      alert('Gagal mengubah status blokir!');
      setIsProcessing(false);
    }
  });
};

  const handleExport = () => {
    window.location.href = '/admin/customers/export';
  };

  const totalSpent = (customer: any) => {
    return customer.combinedTotalSpent || 0;
  };

  const formatRupiah = (amount: any) => {
  const safeAmount = Number(amount) || 0;
  
  if (isNaN(safeAmount)) {
    return 'Rp 0';
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(safeAmount);
};

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Data Pelanggan</h2>
          <p className="text-gray-600 text-sm sm:text-base">Kelola informasi dan data pelanggan</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{customers.length}</div>
              <div className="text-sm text-gray-600">Total Pelanggan</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{customers.filter(c => c.status === 'active').length}</div>
              <div className="text-sm text-gray-600">Pelanggan Aktif</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{customers.filter(c => c.status === 'blocked').length}</div>
              <div className="text-sm text-gray-600">Diblokir</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {customers.filter(c => totalSpent(c) > 1000000).length}
              </div>
              <div className="text-sm text-gray-600">Pelanggan Premium</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filter Status:</span>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="blocked">Diblokir</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Urutkan:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="name">Nama</option>
                <option value="totalSpent">Total Belanja</option>
                <option value="lastOrder">Terakhir Aktif</option>
                <option value="joinDate">Bergabung</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title={sortOrder === 'asc' ? 'Urutkan Descending' : 'Urutkan Ascending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:ml-auto">
            <span className="text-sm text-gray-600">
              Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan
            </span>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Mobile View */}
        <div className="lg:hidden">
          <div className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700">
                      {customer.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{customer.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{customer.phone}</p>
                        <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 flex-shrink-0 ${getStatusColor(customer.status)}`}>
                        {getStatusText(customer.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Pesanan: </span>
                        <span className="font-medium">{customer.totalOrders}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Reservasi: </span>
                        <span className="font-medium">{customer.totalReservations}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Total: </span>
                        <span className="font-medium">{formatRupiah(totalSpent(customer))}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => openModal('customer', customer)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Detail
                      </button>
                      <button 
                        onClick={() => handleToggleBlock(customer.id, customer.name, customer.is_blocked)}
                        className={`px-3 py-1 rounded text-xs flex items-center ${
                          customer.is_blocked 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {customer.is_blocked ? (
                          <>
                            <ShieldOff className="w-3 h-3 mr-1" />
                            Buka Blokir
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Blokir
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktivitas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Belanja</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terakhir Aktif</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {customer.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">Bergabung: {customer.joinDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.phone}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.totalOrders} pesanan</div>
                    <div className="text-sm text-gray-500">{customer.totalReservations} reservasi</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatRupiah(totalSpent(customer))}</div>
                    <div className="text-sm text-gray-500">
                      Order: {formatRupiah(customer.totalSpent || 0)} | 
                      Reservasi: {formatRupiah(customer.reservationSpent || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.lastActivityDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                      {getStatusText(customer.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openModal('customer', customer)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </button>
                      <button 
                        onClick={() => handleToggleBlock(customer.id, customer.name, customer.is_blocked)}
                        className={`px-3 py-1 rounded flex items-center ${
                          customer.is_blocked 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {customer.is_blocked ? (
                          <>
                            <ShieldOff className="w-4 h-4 mr-1" />
                            Buka Blokir
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-1" />
                            Blokir
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pelanggan</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' ? 'Tidak ada pelanggan yang sesuai dengan filter.' : 'Belum ada data pelanggan.'}
            </p>
          </div>
        )}
      </div>

        {/* Confirm Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${confirmData.isBlocked ? 'bg-green-100' : 'bg-red-100'}`}>
                      {confirmData.isBlocked ? (
                        <ShieldOff className="w-6 h-6 text-green-600" />
                      ) : (
                        <Shield className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {confirmData.isBlocked ? 'Buka Blokir Akun' : 'Blokir Akun'}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed">
                    Apakah Anda yakin ingin <strong>{confirmData.action}</strong> akun <strong>{confirmData.customerName}</strong>?
                  </p>
                  {!confirmData.isBlocked && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Akun yang diblokir tidak akan bisa login dan melakukan pemesanan.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-100">
                  <button
                    onClick={confirmToggleBlock}
                    disabled={isProcessing}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      confirmData.isBlocked 
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Memproses...
                      </div>
                    ) : (
                      `Ya, ${confirmData.isBlocked ? 'Buka Blokir' : 'Blokir'}`
                    )}
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}
    </div>
  );
};

export default CustomersContent;