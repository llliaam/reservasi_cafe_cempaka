// components/CustomersContent.tsx - Responsive Version
import React, { useState, useEffect } from 'react';
import { Plus, Upload, Users, Star, TrendingUp, Eye, Phone, Mail } from 'lucide-react';

interface CustomersContentProps {
  customers: any[];
  searchTerm: string;
  openModal: (type: string, data?: any) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

const CustomersContent: React.FC<CustomersContentProps> = ({
  customers = [],
  searchTerm,
  openModal,
  getStatusColor,
  getStatusText
}) => {
  const [filteredCustomers, setFilteredCustomers] = useState(customers);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Data Pelanggan</h2>
          <p className="text-gray-600 text-sm sm:text-base">Kelola informasi dan data pelanggan</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Pelanggan
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center text-sm font-medium">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{customers.length}</div>
              <div className="text-sm text-gray-600">Total Pelanggan</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{customers.filter(c => c.status === 'vip').length}</div>
              <div className="text-sm text-gray-600">Pelanggan VIP</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{customers.filter(c => c.status === 'active').length}</div>
              <div className="text-sm text-gray-600">Pelanggan Aktif</div>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Mobile View */}
        <div className="lg:hidden">
          <div className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700">
                      {customer.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{customer.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{customer.phone}</p>
                        <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 flex-shrink-0 ${getStatusColor(customer.status)}`}>
                        {getStatusText(customer.status)}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Pesanan: </span>
                        <span className="font-medium">{customer.totalOrders}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total: </span>
                        <span className="font-medium">Rp {customer.totalSpent.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-3">
                      <button 
                        onClick={() => openModal('customer', customer)}
                        className="text-blue-600 hover:text-blue-900 text-sm flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </button>
                      <button className="text-green-600 hover:text-green-900 text-sm flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </button>
                      <button className="text-purple-600 hover:text-purple-900 text-sm flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pesanan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Belanja</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terakhir Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {customer.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.phone}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.totalOrders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rp {customer.totalSpent.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.lastOrder}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                      {getStatusText(customer.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openModal('customer', customer)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-900">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pelanggan</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Tidak ada pelanggan yang sesuai dengan pencarian.' : 'Belum ada data pelanggan.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersContent;