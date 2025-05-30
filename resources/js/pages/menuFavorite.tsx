import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { 
    Heart, 
    ShoppingBag, 
    Star, 
    Clock,
    X,
    Plus,
    TrendingUp,
    Package
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Menu Favorit',
        href: '/menu-favorit',
    },
];

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

interface PageProps extends SharedData {
  favorites: FavoriteMenuItem[];
  stats: FavoriteStats;
}

const MenuFavorite: React.FC = () => {
  const { favorites, stats, flash } = usePage<PageProps>().props;
  const [cart, setCart] = useState<CartItem[]>([]);

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
    router.delete(route('favorites.remove', menuItemId), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        // Success message will be shown via session flash
      }
    });
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
    
    console.log(`${item.name} added to cart`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Menu Favorit - Cempaka Cafe" />
      
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
        {/* Flash Messages */}
        {flash?.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {flash.success}
          </div>
        )}

        {flash?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {flash.error}
          </div>
        )}

        {/* Header Section */}
        <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Menu Favorit Saya</h1>
          </div>
          <p className="text-pink-100">Koleksi menu pilihan yang telah Anda simpan</p>
        </div>

        {/* Stats Overview */}
        {favorites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_favorites}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Favorit</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.categories.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Kategori Berbeda</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Daftar Menu Favorit
              </h3>
              <Link 
                href="/menu"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
              >
                Jelajahi Menu
                <Plus className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {/* Empty State */}
            {favorites.length === 0 && (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Belum Ada Menu Favorit</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Mulai jelajahi menu dan tambahkan yang Anda sukai ke favorit</p>
                <Link 
                  href="/menu"
                  className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Jelajahi Menu
                </Link>
              </div>
            )}

            {/* Favorites Grid */}
            {favorites.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative h-40">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/300x200/fbbf24/ffffff?text=${encodeURIComponent(item.name)}`;
                        }}
                      />
                      
                      {/* Popular Badge */}
                      {item.is_featured && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          🔥 Popular
                        </span>
                      )}
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFavorite(item.id)}
                        className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                        title="Hapus dari favorit"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                        {item.name}
                      </h4>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{item.category}</p>

                      {/* Availability Status */}
                      <div className="mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.is_available 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {item.is_available ? 'Tersedia' : 'Tidak Tersedia'}
                        </span>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Favorited Date */}
                      <div className="flex items-center gap-1 mb-3">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          Difavoritkan {formatDate(item.favorited_at)}
                        </span>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {item.formatted_price}
                        </span>

                        <button
                          onClick={() => addToCart(item)}
                          disabled={!item.is_available}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                            item.is_available
                              ? 'bg-orange-500 text-white hover:bg-orange-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingBag className="w-3 h-3" />
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
      </div>
    </AppLayout>
  );
};

export default MenuFavorite;