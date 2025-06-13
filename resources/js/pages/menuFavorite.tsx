import React, { useState } from 'react';
import {
    Heart,
    ShoppingBag,
    Star,
    Clock,
    X,
    Plus,
    TrendingUp,
    Package,
    ArrowLeft,
    Home
} from 'lucide-react';

interface FavoriteMenuItem {
  id: number;
  name: string;
  price: number;
  formatted_price: string;
  category: string;
  image: string;
  description: string;
  is_available: boolean;
  is_featured: boolean;
  favorited_at: string;
}

interface FavoriteStats {
  total_favorites: number;
  available_favorites: number;
  categories: string[];
  total_value: number;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface MenuFavoriteProps {
  favorites?: FavoriteMenuItem[];
  stats?: FavoriteStats;
  onBackToMenu?: () => void;
  onGoHome?: () => void;
}

// Sample data untuk demo
const sampleFavorites: FavoriteMenuItem[] = [
  {
    id: 1,
    name: "Nasi Goreng Spesial",
    price: 25000,
    formatted_price: "Rp 25.000",
    category: "Makanan Utama",
    image: "nasi-goreng.jpg",
    description: "Nasi goreng dengan telur, ayam, dan sayuran segar",
    is_available: true,
    is_featured: true,
    favorited_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "Es Teh Manis",
    price: 8000,
    formatted_price: "Rp 8.000",
    category: "Minuman",
    image: "es-teh.jpg",
    description: "Teh manis segar dengan es batu",
    is_available: true,
    is_featured: false,
    favorited_at: "2024-01-14T14:20:00Z"
  },
  {
    id: 3,
    name: "Ayam Bakar Madu",
    price: 35000,
    formatted_price: "Rp 35.000",
    category: "Makanan Utama",
    image: "ayam-bakar.jpg",
    description: "Ayam bakar dengan bumbu madu dan rempah pilihan",
    is_available: false,
    is_featured: true,
    favorited_at: "2024-01-13T16:45:00Z"
  }
];

const sampleStats: FavoriteStats = {
  total_favorites: 3,
  available_favorites: 2,
  categories: ["Makanan Utama", "Minuman"],
  total_value: 68000
};

const MenuFavorite: React.FC<MenuFavoriteProps> = ({
  favorites = sampleFavorites,
  stats = sampleStats,
  onBackToMenu,
  onGoHome
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<string>('');

  // Function to navigate back to landing page
  const handleBackToLanding = () => {
    // Using window.location to navigate to landing page
    window.location.href = '/';
  };

  // Function to navigate to home
  const handleGoHome = () => {
    window.location.href = '/';
  };

  // Function to get correct menu image path
  const getMenuImagePath = (imageFilename: string) => {
    if (!imageFilename) {
      return "/api/placeholder/300/200";
    }

    if (imageFilename.startsWith('http')) {
      return imageFilename;
    }

    // Using placeholder for demo
    return "/api/placeholder/300/200";
  };

  // Function untuk fallback gambar yang gagal load
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, menuName: string) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent && !parent.querySelector('.fallback-div')) {
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'absolute inset-0 flex items-center justify-center text-lg font-bold text-white bg-orange-400 fallback-div';
      const initials = menuName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
      fallbackDiv.textContent = initials || 'M';
      parent.appendChild(fallbackDiv);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const removeFavorite = (menuItemId: number) => {
    // In real app, this would make API call
    setNotification(`Menu berhasil dihapus dari favorit`);
    setTimeout(() => setNotification(''), 3000);
    console.log(`Remove favorite: ${menuItemId}`);
  };

  const addToCart = (item: FavoriteMenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      setCart(prev => prev.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart(prev => [...prev, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }]);
    }

    setNotification(`${item.name} ditambahkan ke keranjang`);
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <div className="bg-white border-b border-orange-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToMenu || handleBackToLanding}
                className="p-2 text-gray-600 transition-colors rounded-lg dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700"
                title="Kembali ke Landing Page"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Heart className="w-5 h-5 text-orange-600" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Menu Favorit</h1>
              </div>
            </div>
            <button
              onClick={onGoHome || handleGoHome}
              className="p-2 text-gray-600 transition-colors rounded-lg dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700"
              title="Ke Beranda"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Notification */}
        {notification && (
          <div className="px-4 py-3 mb-6 text-orange-700 bg-orange-100 border border-orange-300 rounded-lg animate-fade-in">
            {notification}
          </div>
        )}

        {/* Header Section */}
        <div className="p-6 mb-8 text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Menu Favorit Saya</h2>
          </div>
          <p className="text-orange-100">Koleksi menu pilihan yang telah Anda simpan</p>
        </div>

        {/* Stats Overview */}
        {favorites.length > 0 && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            <div className="p-6 bg-white border border-orange-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg dark:bg-orange-900/20">
                  <Heart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_favorites}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Favorit</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-orange-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                  <Package className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.categories.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Kategori Berbeda</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-orange-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg dark:bg-green-900/20">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(stats.total_value)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Nilai</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white border border-orange-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
          <div className="p-6 border-b border-orange-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Daftar Menu Favorit
              </h3>
              <button
                onClick={onBackToMenu || handleBackToLanding}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 transition-colors rounded-lg hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/10"
              >
                <Plus className="w-4 h-4" />
                Jelajahi Menu
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Empty State */}
            {favorites.length === 0 && (
              <div className="py-16 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
                  <Heart className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">Belum Ada Menu Favorit</h3>
                <p className="mb-8 text-gray-600 dark:text-gray-400">Mulai jelajahi menu dan tambahkan yang Anda sukai ke favorit</p>
                <button
                  onClick={onBackToMenu || handleBackToLanding}
                  className="inline-block px-6 py-3 text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600"
                >
                  Jelajahi Menu
                </button>
              </div>
            )}

            {/* Favorites Grid */}
            {favorites.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favorites.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden transition-all duration-300 transform bg-white border border-orange-200 dark:bg-gray-700/50 rounded-xl dark:border-gray-600 hover:shadow-lg hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="relative h-48">
                      <img
                        src={getMenuImagePath(item.image)}
                        alt={item.name}
                        className="object-cover w-full h-full"
                        onError={(e) => handleImageError(e, item.name)}
                      />

                      {/* Popular Badge */}
                      {item.is_featured && (
                        <span className="absolute flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-orange-500 rounded-full top-3 left-3">
                          <Star className="w-3 h-3" />
                          Popular
                        </span>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFavorite(item.id)}
                        className="absolute p-2 text-white transition-colors bg-red-500 rounded-full shadow-lg top-3 right-3 hover:bg-red-600"
                        title="Hapus dari favorit"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Availability Overlay */}
                      {!item.is_available && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                          <span className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-full">
                            Tidak Tersedia
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h4 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {item.name}
                      </h4>

                      <p className="mb-3 text-sm font-medium text-orange-600 dark:text-orange-400">{item.category}</p>

                      {/* Description */}
                      {item.description && (
                        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Favorited Date */}
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          Difavoritkan {formatDate(item.favorited_at)}
                        </span>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {item.formatted_price}
                        </span>

                        <button
                          onClick={() => addToCart(item)}
                          disabled={!item.is_available}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                            item.is_available
                              ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Tambah
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Summary (if items in cart) */}
        {cart.length > 0 && (
          <div className="fixed max-w-sm p-4 bg-white border border-orange-200 shadow-lg bottom-6 right-6 dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">Keranjang</h4>
              <span className="px-2 py-1 text-xs text-white bg-orange-500 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {formatPrice(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuFavorite;
