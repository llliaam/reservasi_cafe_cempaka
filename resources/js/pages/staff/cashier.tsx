//cashier.tsx

import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

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

const CashierSystem: React.FC = () => {
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
    <div className="flex flex-1 w-full h-full">
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
            <h3 className="mb-4 text-xl font-semibold">Payment Method</h3>

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
                Cash Payment
              </button>
              <button
                onClick={() => setPaymentMethod('debit')}
                className={`w-full p-3 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'debit'
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Debit Card
              </button>
            </div>

            {paymentMethod === 'cash' && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Cash Amount Received
                </label>
                <input
                  type="text"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
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

export default CashierSystem;
