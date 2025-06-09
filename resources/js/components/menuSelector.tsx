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
      fallbackDiv.className = 'flex items-center justify-center w-12 h-12 text-xs font-bold text-white bg-orange-400 rounded-md fallback-div';
      const initials = menuName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
      fallbackDiv.textContent = initials || 'M';
      parent.appendChild(fallbackDiv);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Menu Tambahan</h2>
        <button
          type="button"
          onClick={toggleMenuPopup}
          className="px-4 py-2 text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600"
        >
          + Tambah Menu
        </button>
      </div>

      {selectedMenuItems.length > 0 ? (
        <div className="space-y-3">
          {selectedMenuItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
              <div className="flex items-center">
                <div className="mr-3">
                  <img
                    src={getMenuImagePath(item.image)}
                    alt={item.name}
                    className="object-cover w-12 h-12 rounded-md"
                    onError={(e) => handleImageError(e, item.name)}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600">{formatPrice(item.price)} x {item.quantity}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleRemoveMenuItem(item.id)}
                  className="p-1 text-gray-500 hover:text-orange-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className="font-medium text-gray-700">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => handleAddMenuItem(item)}
                  className="p-1 text-gray-500 hover:text-orange-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          <div className="pt-3 border-t border-orange-200">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Subtotal Menu:</span>
              <span className="font-medium text-orange-600">{formatPrice(calculateMenuSubtotal())}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          <p>Belum ada menu tambahan yang dipilih</p>
          <p className="mt-2 text-sm">Klik tombol "Tambah Menu" untuk melihat pilihan menu</p>
        </div>
      )}
    </div>
  );
};

export default MenuSelector;
