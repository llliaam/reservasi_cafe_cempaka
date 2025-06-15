import React from 'react';
import { useState, useEffect } from 'react';
import { 
  ShoppingBag, DollarSign, Users, Star, TrendingUp, ChevronRight, 
  Plus, RefreshCw, Package, FileText, Download, Calendar,
  Eye, Check, ArrowUp, ArrowDown, ShoppingCart // TAMBAHKAN ArrowUp, ArrowDown, ShoppingCart
} from 'lucide-react';

interface DashboardContentProps {
  stats: {
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    avgOrderValue: number;
    monthlyGrowth: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customerGrowth: number;
    confirmedReservations: number;
    totalReservations: number;
     orderRevenue?: number;
    reservationRevenue?: number;
    orderCount?: number;
    reservationCount?: number;
    recentReservations?: any[];
    recentOrders?: any[];
  };
   chartData?: Array<{
    hour: string;
    orders: number;
    reservations?: number;         // TAMBAH
    orderRevenue?: number;         // TAMBAH
    reservationRevenue?: number;   // TAMBAH
    totalTransactions?: number;    // TAMBAH
    totalRevenue?: number;         // TAMBAH
    revenue: number;
    full_date?: string;
  }>;
  currentPeriod?: string;
  dateRange?: {
    start: string;
    end: string;
    period: string;
  };
  setActiveTab: (tab: string) => void;
  openModal: (type: string, data?: any) => void;
  orders: any[];
  menuItems: any[];
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  handleConfirmReservation?: (id: number) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  stats,
  chartData = [],
  currentPeriod = 'today', 
  dateRange,
  setActiveTab,
  openModal,
  orders,
  menuItems,
  getStatusColor,
  getStatusText
}) => {

   const [dataFilter, setDataFilter] = useState<'all' | 'orders' | 'reservations'>('all');
  const [customStartDate, setCustomStartDate] = useState(dateRange?.start || '');
  const [customEndDate, setCustomEndDate] = useState(dateRange?.end || '');
  const [chartMode, setChartMode] = useState<'transactions' | 'revenue'>('transactions');
  
  const [localChartData, setLocalChartData] = useState(() => {
    if (chartData && chartData.length > 0) {
      return chartData;
    }
    return Array.from({ length: 15 }, (_, i) => ({
      hour: String(i + 8).padStart(2, '0') + ':00',
      orders: 0,
      revenue: 0
    }));
  });

  const [isLoading, setIsLoading] = useState(false);

   const getFilteredStats = () => {
  console.log('Processing filter:', dataFilter);
  console.log('Raw stats:', {
    orderRevenue: stats.orderRevenue,
    orderCount: stats.orderCount, 
    reservationRevenue: stats.reservationRevenue,
    reservationCount: stats.reservationCount
  });

  if (dataFilter === 'orders') {
    const result = {
      ...stats,
      totalRevenue: stats.orderRevenue || 0,
      totalOrders: stats.orderCount || 0,
      avgOrderValue: (stats.orderCount && stats.orderCount > 0) ? (stats.orderRevenue || 0) / stats.orderCount : 0,
      title: 'Data Pesanan'
    };
    console.log('Orders filter result:', result);
    return result;
  } 
  
  if (dataFilter === 'reservations') {
    const result = {
      ...stats,
      totalRevenue: stats.reservationRevenue || 0,
      totalOrders: stats.reservationCount || 0,
      avgOrderValue: (stats.reservationCount && stats.reservationCount > 0) ? (stats.reservationRevenue || 0) / stats.reservationCount : 0,
      title: 'Data Reservasi'
    };
    console.log('Reservations filter result:', result);
    return result;
  }
  
  // Semua data - gabungan
  const result = {
    ...stats,
    totalRevenue: (stats.orderRevenue || 0) + (stats.reservationRevenue || 0),
    totalOrders: (stats.orderCount || 0) + (stats.reservationCount || 0),
    avgOrderValue: ((stats.orderCount || 0) + (stats.reservationCount || 0)) > 0 ? 
      ((stats.orderRevenue || 0) + (stats.reservationRevenue || 0)) / ((stats.orderCount || 0) + (stats.reservationCount || 0)) : 0,
    title: 'Data Gabungan'
  };
  console.log('Combined filter result:', result);
  return result;
};

  const filteredStats = getFilteredStats();

const handleDateRangeChange = (newRange: 'today' | 'week' | 'month' | 'custom') => {
  setIsLoading(true);
  
  if (newRange !== 'custom') {
    window.location.href = `/dashboardAdmin?period=${newRange}`;
  }
};

  const handleCustomDateApply = () => {
  if (customStartDate && customEndDate) {
    // Validasi tanggal
    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate);
    
    if (startDate > endDate) {
      alert('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      return;
    }
    
    if (endDate > new Date()) {
      alert('Tanggal akhir tidak boleh lebih dari hari ini');
      return;
    }
    
    setIsLoading(true);
    
    // Redirect dengan parameter custom date
    const url = `/dashboardAdmin?period=custom&start_date=${customStartDate}&end_date=${customEndDate}`;
    window.location.href = url;
  } else {
    alert('Harap pilih tanggal mulai dan tanggal akhir');
  }
  };

   // Update chart data ketika props berubah
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      setLocalChartData(chartData);
    }
  }, [chartData]);

  useEffect(() => {
  console.log('=== STATS DEBUG ===');
  console.log('Full stats object:', stats);
  console.log('Breakdown check:', {
    orderRevenue: stats.orderRevenue,
    orderCount: stats.orderCount,
    reservationRevenue: stats.reservationRevenue,
    reservationCount: stats.reservationCount,
    hasOrderRevenue: stats.hasOwnProperty('orderRevenue'),
    hasOrderCount: stats.hasOwnProperty('orderCount'),
    hasReservationRevenue: stats.hasOwnProperty('reservationRevenue'),
    hasReservationCount: stats.hasOwnProperty('reservationCount')
  });
  console.log('Current filter:', dataFilter);
  console.log('=== END DEBUG ===');
}, [stats, dataFilter]);

  
// Update custom dates ketika dateRange props berubah
useEffect(() => {
  if (dateRange) {
    setCustomStartDate(dateRange.start || '');
    setCustomEndDate(dateRange.end || '');
  }
}, [dateRange]);

