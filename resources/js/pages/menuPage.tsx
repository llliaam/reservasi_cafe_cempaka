// MenuPage.tsx
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/components/header';
import ProductGrid from '@/components/productGrid';
import CartSidebar from '@/components/cartSidebar';

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

interface CartItem extends Product {
  quantity: number;
}

const MenuPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const products: Product[] = [
    {
      id: 1,
      name: "Nasi Goreng Spesial",
      price: 25000,
      originalPrice: 30000,
      category: "Main Course",
      image: "/api/placeholder/300/200",
      rating: 4.8,
      isPopular: true
    },
    {
      id: 2,
      name: "Indomie Goreng Telur",
      price: 20000,
      category: "Main Course",
      image: "/api/placeholder/300/200",
      rating: 4.6
    },
    {
      id: 3,
      name: "Steak Ayam Premium",
      price: 35000,
      category: "Main Course",
      image: "/api/placeholder/300/200",
      rating: 4.9,
      isPopular: true
    },
    {
      id: 4,
      name: "Café Latte",
      price: 15000,
      category: "Hot Coffee",
      image: "/api/placeholder/300/200",
      rating: 4.7
    }
  ];

  const categories = ['All Menu', 'Hot Coffee', 'Cold Coffee', 'Main Course'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Menu' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
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

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <Head title="Menu - Cempaka Cafe" />
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Header 
          cartCount={cartCount} 
          onCartClick={() => setIsCartOpen(true)} 
        />
        
        
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
              {categories.map((category) => (
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

          <ProductGrid 
            products={filteredProducts}
            onAddToCart={addToCart}
          />
        </main>

        <CartSidebar 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={updateCartQuantity}
          total={cartTotal}
        />

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