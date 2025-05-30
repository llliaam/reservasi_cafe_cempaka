import React from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Clock, Users, ArrowUp, ArrowDown, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Sample data - in real app, this would come from API
  const todayStats = {
    totalRevenue: 2450000,
    totalOrders: 87,
    avgOrderValue: 28161,
    activeCustomers: 156,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
    customerGrowth: 15.2
  };

  const recentActivities = [
    { id: 1, type: 'sale', description: 'Nasi Ayam Penyet + Cappuccino', amount: 37000, time: '2 min ago', customer: 'Customer #142' },
    { id: 2, type: 'online', description: 'Online Order - Benediktiam', amount: 85000, time: '5 min ago', customer: 'Online' },
    { id: 3, type: 'sale', description: 'Frappe + Udang Keju', amount: 45000, time: '8 min ago', customer: 'Customer #141' },
    { id: 4, type: 'refund', description: 'Refund - Indomie Bangladesh', amount: -15000, time: '12 min ago', customer: 'Customer #140' },
    { id: 5, type: 'sale', description: 'Latte + Nasi Goreng Telor', amount: 34000, time: '15 min ago', customer: 'Customer #139' },
  ];

  const hourlyData = [
    { hour: '08:00', orders: 8, revenue: 120000 },
    { hour: '09:00', orders: 12, revenue: 180000 },
    { hour: '10:00', orders: 18, revenue: 275000 },
    { hour: '11:00', orders: 15, revenue: 235000 },
    { hour: '12:00', orders: 25, revenue: 425000 },
    { hour: '13:00', orders: 22, revenue: 380000 },
    { hour: '14:00', orders: 20, revenue: 340000 },
    { hour: '15:00', orders: 16, revenue: 285000 }
  ];

  const formatCurrency = (amount: number) => {
    return `Rp${Math.abs(amount).toLocaleString()}`;
  };

  const formatGrowth = (growth: number) => {
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  return (
    <div className="h-full p-6 overflow-y-auto bg-gradient-to-br from-yellow-50 to-green-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Today's overview and performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(todayStats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">{formatGrowth(todayStats.revenueGrowth)}</span>
            <span className="ml-2 text-sm text-gray-500">vs yesterday</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">{formatGrowth(todayStats.ordersGrowth)}</span>
            <span className="ml-2 text-sm text-gray-500">vs yesterday</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(todayStats.avgOrderValue)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">+5.2%</span>
            <span className="ml-2 text-sm text-gray-500">vs yesterday</span>
          </div>
        </div>

        {/* Active Customers */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Customers</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.activeCustomers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">{formatGrowth(todayStats.customerGrowth)}</span>
            <span className="ml-2 text-sm text-gray-500">vs yesterday</span>
          </div>
        </div>
      </div>

      {/* Hourly Performance Chart - Now Full Width */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Hourly Performance</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-64 overflow-x-auto">
          <div className="flex items-end justify-between h-full min-w-full px-2" style={{ minWidth: '600px' }}>
            {hourlyData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1 mx-1">
                <div className="flex flex-col items-center mb-2">
                  <div
                    className="w-8 mb-1 bg-orange-400 rounded-t-sm"
                    style={{ height: `${(data.revenue / 450000) * 180}px`, minHeight: '10px' }}
                  ></div>
                  <span className="text-xs font-medium text-gray-700">{data.orders}</span>
                </div>
                <span className="text-xs text-gray-500">{data.hour}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 bg-orange-400 rounded"></div>
            <span className="text-sm text-gray-600">Revenue</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 bg-gray-700 rounded"></div>
            <span className="text-sm text-gray-600">Orders</span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                  activity.type === 'sale' ? 'bg-green-100' :
                  activity.type === 'online' ? 'bg-blue-100' : 'bg-red-100'
                }`}>
                  {activity.type === 'sale' ? (
                    <ShoppingCart className={`w-5 h-5 ${activity.type === 'sale' ? 'text-green-600' : ''}`} />
                  ) : activity.type === 'online' ? (
                    <Users className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ArrowDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{activity.description}</p>
                  <p className="text-sm text-gray-500">{activity.customer} • {activity.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${activity.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {activity.amount > 0 ? '+' : ''}{formatCurrency(activity.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