// Show custom date inputs when custom period is selected
useEffect(() => {
  if (currentPeriod === 'custom' && (!customStartDate || !customEndDate)) {
    // Set default dates if custom is selected but no dates provided
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    if (!customStartDate) {
      setCustomStartDate(lastWeek.toISOString().split('T')[0]);
    }
    if (!customEndDate) {
      setCustomEndDate(today.toISOString().split('T')[0]);
    }
  }
}, [currentPeriod, customStartDate, customEndDate]);

  const maxRevenue = Math.max(...localChartData.map(d => d.revenue || 0), 1)

  return (
    <div className="space-y-4 sm:space-y-6">
     {/* Admin Overview Cards - Updated */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
      {/* Quick Actions Card - Updated */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold">Aksi Cepat</h3>
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Plus className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-3">
          <button 
            onClick={() => setActiveTab('orders')}
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left"
          >
            + Kelola Pesanan
          </button>
          <button 
            onClick={() => setActiveTab('reservations')}
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left"
          >
            + Kelola Reservasi
          </button>
        </div>
      </div>

      {/* Performance Insights - Enhanced */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold">Performa Admin</h3>
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-90">Pesanan Completed</span>
            <span className="text-lg font-bold">{stats.completedOrders}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-90">Reservasi Dikonfirmasi</span>
            <span className="text-lg font-bold">{stats.confirmedReservations}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full" style={{width: `${Math.min((stats.completedOrders / stats.totalOrders) * 100, 100)}%`}}></div>
          </div>
          <span className="text-xs opacity-75">Tingkat completion: {Math.round((stats.completedOrders / stats.totalOrders) * 100)}%</span>
        </div>
      </div>
    </div>

    {/* Date Range Filter - Add this after Admin Overview Cards */}
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analisis Data</h2>
          <p className="text-sm text-gray-600">Filter berdasarkan periode waktu</p>
        </div>

         <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm mb-4 lg:mb-0">
      {[
        { key: 'all', label: 'Semua Data', icon: '📊' },
        { key: 'orders', label: 'Pesanan', icon: '🛒' },
        { key: 'reservations', label: 'Reservasi', icon: '📅' }
      ].map((option) => (
        <button
          key={option.key}
          onClick={() => setDataFilter(option.key)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
            dataFilter === option.key
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <span>{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
        
        {/* Date Range Buttons */}
         <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
          {[
            { key: 'today' as const, label: 'Hari Ini' },
            { key: 'week' as const, label: 'Minggu Ini' },
            { key: 'month' as const, label: 'Bulan Ini' },
            { key: 'custom' as const, label: 'Custom' }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => handleDateRangeChange(option.key)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                currentPeriod === option.key
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
        {/* Custom Date Range Inputs */}
        {currentPeriod === 'custom' && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white p-4 rounded-xl border border-gray-200 mt-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Dari:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]} // Maksimal hari ini
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sampai:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]} // Maksimal hari ini
                  min={customStartDate} // Minimal dari tanggal start
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            
            <button
              onClick={handleCustomDateApply}
              disabled={!customStartDate || !customEndDate || isLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memuat...' : 'Terapkan Filter'}
            </button>
          </div>
        )}
    </div>
      
      {/* Stats Grid - Update dengan format Rupiah */}
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
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Total Pendapatan {dataFilter !== 'all' && `(${filteredStats.title})`}
                  </p>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(filteredStats.totalRevenue || 0)}
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
                    <span>{(stats.revenueGrowth || 0) >= 0 ? '+' : ''}{(stats.revenueGrowth || 0).toFixed(1)}%</span>
                  </div>
                  <span className="text-xs text-gray-500">vs periode sebelumnya</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders/Transactions */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {dataFilter === 'all' ? 'Total Transaksi' : 
                    dataFilter === 'orders' ? 'Total Pesanan' : 'Total Reservasi'}
                  </p>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  {(filteredStats.totalOrders || 0).toLocaleString('id-ID')}
                </p>
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
                    <span>{(stats.ordersGrowth || 0) >= 0 ? '+' : ''}{(stats.ordersGrowth || 0).toFixed(1)}%</span>
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
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(stats.avgOrderValue || 0)}
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
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Pelanggan</p>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{(stats.totalCustomers || 0).toLocaleString('id-ID')}</p>
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
                    <span>{(stats.customerGrowth || 0) >= 0 ? '+' : ''}{(stats.customerGrowth || 0).toFixed(1)}%</span>
                  </div>
                  <span className="text-xs text-gray-500">vs periode sebelumnya</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Analytics Dashboard dengan Chart Gabungan */}
{/* Enhanced Analytics Dashboard dengan Dual Bar Chart */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
  {/* Revenue Trend dengan Dual Bar */}
  <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {currentPeriod === 'today' && 'Tren Per Jam (Hari Ini)'}
          {currentPeriod === 'week' && 'Tren Per Hari (Minggu Ini)'}
          {currentPeriod === 'month' && 'Tren Per Hari (Bulan Ini)'}
          {currentPeriod === 'custom' && 'Tren Custom Period'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Perbandingan aktivitas pesanan dan reservasi
        </p>
      </div>
      
      {/* Toggle View Mode */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setChartMode('transactions')}
          className={`px-3 py-1 text-sm font-medium rounded transition-all ${
            chartMode === 'transactions' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Transaksi
        </button>
        <button
          onClick={() => setChartMode('revenue')}
          className={`px-3 py-1 text-sm font-medium rounded transition-all ${
            chartMode === 'revenue' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Revenue
        </button>
      </div>
    </div>

    {/* Chart Area */}
    <div className="h-64 lg:h-80 overflow-x-auto">
      <div className="flex items-end justify-between h-full min-w-full">
        {localChartData.map((data, index) => {
          // VALIDASI DATA UNTUK MENCEGAH NaN
          const orderValue = chartMode === 'revenue' 
            ? (Number(data.orderRevenue) || 0) 
            : (Number(data.orders) || 0);
          const reservationValue = chartMode === 'revenue' 
            ? (Number(data.reservationRevenue) || 0) 
            : (Number(data.reservations) || 0);
          
          // Calculate max value dengan validasi
          const allValues = localChartData.map(d => {
            const oVal = chartMode === 'revenue' ? (Number(d.orderRevenue) || 0) : (Number(d.orders) || 0);
            const rVal = chartMode === 'revenue' ? (Number(d.reservationRevenue) || 0) : (Number(d.reservations) || 0);
            return Math.max(oVal, rVal);
          }).filter(v => !isNaN(v));
          
          const maxValue = Math.max(...allValues, 1);
          
          return (
              <div key={index} className="flex flex-col items-center flex-1 mx-1 group">
                <div className="flex flex-col items-center mb-3 h-full justify-end">
                  {/* Dual Bars */}
                  <div className="flex items-end space-x-1 mb-2">
                    {/* Orders Bar */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-4 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                        style={{ 
                          height: `${Math.max((orderValue / maxValue) * 180, orderValue > 0 ? 8 : 0)}px`
                        }}
                        title={chartMode === 'revenue' 
                          ? `Pesanan: ${new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0
                            }).format(orderValue)}`
                          : `Pesanan: ${orderValue}`
                        }
                      ></div>
                      <span className="text-xs text-blue-600 font-medium mt-1">
                        {chartMode === 'revenue' 
                          ? (orderValue === 0 ? '0' : new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(orderValue))
                          : orderValue
                        }
                      </span>
                    </div>
                    
                    {/* Reservations Bar */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-4 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t transition-all duration-300 hover:from-purple-600 hover:to-purple-500 cursor-pointer"
                        style={{ 
                          height: `${Math.max((reservationValue / maxValue) * 180, reservationValue > 0 ? 8 : 0)}px`
                        }}
                        title={chartMode === 'revenue' 
                          ? `Reservasi: ${new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0
                            }).format(reservationValue)}`
                          : `Reservasi: ${reservationValue}`
                        }
                      ></div>
                      <span className="text-xs text-purple-600 font-medium mt-1">
                        {chartMode === 'revenue' 
                          ? (reservationValue === 0 ? '0' : new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(reservationValue))
                          : reservationValue
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Time Label */}
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  {data.hour}
                </span>
              </div>
            );
          })}
      </div>
    </div>

    {/* Chart Legend */}
    <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded"></div>
        <span className="text-sm text-gray-600 font-medium">Pesanan</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-400 rounded"></div>
        <span className="text-sm text-gray-600 font-medium">Reservasi</span>
      </div>
    </div>

    {/* Summary Stats dengan Validasi */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="text-lg font-bold text-blue-600">
          {(() => {
            const value = chartMode === 'revenue' 
              ? localChartData.reduce((sum, d) => sum + (Number(d.orderRevenue) || 0), 0)
              : localChartData.reduce((sum, d) => sum + (Number(d.orders) || 0), 0);
            
            if (chartMode === 'revenue') {
              return isNaN(value) || value === 0 ? 'Rp 0' : new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                minimumFractionDigits: 0
              }).format(value);
            } else {
              return isNaN(value) ? '0' : value.toLocaleString('id-ID');
            }
          })()}
        </div>
        <div className="text-xs text-gray-600">
          {chartMode === 'revenue' ? 'Revenue Pesanan' : 'Total Pesanan'}
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-bold text-purple-600">
          {(() => {
            const value = chartMode === 'revenue' 
              ? localChartData.reduce((sum, d) => sum + (Number(d.reservationRevenue) || 0), 0)
              : localChartData.reduce((sum, d) => sum + (Number(d.reservations) || 0), 0);
            
            if (chartMode === 'revenue') {
              return isNaN(value) || value === 0 ? 'Rp 0' : new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                minimumFractionDigits: 0
              }).format(value);
            } else {
              return isNaN(value) ? '0' : value.toLocaleString('id-ID');
            }
          })()}
        </div>
        <div className="text-xs text-gray-600">
          {chartMode === 'revenue' ? 'Revenue Reservasi' : 'Total Reservasi'}
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-bold text-gray-900">
          {(() => {
            const orderValue = localChartData.reduce((sum, d) => sum + (Number(d.orderRevenue) || 0), 0);
            const reservationValue = localChartData.reduce((sum, d) => sum + (Number(d.reservationRevenue) || 0), 0);
            const orderCount = localChartData.reduce((sum, d) => sum + (Number(d.orders) || 0), 0);
            const reservationCount = localChartData.reduce((sum, d) => sum + (Number(d.reservations) || 0), 0);
            
            if (chartMode === 'revenue') {
              const total = orderValue + reservationValue;
              return isNaN(total) || total === 0 ? 'Rp 0' : new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                minimumFractionDigits: 0
              }).format(total);
            } else {
              const total = orderCount + reservationCount;
              return isNaN(total) ? '0' : total.toLocaleString('id-ID');
            }
          })()}
        </div>
        <div className="text-xs text-gray-600">
          {chartMode === 'revenue' ? 'Total Revenue' : 'Total Transaksi'}
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">
          {(() => {
            if (chartMode === 'revenue') {
              const totalRevenue = localChartData.reduce((sum, d) => sum + (Number(d.orderRevenue) || 0) + (Number(d.reservationRevenue) || 0), 0);
              const totalTransactions = localChartData.reduce((sum, d) => sum + (Number(d.orders) || 0) + (Number(d.reservations) || 0), 0);
              
              if (totalTransactions === 0 || isNaN(totalRevenue) || isNaN(totalTransactions)) {
                return 'Rp 0';
              }
              
              const avg = totalRevenue / totalTransactions;
              return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                minimumFractionDigits: 0
              }).format(avg);
            } else {
              const totalReservations = localChartData.reduce((sum, d) => sum + (Number(d.reservations) || 0), 0);
              const totalTransactions = localChartData.reduce((sum, d) => sum + (Number(d.orders) || 0) + (Number(d.reservations) || 0), 0);
              
              if (totalTransactions === 0 || isNaN(totalReservations) || isNaN(totalTransactions)) {
                return '0%';
              }
              
              const percentage = (totalReservations / totalTransactions) * 100;
              return `${Math.round(percentage)}%`;
            }
          })()}
        </div>
        <div className="text-xs text-gray-600">
          {chartMode === 'revenue' ? 'Rata-rata per Transaksi' : 'Rasio Reservasi'}
        </div>
      </div>
    </div>
  </div>

        {/* Key Metrics Summary - Enhanced dengan Data Jelas */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metrik Utama</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Konversi Reservasi</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.totalReservations > 0 ? Math.round((stats.confirmedReservations / stats.totalReservations) * 100) : 0}%
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {stats.confirmedReservations} dari {stats.totalReservations} reservasi
                  </p>
                </div>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Revenue per Customer</p>
                  <p className="text-2xl font-bold text-green-900">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(stats.totalCustomers > 0 ? Math.round(stats.totalRevenue / stats.totalCustomers) : 0)}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Rata-rata belanja per pelanggan
                  </p>
                </div>
                <div className="p-2 bg-green-200 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Pesanan Completed</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {Math.round((stats.completedOrders / stats.totalOrders) * 100)}%
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    {stats.completedOrders} dari {stats.totalOrders} pesanan
                  </p>
                </div>
                <div className="p-2 bg-purple-200 rounded-lg">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
     {/* Recent Orders & Recent Reservations - Updated untuk Seminggu */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Recent Orders - Data Seminggu */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pesanan Terbaru</h3>
                <p className="text-sm text-gray-600">Data 7 hari terakhir</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('orders')}
              className="text-sm text-blue-500 hover:text-blue-700 flex items-center font-medium transition-colors duration-200 hover:bg-blue-50 px-3 py-1 rounded-lg"
            >
              <span className="hidden sm:inline">Lihat Semua</span>
              <span className="sm:hidden">Semua</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
          {/* Data recent orders dari backend akan menampilkan 7 hari terakhir */}
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            stats.recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="group p-4 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="font-medium text-gray-900 text-sm truncate">{order.id}</div>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 truncate mb-1">{order.customer_name}</div>
                    <div className="text-xs text-gray-500 truncate">{order.items_count} item</div>
                    <div className="text-xs text-gray-400 mt-1">{order.order_time}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-gray-900 text-sm mb-2">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(order.total_amount)}
                    </div>
                    <button 
                      onClick={() => openModal('order', order)}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2 py-1 rounded transition-all duration-200 font-medium"
                    >
                      <Eye className="w-3 h-3 inline mr-1" />
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Belum ada pesanan minggu ini</p>
              <p className="text-gray-400 text-sm mt-1">Pesanan akan muncul di sini</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Reservations - Data Seminggu */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reservasi Terbaru</h3>
                <p className="text-sm text-gray-600">Data 7 hari terakhir</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('reservations')}
              className="text-sm text-purple-500 hover:text-purple-700 flex items-center font-medium transition-colors duration-200 hover:bg-purple-50 px-3 py-1 rounded-lg"
            >
              <span className="hidden sm:inline">Kelola Reservasi</span>
              <span className="sm:hidden">Kelola</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
          {/* Data reservasi dari backend akan menampilkan 7 hari terakhir */}
          {stats.recentReservations && stats.recentReservations.length > 0 ? (
            stats.recentReservations.slice(0, 5).map((reservation) => (
              <div key={reservation.id} className="group p-4 border-2 border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="font-medium text-gray-900 text-sm truncate">{reservation.reservation_code}</div>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 truncate mb-1">{reservation.customer_name}</div>
                    <div className="text-xs text-gray-500 truncate">{reservation.package_name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {reservation.date} • {reservation.time} • {reservation.guests} orang
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex space-x-1 mb-2">
                    {reservation.status === 'pending' && (
                      <button className="text-xs text-green-600 hover:text-green-800 hover:bg-green-100 px-2 py-1 rounded transition-all duration-200 font-medium">
                        <Check className="w-3 h-3 inline mr-1" />
                        Konfirmasi
                      </button>
                    )}
                    <button 
                      onClick={() => openModal('reservation', reservation)}
                      className="text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-100 px-2 py-1 rounded transition-all duration-200 font-medium"
                    >
                      <Eye className="w-3 h-3 inline mr-1" />
                      Detail
                    </button>
                  </div>
                  <div className="text-xs font-semibold text-green-600">
                    {reservation.total_price}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Belum ada reservasi minggu ini</p>
            <p className="text-gray-400 text-sm mt-1">Reservasi akan muncul di sini</p>
          </div>
        )}
      </div>
    </div>
    </div>

      </div>
  );
};

export default DashboardContent;