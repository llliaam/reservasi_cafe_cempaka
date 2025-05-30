import React from 'react';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  quantity?: number;
}

interface MenuSelectorProps {
  selectedMenuItems: MenuItem[];
  handleAddMenuItem: (item: MenuItem) => void;
  handleRemoveMenuItem: (itemId: number) => void;
  toggleMenuPopup: () => void;
  calculateMenuSubtotal: () => number;
  formatPrice: (price: number) => string;
}

const MenuSelector: React.FC<MenuSelectorProps> = ({ 
  selectedMenuItems, 
  handleAddMenuItem, 
  handleRemoveMenuItem,
  toggleMenuPopup,
  calculateMenuSubtotal,
  formatPrice
}) => {
  // Function to get correct menu image path
  const getMenuImagePath = (imageFilename: string) => {
    if (!imageFilename) {
      // Fallback ke gambar default lokal
      return "/images/poto_menu/default-menu.jpg";
    }
    
    // Cek apakah sudah full URL (placeholder lama)
    if (imageFilename.startsWith('http')) {
      return imageFilename;
    }
    
    // Return path ke folder poto_menu
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
      fallbackDiv.className = 'fallback-div w-12 h-12 flex items-center justify-center bg-yellow-400 text-white font-bold text-xs rounded-md';
      const initials = menuName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
      fallbackDiv.textContent = initials || 'M';
      parent.appendChild(fallbackDiv);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Menu Tambahan</h2>
        <button
          type="button"
          onClick={toggleMenuPopup}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          + Tambah Menu
        </button>
      </div>
      
      {selectedMenuItems.length > 0 ? (
        <div className="space-y-3">
          {selectedMenuItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="mr-3">
                  <img 
                    src={getMenuImagePath(item.image)}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-md"
                    onError={(e) => handleImageError(e, item.name)}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                  <p className="text-gray-500 text-sm">{formatPrice(item.price)} x {item.quantity}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleRemoveMenuItem(item.id)}
                  className="p-1 text-gray-500 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className="text-gray-700">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => handleAddMenuItem(item)}
                  className="p-1 text-gray-500 hover:text-green-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Subtotal Menu:</span>
              <span className="font-medium text-gray-800">{formatPrice(calculateMenuSubtotal())}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Belum ada menu tambahan yang dipilih</p>
          <p className="text-sm mt-2">Klik tombol "Tambah Menu" untuk melihat pilihan menu</p>
        </div>
      )}
    </div>
  );
};

export default MenuSelector;