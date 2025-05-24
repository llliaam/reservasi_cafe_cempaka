// components/CartSidebar.tsx
import React, { useState } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  total: number;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  total 
}) => {
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState('dine-in');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const tax = total * 0.1;
  const finalTotal = total + tax;

  const handleCheckout = () => {
    alert('Pesanan berhasil! Terima kasih.');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">🛒 Keranjang</h2>
            <p className="text-orange-100 text-sm">{cart.length} item</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Keranjang Kosong</h3>
              <p className="text-gray-600 mb-6">Yuk, pesan makanan favorit!</p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full font-semibold"
              >
                Mulai Pesan
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors"
                        >
                          −
                        </button>
                        <span className="font-semibold text-gray-800 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-gray-800">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Pemesan
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-0"
                />
              </div>

              {/* Order Type */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Jenis Pemesanan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setOrderType('dine-in')}
                    className={`p-3 rounded-xl border-2 text-center font-medium transition-all ${
                      orderType === 'dine-in'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    🍽️ Dine In
                  </button>
                  <button
                    onClick={() => setOrderType('takeaway')}  
                    className={`p-3 rounded-xl border-2 text-center font-medium transition-all ${
                      orderType === 'takeaway'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    🥡 Take Away
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Ringkasan</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Pajak (10%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-800">Total</span>
                      <span className="font-bold text-lg text-orange-600">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Button */}
              <button
                onClick={handleCheckout}
                disabled={!customerName.trim()}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  customerName.trim()
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {customerName.trim() ? '🎉 Pesan Sekarang' : 'Masukkan Nama Dulu'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;