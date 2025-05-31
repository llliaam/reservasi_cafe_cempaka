import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Star, Eye, Heart, ShoppingCart } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating: number;
  review_count?: number;
  isPopular?: boolean;
  description?: string;
}

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onShowDetail?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onAddToCart,
  onShowDetail 
}) => {
  const { auth, favoriteIds } = usePage<any>().props;
  const [favorites, setFavorites] = useState<number[]>(favoriteIds || []);
  const [isLoading, setIsLoading] = useState(false);

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
    
    // Jika default-menu.jpg juga gagal, ganti dengan fallback div
    const parent = target.parentElement;
    if (parent && !parent.querySelector('.fallback-div')) {
      // Hide the broken image
      target.style.display = 'none';
      
      // Create colored fallback div
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'fallback-div w-full h-48 flex items-center justify-center bg-yellow-400 text-white font-bold text-2xl';
      const initials = menuName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
      fallbackDiv.textContent = initials || 'M';
      
      // Insert fallback div right after the image
      parent.insertBefore(fallbackDiv, target.nextSibling);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const toggleFavorite = (productId: number) => {
    if (!auth?.user) {
      alert('Silakan login untuk menambahkan menu ke favorit');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    
    // Optimistically update UI
    const isCurrentlyFavorited = favorites.includes(productId);
    setFavorites(prev => 
      isCurrentlyFavorited
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );

    // Submit form using Inertia.js
    router.post(route('favorites.toggle', productId), {}, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        // Success - UI already updated optimistically
        const product = products.find(p => p.id === productId);
        const message = !isCurrentlyFavorited 
          ? `${product?.name} ditambahkan ke favorit` 
          : `${product?.name} dihapus dari favorit`;
        
        console.log(message);
      },
      onError: (errors) => {
        // Revert optimistic update on error
        setFavorites(prev => 
          isCurrentlyFavorited
            ? [...prev, productId]
            : prev.filter(id => id !== productId)
        );
        console.error('Failed to toggle favorite:', errors);
      },
      onFinish: () => {
        setIsLoading(false);
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

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Produk tidak ditemukan</h3>
        <p className="text-gray-600">Coba ubah kata kunci pencarian</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Menu Pilihan ({products.length} produk)
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
          >
            {/* Image */}
            <div className="relative">
              <img
                src={getMenuImagePath(product.image)}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => handleImageError(e, product.name)}
              />
              
              {/* Badges */}
              {product.isPopular && (
                <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  🔥 Popular
                </span>
              )}
              
              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(product.id)}
                  disabled={isLoading}
                  className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                    favorites.includes(product.id) 
                      ? 'bg-red-500 text-white shadow-lg' 
                      : 'bg-white/80 text-gray-600 hover:bg-red-50'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={favorites.includes(product.id) ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                  )}
                </button>

                {/* Detail Button */}
                {onShowDetail && (
                  <button
                    onClick={() => onShowDetail(product)}
                    className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-gray-100 backdrop-blur-sm transition-all duration-200"
                    title="Lihat detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                {product.name}
              </h3>

              {/* Category */}
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>

              {/* Rating */}
              <div className="mb-3">
                {renderStars(product.rating, product.review_count)}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
              )}

              {/* Price and Order Button */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <span className="text-xl font-bold text-gray-800">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-semibold">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Order Button */}
                <button
                  onClick={() => onAddToCart(product)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  title={`Pesan ${product.name}`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show favorites count if user is logged in */}
      {auth?.user && favorites.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Anda memiliki <span className="font-semibold text-orange-600">{favorites.length}</span> menu favorit
          </p>
          <a
            href="/my-favorites"
            className="mt-2 text-orange-600 hover:text-orange-700 font-medium underline"
          >
            Lihat semua favorit →
          </a>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;