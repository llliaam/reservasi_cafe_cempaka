// MenuPage.tsx - Updated with Favorites functionality
import React, { useState } from 'react';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import Navbar from '@/components/navbar';
import ProductGrid from '@/components/productGrid';
import CartSidebar from '@/components/cartSidebar';
import MenuReviews from '@/components/menuReview';
import {
    Star,
    MessageCircle,
    Eye,
    X,
    ArrowLeft,
    Heart
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderData, setSuccessOrderData] = useState<{
    orderCode: string;
    estimatedTime?: string;
    paymentMethod: string;
    total: number;
  } | null>(null);

  // State untuk favorite menu IDs
  const [userFavorites, setUserFavorites] = useState<number[]>(favoriteIds || []);

  // Function to get correct menu image path
  const getMenuImagePath = (imageFilename: string) => {
    if (!imageFilename) {
      return "/images/poto_menu/default-menu.jpg";
    }

    if (imageFilename.startsWith('http')) {
      return imageFilename;
    }

    return `/images/poto_menu/${imageFilename}`;
  };

  // Function untuk fallback gambar yang gagal load
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, menuName: string) => {
    const target = e.target as HTMLImageElement;

    // Coba fallback ke gambar default dulu
    if (!target.src.includes('default-menu.jpg')) {
      target.src = '/images/poto_menu/default-menu.jpg';
      return;
    }

    // Jika default-menu.jpg juga gagal, buat simple colored div
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent && !parent.querySelector('.fallback-div')) {
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'absolute inset-0 flex items-center justify-center text-lg font-bold text-white bg-yellow-400 fallback-div';
      const initials = menuName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
      fallbackDiv.textContent = initials || 'M';
      parent.appendChild(fallbackDiv);
    }
  };

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

  // Add categories list with "All Menu" and "Favourites" options
  const allCategories = ['All Menu', 'Favourites', ...categories.map(cat => cat.name)];

// Replace your existing toggleFavorite function with this fixed version:

