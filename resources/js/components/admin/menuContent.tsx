// components/MenuContent.tsx - Responsive Version
import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react'; 
import { 
  Plus, Upload, FileText, Check, Package, Filter, Star, Eye, 
  Edit3, Trash2
} from 'lucide-react';

interface MenuContentProps {
  menuItems: any[];
  setMenuItems: (items: any[]) => void;
  searchTerm: string;
  openModal: (type: string, data?: any) => void;
  setIsAddMenuOpen: (open: boolean) => void;
  getStatusColor: (status: string) => string;
  menuCategories: any[];
}

const MenuContent: React.FC<MenuContentProps> = ({
  menuItems,
  setMenuItems,
  searchTerm,
  openModal,
  setIsAddMenuOpen,
  getStatusColor,
  menuCategories
}) => {
  const [filteredMenu, setFilteredMenu] = useState(menuItems);
  const [filterCategory, setFilterCategory] = useState('all');

 useEffect(() => {
  let filtered = menuItems;
  
  // Filter berdasarkan kategori
  if (filterCategory !== 'all') {
    // Cari kategori berdasarkan name, bukan ID
    const selectedCategoryName = menuCategories.find(cat => cat.id.toString() === filterCategory)?.name;
    if (selectedCategoryName) {
      filtered = filtered.filter(item => item.category === selectedCategoryName);
    }
  }
  
  // Filter berdasarkan search term
  if (searchTerm) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  setFilteredMenu(filtered);
}, [filterCategory, searchTerm, menuItems, menuCategories]);

  const handleDeleteMenu = (id: number) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

 const handleToggleStatus = (id: number) => {
  const menuItem = menuItems.find(item => item.id === id);
  if (!menuItem) return;

  // Call backend to update status
  router.patch(`/admin/menu/${id}/toggle-status`, {
    is_available: !menuItem.is_available
  }, {
    preserveState: true,
    preserveScroll: true,
    onSuccess: (page) => {
      if (page.props.menuItems) {
        setMenuItems(page.props.menuItems);
      }
      console.log('Status menu berhasil diupdate');
    },
    onError: (errors) => {
      console.error('Error updating menu status:', errors);
    }
  });
};

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Menu Makanan & Minuman</h2>
          <p className="text-gray-600 text-sm sm:text-base">Kelola menu cafe dan harga</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setIsAddMenuOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Menu
          </button>
          {/* <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center text-sm font-medium">
            <Upload className="w-4 h-4 mr-2" />
            Import Menu
          </button> */}
        </div>
      </div>

      {/* Menu Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{menuItems.length}</div>
              <div className="text-sm text-gray-600">Total Menu</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {menuItems.filter(m => m.is_available).length}
              </div>
              <div className="text-sm text-gray-600">Tersedia</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {menuItems.filter(m => m.category === 'Food').length}
              </div>
              <div className="text-sm text-gray-600">Food</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {menuItems.filter(m => m.category === 'Beverage').length}
              </div>
              <div className="text-sm text-gray-600">Beverage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Semua Kategori</option>
            {menuCategories && menuCategories.length > 0 && menuCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <div className="flex items-center space-x-2 sm:ml-auto">
            <span className="text-sm text-gray-600">
              Menampilkan {filteredMenu.length} dari {menuItems.length} menu
            </span>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredMenu.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-w-16 aspect-h-12 bg-gray-200">
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden rounded-t-xl">
                {item.image_url ? (
                  <img 
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('.fallback-icon');
                      if (fallback) {
                        fallback.classList.remove('hidden');
                      }
                    }}
                  />
                ) : null}
                <div className={`fallback-icon flex items-center justify-center w-full h-full ${item.image_url ? 'hidden' : ''}`}>
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 truncate pr-2 flex-1">{item.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${getStatusColor(item.status === 'available' ? 'active' : 'inactive')}`}>
                  {item.status === 'available' ? 'Tersedia' : 'Habis'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-bold text-gray-900">Rp {item.price.toLocaleString()}</div>
                {/* <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">{item.popularity}%</span>
                </div> */}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => openModal('menu', item)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Detail
                </button>
                <button 
                  onClick={() => handleToggleStatus(item.id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm flex items-center justify-center ${
                    item.is_available 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {item.is_available ? 'Non-aktifkan' : 'Aktifkan'}
                </button>
                <button 
                  onClick={() => handleDeleteMenu(item.id)}
                  className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 text-sm flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMenu.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada menu</h3>
          <p className="text-gray-600">
            {searchTerm || filterCategory !== 'all' 
              ? 'Tidak ada menu yang sesuai dengan filter.' 
              : 'Belum ada menu yang ditambahkan.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuContent;