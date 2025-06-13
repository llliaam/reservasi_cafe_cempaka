// components/Sidebar.tsx
import React from 'react';
import { 
  Home, ShoppingBag, FileText, Package, Calendar, Users, UserCheck, TrendingUp,
  Settings, HelpCircle, LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
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

  return (
    <div className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">CleanCare Pro</h1>
            <p className="text-xs text-gray-500">Owner Panel</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">MENU UTAMA</p>
        <div className="space-y-1">
          <div className="text-sm text-gray-600 mb-2">Platform</div>
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                activeTab === id
                  ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 mr-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

<div className="mt-auto px-4 pb-4">
  <div className="mb-4">
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg shadow-sm">
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">A</span>
      </div>
      <div className="flex-1">
       nigger
       
      </div>
    </div>
  </div>

  <div>
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">AKUN</p>
    <div className="text-sm text-gray-600 mb-1">Platform</div>
    <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
      <Settings className="w-4 h-4 mr-3" />
      Pengaturan
    </button>
    <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
      <HelpCircle className="w-4 h-4 mr-3" />
      Bantuan
    </button>
    <button className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
      <LogOut className="w-4 h-4 mr-3" />
      Logout
    </button>
  </div>
</div>
</div>

  );
};

export default Sidebar;