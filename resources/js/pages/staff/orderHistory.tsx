//orderHistory.tsx

import React, { useState } from 'react';
import { Search } from 'lucide-react';

const OrderHistory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const historyOrders = [
    { id: '005', customer: 'Irzamara', category: 'Per Orang / 18 Orang', status: 'Selesai', date: '2025-05-15' },
    { id: '004', customer: 'Jasmid', category: 'Ruangan Acara', status: 'Selesai', date: '2025-05-12' },
    { id: '001', customer: 'Benediktiam', category: 'Per Orang / 6 Orang', status: 'Selesai', date: '2025-05-10' },
    { id: '003', customer: 'Rifqiylari', category: 'Ruangan Acara', status: 'Batal', date: '2025-05-08' },
    { id: '002', customer: 'Anqilyas', category: 'Per Orang / 15 Orang', status: 'Selesai', date: '2025-05-05' },
  ];

  const filteredOrders = historyOrders.filter(order => {
    const matchesSearch = !searchQuery ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.includes(searchQuery);

    const matchesCategory = !selectedCategory || order.category.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai': return 'bg-green-100 text-green-800';
      case 'Batal': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Selesai': return 'bg-green-500';
      case 'Batal': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full p-6 bg-gradient-to-br from-yellow-50 to-green-50">
      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nama Pemesan</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Detail</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{order.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${getStatusDot(order.status)} mr-2`}></div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <button className="px-3 py-1 font-medium text-orange-800 transition-colors bg-orange-200 rounded-md hover:bg-orange-300">
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
