import React from 'react';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface MenuItems {
  food: MenuItem[];
  beverage: MenuItem[];
  dessert: MenuItem[];
}

interface MenuPopupProps {
  showPopup: boolean;
  closePopup: () => void;
  menuItems: MenuItems;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  handleAddMenuItem: (item: MenuItem) => void;
  selectedMenuItems: MenuItem[];
  calculateMenuSubtotal: () => number;
  formatPrice: (price: number) => string;
}

const MenuPopup: React.FC<MenuPopupProps> = ({
  showPopup,
  closePopup,
  menuItems,
  selectedCategory,
  setSelectedCategory,
  handleAddMenuItem,
  selectedMenuItems,
  calculateMenuSubtotal,
  formatPrice
}) => {
  if (!showPopup) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-10 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Pilih Menu Tambahan</h2>
            <button
              type="button"
              onClick={closePopup}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Tab Menu */}
          <div className="flex border-b border-gray-200 mt-4">
            <button
              type="button"
              className={`py-2 px-4 font-medium ${
                selectedCategory === 'food' 
                  ? 'text-yellow-500 border-b-2 border-yellow-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedCategory('food')}
            >
              Makanan
            </button>
            <button
              type="button"
              className={`py-2 px-4 font-medium ${
                selectedCategory === 'beverage' 
                  ? 'text-yellow-500 border-b-2 border-yellow-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedCategory('beverage')}
            >
              Minuman
            </button>
            <button
              type="button"
              className={`py-2 px-4 font-medium ${
                selectedCategory === 'dessert' 
                  ? 'text-yellow-500 border-b-2 border-yellow-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedCategory('dessert')}
            >
              Dessert
            </button>
          </div>
        </div>
        
        {/* Daftar Menu */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "50vh" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menuItems[selectedCategory].map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex items-center p-3">
                  <div className="w-20 h-20 flex-shrink-0 mr-3">
                    <img 
                      src={`/images/${item.image}`} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-yellow-600 font-bold">{formatPrice(item.price)}</p>
                    <p className="text-gray-500 text-xs mt-1">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddMenuItem(item)}
                    className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer Popup */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              {selectedMenuItems.length} item dipilih
            </p>
            <p className="font-medium text-gray-800">
              Subtotal: {formatPrice(calculateMenuSubtotal())}
            </p>
          </div>
          <button
            type="button"
            onClick={closePopup}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuPopup;