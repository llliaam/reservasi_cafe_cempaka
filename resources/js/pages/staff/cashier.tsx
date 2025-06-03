import React, { useState, useMemo } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X, Search, Filter, Download, Menu } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface Table {
  id: number;
  meja_name: string;
  capacity: number;
  location: string;
}

interface CashierSystemProps {
  menuItems?: Product[];
  availableTables?: Table[];
  auth?: { user: { id: number; name: string; } };
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
    className="p-3 transition-shadow bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md group"
    onClick={() => onAddToCart({ id, name, price, image: imgSrc })}
  >
    <div className="relative overflow-hidden rounded-lg mb-3">
      <img 
        src={imgSrc} 
        alt={name} 
        className="object-cover w-full h-24 sm:h-28 md:h-32 transition-transform group-hover:scale-105" 
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg"></div>
    </div>
    <h3 className="mb-1 text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2">{name}</h3>
    <p className="text-xs sm:text-sm font-medium text-orange-600">Rp{price.toLocaleString()}</p>
  </div>
);

const CashierSystem: React.FC<CashierSystemProps> = ({ 
  menuItems = [], 
  availableTables = [],
  auth 
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'debit' | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState<any>(null);
  const [showCart, setShowCart] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories from menu items
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(menuItems.map(item => item.category)));
    return ['all', ...uniqueCategories];
  }, [menuItems]);

  // Filter menu items based on search and category
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, selectedCategory]);

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
    setCustomerInfo({ name: '', phone: '', email: '' });
    setSelectedTable(null);
    setOrderType('dine_in');
    setShowConfirmModal(false);
    setShowSuccessModal(false);
    setCompletedOrderData(null);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const itemTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceFee = Math.round(itemTotal * 0.05);
  const subTotal = itemTotal + serviceFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const handleProcessOrder = () => {
    if (!customerInfo.name.trim()) {
      alert('Mohon masukkan nama customer!');
      return;
    }

    if (orderType === 'dine_in' && !selectedTable) {
      alert('Mohon pilih meja untuk dine in!');
      return;
    }

    if (paymentMethod === 'cash') {
      const cashValue = parseInt(cashAmount.replace(/\D/g, ''));
      if (cashValue < subTotal) {
        alert('Insufficient cash amount!');
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const confirmProcessOrder = () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    const totalAmount = itemTotal + serviceFee;
    const selectedTableData = availableTables.find(t => t.id === selectedTable);

    const orderData = {
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone || 'Walk-in Customer',
      customer_email: customerInfo.email,
      order_type: orderType,
      table_id: orderType === 'dine_in' ? selectedTable : null,
      cart_items: cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        special_instructions: ''
      })),
      subtotal: itemTotal,
      service_fee: serviceFee,
      total_amount: totalAmount,
      payment_method: paymentMethod === 'cash' ? 'cash' : 'debit_card',
      staff_id: auth?.user?.id,
      notes: ''
    };

    // Simulate API call - Replace this with actual router.post in real implementation
    setTimeout(() => {
      const orderCode = `OFF-${Date.now().toString().slice(-8)}`;
      const orderDate = new Date().toLocaleString('id-ID');
      
      const successOrderData = {
        order_code: orderCode,
        order_time: orderDate,
        order_type: orderType,
        order_type_label: orderType === 'dine_in' ? 'Makan di Tempat' : 'Bawa Pulang',
        status: 'confirmed',
        status_label: 'Dikonfirmasi',
        payment_method: paymentMethod === 'cash' ? 'cash' : 'debit_card',
        payment_method_label: paymentMethod === 'cash' ? 'Tunai' : 'Kartu Debit',
        payment_status: 'paid',
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone || 'Walk-in Customer',
        customer_email: customerInfo.email || '',
        table_name: selectedTableData?.meja_name || null,
        subtotal: itemTotal,
        service_fee: serviceFee,
        total_amount: totalAmount,
        items: cart.map(item => ({
          menu_name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
          special_instructions: ''
        })),
        cash_received: paymentMethod === 'cash' ? parseInt(cashAmount.replace(/\D/g, '')) : null,
        change_amount: paymentMethod === 'cash' ? change : null,
        staff_name: auth?.user?.name || 'Staff'
      };

      setCompletedOrderData(successOrderData);
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      setIsSubmitting(false);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return `Rp${amount.toLocaleString()}`;
  };

  const change = paymentMethod === 'cash' && cashAmount ?
    Math.max(0, parseInt(cashAmount.replace(/\D/g, '')) - subTotal) : 0;

  // PDF Generator Component
  const PDFBillGenerator = ({ orderData }: { orderData: any }) => {
    const generatePDF = async () => {
      alert('PDF generation feature would be implemented here');
    };

    return (
      <button
        onClick={generatePDF}
        className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors w-full justify-center"
      >
        <Download size={16} />
        <span>Download Bill</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Cempaka Cafe</h1>
        <button
          onClick={() => setShowCart(!showCart)}
          className="relative p-2 text-orange-600 bg-orange-50 rounded-lg"
        >
          <ShoppingCart size={20} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Menu Grid with Search */}
      <div className="flex-1 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-yellow-50 to-green-50">
        {/* Search and Filter Header */}
        <div className="mb-4 lg:mb-6 bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-orange-100">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all ${
                  showFilters ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter size={16} />
                Filter
              </button>
              
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={clearSearch}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Pills */}
          {(showFilters || selectedCategory !== 'all') && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category === 'all' ? 'Semua Menu' : category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results Info */}
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-600">
            <span>
              {filteredMenuItems.length} dari {menuItems.length} menu
              {searchTerm && (
                <span className="ml-1 font-medium">
                  untuk "{searchTerm}"
                </span>
              )}
            </span>
            {selectedCategory !== 'all' && (
              <span className="text-orange-600 font-medium">
                Kategori: {selectedCategory}
              </span>
            )}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="max-w-6xl mx-auto">
          {filteredMenuItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredMenuItems.map((item) => (
                <MenuItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  price={item.price}
                  imgSrc={`/images/poto_menu/${item.image}`}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">
                Tidak ada menu ditemukan
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-md px-4">
                {searchTerm 
                  ? `Tidak ada menu yang cocok dengan pencarian "${searchTerm}"`
                  : `Tidak ada menu dalam kategori "${selectedCategory}"`
                }
              </p>
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                Reset Pencarian
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Checkout Panel */}
      <div className="hidden lg:block bg-white border-l border-gray-200 shadow-lg w-80 xl:w-96">
        {/* Checkout Header */}
        <div className="p-4 bg-orange-100 border-b">
          <div className="flex items-center">
            <ShoppingCart className="mr-2 text-orange-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Pesanan Offline</h2>
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="flex items-center justify-center w-6 h-6 text-sm text-red-600 bg-red-100 rounded-full"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 font-medium text-center text-sm">{item.quantity}</span>
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
              <span className="text-gray-600">Service Fee (5%)</span>
              <span className="text-gray-800">{formatCurrency(serviceFee)}</span>
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

      {/* Mobile Cart Overlay */}
      {showCart && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setShowCart(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Mobile Cart Header */}
            <div className="flex items-center justify-between p-4 border-b bg-orange-100">
              <div className="flex items-center">
                <ShoppingCart className="mr-2 text-orange-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Pesanan</h3>
              </div>
              <button onClick={() => setShowCart(false)} className="p-1 text-gray-500">
                <X size={20} />
              </button>
            </div>

            {/* Mobile Cart Content */}
            <div className="flex flex-col h-full max-h-[calc(80vh-80px)]">
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No items in cart</p>
                    <p className="text-sm">Select items from menu to add</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center p-3 space-x-3 rounded-lg bg-gray-50">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-12 h-12 rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex items-center justify-center w-8 h-8 text-red-600 bg-red-100 rounded-full"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 font-medium text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex items-center justify-center w-8 h-8 text-green-600 bg-green-100 rounded-full"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex items-center justify-center w-8 h-8 ml-2 text-red-600 bg-red-100 rounded-full"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t bg-white">
                  {/* Totals */}
                  <div className="px-4 py-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Item Total</span>
                        <span className="text-gray-800">{formatCurrency(itemTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Fee (5%)</span>
                        <span className="text-gray-800">{formatCurrency(serviceFee)}</span>
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
                      onClick={() => {
                        handleCheckout();
                        setShowCart(false);
                      }}
                      className="w-full py-3 font-medium text-white transition-colors bg-orange-400 rounded-lg hover:bg-orange-500"
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-4xl mx-auto bg-white rounded-xl shadow-2xl max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-orange-500 to-orange-600">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Complete Order</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentMethod(null);
                  setCashAmount('');
                  setCustomerInfo({ name: '', phone: '', email: '' });
                  setSelectedTable(null);
                  setOrderType('dine_in');
                }}
                className="p-1 text-white transition-colors hover:bg-white hover:bg-opacity-20 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column - Customer & Order Info */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Customer Information */}
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium text-gray-800">Customer Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Customer Name *
                        </label>
                        <input
                          type="text"
                          placeholder="Enter customer name"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                          className="w-full p-2.5 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="Phone number (optional)"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                          className="w-full p-2.5 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="Email address (optional)"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                          className="w-full p-2.5 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Type Selection */}
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium text-gray-800">Order Type</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderType('dine_in')}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                          orderType === 'dine_in' 
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm sm:text-lg font-semibold">Dine In</div>
                          <div className="text-xs sm:text-sm opacity-75">Eat at restaurant</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('takeaway')}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                          orderType === 'takeaway' 
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm sm:text-lg font-semibold">Takeaway</div>
                          <div className="text-xs sm:text-sm opacity-75">Take to go</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Table Selection for Dine In */}
                  {orderType === 'dine_in' && (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium text-gray-800">Select Table</h4>
                      <select
                        value={selectedTable || ''}
                        onChange={(e) => setSelectedTable(Number(e.target.value))}
                        className="w-full p-2.5 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        <option value="">-- Choose Table --</option>
                        {availableTables.map(table => (
                          <option key={table.id} value={table.id}>
                            {table.meja_name} (Capacity: {table.capacity})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Right Column - Payment Info */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Order Summary */}
                  <div className="p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium text-orange-800">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Item Total</span>
                        <span className="font-medium">{formatCurrency(itemTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Service Fee (5%)</span>
                        <span className="font-medium">{formatCurrency(serviceFee)}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-orange-200">
                        <div className="flex justify-between">
                          <span className="text-base sm:text-lg font-semibold text-orange-800">Total</span>
                          <span className="text-lg sm:text-xl font-bold text-orange-600">{formatCurrency(subTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium text-gray-800">Payment Method</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                          paymentMethod === 'cash'
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm sm:text-base font-semibold">Cash Payment</div>
                            <div className="text-xs sm:text-sm opacity-75">Pay with cash</div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            paymentMethod === 'cash' 
                              ? 'border-orange-500 bg-orange-500' 
                              : 'border-gray-300'
                          }`}>
                            {paymentMethod === 'cash' && (
                              <div className="w-full h-full bg-white rounded-full scale-50"></div>
                            )}
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setPaymentMethod('debit')}
                        className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                          paymentMethod === 'debit'
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm sm:text-base font-semibold">Debit Card</div>
                            <div className="text-xs sm:text-sm opacity-75">Pay with card</div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            paymentMethod === 'debit' 
                              ? 'border-orange-500 bg-orange-500' 
                              : 'border-gray-300'
                          }`}>
                            {paymentMethod === 'debit' && (
                              <div className="w-full h-full bg-white rounded-full scale-50"></div>
                            )}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Cash Amount Input */}
                  {paymentMethod === 'cash' && (
                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="mb-3 text-base sm:text-lg font-medium text-green-800">Cash Payment Details</h4>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-green-700">
                          Cash Amount Received
                        </label>
                        <input
                          type="text"
                          value={cashAmount}
                          onChange={(e) => setCashAmount(e.target.value)}
                          placeholder="Enter cash amount"
                          className="w-full p-2.5 sm:p-3 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {change > 0 && (
                          <div className="mt-3 p-3 bg-green-100 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-green-800">Change to return:</span>
                              <span className="text-base sm:text-lg font-bold text-green-600">{formatCurrency(change)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentMethod(null);
                    setCashAmount('');
                    setCustomerInfo({ name: '', phone: '', email: '' });
                    setSelectedTable(null);
                    setOrderType('dine_in');
                  }}
                  className="flex-1 px-4 sm:px-6 py-3 text-sm sm:text-base text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessOrder}
                  disabled={isSubmitting || !customerInfo.name.trim() || (orderType === 'dine_in' && !selectedTable) || !paymentMethod}
                  className="flex-1 sm:flex-2 px-6 sm:px-8 py-3 text-sm sm:text-base text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    'Process Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-orange-100 rounded-full">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h3 className="text-base sm:text-lg font-semibold text-center text-gray-800 mb-2">
                Konfirmasi Pesanan
              </h3>
              
              <p className="text-sm sm:text-base text-center text-gray-600 mb-4 sm:mb-6">
                Apakah Anda yakin ingin memproses pesanan ini?
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium truncate ml-2">{customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-orange-600">
                    <span>Total:</span>
                    <span>{formatCurrency(subTotal)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmProcessOrder}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:bg-orange-300 transition-colors"
                >
                  {isSubmitting ? 'Processing...' : 'Ya, Proses'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && completedOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-lg mx-auto bg-white rounded-xl shadow-2xl">
            <div className="p-4 sm:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Pesanan Berhasil!</h3>
                <p className="text-sm sm:text-base text-gray-600">Order Code: {completedOrderData.order_code}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium truncate ml-2">{completedOrderData.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{formatCurrency(completedOrderData.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span className="font-medium">{completedOrderData.payment_method_label}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <PDFBillGenerator orderData={completedOrderData} />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    resetOrder();
                  }}
                  className="flex-1 px-4 py-2.5 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Pesanan Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierSystem;