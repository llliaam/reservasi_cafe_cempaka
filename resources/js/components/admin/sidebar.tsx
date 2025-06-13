// components/Sidebar.tsx - Responsive Version
import React from 'react';
import { 
  Home, ShoppingBag, FileText, Package, Calendar, Users, UserCheck, TrendingUp,
  Settings, HelpCircle, LogOut, X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isMobile = false, 
  isOpen = false, 
  onClose 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'orders', label: 'Kelola Pesanan', icon: ShoppingBag },
    { id: 'menu', label: 'Menu Makanan & Minuman', icon: FileText },
    { id: 'packages', label: 'Paket Reservasi', icon: Package },
    { id: 'reservations', label: 'Reservasi', icon: Calendar },
    { id: 'customers', label: 'Data Pelanggan', icon: Users },
    { id: 'staff', label: 'Manajemen Staff', icon: UserCheck },
    { id: 'analytics', label: 'Analytics & Report', icon: TrendingUp }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div id="mobile-sidebar" className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate">Cafe Cempaka & Resto</h1>
              <p className="text-xs text-gray-500">Owner Panel</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          {isMobile && (
            <button 
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>
      
      {/* Navigation Menu */}
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">MENU UTAMA</p>
        <div className="space-y-1">
          <div className="text-sm text-gray-600 mb-2">Platform</div>
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-sm text-left transition-colors group ${
                activeTab === id
                  ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

<<<<<<< HEAD
<div className="mt-auto px-4 pb-4">
  <div className="mb-4">
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg shadow-sm">
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">A</span>
      </div>
      <div className="flex-1">
       nigger
       
=======
      {/* User Profile and Account Section */}
      <div className="mt-auto p-4 border-t border-gray-100 flex-shrink-0">
        {/* User Profile */}
        <div className="mb-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg shadow-sm">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin Owner</p>
              <p className="text-xs text-gray-500 truncate">admin@cleancare.com</p>
            </div>
          </div>
        </div>

        {/* Account Menu */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">AKUN</p>
          <div className="text-sm text-gray-600 mb-1">Platform</div>
          <div className="space-y-1">
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Settings className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">Pengaturan</span>
            </button>
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <HelpCircle className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">Bantuan</span>
            </button>
            <button className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">Logout</span>
            </button>
          </div>
        </div>
>>>>>>> 15dc52042dfed7c694b0203358f21728baeab523
      </div>
    </div>
  );
};

export default Sidebar;