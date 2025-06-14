import React from 'react';
import { 
  ShoppingBag, DollarSign, Users, Star, TrendingUp, ChevronRight, 
  Plus, RefreshCw, Package, FileText, Download, Calendar
} from 'lucide-react';

interface DashboardContentProps {
  stats: {
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    avgOrderValue: number;
    monthlyGrowth: number;
  };
  setActiveTab: (tab: string) => void;
  openModal: (type: string, data?: any) => void;
  orders: any[];
  menuItems: any[];
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  stats,
  setActiveTab,
  openModal,
  orders,
  menuItems,
  getStatusColor,
  getStatusText
}) => {
  const monthlyRevenue = [
    { month: 'Jan', revenue: 15000000, orders: 450 },
    { month: 'Feb', revenue: 18000000, orders: 520 },
    { month: 'Mar', revenue: 22000000, orders: 680 },
    { month: 'Apr', revenue: 19500000, orders: 590 },
    { month: 'Mei', revenue: 25000000, orders: 750 }
  ];

  const categoryRevenue = [
    { category: 'Makanan', revenue: 18500000, percentage: 65, orders: 485 },
    { category: 'Minuman', revenue: 6500000, percentage: 25, orders: 320 },
    { category: 'Reservasi', revenue: 3000000, percentage: 10, orders: 45 }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Da Money countah</h2>
        <p className="text-orange-100 text-sm sm:text-base mb-4">On sum nonchalant shi</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button 
            onClick={() => setActiveTab('orders')}
            className="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 flex items-center justify-center text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Pesanan
          </button>
          <button className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500 flex items-center justify-center text-sm font-medium transition-colors">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Data
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-blue-500 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
              <div className="text-sm text-gray-600">Total Pesanan</div>
              <div className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">+{stats.monthlyGrowth}% bulan ini</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-green-500 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">Rp {stats.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Pendapatan</div>
              <div className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
                <span>+15% bulan ini</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-purple-500 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCustomers}</div>
              <div className="text-sm text-gray-600">Total Pelanggan</div>
              <div className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
                <span>+8% bulan ini</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-yellow-500 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">Rp {stats.avgOrderValue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Rata-rata Pesanan</div>
              <div className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
                <span>+5% bulan ini</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pendapatan Bulanan</h3>
          <div className="h-48 sm:h-64">
            <div className="flex items-end justify-between h-40 sm:h-48 space-x-1 sm:space-x-2">
              {monthlyRevenue.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="bg-orange-500 rounded-t w-full transition-all hover:bg-orange-600 cursor-pointer" 
                       style={{ height: `${(item.revenue / 25000000) * 100}%`, minHeight: '20px' }}>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">{item.month}</div>
                  <div className="text-xs font-medium text-gray-900 hidden sm:block">Rp {(item.revenue / 1000000).toFixed(1)}M</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0</span>
              <span>25M</span>
            </div>
          </div>
        </div>

        {/* Category Revenue */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pendapatan per Kategori</h3>
          <div className="space-y-3 sm:space-y-4">
            {categoryRevenue.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className={`w-4 h-4 rounded flex-shrink-0 ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">{item.category}</div>
                    <div className="text-xs text-gray-500">{item.orders} pesanan</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-medium text-gray-900">Rp {(item.revenue / 1000000).toFixed(1)}M</div>
                  <div className="text-xs text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pie Chart Visual */}
          <div className="mt-6 flex justify-center">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32">
              <svg className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="15.915" fill="transparent" stroke="#e5e7eb" strokeWidth="1"/>
                <circle cx="16" cy="16" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="1" 
                        strokeDasharray={`${categoryRevenue[0].percentage} ${100 - categoryRevenue[0].percentage}`} strokeLinecap="round"/>
                <circle cx="16" cy="16" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="1" 
                        strokeDasharray={`${categoryRevenue[1].percentage} ${100 - categoryRevenue[1].percentage}`} 
                        strokeDashoffset={`-${categoryRevenue[0].percentage}`} strokeLinecap="round"/>
                <circle cx="16" cy="16" r="15.915" fill="transparent" stroke="#8b5cf6" strokeWidth="1" 
                        strokeDasharray={`${categoryRevenue[2].percentage} ${100 - categoryRevenue[2].percentage}`} 
                        strokeDashoffset={`-${categoryRevenue[0].percentage + categoryRevenue[1].percentage}`} strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm sm:text-lg font-bold text-gray-900">28M</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Orders & Top Menu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Pesanan Terbaru</h3>
              <button 
                onClick={() => setActiveTab('orders')}
                className="text-sm text-orange-500 hover:underline flex items-center"
              >
                <span className="hidden sm:inline">Lihat Semua</span>
                <span className="sm:hidden">Semua</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {orders && orders.length > 0 ? (
              orders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="font-medium text-gray-900 text-sm truncate">{order.id}</div>
                    <div className="text-sm text-gray-600 truncate">{order.customerName}</div>
                    <div className="text-xs text-gray-500 truncate">{order.service}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-gray-900 text-sm">Rp {order.price.toLocaleString()}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)} inline-block`}>
                      {getStatusText(order.status)}
                    </div>
                    <button 
                      onClick={() => openModal('order', order)}
                      className="text-xs text-blue-600 hover:underline mt-1 block"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada pesanan</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Menu Items */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Menu Terpopuler</h3>
              <button 
                onClick={() => setActiveTab('menu')}
                className="text-sm text-green-500 hover:underline flex items-center"
              >
                <span className="hidden sm:inline">Kelola Menu</span>
                <span className="sm:hidden">Menu</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {menuItems && menuItems.length > 0 ? (
              menuItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center space-x-3 sm:space-x-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{item.name}</div>
                    <div className="text-sm text-gray-600 truncate">{item.category}</div>
                    <div className="text-xs text-gray-500">Rp {item.price.toLocaleString()}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{item.popularity}%</span>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${getStatusColor(item.status === 'available' ? 'active' : 'inactive')}`}>
                      {item.status === 'available' ? 'Tersedia' : 'Habis'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada menu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <button 
            onClick={() => setActiveTab('menu')}
            className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-orange-50 text-center transition-all duration-200 hover:scale-[1.2]"

          >
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-xs sm:text-sm font-medium truncate">Kelola Menu</div>
          </button>
          <button 
            onClick={() => setActiveTab('packages')}
            className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-orange-50 text-center transition-all duration-200 hover:scale-[1.2]"

          >
            <Package className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-xs sm:text-sm font-medium truncate">Paket Reservasi</div>
          </button>
          <button className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-orange-50 text-center transition-all duration-200 hover:scale-[1.2]"
>
            <Download className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-green-600" />
            <div className="text-xs sm:text-sm font-medium truncate">Export Data</div>
          </button>
  </div>
</div>

      </div>
    
  );
};

export default DashboardContent;