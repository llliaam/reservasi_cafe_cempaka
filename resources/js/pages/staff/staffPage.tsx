  import React, { useState, useEffect } from 'react';
 import { 
  User, Menu, X, Home, CreditCard, History, 
  UserCheck, LogOut, Coffee, AlertTriangle
} from 'lucide-react';

  import CashierSystem from './cashier';
  import OnlineOrdersPage from './onlineOrders';
  import Dashboard from './Sdashboard';
  import StaffReservasi from './staffReservasi';

  type ActivePage = 'dashboard' | 'cashier' | 'online-orders' | 'staff-reservasi';

  interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    activeCustomers: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customerGrowth: number;
  }

  interface HourlyData {
    hour: string;
    orders: number;
    revenue: number;
  }

  interface RecentActivity {
    id: string;
    type: 'sale' | 'online' | 'reservation' | 'refund';
    description: string;
    amount: number;
    time: string;
    customer: string;
    status?: string;
  }

  interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface AvailableTable {
  id: number;
  meja_name: string;
  capacity: number;
  location: string;
}

  // ADDED: Interfaces for reservations and tables
  interface Reservation {
    id: number;
    reservation_code: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    date: string;
    time: string;
    guests: number;
    table_name?: string;
    table_number?: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    payment_method: string;
    payment_method_label: string;
    proof_of_payment?: string;
    special_requests?: string;
    package_name: string;
    total_price: string;
    table_location: string;
    location_detail?: string;
    can_be_confirmed: boolean;
    can_be_cancelled: boolean;
    requires_payment_confirmation: boolean;
  }

  interface Table {
    id: number;
    table_number: number;
    meja_name: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    location_type: string;
    location_detail?: string;
    full_location: string;
    status_label: string;
    status_color: string;
    is_available: boolean;
    current_reservation?: any;
    today_reservations_count: number;
  }

  interface StaffPageProps {
  dashboardData?: {
    todayStats: DashboardStats;
    hourlyData: HourlyData[];
    recentActivities: RecentActivity[];
    pendingOrdersCount: number;
    todayReservationsCount: number;
  };
  reservationsData?: Reservation[];
  tablesData?: Table[];
  ordersData?: any[];
  menuItems?: Product[];
  availableTables?: AvailableTable[];
  auth?: { user: { id: number; name: string; role: string; } };
  reservationFilters?: {
    status?: string;
    date?: string;
  };
  pendingOrders?: any[];
  pendingReservations?: any[]; // ADD THIS
  popularMenus?: any[];
  currentPeriod?: string;
  currentDateRange?: any;
}

// Komponen Dialog Konfirmasi
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Ya", cancelText = "Batal", type = "warning" }) => {
  if (!isOpen) return null;

  const getIconColor = () => {
    switch (type) {
      case 'danger': return 'text-red-600';
      case 'warning': return 'text-amber-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700';
      case 'info': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-gray-100 ${getIconColor()}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold transition-colors duration-200 ${getButtonColor()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

  const StaffPage: React.FC<StaffPageProps> = ({ 
    dashboardData,
    reservationsData,
    tablesData,
    ordersData,
    menuItems = [],
    availableTables = [],
    auth,
    reservationFilters,
    pendingOrders = [],
    pendingReservations = [], 
    popularMenus = [],
    currentPeriod,
    currentDateRange
  }) => {
    const [activePage, setActivePage] = useState<ActivePage>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    console.log('StaffPage received props:', { 
    pendingOrders, 
    pendingReservations, // ADD THIS
    popularMenus 
  });
    
    const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    // Simple redirect - tidak pakai form, tidak pakai POST, tidak pakai CSRF
    window.location.href = '/logout';
  };
  
  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

    useEffect(() => {
      // Check flash data untuk tab yang harus aktif
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get('tab');
      
      if (tabFromUrl) {
        setActivePage(tabFromUrl as ActivePage);
      }
    }, []);

    // Mock Dashboard component untuk demo (ganti dengan import yang sebenarnya)
    const MockDashboard = ({ dashboardData }: any) => (
      <div className="p-8 bg-gray-100 h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Component</h2>
          <p className="text-gray-600">Gunakan komponen Dashboard yang telah diperbaiki</p>
        </div>
      </div>
    );

    const renderContent = () => {
      switch (activePage) {
        case 'dashboard':
            return dashboardData ? (
              <Dashboard 
                dashboardData={dashboardData} 
                pendingOrders={pendingOrders}
                pendingReservations={pendingReservations} // ADD THIS
                popularMenus={popularMenus}
                currentPeriod={currentPeriod} 
                currentDateRange={currentDateRange} 
              />
            ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Memuat dashboard...</p>
              </div>
            </div>
          );
        case 'cashier':
        return <CashierSystem 
          menuItems={menuItems}
          availableTables={availableTables}
          auth={auth}
        />;
        case 'online-orders':
          return <OnlineOrdersPage ordersData={ordersData} />;
        case 'staff-reservasi':
          return <StaffReservasi 
            reservationsData={reservationsData}
            tablesData={tablesData}
            reservationFilters={reservationFilters}
          />;
        default:
          return null;
      }
    };

    const navigationMenu = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Home,
    description: 'Ringkasan & Analytics'
  },
  { 
    id: 'cashier', 
    label: 'Kasir', 
    icon: CreditCard,
    description: 'Sistem Point of Sale'
  },
  { 
    id: 'online-orders', 
    label: 'History Pesanan', 
    icon: History,
    description: 'Kelola pesanan customer'
  },
  { 
    id: 'staff-reservasi', 
    label: 'Reservasi', 
    icon: UserCheck,
    description: 'Manajemen reservasi'
  }
];

    const getButtonStyle = (page: ActivePage) => {
      const isActive = activePage === page;
      return isActive
        ? "w-full flex items-center px-4 py-3 text-left rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transform scale-[1.02] transition-all duration-200"
        : "w-full flex items-center px-4 py-3 text-left rounded-xl bg-white/70 backdrop-blur-sm text-amber-800 hover:bg-white hover:shadow-md hover:scale-[1.01] transition-all duration-200 border border-amber-100/50";
    };

    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50
          w-72 lg:w-80 flex flex-col justify-between 
          bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 
          shadow-2xl lg:shadow-xl transition-transform duration-300 ease-in-out
          border-r border-amber-100/50
        `}>
          {/* Logo and Header */}
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-2xl bg-gradient-to-br from-amber-800 to-amber-600 shadow-lg">
                  <Coffee className="w-7 h-7 text-amber-100" />
                </div>
                <div>
                  <h1 className="font-serif text-xl lg:text-2xl font-bold text-amber-900 leading-tight">
                    Cempaka Cafe
                  </h1>
                  <p className="text-sm text-amber-700 font-medium">& Resto</p>
                </div>
              </div>
              {/* Mobile Close Button */}
              <button
                className="lg:hidden p-2 rounded-lg bg-white/70 text-amber-800 hover:bg-white transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-3">
              <div className="mb-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider px-4 mb-3">
                  Menu Utama
                </p>
              </div>
              
              {navigationMenu.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activePage === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        className={getButtonStyle(item.id as ActivePage)}
                        onClick={() => {
                          setActivePage(item.id as ActivePage);
                          setSidebarOpen(false);
                        }}
                        aria-label={`Navigate to ${item.label}`}
                      >
                    <div className="flex items-center space-x-3 w-full">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-amber-100'}`}>
                        <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-amber-600'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-amber-900'}`}>
                          {item.label}
                        </p>
                        <p className={`text-xs ${isActive ? 'text-white/80' : 'text-amber-600'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Sign Out */}
          <div className="p-6 lg:p-8 border-t border-amber-200/50">
            {/* User Profile */}
            <div className="flex items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl mb-4 border border-amber-100/50">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl shadow-sm">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="font-semibold text-amber-900 text-sm">Staff User</p>
                <p className="text-xs text-amber-600">Online</p>
              </div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-sm"></div>
            </div>

            {/* Sign Out Button */}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-[1.02]"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Keluar
            </button>
            
            {/* App Version */}
            <div className="mt-4 text-center">
              <p className="text-xs text-amber-600">Version 1.0.0</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <button
              className="p-2 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center">
              <Coffee className="w-6 h-6 text-amber-600 mr-2" />
              <h1 className="font-serif text-lg font-bold text-amber-900">Cempaka Cafe</h1>
            </div>
            
            <div className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            {renderContent()}
          </div>
        </div>
        {/* Dialog Konfirmasi Logout */}
        <ConfirmationDialog
          isOpen={showLogoutDialog}
          onClose={cancelLogout}
          onConfirm={confirmLogout}
          title="Konfirmasi Keluar"
          message="Apakah Anda yakin ingin keluar dari sistem?"
          confirmText="Ya, Keluar"
          cancelText="Batal"
          type="warning"
        />
      </div>
    );
  };

  export default StaffPage;