// MenuPage.tsx - Refactored without API calls, using props and form submissions
import React, { useState } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import { type SharedData } from '@/types';
import Header from '@/components/header';
import ProductGrid from '@/components/productGrid';
import CartSidebar from '@/components/cartSidebar';
import MenuReviews from '@/components/menuReview';
import { 
    Star, 
    MessageCircle, 
    Eye,
    X,
    ArrowLeft
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  review_count?: number;
  isPopular?: boolean;
  description?: string;
}

interface CartItem extends Product {
  quantity: number;
  special_instructions?: string;
}

interface PageProps extends SharedData {
  menuItems: Product[];
  categories: { id: number; name: string; slug: string; }[];
  favoriteIds: number[];
}

const MenuPage: React.FC = () => {
  const { auth, menuItems, categories, favoriteIds, flash } = usePage<PageProps>().props;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');

  // Form for order submission
  const { data, setData, post, processing, errors, reset } = useForm({
    customer_name: auth?.user?.name || '',
    customer_phone: '',
    customer_email: auth?.user?.email || '',
    order_type: 'dine_in',
    delivery_address: '',
    notes: '',
    cart_items: [],
    subtotal: 0,
    delivery_fee: 0,
    service_fee: 0,
    total_amount: 0,
    payment_method: 'cash'
  });

  // Add categories list with "All Menu" option
  const allCategories = ['All Menu', ...categories.map(cat => cat.name)];

  // Filter products based on search and category
  const filteredProducts = menuItems.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Menu' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Show product detail with reviews
  const showProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  // Add to cart
  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const updateCartInstructions = (productId: number, instructions: string) => {
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, special_instructions: instructions }
        : item
    ));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate fees
  const deliveryFee = orderType === 'delivery' ? 10000 : 0;
  const serviceFee = Math.round(cartTotal * 0.05); // 5% service fee
  const totalAmount = cartTotal + deliveryFee + serviceFee;

  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Silakan pilih menu terlebih dahulu sebelum melakukan checkout.');
      return;
    }
    
    if (!auth?.user) {
      window.location.href = '/login';
      return;
    }

    setShowCheckout(true);
  };

  // Handle order submission
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!data.customer_name || !data.customer_phone || !data.customer_email) {
      alert('Mohon lengkapi semua informasi pelanggan yang diperlukan.');
      return;
    }

    if (orderType === 'delivery' && !data.delivery_address) {
      alert('Mohon masukkan alamat pengiriman untuk pesanan delivery.');
      return;
    }

    // Update form data
    setData({
      ...data,
      order_type: orderType,
      cart_items: cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        special_instructions: item.special_instructions || null
      })),
      subtotal: cartTotal,
      delivery_fee: deliveryFee,
      service_fee: serviceFee,
      total_amount: totalAmount
    });

    // Submit form
    post('/orders', {
      onSuccess: () => {
        setCart([]);
        setShowCheckout(false);
        setIsCartOpen(false);
        reset();
      },
      onError: () => {
        // Errors will be shown via Laravel validation
      }
    });
  };

  const renderStars = (rating: number, reviewCount?: number) => {
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                index < Math.floor(rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 ml-1">
          ({reviewCount || 0})
        </span>
      </div>
    );
  };

  return (
    <>
      <Head title="Menu - Cempaka Cafe" />
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Header 
          cartCount={cartCount} 
          onCartClick={() => setIsCartOpen(true)} 
        />
        
        {/* Flash Messages */}
        {flash?.success && (
          <div className="container mx-auto px-4 pt-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {flash.success}
            </div>
          </div>
        )}

        {flash?.error && (
          <div className="container mx-auto px-4 pt-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {flash.error}
            </div>
          </div>
        )}
        
        <main className="container mx-auto px-4 py-8">
          {/* Search & Category */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
              <input
                type="text"
                placeholder="Cari menu favorit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-orange-400 focus:ring-0"
              />
            </div>
            
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Use ProductGrid Component */}
          <ProductGrid 
            products={filteredProducts}
            onAddToCart={handleAddToCart}
            onShowDetail={showProductDetails}
          />
        </main>

        {/* Product Detail Modal with Reviews */}
        {showProductDetail && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <button
                  onClick={() => setShowProductDetail(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </button>
                <button 
                  onClick={() => setShowProductDetail(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                {/* Product Info */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <img
                      src={selectedProduct.image || `https://via.placeholder.com/400x300/fbbf24/ffffff?text=${encodeURIComponent(selectedProduct.name)}`}
                      alt={selectedProduct.name}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {selectedProduct.name}
                    </h2>
                    
                    <div className="mb-4">
                      {renderStars(selectedProduct.rating, selectedProduct.review_count)}
                    </div>
                    
                    <div className="text-3xl font-bold text-orange-600 mb-4">
                      Rp {selectedProduct.price.toLocaleString('id-ID')}
                    </div>
                    
                    {selectedProduct.description && (
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    )}
                    
                    <button
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        setShowProductDetail(false);
                      }}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-6 rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Tambah ke Keranjang
                    </button>
                  </div>
                </div>
                
                {/* Reviews Section */}
                <MenuReviews 
                  menuItemId={selectedProduct.id}
                  menuItemName={selectedProduct.name}
                />
              </div>
            </div>
          </div>
        )}

        <CartSidebar 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={updateCartQuantity}
          onUpdateInstructions={updateCartInstructions}
          total={cartTotal}
          onCheckout={handleCheckout}
        />

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Checkout</h2>
                  <button 
                    onClick={() => setShowCheckout(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  {/* Show validation errors */}
                  {errors.order && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {errors.order}
                    </div>
                  )}

                  {/* Order Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipe Pesanan</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['dine_in', 'takeaway', 'delivery'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setOrderType(type as any);
                            setData('order_type', type);
                          }}
                          className={`p-2 text-xs rounded-lg border ${
                            orderType === type 
                              ? 'bg-orange-500 text-white border-orange-500' 
                              : 'bg-white text-gray-700 border-gray-300'
                          }`}
                        >
                          {type === 'dine_in' ? 'Makan di Tempat' : 
                           type === 'takeaway' ? 'Bawa Pulang' : 'Delivery'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nama Lengkap *"
                      value={data.customer_name}
                      onChange={(e) => setData('customer_name', e.target.value)}
                      className={`w-full p-3 border rounded-lg ${errors.customer_name ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.customer_name && (
                      <p className="text-red-500 text-sm">{errors.customer_name}</p>
                    )}

                    <input
                      type="tel"
                      placeholder="No. Telepon *"
                      value={data.customer_phone}
                      onChange={(e) => setData('customer_phone', e.target.value)}
                      className={`w-full p-3 border rounded-lg ${errors.customer_phone ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.customer_phone && (
                      <p className="text-red-500 text-sm">{errors.customer_phone}</p>
                    )}

                    <input
                      type="email"
                      placeholder="Email *"
                      value={data.customer_email}
                      onChange={(e) => setData('customer_email', e.target.value)}
                      className={`w-full p-3 border rounded-lg ${errors.customer_email ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.customer_email && (
                      <p className="text-red-500 text-sm">{errors.customer_email}</p>
                    )}
                    
                    {orderType === 'delivery' && (
                      <>
                        <textarea
                          placeholder="Alamat Pengiriman *"
                          value={data.delivery_address}
                          onChange={(e) => setData('delivery_address', e.target.value)}
                          className={`w-full p-3 border rounded-lg ${errors.delivery_address ? 'border-red-500' : ''}`}
                          rows={3}
                          required
                        />
                        {errors.delivery_address && (
                          <p className="text-red-500 text-sm">{errors.delivery_address}</p>
                        )}
                      </>
                    )}
                    
                    <textarea
                      placeholder="Catatan (opsional)"
                      value={data.notes}
                      onChange={(e) => setData('notes', e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      rows={2}
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Ringkasan Pesanan</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal ({cartCount} item)</span>
                        <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                      </div>
                      {deliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span>Ongkir</span>
                          <span>Rp {deliveryFee.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Biaya Layanan</span>
                        <span>Rp {serviceFee.toLocaleString('id-ID')}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className={`w-full py-3 rounded-lg font-medium ${
                      processing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {processing ? 'Memproses...' : 'Buat Pesanan'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-full shadow-2xl z-40"
          >
            🛒 {cartCount}
          </button>
        )}
      </div>
    </>
  );
};

export default MenuPage;