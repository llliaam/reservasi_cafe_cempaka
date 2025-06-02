import React from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Clock, Users, ArrowUp, ArrowDown, Calendar, AlertCircle } from 'lucide-react';

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

interface DashboardProps {
  dashboardData: {
    todayStats: DashboardStats;
    hourlyData: HourlyData[];
    recentActivities: RecentActivity[];
    pendingOrdersCount: number;
    todayReservationsCount: number;
  };
}

const Sdashboard: React.FC<DashboardProps> = ({ dashboardData }) => {
  const { todayStats, hourlyData, recentActivities, pendingOrdersCount, todayReservationsCount } = dashboardData;

  const formatCurrency = (amount: number) => {
    return `Rp${Math.abs(amount).toLocaleString('id-ID')}`;
  };

  const formatGrowth = (growth: number) => {
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="w-4 h-4 text-emerald-600" />;
      case 'online':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'reservation':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'refund':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      default:
        return <ShoppingCart className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-emerald-50 border-emerald-200';
      case 'online':
        return 'bg-blue-50 border-blue-200';
      case 'reservation':
        return 'bg-purple-50 border-purple-200';
      case 'refund':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const maxRevenue = Math.max(...hourlyData.map(d => d.revenue), 1);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section - Improved Typography Hierarchy */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                Dashboard Staff
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 font-medium">
                Ringkasan operasional dan performa hari ini
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Cards - Enhanced Visual Hierarchy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/90 font-medium text-sm">Pesanan Menunggu</p>
                    <p className="text-3xl font-bold text-white">{pendingOrdersCount}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                    Perlu Perhatian
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/90 font-medium text-sm">Reservasi Hari Ini</p>
                    <p className="text-3xl font-bold text-white">{todayReservationsCount}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                    Terjadwal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Enhanced Cards with Better Spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {/* Total Revenue */}
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2.5 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Pendapatan</p>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                    {formatCurrency(todayStats.totalRevenue)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      todayStats.revenueGrowth >= 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {todayStats.revenueGrowth >= 0 ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )}
                      <span>{formatGrowth(todayStats.revenueGrowth)}</span>
                    </div>
                    <span className="text-xs text-gray-500">vs kemarin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2.5 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Pesanan</p>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{todayStats.totalOrders}</p>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      todayStats.ordersGrowth >= 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {todayStats.ordersGrowth >= 0 ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )}
                      <span>{formatGrowth(todayStats.ordersGrowth)}</span>
                    </div>
                    <span className="text-xs text-gray-500">vs kemarin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2.5 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Rata-rata Nilai</p>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                    {formatCurrency(todayStats.avgOrderValue)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      <ArrowUp className="w-3 h-3" />
                      <span>Stabil</span>
                    </div>
                    <span className="text-xs text-gray-500">vs kemarin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Customers */}
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2.5 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pelanggan Hari Ini</p>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{todayStats.activeCustomers}</p>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      todayStats.customerGrowth >= 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {todayStats.customerGrowth >= 0 ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )}
                      <span>{formatGrowth(todayStats.customerGrowth)}</span>
                    </div>
                    <span className="text-xs text-gray-500">vs kemarin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart and Activities Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Hourly Performance Chart - Enhanced */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Performa Per Jam</h3>
                  <p className="text-sm text-gray-600 mt-1">Grafik pendapatan dan pesanan hari ini</p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                    <span className="text-gray-600 font-medium">Pendapatan</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                    <span className="text-gray-600 font-medium">Jumlah Pesanan</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-64 lg:h-80 overflow-x-auto">
                <div className="flex items-end justify-between h-full min-w-full px-2" style={{ minWidth: '600px' }}>
                  {hourlyData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 mx-1 group">
                      <div className="flex flex-col items-center mb-3">
                        <div
                          className="w-6 sm:w-8 mb-2 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-500 cursor-pointer shadow-sm"
                          style={{ 
                            height: `${Math.max((data.revenue / maxRevenue) * 200, 8)}px`,
                            minHeight: '8px'
                          }}
                          title={`Revenue: ${formatCurrency(data.revenue)}`}
                        ></div>
                        <div className="px-2 py-1 bg-gray-800 text-white text-xs font-bold rounded-md shadow-sm">
                          {data.orders}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                        {data.hour}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities - Enhanced */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Aktivitas Terbaru</h3>
                  <p className="text-sm text-gray-600 mt-1">Transaksi dan kegiatan terkini</p>
                </div>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className={`flex items-start space-x-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${getActivityBgColor(activity.type)}`}>
                      <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{activity.description}</p>
                        <p className="text-xs text-gray-600 mt-1">{activity.customer}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{activity.time}</span>
                          {activity.status && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                              {activity.status}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm font-bold mt-2 ${activity.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {activity.amount > 0 ? '+' : ''}{formatCurrency(activity.amount)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Belum ada aktivitas hari ini</p>
                    <p className="text-gray-400 text-sm mt-1">Aktivitas akan muncul di sini</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sdashboard;