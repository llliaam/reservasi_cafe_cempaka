// components/OrdersContent.tsx
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Check, Clock, AlertCircle, Filter, Download, RefreshCw,
  Eye, Edit3, Phone, XCircle, CheckCircle
} from 'lucide-react';

interface OrdersContentProps {
  orders: any[];
  searchTerm: string;
  openModal: (type: string, data?: any) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
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

  const exportData = () => {
  const csvContent = [
    ['ID Order', 'Nama Customer', 'Telepon', 'Items', 'Type', 'Total', 'Status', 'Tanggal'],
    ...filteredOrders.map(order => [
      order.id,
      order.customerName,
      order.phone,
      Array.isArray(order.items) ? order.items.join('; ') : order.service,
      order.type === 'takeaway' ? 'Takeaway' : 'Dine In',
      `Rp ${order.price.toLocaleString()}`,
      getStatusText(order.status),
      order.date
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
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
  }, [filterStatus, searchTerm, orders]);

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

      {/* Order Type Stats */}
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
                {orders.filter(o => o.type === 'dine-in').length} orders
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Type</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Takeaway Revenue</span>
              <span className="text-sm font-medium text-gray-900">
                Rp {orders.filter(o => o.type === 'takeaway').reduce((sum, o) => sum + o.price, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Dine In Revenue</span>
              <span className="text-sm font-medium text-gray-900">
                Rp {orders.filter(o => o.type === 'dine-in').reduce((sum, o) => sum + o.price, 0).toLocaleString()}
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
              Menampilkan {filteredOrders.length} dari {orders.length} order
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
              {filteredOrders.map((order) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rp {order.price.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => openModal('order', order)}
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
    </div>
  );
};

export default OrdersContent;