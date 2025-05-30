import React, { useState } from 'react';
import { ShoppingCart, User, Plus, Minus, Trash2, Search } from 'lucide-react';
import staffDashboard from './staffDashboard';


// Main component that controls page switching
const CafeSystem: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'cashier' | 'online' | 'history'>('cashier');

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <StaffDashboard />;
      case 'cashier':
        return <CashierPage />;
      case 'online':
        return <OnlineOrdersPage />;
      case 'history':
        return <HistoryPage />;
      default:
        return <CashierPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex flex-col justify-between w-56 p-4 shadow-lg bg-gradient-to-b from-yellow-50 to-green-50">
        {/* Logo and Title */}
        <div>
          <div className="flex items-center mb-8">
            <div className="flex items-center justify-center w-12 h-12 mr-3 rounded-full bg-amber-800">
              <div className="w-8 h-8 rounded-full bg-amber-600"></div>
            </div>
            <h1 className="font-serif text-xl italic text-amber-800">Cempaka Cafe & Resto</h1>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <button
              className={`w-full py-3 px-4 text-left rounded-lg shadow-sm ${
                currentPage === 'dashboard' ? 'bg-orange-300 text-white' : 'bg-amber-100 text-amber-800'
              } font-medium`}
              onClick={() => setCurrentPage('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`w-full py-3 px-4 text-left rounded-lg shadow-sm ${
                currentPage === 'cashier' ? 'bg-orange-300 text-white' : 'bg-amber-100 text-amber-800'
              } font-medium`}
              onClick={() => setCurrentPage('cashier')}
            >
              Cashier
            </button>
            <button
              className={`w-full py-3 px-4 text-left rounded-lg shadow-sm ${
                currentPage === 'online' ? 'bg-orange-300 text-white' : 'bg-amber-100 text-amber-800'
              } font-medium`}
              onClick={() => setCurrentPage('online')}
            >
              Online Orders
            </button>
            <button
              className={`w-full py-3 px-4 text-left rounded-lg shadow-sm ${
                currentPage === 'history' ? 'bg-orange-300 text-white' : 'bg-amber-100 text-amber-800'
              } font-medium`}
              onClick={() => setCurrentPage('history')}
            >
              History
            </button>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-12 h-12 mb-3 bg-gray-300 rounded-full">
            <User size={24} className="text-gray-600" />
          </div>
          <button className="w-full px-4 py-2 font-medium text-white bg-orange-400 rounded-lg shadow-sm">
            Sign Out
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {renderPage()}
      </div>
    </div>
  );
};

// Dashboard Page (Placeholder)
const StaffDashboard: React.FC = () => {
  return (
    <div className="h-full p-6 bg-gradient-to-br from-yellow-50 to-green-50">
      <h2 className="mb-6 text-2xl font-bold">Dashboard</h2>
      <p>Dashboard content coming soon...</p>
    </div>
  );
};


// Cashier Page
const CashierPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'debit' | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashAmount, setCashAmount] = useState('');

  const menuItems = [
    { id: 1, name: 'Cappuccino', price: 15000, imgSrc: '/api/placeholder/150/120' },
    { id: 2, name: 'Nasi Goreng Telor', price: 18000, imgSrc: '/api/placeholder/150/120' },
    { id: 3, name: 'Espresso', price: 12000, imgSrc: '/api/placeholder/150/120' },
    { id: 4, name: 'Nasi Ayam Penyet', price: 22000, imgSrc: '/api/placeholder/150/120' },
    { id: 5, name: 'Frappe', price: 20000, imgSrc: '/api/placeholder/150/120' },
    { id: 6, name: 'Indomie Bangladesh', price: 15000, imgSrc: '/api/placeholder/150/120' },
    { id: 7, name: 'Latte', price: 16000, imgSrc: '/api/placeholder/150/120' },
    { id: 8, name: 'Udang Keju', price: 25000, imgSrc: '/api/placeholder/150/120' },
    { id: 9, name: 'Kopi Hitam', price: 8000, imgSrc: '/api/placeholder/150/120' },
  ];

  const addToCart = (item: { id: number; name: string; price: number; image: string }) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: number, change: number) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const resetOrder = () => {
    setCart([]);
    setPaymentMethod(null);
    setCashAmount('');
  };

  const itemTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(itemTotal * 0.1); // 10% tax
  const subTotal = itemTotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const processPayment = () => {
    if (paymentMethod === 'cash') {
      const cashValue = parseInt(cashAmount.replace(/\D/g, ''));
      if (cashValue < subTotal) {
        alert('Insufficient cash amount!');
        return;
      }
    }

    // Process payment logic here
    alert(`Payment processed successfully via ${paymentMethod}!`);
    resetOrder();
    setShowPaymentModal(false);
  };

  const formatCurrency = (amount: number) => {
    return `Rp${amount.toLocaleString()}`;
  };

  const change = paymentMethod === 'cash' && cashAmount ?
    Math.max(0, parseInt(cashAmount.replace(/\D/g, '')) - subTotal) : 0;

  return (
    <div className="flex h-full">
      {/* Menu Grid */}
      <div className="flex-1 p-6 bg-gradient-to-br from-yellow-50 to-green-50">
        <div className="grid max-w-4xl grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <MenuItem
              key={item.id}
              {...item}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </div>

      {/* Checkout Panel */}
      <div className="bg-white border-l border-gray-200 shadow-lg w-80">
        {/* Checkout Header */}
        <div className="p-4 bg-orange-100 border-b">
          <div className="flex items-center">
            <ShoppingCart className="mr-2 text-orange-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Checkout</h2>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {cart.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No items in cart</p>
              <p className="text-sm">Select items from menu to add</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center p-3 space-x-3 rounded-lg bg-gray-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-12 h-12 rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="flex items-center justify-center w-6 h-6 text-sm text-red-600 bg-red-100 rounded-full"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 font-medium text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="flex items-center justify-center w-6 h-6 text-sm text-green-600 bg-green-100 rounded-full"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center justify-center w-6 h-6 ml-2 text-red-600 bg-red-100 rounded-full"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Item Total</span>
              <span className="text-gray-800">{formatCurrency(itemTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="text-gray-800">{formatCurrency(tax)}</span>
            </div>
            <div className="pt-2 mt-2 border-t">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-800">Sub Total</span>
                <span className="text-lg text-orange-600">{formatCurrency(subTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-3">
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3 font-medium text-white transition-colors bg-orange-400 rounded-lg hover:bg-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Check Out
          </button>
          <button
            onClick={resetOrder}
            className="w-full py-3 font-medium text-orange-500 transition-colors border-2 border-orange-300 rounded-lg hover:bg-orange-50"
          >
            Reset Order
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-w-full p-6 mx-4 bg-white rounded-lg w-96">
            <h3 className="mb-4 text-xl font-semibold text-gray-700">Payment Method</h3>

            <div className="mb-4">
              <p className="text-lg font-medium">Total: {formatCurrency(subTotal)}</p>
            </div>

            <div className="mb-6 space-y-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`w-full p-3 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
               <p className='text-gray-900'>Cash Payment</p>
              </button>
              <button
                onClick={() => setPaymentMethod('debit')}
                className={`w-full p-3 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'debit'
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <p className='text-gray-900'>Debit Card</p>
              </button>
            </div>

            {paymentMethod === 'cash' && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <p className='text-gray-900'>Cash Amount Received</p>
                </label>
                <input
                  type="text"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-black-100 focus:outline-none focus:border-orange-400"
                />
                {change > 0 && (
                  <p className="mt-2 font-medium text-green-600">
                    Change: {formatCurrency(change)}
                  </p>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentMethod(null);
                  setCashAmount('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                disabled={!paymentMethod || (paymentMethod === 'cash' && !cashAmount)}
                className="flex-1 px-4 py-2 text-white bg-orange-400 rounded-lg hover:bg-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Online Orders Page
const OnlineOrdersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const onlineOrders = [
    { id: '001', customer: 'Benediktiam', category: 'Per Orang / 6 Orang', status: 'Selesai' },
    { id: '002', customer: 'Anqilyas', category: 'Per Orang / 15 Orang', status: 'Sedang berjalan' },
    { id: '003', customer: 'Rifqiylari', category: 'Ruangan Acara', status: 'Batal' },
    { id: '004', customer: 'Jasmid', category: 'Ruangan Acara', status: 'Sedang berjalan' },
    { id: '005', customer: 'Kiranisa', category: 'Per Orang / 2 Orang', status: 'Sedang berjalan' },
  ];

  const filteredOrders = onlineOrders.filter(order => {
    const matchesSearch = !searchQuery ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.includes(searchQuery);

    const matchesStatus = !selectedStatus || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai':
        return 'bg-green-100 text-green-800';
      case 'Sedang berjalan':
        return 'bg-yellow-100 text-yellow-800';
      case 'Batal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Selesai':
        return 'bg-green-500';
      case 'Sedang berjalan':
        return 'bg-yellow-500';
      case 'Batal':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full p-6 bg-gradient-to-br from-yellow-50 to-green-50">
      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Nama Pemesan
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Kategori
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {order.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${getStatusDot(order.status)} mr-2`}></div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <button className="px-3 py-1 font-medium text-orange-800 transition-colors bg-orange-200 rounded-md hover:bg-orange-300">
                      Lihat Detail
                    </button>
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

// History Page
const HistoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const historyOrders = [
    { id: '005', customer: 'Irzamara', category: 'Per Orang / 18 Orang', status: 'Selesai', date: '2025-05-15' },
    { id: '004', customer: 'Jasmid', category: 'Ruangan Acara', status: 'Selesai', date: '2025-05-12' },
    { id: '001', customer: 'Benediktiam', category: 'Per Orang / 6 Orang', status: 'Selesai', date: '2025-05-10' },
    { id: '003', customer: 'Rifqiylari', category: 'Ruangan Acara', status: 'Batal', date: '2025-05-08' },
    { id: '002', customer: 'Anqilyas', category: 'Per Orang / 15 Orang', status: 'Selesai', date: '2025-05-05' },
  ];

  const filteredOrders = historyOrders.filter(order => {
    const matchesSearch = !searchQuery ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.includes(searchQuery);

    const matchesCategory = !selectedCategory || order.category.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai':
        return 'bg-green-100 text-green-800';
      case 'Batal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Selesai':
        return 'bg-green-500';
      case 'Batal':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full p-6 bg-gradient-to-br from-yellow-50 to-green-50">
      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Nama Pemesan
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Kategori
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {order.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${getStatusDot(order.status)} mr-2`}></div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <button className="px-3 py-1 font-medium text-orange-800 transition-colors bg-orange-200 rounded-md hover:bg-orange-300">
                      Lihat Detail
                    </button>
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

// Helper Components
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface MenuItemProps {
  id: number;
  name: string;
  price: number;
  imgSrc: string;
  onAddToCart: (item: { id: number; name: string; price: number; image: string }) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ id, name, price, imgSrc, onAddToCart }) => (
  <div
    className="p-3 transition-shadow bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md"
    onClick={() => onAddToCart({ id, name, price, image: imgSrc })}
  >
    <img src={imgSrc} alt={name} className="object-cover w-full h-32 mb-3 rounded-lg" />
    <h3 className="mb-1 text-sm font-semibold text-gray-800">{name}</h3>
    <p className="text-sm font-medium text-gray-600">Rp{price.toLocaleString()}</p>
  </div>
);

export default CafeSystem;
