// components/OrdersContent.tsx
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Check, Clock, AlertCircle, Filter, Download, RefreshCw, X,
  Eye, Edit3, Phone, XCircle, CheckCircle
} from 'lucide-react';

interface OrdersContentProps {
  orders: any[];
  searchTerm: string;
  openModal: (type: string, data?: any) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  onUpdateStatus?: (orderId: string, status: string, staffId?: string) => void;
}

interface OrderData {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  items: string[] | string;
  service?: string;
  type: 'takeaway' | 'dine-in' | 'dine_in';
  status: string;
  price: number;
  date: string;
  time?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  paymentProof?: string;
  // Staff tracking fields
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

const OrdersContent: React.FC<OrdersContentProps> = ({
  orders = [],
  searchTerm,
  openModal,
  getStatusColor,
  getStatusText
}) => {
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedOrders, setPaginatedOrders] = useState([]);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const showImageInModal = (imageUrl: string) => {
    setImageUrl(imageUrl);
    setShowImageModal(true);
  };
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => {},
    type: 'danger'
  });

  const showConfirmAlert = (config: any) => {
    setAlertConfig(config);
    setShowAlert(true);
  };

  const handleOpenDetailModal = (order: OrderData) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedOrder(null);
    setShowDetailModal(false);
  };

  const exportData = () => {
  const csvHeaders = [
    'No',
    'ID Order',
    'Nama Customer', 
    'Telepon',
    'Email',
    'Jenis Pesanan',
    'Items/Menu',
    'Jumlah Item',
    'Total Pembayaran',
    'Status Pesanan',
    'Metode Pembayaran',
    'Status Pembayaran',
    'Tanggal Pesanan',
    'Waktu Pesanan',
    'Catatan Khusus'
  ];

  const csvData = [
    csvHeaders,
    ...filteredOrders.map((order, index) => [
      index + 1,
      order.id || '',
      order.customerName || '',
      order.phone || '',
      order.email || '',
      order.type === 'takeaway' ? 'Takeaway' : 
      order.type === 'dine-in' || order.type === 'dine_in' ? 'Dine In' : 'Delivery',
      Array.isArray(order.items) ? order.items.join('; ') : order.service || '',
      Array.isArray(order.items) ? order.items.length : 1,
      `Rp ${Number(order.price || 0).toLocaleString('id-ID')}`, // Format rupiah
      getStatusText(order.status),
      order.paymentMethod || 'Tidak Diketahui',
      order.paymentStatus || 'Pending',
      order.date || '',
      order.time || '',
      order.notes || ''
    ])
  ];

  const csvContent = csvData.map(row => 
    row.map(field => {
      const stringField = String(field || '');
      // Escape quotes and wrap in quotes if contains comma or quotes
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
  a.download = `laporan-pesanan-fnb-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
  let filtered = orders;
  
  if (filterStatus !== 'all') {
    filtered = filtered.filter(order => order.status === filterStatus);
  }
  
  if (searchTerm) {
    filtered = filtered.filter(order => 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  setFilteredOrders(filtered);
  
  // Pagination logic
  const total = Math.ceil(filtered.length / itemsPerPage);
  setTotalPages(total);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginated = filtered.slice(startIndex, endIndex);
  setPaginatedOrders(paginated);
  
  // Reset to page 1 if current page exceeds total pages
  if (currentPage > total && total > 0) {
    setCurrentPage(1);
  }
  }, [filterStatus, searchTerm, orders, currentPage, itemsPerPage]);

   const PaginationComponent = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} dari {filteredOrders.length} order
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                1
              </button>
              {startPage > 2 && <span className="text-sm text-gray-500">...</span>}
            </>
          )}
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-3 py-1 text-sm border rounded-md ${
                currentPage === number
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-sm text-gray-500">...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const DetailModal = ({ order, onClose }: { order: OrderData; onClose: () => void }) => {
  if (!order) return null;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
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

  // Tambahkan di awal komponen untuk debug
    useEffect(() => {
      console.log('Orders data:', orders);
      console.log('Completed orders:', orders.filter(o => o.status === 'completed'));
      console.log('Sample order price:', orders[0]?.price, typeof orders[0]?.price);
    }, [orders]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Detail Pesanan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Basic Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700">ID Pesanan</label>
            <p className="text-gray-900 font-mono">{order.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Pelanggan</label>
            <p className="text-gray-900">{order.customerName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">No. Telepon</label>
            <p className="text-gray-900">{order.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tipe Order</label>
            <p className="text-gray-900">
              {order.type === 'takeaway' ? 'Takeaway' : 'Dine In'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Total Harga</label>
            <p className="text-gray-900 font-semibold">Rp {Number(order.price || 0).toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700">Items</label>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            {Array.isArray(order.items) ? (
              <ul className="space-y-1">
                {order.items.map((item, index) => (
                  <li key={index} className="text-gray-900">• {item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-900">{order.items || order.service}</p>
            )}
          </div>
        </div>

        {/* Staff Tracking Section */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-3 block">Tracking Staff</label>
            <div className="space-y-3">
              {/* Order Creation */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">Pesanan Dibuat</p>
                  <p className="text-xs text-blue-700">
                    {order.createdBy ? 
                      `Oleh: ${order.createdBy.name} (${order.createdBy.role === 'customer' ? 'Customer' : 'Staff'})` : 
                      `Oleh: ${order.customerName} (Customer)`
                    }
                  </p>
                </div>
                <span className="text-xs text-blue-600">{order.date} {order.time || ''}</span>
              </div>

              {/* Confirmation - ONLY SHOW IF CONFIRMED */}
              {(order.status === 'confirmed' || order.status === 'preparing' || 
                order.status === 'ready' || order.status === 'completed') && order.confirmedBy && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-900">Pesanan Dikonfirmasi</p>
                    <p className="text-xs text-green-700">
                      Oleh: {order.confirmedBy.name} ({order.confirmedBy.role})
                    </p>
                  </div>
                  <span className="text-xs text-green-600">
                    {formatDateTime(order.confirmedBy.confirmedAt)}
                  </span>
                </div>
              )}

              {/* Show current status if not pending and not cancelled */}
              {order.status !== 'pending' && order.status !== 'cancelled' && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-orange-900">Status Saat Ini</p>
                    <p className="text-xs text-orange-700">
                      {getStatusText(order.status)}
                    </p>
                  </div>
                  <span className="text-xs text-orange-600">
                    {formatDateTime(order.confirmedBy?.confirmedAt || new Date().toISOString())}
                  </span>
                </div>
              )}

              {/* Cancellation */}
              {order.status === 'cancelled' && order.cancelledBy && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-red-900">Pesanan Dibatalkan</p>
                    <p className="text-xs text-red-700">
                      {order.cancelledBy.role === 'customer' ? 
                        'Oleh: Customer' : 
                        `Oleh: ${order.cancelledBy.name} (${order.cancelledBy.role})`
                      }
                    </p>
                    {order.cancelledBy.reason && (
                      <p className="text-xs text-red-600 mt-1">Alasan: {order.cancelledBy.reason}</p>
                    )}
                  </div>
                  <span className="text-xs text-red-600">
                    {formatDateTime(order.cancelledBy.cancelledAt)}
                  </span>
                </div>
              )}

              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Riwayat Status</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {order.statusHistory.map((history, index) => (
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

        {/* Payment Info */}
        {order.paymentMethod && (
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700">Metode Pembayaran</label>
            <p className="text-gray-900">{order.paymentMethod}</p>
            {order.paymentStatus && (
              <p className="text-sm text-gray-600">Status: {order.paymentStatus}</p>
            )}
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700">Catatan</label>
            <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{order.notes}</p>
          </div>
        )}

        {/* Payment Proof */}
        {order.paymentProof && (
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700">Bukti Pembayaran</label>
            <div className="mt-2">
              <img 
                src={order.paymentProof} 
                alt="Bukti Pembayaran"
                className="max-w-full h-auto max-h-64 rounded-lg border cursor-pointer"
                onClick={() => showImageInModal(order.paymentProof!)}
              />
              <p className="text-xs text-blue-600 mt-1 cursor-pointer" onClick={() => showImageInModal(order.paymentProof!)}>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Food & Beverage</h2>
          <p className="text-gray-600">Kelola pesanan takeaway dan dine-in dari pelanggan</p>
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

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
              <div className="text-sm text-gray-600">Total Order F&B</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'completed').length}</div>
              <div className="text-sm text-gray-600">Selesai</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'confirmed').length}</div>
              <div className="text-sm text-gray-600">Dikonfirmasi</div>
            </div>
          </div>
        </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'cancelled').length}</div>
              <div className="text-sm text-gray-600">Dibatalkan</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'pending').length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Type Stats - IMPROVED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order by Type</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Takeaway</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {orders.filter(o => o.type === 'takeaway').length} orders
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Dine In</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {orders.filter(o => o.type === 'dine-in' || o.type === 'dine_in').length} orders
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Type</h3>
          <div className="space-y-3">
            {(() => {
              // Filter hanya order yang completed untuk revenue
              const completedOrders = orders.filter(o => o.status === 'completed');
              
              // Hitung revenue takeaway
              const takeawayRevenue = completedOrders
                .filter(o => o.type === 'takeaway')
                .reduce((sum, o) => {
                  const price = Number(o.price) || 0;
                  return sum + price;
                }, 0);
              
              // Hitung revenue dine in (termasuk dine_in dan dine-in)
              const dineInRevenue = completedOrders
                .filter(o => o.type === 'dine-in' || o.type === 'dine_in')
                .reduce((sum, o) => {
                  const price = Number(o.price) || 0;
                  return sum + price;
                }, 0);
              
              // Total revenue
              const totalRevenue = takeawayRevenue + dineInRevenue;
              
              return (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Takeaway Revenue</span>
                    <span className="text-sm font-medium text-gray-900">
                      Rp {takeawayRevenue.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Dine In Revenue</span>
                    <span className="text-sm font-medium text-gray-900">
                      Rp {dineInRevenue.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-sm text-gray-900">Total Revenue</span>
                      <span className="text-sm text-green-600">
                        Rp {totalRevenue.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Debug info - hapus ini setelah testing */}
                  <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                    <div>Debug: Total completed orders: {completedOrders.length}</div>
                    <div>Takeaway completed: {completedOrders.filter(o => o.type === 'takeaway').length}</div>
                    <div>Dine In completed: {completedOrders.filter(o => o.type === 'dine-in' || o.type === 'dine_in').length}</div>
                  </div>
                </>
              );
            })()}
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
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="cancelled">Dibatalkan</option>
            <option value="completed">Selesai</option>
          </select>
          
          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-sm text-gray-600">
              Menampilkan {paginatedOrders.length} dari {filteredOrders.length} order
              {filteredOrders.length !== orders.length && ` (Total: ${orders.length})`}
            </span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-500">{order.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.items ? order.items.join(', ') : order.service}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.type === 'takeaway' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {order.type === 'takeaway' ? 'Takeaway' : 'Dine In'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Rp {Number(order.price).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleOpenDetailModal(order)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm flex items-center"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          {/* Pagination Component */}
          {totalPages > 1 && <PaginationComponent />}
      </div>
        {/* Confirmation Alert */}
        {showAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${
                  alertConfig.type === 'danger' ? 'bg-red-100' :
                  alertConfig.type === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  {alertConfig.type === 'danger' ? (
                    <XCircle className="w-6 h-6 text-red-600" />
                  ) : alertConfig.type === 'warning' ? (
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 break-words">{alertConfig.title}</h3>
              </div>
              <p className="text-gray-600 mb-6 break-words">{alertConfig.message}</p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={alertConfig.onConfirm}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                    alertConfig.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                    alertConfig.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {alertConfig.confirmText}
                </button>
                <button
                  onClick={() => setShowAlert(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedOrder && (
          <DetailModal 
            order={selectedOrder} 
            onClose={handleCloseDetailModal}
          />
        )}

        {/* Image Modal yang sudah ada */}
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

export default OrdersContent;