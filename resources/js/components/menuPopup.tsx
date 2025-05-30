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
      fallbackDiv.className = 'fallback-div w-20 h-20 flex items-center justify-center bg-yellow-400 text-white font-bold text-sm rounded-md';
      const initials = menuName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
      fallbackDiv.textContent = initials || 'M';
      parent.appendChild(fallbackDiv);
    }
  };
  
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closePopup();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 menu-popup-backdrop flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-menu-popup-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Pilih Menu Tambahan</h2>
            <button
              type="button"
              onClick={closePopup}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
              aria-label="Close menu popup"
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
              className={`py-2 px-4 font-medium transition-colors ${
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
              className={`py-2 px-4 font-medium transition-colors ${
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
              className={`py-2 px-4 font-medium transition-colors ${
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
          {menuItems[selectedCategory] && menuItems[selectedCategory].length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menuItems[selectedCategory].map((item) => {
                const selectedItem = selectedMenuItems.find(selected => selected.id === item.id);
                const quantity = selectedItem?.quantity || 0;
                
                return (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex items-center p-3">
                      <div className="w-20 h-20 flex-shrink-0 mr-3">
                        <img 
                          src={getMenuImagePath(item.image)} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => handleImageError(e, item.name)}
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-yellow-600 font-bold">{formatPrice(item.price)}</p>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                        {quantity > 0 && (
                          <div className="flex items-center mt-2">
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              {quantity} dipilih
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddMenuItem(item)}
                        className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 ml-3"
                        aria-label={`Tambah ${item.name} ke pesanan`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">Tidak ada menu tersedia</p>
              <p className="text-gray-400 text-sm">untuk kategori {selectedCategory}</p>
            </div>
          )}
        </div>
        
        {/* Footer Popup */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
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
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPopup;