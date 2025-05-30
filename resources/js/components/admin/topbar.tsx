// components/TopBar.tsx
import React from 'react';
import { Search, Bell } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  notifications: Array<{
    id: number;
    message: string;
    type: string;
    time: string;
  }>;
}

const TopBar: React.FC<TopBarProps> = ({ 
  activeTab, 
  searchTerm, 
  setSearchTerm, 
  notifications 
}) => {
  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'orders': return 'Kelola Pesanan';
      case 'menu': return 'Menu Makanan & Minuman';
      case 'packages': return 'Paket Reservasi';
      case 'reservations': return 'Reservasi';
      case 'customers': return 'Data Pelanggan';
      case 'staff': return 'Manajemen Staff';
      case 'analytics': return 'Analytics & Report';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900">
            {getPageTitle(activeTab)}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari pesanan, pelanggan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-64 text-sm"
            />
          </div>
          <div className="relative">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;