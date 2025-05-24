// components/ProductGrid.tsx
import React, { useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating: number;
  isPopular?: boolean;
}

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  const [favorites, setFavorites] = useState<number[]>([]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
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
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              
              {/* Badges */}
              {product.isPopular && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  🔥 Popular
                </span>
              )}
              
              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                  favorites.includes(product.id) 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/80 text-gray-600 hover:bg-red-50'
                }`}
              >
                {favorites.includes(product.id) ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-yellow-400">⭐</span>
                <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                <span className="text-sm text-gray-500">(120 reviews)</span>
              </div>

              {/* Price and Add Button */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-gray-800">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-semibold">
                        -17%
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onAddToCart(product)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-110 transition-all duration-200"
                >
                  ➕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;