const toggleFavorite = async (menuItemId: number, e?: React.MouseEvent) => {
  if (e) {
    e.stopPropagation(); // Prevent triggering product detail modal
  }

  if (!auth?.user) {
    router.visit('/login');
    return;
  }

  try {
    // Optimistic update
    const isFavorited = userFavorites.includes(menuItemId);
    if (isFavorited) {
      setUserFavorites(prev => prev.filter(id => id !== menuItemId));
    } else {
      setUserFavorites(prev => [...prev, menuItemId]);
    }

    // Send request to server using Inertia's router.post
    router.post('/favorites/toggle', {
      menu_item_id: menuItemId  // Make sure this matches your backend expectation
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: (page) => {
        // Update favorites from server response if available
        if (page.props.favoriteIds) {
          setUserFavorites(page.props.favoriteIds);
        }
      },
      onError: (errors) => {
        console.error('Favorite toggle error:', errors);
        // Revert the optimistic update on error
        if (isFavorited) {
          setUserFavorites(prev => [...prev, menuItemId]);
        } else {
          setUserFavorites(prev => prev.filter(id => id !== menuItemId));
        }

        // Show user-friendly error message
        alert('Gagal mengubah status favorit. Silakan coba lagi.');
      }
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    // Revert optimistic update on catch
    const isFavorited = userFavorites.includes(menuItemId);
    if (isFavorited) {
      setUserFavorites(prev => [...prev, menuItemId]);
    } else {
      setUserFavorites(prev => prev.filter(id => id !== menuItemId));
    }

    alert('Terjadi kesalahan. Silakan coba lagi.');
  }
};

  // Filter products based on search and category
  const filteredProducts = menuItems.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesCategory = true;
    if (selectedCategory === 'All Menu') {
      matchesCategory = true;
    } else if (selectedCategory === 'Favourites') {
      matchesCategory = userFavorites.includes(product.id);
    } else {
      matchesCategory = product.category === selectedCategory;
    }

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

    if (cart.length === 0) {
      alert('Keranjang masih kosong. Silakan pilih menu terlebih dahulu.');
      return;
    }

    // Validation untuk payment proof jika bukan cash
    if (data.payment_method !== 'cash' && !data.payment_proof) {
      alert('Mohon upload bukti pembayaran untuk metode pembayaran online.');
      return;
    }

    // Prepare FormData untuk file upload
    const formData = new FormData();

    // Add basic order data
    formData.append('customer_name', data.customer_name);
    formData.append('customer_phone', data.customer_phone);
    formData.append('customer_email', data.customer_email);
    formData.append('order_type', orderType);
    formData.append('delivery_address', data.delivery_address || '');
    formData.append('notes', data.notes || '');
    formData.append('subtotal', cartTotal.toString());
    formData.append('delivery_fee', deliveryFee.toString());
    formData.append('service_fee', serviceFee.toString());
    formData.append('total_amount', totalAmount.toString());
    formData.append('payment_method', data.payment_method);

    // Add cart items
    cart.forEach((item, index) => {
      formData.append(`cart_items[${index}][id]`, item.id.toString());
      formData.append(`cart_items[${index}][quantity]`, item.quantity.toString());
      formData.append(`cart_items[${index}][special_instructions]`, item.special_instructions || '');
    });

    // Add payment proof if exists
    if (data.payment_proof) {
      formData.append('payment_proof', data.payment_proof);
    }

    console.log('Submitting order with payment...');

    // Submit menggunakan router.post dengan FormData
    router.post('/orders', formData, {
      forceFormData: true,
      onStart: () => {
        console.log('Starting order submission...');
      },
      onSuccess: (page) => {
        console.log('Order success:', page);

        // Set success data untuk modal
        setSuccessOrderData({
          orderCode: 'ORD-' + Date.now(), // Fallback, seharusnya dari response
          estimatedTime: '20-30 menit', // Fallback, seharusnya dari response
          paymentMethod: data.payment_method,
          total: totalAmount
        });

        // Reset form dan tutup checkout
        setCart([]);
        setShowCheckout(false);
        setIsCartOpen(false);
        reset();

        // Show success modal
        setShowSuccessModal(true);
      },
      onError: (errors) => {
        console.log('Order errors:', errors);
      },
      onFinish: () => {
        console.log('Order submission finished');
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
        <span className="ml-1 text-sm text-gray-600">
          ({reviewCount || 0})
        </span>
      </div>
    );
  };

  // Enhanced ProductGrid component with favorite functionality
  const EnhancedProductGrid = ({ products }: { products: Product[] }) => {
    if (products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 text-6xl">
            {selectedCategory === 'Favourites' ? '💝' : '🔍'}
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-700">
            {selectedCategory === 'Favourites'
              ? 'Belum ada menu favorit'
              : 'Menu tidak ditemukan'}
          </h3>
          <p className="text-gray-500">
            {selectedCategory === 'Favourites'
              ? 'Tekan ikon ❤️ pada menu untuk menambahkan ke favorit'
              : 'Coba gunakan kata kunci lain atau pilih kategori berbeda'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="relative overflow-hidden transition-all duration-300 bg-white shadow-lg rounded-2xl hover:shadow-xl hover:-translate-y-1 group"
          >
            {/* Favorite Button */}
            <button
              onClick={(e) => toggleFavorite(product.id, e)}
              className="absolute z-10 p-2 transition-all duration-200 bg-white rounded-full shadow-lg top-3 right-3 hover:scale-110"
              title={userFavorites.includes(product.id) ? 'Hapus dari favorit' : 'Tambah ke favorit'}
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-200 ${
                  userFavorites.includes(product.id)
                    ? 'text-red-500 fill-current'
                    : 'text-gray-400 hover:text-red-400'
                }`}
              />
            </button>

            {/* Product Image */}
            <div
              className="relative h-48 overflow-hidden cursor-pointer"
              onClick={() => showProductDetails(product)}
            >
              <img
                src={getMenuImagePath(product.image)}
                alt={product.name}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                onError={(e) => handleImageError(e, product.name)}
              />

              {/* View Details Overlay */}
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-30 group-hover:opacity-100">
                <div className="p-2 text-white transition-transform duration-300 transform scale-75 bg-black bg-opacity-50 rounded-full group-hover:scale-100">
                  <Eye className="w-5 h-5" />
                </div>
              </div>

              {/* Popular Badge */}
              {product.isPopular && (
                <div className="absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full top-3 left-3">
                  Popular
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="mb-2">
                <span className="px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-full">
                  {product.category}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-2">
                {product.name}
              </h3>

              <div className="mb-3">
                {renderStars(product.rating, product.review_count)}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-orange-600">
                  Rp {product.price.toLocaleString('id-ID')}
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-orange-500 rounded-lg hover:bg-orange-600 hover:shadow-lg"
                >
                  + Keranjang
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Head title="Menu - Cempaka Cafe" />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navbar
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
        />

        {/* Flash Messages */}
        {flash?.success && (
          <div className="container px-4 pt-4 mx-auto">
            <div className="px-4 py-3 mb-4 text-green-700 bg-green-100 border border-green-400 rounded">
              {flash.success}
            </div>
          </div>
        )}

        {flash?.error && (
          <div className="container px-4 pt-4 mx-auto">
            <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
              {flash.error}
            </div>
          </div>
        )}

        <main className="container px-4 py-8 mx-auto">
          {/* Search & Category */}
          <div className="mb-8">
            <div className="p-4 mb-4 bg-white shadow-lg rounded-2xl">
             <input
              type="text"
              placeholder="Cari menu favorit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 text-black border-2 border-gray-100 rounded-xl focus:border-orange-400 focus:ring-0"
            />
            </div>

            <div className="flex pb-4 space-x-4 overflow-x-auto">
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {category === 'Favourites' && (
                    <Heart className={`w-4 h-4 ${selectedCategory === category ? 'fill-current' : ''}`} />
                  )}
                  {category}
                  {category === 'Favourites' && userFavorites.length > 0 && (
                    <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                      selectedCategory === category
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'bg-orange-100 text-orange-600'
                    }`}>
                      {userFavorites.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Product Grid */}
          <EnhancedProductGrid products={filteredProducts} />
        </main>

        {/* Product Detail Modal with Reviews */}
        {showProductDetail && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b border-gray-200">
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
                <div className="grid gap-8 mb-8 md:grid-cols-2">
                  <div className="relative">
                    <img
                      src={getMenuImagePath(selectedProduct.image)}
                      alt={selectedProduct.name}
                      className="object-cover w-full h-64 rounded-xl"
                      onError={(e) => handleImageError(e, selectedProduct.name)}
                    />

                    {/* Favorite Button in Modal */}
                    <button
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      className="absolute p-3 transition-all duration-200 bg-white rounded-full shadow-lg top-4 right-4 hover:scale-110"
                    >
                      <Heart
                        className={`w-6 h-6 transition-colors duration-200 ${
                          userFavorites.includes(selectedProduct.id)
                            ? 'text-red-500 fill-current'
                            : 'text-gray-400 hover:text-red-400'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">
                      {selectedProduct.name}
                    </h2>

                    <div className="mb-4">
                      {renderStars(selectedProduct.rating, selectedProduct.review_count)}
                    </div>

                    <div className="mb-4 text-3xl font-bold text-orange-600">
                      Rp {selectedProduct.price.toLocaleString('id-ID')}
                    </div>

                    {selectedProduct.description && (
                      <p className="mb-6 leading-relaxed text-gray-600">
                        {selectedProduct.description}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleFavorite(selectedProduct.id)}
                        className={`px-6 py-3 font-medium transition-all duration-200 rounded-xl flex items-center gap-2 ${
                          userFavorites.includes(selectedProduct.id)
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${userFavorites.includes(selectedProduct.id) ? 'fill-current' : ''}`} />
                        {userFavorites.includes(selectedProduct.id) ? 'Favorit' : 'Tambah Favorit'}
                      </button>

                      <button
                        onClick={() => {
                          handleAddToCart(selectedProduct);
                          setShowProductDetail(false);
                        }}
                        className="flex-1 px-6 py-3 font-medium text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl hover:from-orange-600 hover:to-amber-600 hover:shadow-xl"
                      >
                        Tambah ke Keranjang
                      </button>
                    </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Checkout</h2>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitOrder} encType="multipart/form-data">
                  <div className="space-y-4">
                    {/* Show validation errors */}
                    {errors.order && (
                      <div className="px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded">
                        {errors.order}
                      </div>
                    )}

                    {/* Order Type */}
                    <div>
                      <label className="block mb-2 text-sm font-medium">Tipe Pesanan</label>
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
                        <p className="text-sm text-red-500">{errors.customer_name}</p>
                      )}

                      <input
                        type="tel"
                        placeholder="No. Telepon *"
                        value={data.customer_phone}
                        onChange={(e) => setData('customer_phone', e.target.value)}
                        className={`w-full p-3 border rounded-lg ${errors.customer_phone ? 'border-red-500' : ''}`}
                        required
                      />

                      <input
                        type="email"
                        placeholder="Email *"
                        value={data.customer_email}
                        onChange={(e) => setData('customer_email', e.target.value)}
                        className={`w-full p-3 border rounded-lg ${errors.customer_email ? 'border-red-500' : ''}`}
                        required
                      />

                      {orderType === 'delivery' && (
                        <textarea
                          placeholder="Alamat Pengiriman *"
                          value={data.delivery_address}
                          onChange={(e) => setData('delivery_address', e.target.value)}
                          className={`w-full p-3 border rounded-lg ${errors.delivery_address ? 'border-red-500' : ''}`}
                          rows={3}
                          required
                        />
                      )}

                      <textarea
                        placeholder="Catatan (opsional)"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        className="w-full p-3 border rounded-lg"
                        rows={2}
                      />
                    </div>

                    {/* Payment Methods */}
                    <div>
                      <label className="block mb-3 text-sm font-medium">Metode Pembayaran</label>

                      {/* Bayar di Tempat */}
                      <div className="mb-4">
                        <div className="mb-2 text-xs font-medium text-gray-600">Bayar di Tempat</div>
                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="payment_method"
                            value="cash"
                            checked={data.payment_method === 'cash'}
                            onChange={(e) => setData('payment_method', e.target.value)}
                            className="mr-3"
                          />
                          <div className="flex items-center">
                            <span className="mr-3 text-2xl">💵</span>
                            <span className="font-medium">Bayar di Tempat</span>
                          </div>
                        </label>
                      </div>

                      {/* E-Wallet */}
                      <div className="mb-4">
                        <div className="mb-2 text-xs font-medium text-gray-600">E-Wallet</div>
                        <div className="space-y-2">
                          {[
                            { value: 'dana', label: 'DANA', icon: '💙' },
                            { value: 'gopay', label: 'GoPay', icon: '🟢' },
                            { value: 'ovo', label: 'OVO', icon: '🟣' },
                            { value: 'shopeepay', label: 'ShopeePay', icon: '🧡' }
                          ].map((method) => (
                            <label key={method.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                              <input
                                type="radio"
                                name="payment_method"
                                value={method.value}
                                checked={data.payment_method === method.value}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="mr-3"
                              />
                              <div className="flex items-center">
                                <span className="mr-3 text-2xl">{method.icon}</span>
                                <span className="font-medium">{method.label}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Mobile Banking */}
                      <div className="mb-4">
                        <div className="mb-2 text-xs font-medium text-gray-600">Mobile/Internet Banking</div>
                        <div className="space-y-2">
                          {[
                            { value: 'bca', label: 'BCA', icon: '🔵' },
                            { value: 'mandiri', label: 'Mandiri', icon: '🟡' },
                            { value: 'bni', label: 'BNI', icon: '🟠' },
                            { value: 'bri', label: 'BRI', icon: '🔵' },
                            { value: 'bsi', label: 'BSI', icon: '🟢' }
                          ].map((method) => (
                            <label key={method.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                              <input
                                type="radio"
                                name="payment_method"
                                value={method.value}
                                checked={data.payment_method === method.value}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="mr-3"
                              />
                              <div className="flex items-center">
                                <span className="mr-3 text-2xl">{method.icon}</span>
                                <span className="font-medium">{method.label}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Upload Payment Proof untuk non-cash */}
                    {data.payment_method !== 'cash' && (
                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          Bukti Pembayaran <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setData('payment_proof', file);
                            }
                          }}
                          className="w-full p-3 border rounded-lg"
                          required={data.payment_method !== 'cash'}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Upload screenshot bukti transfer/pembayaran (JPG, PNG, max 2MB)
                        </p>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h3 className="mb-2 font-medium">Ringkasan Pesanan</h3>
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
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && successOrderData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white rounded-xl">
              <div className="p-6 text-center">
                {/* Success Icon */}
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                {/* Success Message */}
                <h2 className="mb-2 text-xl font-bold text-gray-900">
                  Pesanan Berhasil Dibuat! 🎉
                </h2>

                <div className="p-4 mb-4 text-left rounded-lg bg-gray-50">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kode Pesanan:</span>
                      <span className="font-medium text-orange-600">{successOrderData.orderCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Pembayaran:</span>
                      <span className="font-medium">Rp {successOrderData.total.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Metode Pembayaran:</span>
                      <span className="font-medium capitalize">
                        {successOrderData.paymentMethod === 'cash' ? 'Bayar di Tempat' : successOrderData.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                    {successOrderData.estimatedTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimasi Siap:</span>
                        <span className="font-medium">{successOrderData.estimatedTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Status Info */}
                {successOrderData.paymentMethod === 'cash' ? (
                  <div className="p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-sm text-blue-800">
                      💡 Silakan bayar saat pesanan siap atau saat makan di tempat
                    </p>
                  </div>
                ) : (
                  <div className="p-3 mb-4 border border-green-200 rounded-lg bg-green-50">
                    <p className="text-sm text-green-800">
                      ✅ Bukti pembayaran berhasil diupload. Pesanan akan segera diproses oleh staff.
                    </p>
                  </div>
                )}

                {/* What's Next */}
                <div className="mb-4 text-left">
                  <h3 className="mb-2 font-medium text-gray-900">Selanjutnya:</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Staff akan mengkonfirmasi pesanan Anda</li>
                    <li>• Anda akan mendapat notifikasi saat pesanan siap</li>
                    <li>• Silakan datang ke lokasi untuk mengambil pesanan</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      setSuccessOrderData(null);
                      // Redirect ke halaman order detail jika ada
                      // window.location.href = `/orders/${successOrderData.orderCode}`;
                    }}
                    className="w-full py-3 font-medium text-white transition-all bg-orange-500 rounded-lg hover:bg-orange-600"
                  >
                    Lihat Detail Pesanan
                  </button>

                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      setSuccessOrderData(null);
                    }}
                    className="w-full py-3 font-medium text-gray-700 transition-all bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Lanjut Belanja
                  </button>
                </div>

                {/* Contact Info */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Ada pertanyaan? Hubungi kami di <span className="font-medium">0812-3456-7890</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed z-50 py-5 text-white rounded-full shadow-2xl px-15 bottom-6 right-6 bg-gradient-to-r from-orange-500 to-amber-500"
            >
            🛒 {cartCount}
          </button>
        )}
      </div>
    </>
  );
};

export default MenuPage;
