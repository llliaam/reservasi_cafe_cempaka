// components/TopBar.tsx - Responsive Version
import React, { useState } from 'react';
import { Search, Bell, Menu, X } from 'lucide-react';

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
  onMenuClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  activeTab, 
  searchTerm, 
  setSearchTerm, 
  notifications,
  onMenuClick
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = (tab: string) => {
    const titles = {
      'dashboard': 'Dashboard',
      'orders': 'Kelola Pesanan',
      'menu': 'Menu Makanan & Minuman',
      'packages': 'Paket Reservasi',
      'reservations': 'Reservasi',
      'customers': 'Data Pelanggan',
      'staff': 'Manajemen Staff',
      'analytics': 'Analytics & Report'
    };
    return titles[tab as keyof typeof titles] || 'Dashboard';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Left section - Menu button + Title */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Mobile menu button */}
          <button 
            id="mobile-menu-button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Page Title */}
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-medium text-gray-900 truncate">
              {getPageTitle(activeTab)}
            </h1>
          </div>
        </div>
        
        {/* Right section - Search + Notifications */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search - Desktop */}
          <div className="hidden sm:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari pesanan, pelanggan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-48 lg:w-64 text-sm"
            />
          </div>

          {/* Search - Mobile (expandable) */}
          <div className="sm:hidden relative">
            {!isSearchExpanded ? (
              <button 
                onClick={() => setIsSearchExpanded(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Search className="w-5 h-5" />
              </button>
            ) : (
              <div className="absolute right-0 top-0 w-64 z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onBlur={() => setIsSearchExpanded(false)}
                    autoFocus
                    className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full text-sm bg-white shadow-lg"
                  />
                  <button 
                    onClick={() => setIsSearchExpanded(false)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Notifikasi</h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="sm:hidden p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              notification.type === 'info' ? 'bg-blue-500' :
                              notification.type === 'warning' ? 'bg-yellow-500' :
                              notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 break-words">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <button className="w-full text-sm text-center text-orange-600 hover:text-orange-700 font-medium">
                      Lihat Semua Notifikasi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchExpanded && (
        <div 
          className="sm:hidden fixed inset-0 bg-black bg-opacity-25 z-20"
          onClick={() => setIsSearchExpanded(false)}
        />
      )}

      {/* Notifications Overlay for Mobile */}
      {showNotifications && (
        <div 
          className="sm:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default TopBar;