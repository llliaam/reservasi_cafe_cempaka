import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Search, Eye, Download, Package, Clock, User, Phone, CreditCard, Image, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import CopyOrderCode  from '@/components/copyOrderCode';
import PDFBillGenerator from '@/components/pdfBillGenerator';

// === INTERFACES ===
interface OrderItem {
  menu_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  special_instructions?: string;
}

interface Order {
  id: number;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  order_type: string;
  order_type_label: string;
  status: string;
  status_label: string;
  payment_method: string;
  payment_method_label: string;
  payment_status: string;
  total_amount: number;
  formatted_total: string;
  order_time: string;
  items_count: number;
  main_item: string;
  items: OrderItem[];
  payment_proof?: string;
}

interface OnlineOrdersPageProps {
  ordersData?: Order[];
}

// === ORDER DETAIL MODAL COMPONENT ===
const OrderDetailModal: React.FC<{
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  getStatusColor: (status: string) => string;
  getStatusDot: (status: string) => string;
}> = ({ order, isOpen, onClose, getStatusColor, getStatusDot }) => {
  // ✅ useForm dipindahkan ke dalam component
  const statusForm = useForm({
    status: '',
    notes: ''
  });
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  if (!isOpen || !order) return null;

  const handleDownloadBill = () => {
    // Generate bill content
    const billContent = `
===========================================
           CEMPAKA CAFE & RESTO
===========================================
Order: ${order.order_code}
Tanggal: ${order.order_time}
Customer: ${order.customer_name}
Phone: ${order.customer_phone}
Email: ${order.customer_email || '-'}
Type: ${order.order_type_label}
===========================================

ITEMS:
${order.items.map(item => 
  `${item.menu_name} x${item.quantity} - Rp ${item.subtotal.toLocaleString()}`
).join('\n')}

===========================================
TOTAL: ${order.formatted_total}
Payment: ${order.payment_method_label}
Status: ${order.status_label}
===========================================
        Terima kasih!
    `;

    const blob = new Blob([billContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill_${order.order_code}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // === FUNCTION UNTUK CEK APAKAH PERLU BUKTI PEMBAYARAN ===
  const requiresPaymentProof = () => {
    return order.payment_method !== 'cash';
  };

  // === FUNCTION UNTUK CEK STATUS BUTTONS ===
  const canConfirm = () => order.status === 'pending';
  const canReject = () => order.status === 'pending';
  const canComplete = () => ['confirmed', 'preparing', 'ready'].includes(order.status);

  const updateOrderStatus = (order: Order, status: 'confirmed' | 'cancelled' | 'completed') => {
    console.log('=== UPDATE ORDER STATUS ===', {
      orderId: order.id,
      currentStatus: order.status,
      newStatus: status,
      processing: statusForm.processing
    });

    if (statusForm.processing) {
      console.log('Status form already processing, skipping...');
      return;
    }

    const formData = {
      status: status,
      notes: status === 'cancelled' ? 'Ditolak oleh staff' : 'Dikonfirmasi oleh staff'
    };

    router.patch(`/staff/orders/${order.id}/status`, formData, {
      onBefore: () => {
        console.log('Starting status update request');
        return true;
      },
      onStart: () => {
        statusForm.processing = true;
      },
      onSuccess: (response) => {
        console.log('Status update successful:', response);
        statusForm.clearErrors();
        onClose(); // Close modal setelah success
      },
      onError: (errors) => {
        console.error('Error updating status:', errors);
      },
      onFinish: () => {
        statusForm.processing = false;
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Detail Pesanan</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Order Code</label>
                 <CopyOrderCode orderCode={order.order_code} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tanggal & Waktu</label>
                <p className="text-gray-900">{order.order_time}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tipe Order</label>
                <p className="text-gray-900">{order.order_type_label}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusDot(order.status)} mr-2`}></div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status_label}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Method</label>
                <p className="text-gray-900">{order.payment_method_label}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Amount</label>
                <p className="text-xl font-bold text-green-600">{order.formatted_total}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Informasi Customer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama</label>
                <p className="text-gray-900">{order.customer_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{order.customer_phone}</p>
              </div>
              {order.customer_email && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{order.customer_email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Items Pesanan ({order.items_count} item)
            </h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.menu_name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      {item.special_instructions && (
                        <p className="text-sm text-amber-600 mt-1">
                          <span className="font-medium">Note:</span> {item.special_instructions}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        Rp {item.subtotal.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        @ Rp {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
              
          {/* Payment & Total Summary */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Ringkasan Pembayaran
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Metode Pembayaran:</span>
                <span className="font-medium">{order.payment_method_label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status Pembayaran:</span>
                <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                  {order.payment_status === 'paid' ? 'Sudah Bayar' : 'Belum Bayar'}
                </span>
              </div>
              
              {/* === BUKTI PEMBAYARAN === */}
              {requiresPaymentProof() && (
                <div className="border-t border-orange-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bukti Pembayaran:</span>
                    {order.payment_proof ? (
                      <button
                        onClick={() => setIsImageModalOpen(true)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Image className="w-4 h-4" />
                        <span>Lihat Bukti</span>
                      </button>
                    ) : (
                      <span className="text-red-500 font-medium">Belum Upload</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="border-t border-orange-200 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">{order.formatted_total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === ACTION BUTTONS === */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Left side - Close button */}
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-last sm:order-first"
            >
              Tutup
            </button>

            {/* Right side - Action buttons */}
            <div className="flex flex-wrap gap-2 order-first sm:order-last">
              {/* Konfirmasi Button */}
              {canConfirm() && (
                <button
                  className="flex items-center justify-center px-4 py-2 space-x-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => updateOrderStatus(order, 'confirmed')}
                  disabled={statusForm.processing}
                >
                  {statusForm.processing && statusForm.data.status === 'confirmed' ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Mengkonfirmasi...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Konfirmasi</span>
                    </>
                  )}
                </button>
              )}

              {/* Tolak Button */}
              {canReject() && (
                <button
                  className="flex items-center justify-center px-4 py-2 space-x-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => updateOrderStatus(order, 'cancelled')}
                  disabled={statusForm.processing}
                >
                  {statusForm.processing && statusForm.data.status === 'cancelled' ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Membatalkan...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Tolak</span>
                    </>
                  )}
                </button>
              )}

              {/* Selesai Button */}
             {canComplete() && (
                <button
                  className="flex items-center justify-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => updateOrderStatus(order, 'completed')}
                  disabled={statusForm.processing}
                >
                  {statusForm.processing && statusForm.data.status === 'completed' ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Menyelesaikan...</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>Selesai</span>
                    </>
                  )}
                </button>
              )}

              {/* Download Bill Button */}
              <PDFBillGenerator orderData={order} />
            </div>
          </div>
        </div>
      </div>

      {/* === MODAL UNTUK LIHAT BUKTI PEMBAYARAN === */}
      {isImageModalOpen && order.payment_proof && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Bukti Pembayaran - {order.order_code}</h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <img
                src={order.payment_proof}
                alt="Bukti Pembayaran"
                className="max-w-full max-h-[70vh] mx-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/images/no-image.jpg';
                }}
              />
            </div>
            <div className="p-4 border-t border-gray-200 text-center">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// === MAIN COMPONENT ===
const OnlineOrdersPage: React.FC<OnlineOrdersPageProps> = ({ ordersData = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // === HELPER FUNCTIONS INSIDE COMPONENT ===
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'preparing':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'preparing':
      case 'confirmed':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'pending':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Filter orders based on search and status
  const filteredOrders = ordersData.filter(order => {
    const matchesSearch =
      !searchQuery ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery);

    const matchesStatus = !selectedStatus || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Handler functions
  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="h-full p-6 bg-gradient-to-br from-yellow-50 to-green-50">
      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        {/* Header & Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900">History Pesanan</h1>
            <p className="text-sm text-gray-600">Kelola semua pesanan customer</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan nama, phone, atau order code..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 bg-white"
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* Results count */}
          <div className="mt-3">
            <p className="text-sm text-gray-600">
              Menampilkan {filteredOrders.length} dari {ordersData.length} pesanan
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Order Code
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Items
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <span className="font-mono font-medium text-orange-600">
                      {order.order_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-gray-500 text-xs">{order.customer_phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <div>
                      <p className="font-medium">{order.main_item}</p>
                      <p className="text-gray-500 text-xs">
                        {order.items_count} item{order.items_count > 1 ? 's' : ''}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <span className="font-semibold text-green-600">
                      {order.formatted_total}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${getStatusDot(order.status)} mr-2`}></div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status_label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {order.order_type_label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-xs">{order.order_time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <button 
                      onClick={() => handleViewDetail(order)}
                      className="px-3 py-1 font-medium text-orange-800 transition-colors bg-orange-200 rounded-md hover:bg-orange-300 flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Detail</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Tidak ada pesanan yang ditemukan</p>
              <p className="text-gray-400 text-sm">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          )}
        </div>
        
        {/* Pagination (if needed in future) */}
        {filteredOrders.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Total: <span className="font-medium">{filteredOrders.length}</span> pesanan
              </div>
              {/* Future pagination controls can be added here */}
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal 
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        getStatusColor={getStatusColor}
        getStatusDot={getStatusDot}
      />
    </div>
  );
};

export default OnlineOrdersPage;