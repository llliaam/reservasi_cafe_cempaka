// components/MenuContent.tsx
import React, { useState, useEffect } from 'react';
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
}

const MenuContent: React.FC<MenuContentProps> = ({
  menuItems,
  setMenuItems,
  searchTerm,
  openModal,
  setIsAddMenuOpen,
  getStatusColor
}) => {
  const [filteredMenu, setFilteredMenu] = useState(menuItems);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    let filtered = menuItems;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMenu(filtered);
  }, [filterCategory, searchTerm, menuItems]);

  const handleDeleteMenu = (id: number) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleToggleStatus = (id: number) => {
    setMenuItems(menuItems.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'available' ? 'unavailable' : 'available' }
        : item
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Makanan & Minuman</h2>
          <p className="text-gray-600">Kelola menu cafe dan harga</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsAddMenuOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Menu
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Import Menu
          </button>
        </div>
      </div>

      {/* Menu Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{menuItems.length}</div>
              <div className="text-sm text-gray-600">Total Menu</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{menuItems.filter(m => m.status === 'available').length}</div>
              <div className="text-sm text-gray-600">Tersedia</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{menuItems.filter(m => m.category === 'Makanan').length}</div>
              <div className="text-sm text-gray-600">Makanan</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{menuItems.filter(m => m.category === 'Minuman').length}</div>
              <div className="text-sm text-gray-600">Minuman</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Semua Kategori</option>
            <option value="Makanan">Makanan</option>
            <option value="Minuman">Minuman</option>
          </select>
          
          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-sm text-gray-600">
              Menampilkan {filteredMenu.length} dari {menuItems.length} menu
            </span>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenu.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-w-16 aspect-h-12 bg-gray-200">
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status === 'available' ? 'active' : 'inactive')}`}>
                  {item.status === 'available' ? 'Tersedia' : 'Habis'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-bold text-gray-900">Rp {item.price.toLocaleString()}</div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">{item.popularity}%</span>
                </div>
              </div>
              <div className="flex space-x-2">
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
                    item.status === 'available' 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {item.status === 'available' ? 'Non-aktifkan' : 'Aktifkan'}
                </button>
                <button 
                  onClick={() => handleDeleteMenu(item.id)}
                  className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuContent;