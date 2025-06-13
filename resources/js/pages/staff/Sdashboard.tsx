import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Clock, Users, ArrowUp, ArrowDown, Calendar, AlertCircle, Filter, RefreshCw } from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  activeCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customerGrowth: number;
}

interface PendingReservation {
  id: number;
  reservation_code: string;
  customer_name: string;
  date: string;
  time: string;
  guests: number;
  package_name: string;
  total_price: string;
  payment_method: string;
  payment_method_label: string;
  status: string;
  minutes_since_created: number;
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
  pendingOrders?: PendingOrder[];
  popularMenus?: PopularMenu[];
  pendingReservations?: PendingReservation[]; // ADD THIS
  currentPeriod?: 'today' | 'week' | 'month' | 'custom';
  currentDateRange?: {
    start: string;
    end: string;
    period: string;
  };
}

interface PendingOrder {
  id: number;
  order_code: string;
  customer_name: string;
  status: string;
  status_label: string;
  total_amount: number;
  order_time: string;
  minutes_ago: number;
  items_count: number;
  is_urgent: boolean;
}

interface PopularMenu {
  name: string;
  image_url: string;
  total_sold: number;
  total_revenue: number;
}

const Sdashboard: React.FC<DashboardProps> = ({ 
  dashboardData, 
  pendingOrders = [],
  popularMenus = [],
  pendingReservations = [], // ADD THIS
  currentPeriod = 'today',
  currentDateRange
}) => {


  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>(currentPeriod);
  const [customStartDate, setCustomStartDate] = useState(currentDateRange?.start || '');
  const [customEndDate, setCustomEndDate] = useState(currentDateRange?.end || '');
  const [isLoading, setIsLoading] = useState(false);

   const [pendingOrdersList, setPendingOrdersList] = useState<PendingOrder[]>(() => {
    // Jika pendingOrders adalah object, konversi ke array
    if (pendingOrders && typeof pendingOrders === 'object' && !Array.isArray(pendingOrders)) {
      return Object.values(pendingOrders);
    }
    return Array.isArray(pendingOrders) ? pendingOrders : [];
  });
  const [popularMenusList, setPopularMenusList] = useState<PopularMenu[]>(() => {
    // Sama untuk popularMenus
    if (popularMenus && typeof popularMenus === 'object' && !Array.isArray(popularMenus)) {
      return Object.values(popularMenus);
    }
    return Array.isArray(popularMenus) ? popularMenus : [];
  });
   const [pendingReservationsList, setPendingReservationsList] = useState<any[]>(() => {
    // Sama untuk pendingReservations
    if (pendingReservations && typeof pendingReservations === 'object' && !Array.isArray(pendingReservations)) {
      return Object.values(pendingReservations);
    }
    return Array.isArray(pendingReservations) ? pendingReservations : [];
  });

  console.log('=== CONVERTED DATA DEBUG ===');
  console.log('pendingOrdersList (converted):', pendingOrdersList);
  console.log('Is array:', Array.isArray(pendingOrdersList));
  console.log('Length:', pendingOrdersList.length);

  const [currentStats, setCurrentStats] = useState(dashboardData.todayStats);
  const [currentChartData, setCurrentChartData] = useState(dashboardData.hourlyData);
  const [currentPopularMenus, setCurrentPopularMenus] = useState(popularMenus);
  
  

  const [stats, setStats] = useState(dashboardData.todayStats);
  
  const { todayStats, hourlyData, recentActivities, pendingOrdersCount, todayReservationsCount } = dashboardData;
  console.log('Dashboard props:', { pendingOrders, popularMenus });

  console.log('Dashboard props:', { 
    pendingOrdersList, 
    popularMenusList,
    propsPopular: popularMenus,
    propsPending: pendingOrders 
  });

  const filteredPendingOrders = useMemo(() => {
    return pendingOrdersList.filter(order => 
      ['pending'].includes(order.status?.toLowerCase() || '')
    );
  }, [pendingOrdersList]);

  // Filter untuk pending reservations
  const filteredPendingReservations = useMemo(() => {
    return pendingReservationsList.filter(reservation => 
      reservation.status?.toLowerCase() === 'pending'
    );
  }, [pendingReservationsList]);
  

  const formatCurrency = (amount: number) => {
    return `Rp${Math.abs(amount).toLocaleString('id-ID')}`;
  };

  const formatGrowth = (growth: number) => {
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  // Helper functions for dynamic chart display
  const getCustomChartTitle = () => {
    if (!customStartDate || !customEndDate) return 'Performa Per Periode';
    
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return 'Performa Per Jam';
    } else if (diffDays <= 31) {
      return 'Performa Per Hari';
    } else {
      return 'Performa Per Bulan';
    }
  };

  const getCustomChartDescription = () => {
    if (!customStartDate || !customEndDate) return 'Grafik pendapatan dan pesanan periode dipilih';
    
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return 'Grafik pendapatan dan pesanan per jam';
    } else if (diffDays <= 31) {
      return 'Grafik pendapatan dan pesanan per hari';
    } else {
      return 'Grafik pendapatan dan pesanan per bulan';
    }
  };

  const getChartYAxisLabel = () => {
    if (dateRange === 'today') return 'Jumlah Per Jam';
    if (dateRange === 'week') return 'Jumlah Per Hari';
    if (dateRange === 'month') return 'Jumlah Per Hari';
    
    // For custom
    if (!customStartDate || !customEndDate) return 'Jumlah';
    
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'Jumlah Per Jam';
    if (diffDays <= 31) return 'Jumlah Per Hari';
    return 'Jumlah Per Bulan';
  };

  const getChartMinWidth = () => {
    if (dateRange === 'today') return '600px';
    if (dateRange === 'week') return '400px';
    if (dateRange === 'month') return '800px';
    
    // For custom, base on data length
    const dataLength = hourlyData.length;
    if (dataLength <= 8) return '400px';
    if (dataLength <= 15) return '600px';
    if (dataLength <= 31) return '800px';
    return '1000px';
  };

  const getTooltipText = (data) => {
    const baseText = `Revenue: ${formatCurrency(data.revenue)}\nOrders: ${data.orders}`;
    
    if (data.full_date) {
      return `${baseText}\nTanggal: ${data.full_date}`;
    }
    
    if (dateRange === 'today') {
      return `${baseText}\nJam: ${data.hour}`;
    }
    
    return `${baseText}\nPeriode: ${data.hour}`;
  };


  const handleDateRangeChange = (newRange: 'today' | 'week' | 'month' | 'custom') => {
    setDateRange(newRange);
    if (newRange !== 'custom') {
      loadDataForPeriod(newRange);
    }
  };

   const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      loadDataForPeriod('custom', customStartDate, customEndDate);
    }
  };

  // FUNCTION UNTUK LOAD DATA BERDASARKAN PERIODE
  const loadDataForPeriod = (period: string, startDate?: string, endDate?: string) => {
    setIsLoading(true);
    
    // Buat URL dengan query parameters
    const params = new URLSearchParams();
    params.append('period', period);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    // Redirect ke URL baru dengan parameters
    window.location.href = `/staffPage?${params.toString()}`;
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
    useEffect(() => {
    // Kalau mau auto refresh, buat simple aja
    console.log('Dashboard loaded');
  }, []);

  useEffect(() => {
    // Update ketika props berubah
    if (pendingOrders) {
      const converted = typeof pendingOrders === 'object' && !Array.isArray(pendingOrders) 
        ? Object.values(pendingOrders) 
        : Array.isArray(pendingOrders) ? pendingOrders : [];
      setPendingOrdersList(converted);
    }
  }, [pendingOrders]);

  useEffect(() => {
    if (popularMenus) {
      const converted = typeof popularMenus === 'object' && !Array.isArray(popularMenus) 
        ? Object.values(popularMenus) 
        : Array.isArray(popularMenus) ? popularMenus : [];
      setPopularMenusList(converted);
    }
  }, [popularMenus]);

  useEffect(() => {
    if (pendingReservations) {
      const converted = typeof pendingReservations === 'object' && !Array.isArray(pendingReservations) 
        ? Object.values(pendingReservations) 
        : Array.isArray(pendingReservations) ? pendingReservations : [];
      setPendingReservationsList(converted);
    }
  }, [pendingReservations]);

  const [chartData, setChartData] = useState(() => {
    const initialData = dashboardData?.hourlyData || [];
    if (initialData.length === 0) {
      // Fallback empty data
      return Array.from({ length: 15 }, (_, i) => ({
        hour: String(i + 8).padStart(2, '0') + ':00',
        orders: 0,
        revenue: 0
      }));
    }
    return initialData;
  });
  const maxRevenue = Math.max(...chartData.map(d => d.revenue || 0), 1);

  useEffect(() => {
  if (dashboardData?.hourlyData) {
    setChartData(dashboardData.hourlyData);
  }
}, [dashboardData]);



  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section dengan Date Filter */}
        <div className="mb-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                  Dashboard Staff
                </h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600 font-medium">
                  Ringkasan operasional dan performa
                </p>
              </div>
              
              {/* Date Range Buttons */}
              <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                {[
                  { key: 'today', label: 'Hari Ini' },
                  { key: 'week', label: 'Minggu Ini' },
                  { key: 'month', label: 'Bulan Ini' },
                  { key: 'custom', label: 'Custom' }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleDateRangeChange(option.key as any)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      dateRange === option.key
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Custom Date Range Inputs */}
            {dateRange === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Dari:</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sampai:</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleCustomDateApply}
                  disabled={!customStartDate || !customEndDate}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Terapkan Filter
                </button>
              </div>
            )}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                <span className="ml-2 text-sm text-gray-600">Memuat data...</span>
              </div>
            )}
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

        {/* Pending Orders and Reservations Management */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Orders Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Pesanan Menunggu</h3>
                  <p className="text-sm text-gray-600 mt-1">Pesanan online yang perlu diproses</p>
                </div>
                <div className="flex items-center space-x-2">
                 <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  {filteredPendingOrders.length} pesanan
                </span>
                </div>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {filteredPendingOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredPendingOrders.map((order) => (
                    <div 
                      key={`${order.type}-${order.id}`} // Unique key untuk online/offline orders
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        order.is_urgent 
                          ? 'border-red-200 bg-red-50' 
                          : 'border-gray-200 bg-white hover:border-orange-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{order.order_code}</h4>
                          <p className="text-sm text-gray-600">{order.customer_name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {order.is_urgent && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Urgent
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {order.status_label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Waktu:</span>
                          <span className="font-medium">{order.order_time} ({order.minutes_ago}m ago)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Items:</span>
                          <span className="font-medium">{order.items_count} item</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-semibold text-green-600">{formatCurrency(order.total_amount)}</span>
                        </div>
                        {order.type === 'online' && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tipe:</span>
                            <span className="font-medium text-blue-600">Online Order</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Tidak ada pesanan yang menunggu</p>
                  <p className="text-gray-400 text-sm mt-1">Semua pesanan sudah diproses</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Reservations Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Reservasi Menunggu</h3>
                  <p className="text-sm text-gray-600 mt-1">Reservasi yang perlu dikonfirmasi</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {filteredPendingReservations.length} reservasi
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {filteredPendingReservations.length > 0 ? (
                <div className="space-y-4">
                  {filteredPendingReservations.map((reservation) => (
                    <div 
                      key={reservation.id}
                      className="p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-200 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{reservation.reservation_code}</h4>
                          <p className="text-sm text-gray-600">{reservation.customer_name}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tanggal:</span>
                          <span className="font-medium">{reservation.date} {reservation.time}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tamu:</span>
                          <span className="font-medium">{reservation.guests} orang</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Paket:</span>
                          <span className="font-medium">{reservation.package_name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-semibold text-green-600">{reservation.total_price}</span>
                        </div>
                        {reservation.payment_method && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Pembayaran:</span>
                            <span className="font-medium">{reservation.payment_method_label}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Tidak ada reservasi yang menunggu</p>
                  <p className="text-gray-400 text-sm mt-1">Semua reservasi sudah dikonfirmasi</p>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Stats Grid - Update dengan growth yang dinamis */}
      
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
                    {formatCurrency(stats.totalRevenue || 0)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      (stats.revenueGrowth || 0) >= 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {(stats.revenueGrowth || 0) >= 0 ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )}
                      <span>{formatGrowth(stats.revenueGrowth || 0)}</span>
                    </div>
                    <span className="text-xs text-gray-500">vs periode sebelumnya</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Orders - Update serupa */}
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
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{stats.totalOrders || 0}</p>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      (stats.ordersGrowth || 0) >= 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {(stats.ordersGrowth || 0) >= 0 ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )}
                      <span>{formatGrowth(stats.ordersGrowth || 0)}</span>
                    </div>
                    <span className="text-xs text-gray-500">vs periode sebelumnya</span>
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
                    {formatCurrency(stats.avgOrderValue || 0)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      <ArrowUp className="w-3 h-3" />
                      <span>Stabil</span>
                    </div>
                    <span className="text-xs text-gray-500">vs periode sebelumnya</span>
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
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pelanggan Aktif</p>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{stats.activeCustomers || 0}</p>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      (stats.customerGrowth || 0) >= 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {(stats.customerGrowth || 0) >= 0 ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )}
                      <span>{formatGrowth(stats.customerGrowth || 0)}</span>
                    </div>
                    <span className="text-xs text-gray-500">vs periode sebelumnya</span>
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
                  <h3 className="text-lg font-bold text-gray-900">
                    {dateRange === 'today' && 'Performa Per Jam (Hari Ini)'}
                    {dateRange === 'week' && 'Performa Per Hari (Minggu Ini)'}
                    {dateRange === 'month' && 'Performa Per Hari (Bulan Ini)'}
                    {dateRange === 'custom' && getCustomChartTitle()}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {dateRange === 'today' && 'Grafik pendapatan dan pesanan per jam hari ini'}
                    {dateRange === 'week' && 'Grafik pendapatan dan pesanan per hari minggu ini'}
                    {dateRange === 'month' && 'Grafik pendapatan dan pesanan per hari bulan ini'}
                    {dateRange === 'custom' && getCustomChartDescription()}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                    <span className="text-gray-600 font-medium">Pendapatan</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                     <span className="text-gray-600 font-medium">
                      {getChartYAxisLabel()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-64 lg:h-80 overflow-x-auto">
                <div className="flex items-end justify-between h-full min-w-full px-2" style={{ minWidth: getChartMinWidth() }}>
                    {chartData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 mx-1 group">
                      <div className="flex flex-col items-center mb-3">
                        <div
                          className="w-6 sm:w-8 mb-2 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-500 cursor-pointer shadow-sm"
                          style={{ 
                            height: `${Math.max((data.revenue / maxRevenue) * 200, 8)}px`,
                            minHeight: '8px'
                          }}
                          title={getTooltipText(data)}
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

        {/* Popular Menu Items */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section 1: Menu Populer */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Menu Populer</h3>
                      <p className="text-sm text-gray-600 mt-1">Menu terlaris dari pesanan</p>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-orange-500" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {popularMenusList.filter(item => item.type === 'Menu').length > 0 ? (
                    <div className="space-y-4">
                      {popularMenusList.filter(item => item.type === 'Menu').map((menu, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 rounded-xl border border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-all">
                          <div className="relative flex-shrink-0">
                            <img
                              src={menu.image_url || '/images/poto_menu/default-food.jpg'}
                              alt={menu.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              #{index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">{menu.name}</h4>
                            <div className="flex justify-between text-xs">
                              <span className="text-orange-600 font-medium">{menu.total_sold} porsi</span>
                              <span className="text-green-600 font-semibold">{formatCurrency(menu.total_revenue)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium text-sm">Belum ada menu populer</p>
                      <p className="text-gray-400 text-xs mt-1">Data akan muncul setelah ada pesanan</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Paket Reservasi Populer */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Paket Reservasi Populer</h3>
                      <p className="text-sm text-gray-600 mt-1">Paket terlaris dari reservasi</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-500" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {popularMenusList.filter(item => item.type === 'Paket Reservasi').length > 0 ? (
                    <div className="space-y-4">
                      {popularMenusList.filter(item => item.type === 'Paket Reservasi').map((packageItem, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 rounded-xl border border-gray-200 hover:border-purple-200 hover:bg-purple-50 transition-all">
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                              <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              #{index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">{packageItem.name}</h4>
                            <div className="flex justify-between text-xs">
                              <span className="text-purple-600 font-medium">{packageItem.total_sold} reservasi</span>
                              <span className="text-green-600 font-semibold">{formatCurrency(packageItem.total_revenue)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium text-sm">Belum ada paket populer</p>
                      <p className="text-gray-400 text-xs mt-1">Data akan muncul setelah ada reservasi</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
  );
};

export default Sdashboard;