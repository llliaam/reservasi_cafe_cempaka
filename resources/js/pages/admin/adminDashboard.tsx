// pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/sidebar';
import TopBar from '@/components/admin/topbar';
import DashboardContent from '@/components/admin/dashboardContent';
import OrdersContent from '@/components/admin/orderContent';
import MenuContent from '@/components/admin/menuContent';
import CustomersContent from '@/components/admin/customerContent';
import StaffContent from '@/components/admin/staffContent';
import Modal from '@/components/admin/modal';
import ReservationContent from '@/components/admin/reservationContent';
import PackagesContent from '@/components/admin/packagesContent';
import { 
  Plus, 
  Package, 
  Star, 
  Calendar, 
  TrendingUp, 
  Upload 
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false);

  // Mock data for orders
  const [mockOrders] = useState([
    { 
      id: 'ORD-001', 
      customerName: 'Budi Santoso', 
      phone: '081234567890',
      service: 'Nasi Goreng Special, Es Teh Manis', 
      items: ['Nasi Goreng Special', 'Es Teh Manis'],
      type: 'dine-in',
      status: 'completed', 
      price: 35000, 
      date: '2024-03-20',
      paymentMethod: 'Cash',
      notes: 'Extra pedas'
    },
    { 
      id: 'ORD-002', 
      customerName: 'Siti Rahayu', 
      phone: '087654321098',
      service: 'Mie Ayam, Jus Alpukat', 
      items: ['Mie Ayam', 'Jus Alpukat'],
      type: 'takeaway',
      status: 'processing', 
      price: 42000, 
      date: '2024-03-20',
      paymentMethod: 'E-Wallet',
      notes: 'Tidak pakai bawang'
    },
    { 
      id: 'ORD-003', 
      customerName: 'Ahmad Fadli', 
      phone: '085678901234',
      service: 'Paket Reservasi Ulang Tahun', 
      items: ['Paket Reservasi Ulang Tahun'],
      type: 'reservation',
      status: 'pending', 
      price: 500000, 
      date: '2024-03-21',
      paymentMethod: 'Transfer Bank',
      notes: 'Untuk 20 orang'
    },
    { 
      id: 'ORD-004', 
      customerName: 'Dewi Lestari', 
      phone: '089012345678',
      service: 'Ayam Bakar, Sop Buah', 
      items: ['Ayam Bakar', 'Sop Buah'],
      type: 'dine-in',
      status: 'ready', 
      price: 55000, 
      date: '2024-03-20',
      paymentMethod: 'Cash',
      notes: ''
    },
    { 
      id: 'ORD-005', 
      customerName: 'Rudi Hermawan', 
      phone: '082345678901',
      service: 'Coffee Latte, Croissant', 
      items: ['Coffee Latte', 'Croissant'],
      type: 'takeaway',
      status: 'completed', 
      price: 38000, 
      date: '2024-03-20',
      paymentMethod: 'Debit Card',
      notes: 'Extra shot espresso'
    }
  ]);

  // Mock data for menu items
  const [menuItems, setMenuItems] = useState([
    { 
      id: 1, 
      name: 'Nasi Goreng Special', 
      category: 'Makanan', 
      price: 28000, 
      description: 'Nasi goreng dengan telur, ayam, dan sayuran segar',
      status: 'available', 
      popularity: 95,
      image: '/images/nasi-goreng.jpg'
    },
    { 
      id: 2, 
      name: 'Mie Ayam', 
      category: 'Makanan', 
      price: 25000, 
      description: 'Mie dengan topping ayam cincang dan pangsit',
      status: 'available', 
      popularity: 88,
      image: '/images/mie-ayam.jpg'
    },
    { 
      id: 3, 
      name: 'Es Teh Manis', 
      category: 'Minuman', 
      price: 8000, 
      description: 'Teh manis dingin segar',
      status: 'available', 
      popularity: 92,
      image: '/images/es-teh.jpg'
    },
    { 
      id: 4, 
      name: 'Jus Alpukat', 
      category: 'Minuman', 
      price: 18000, 
      description: 'Jus alpukat segar dengan susu',
      status: 'available', 
      popularity: 85,
      image: '/images/jus-alpukat.jpg'
    },
    { 
      id: 5, 
      name: 'Ayam Bakar', 
      category: 'Makanan', 
      price: 35000, 
      description: 'Ayam bakar dengan bumbu khas Cafe Cempaka',
      status: 'available', 
      popularity: 90,
      image: '/images/ayam-bakar.jpg'
    },
    { 
      id: 6, 
      name: 'Coffee Latte', 
      category: 'Minuman', 
      price: 25000, 
      description: 'Espresso dengan steamed milk',
      status: 'available', 
      popularity: 87,
      image: '/images/coffee-latte.jpg'
    }
  ]);

  // Mock data for customers
  const [mockCustomers] = useState([
    { 
      id: 1, 
      name: 'Budi Santoso', 
      phone: '081234567890', 
      email: 'budi@email.com', 
      address: 'Jl. Sudirman No. 123',
      totalOrders: 15, 
      totalSpent: 450000, 
      status: 'active', 
      lastOrder: '2024-03-20',
      joinDate: '2023-01-15'
    },
    { 
      id: 2, 
      name: 'Siti Rahayu', 
      phone: '087654321098', 
      email: 'siti@email.com', 
      address: 'Jl. Gatot Subroto No. 45',
      totalOrders: 25, 
      totalSpent: 750000, 
      status: 'vip', 
      lastOrder: '2024-03-19',
      joinDate: '2022-12-10'
    },
    { 
      id: 3, 
      name: 'Ahmad Fadli', 
      phone: '085678901234', 
      email: 'ahmad@email.com', 
      address: 'Jl. Asia Afrika No. 67',
      totalOrders: 8, 
      totalSpent: 280000, 
      status: 'active', 
      lastOrder: '2024-03-15',
      joinDate: '2023-05-20'
    },
    { 
      id: 4, 
      name: 'Dewi Lestari', 
      phone: '089012345678', 
      email: 'dewi@email.com', 
      address: 'Jl. Diponegoro No. 89',
      totalOrders: 5, 
      totalSpent: 150000, 
      status: 'inactive', 
      lastOrder: '2024-01-10',
      joinDate: '2023-08-05'
    }
  ]);

  // Mock data for staff
  const [mockStaff] = useState([
    { 
      id: 1, 
      name: 'Andi Wijaya', 
      position: 'Head Chef', 
      phone: '081234567890', 
      email: 'andi@cafecempaka.com',
      salary: 5000000, 
      performance: 95, 
      status: 'active', 
      joinDate: '2022-01-15'
    },
    { 
      id: 2, 
      name: 'Rina Susanti', 
      position: 'Waitress', 
      phone: '087654321098', 
      email: 'rina@cafecempaka.com',
      salary: 3000000, 
      performance: 88, 
      status: 'active', 
      joinDate: '2023-03-10'
    },
    { 
      id: 3, 
      name: 'Joko Prasetyo', 
      position: 'Barista', 
      phone: '085678901234', 
      email: 'joko@cafecempaka.com',
      salary: 3500000, 
      performance: 92, 
      status: 'active', 
      joinDate: '2022-06-20'
    },
    { 
      id: 4, 
      name: 'Sari Indah', 
      position: 'Cashier', 
      phone: '089012345678', 
      email: 'sari@cafecempaka.com',
      salary: 3200000, 
      performance: 85, 
      status: 'active', 
      joinDate: '2023-01-05'
    }
  ]);

  // Mock notifications
  const [notifications] = useState([
    { id: 1, message: 'Pesanan baru dari Budi Santoso', type: 'order', time: '5 menit lalu' },
    { id: 2, message: 'Stok Kopi hampir habis', type: 'inventory', time: '30 menit lalu' },
    { id: 3, message: 'Reservasi untuk besok: 3 meja', type: 'reservation', time: '1 jam lalu' }
  ]);

  // Calculate stats
  const stats = {
    totalOrders: mockOrders.length,
    completedOrders: mockOrders.filter(o => o.status === 'completed').length,
    totalRevenue: mockOrders.reduce((sum, order) => sum + order.price, 0),
    totalCustomers: mockCustomers.length,
    avgOrderValue: Math.round(mockOrders.reduce((sum, order) => sum + order.price, 0) / mockOrders.length),
    monthlyGrowth: 12
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'vip':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'processing': return 'Diproses';
      case 'pending': return 'Menunggu';
      case 'ready': return 'Siap';
      case 'active': return 'Aktif';
      case 'inactive': return 'Tidak Aktif';
      case 'vip': return 'VIP';
      default: return status;
    }
  };

  const openModal = (type: string, data?: any) => {
    setModalType(type);
    setModalData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('');
    setModalData(null);
  };

  // Render modal content based on type
  const renderModalContent = () => {
    if (!modalData) return null;

    switch (modalType) {
      case 'order':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID Pesanan</p>
                <p className="font-medium">{modalData.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(modalData.status)}`}>
                  {getStatusText(modalData.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pelanggan</p>
                <p className="font-medium">{modalData.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">No. Telepon</p>
                <p className="font-medium">{modalData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipe Order</p>
                <p className="font-medium">{modalData.type === 'dine-in' ? 'Dine In' : modalData.type === 'takeaway' ? 'Takeaway' : 'Reservasi'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Harga</p>
                <p className="font-medium">Rp {modalData.price.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Items</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                {modalData.items?.map((item: string, index: number) => (
                  <p key={index} className="text-sm">{item}</p>
                ))}
              </div>
            </div>
            {modalData.notes && (
              <div>
                <p className="text-sm text-gray-600">Catatan</p>
                <p className="text-sm">{modalData.notes}</p>
              </div>
            )}
          </div>
        );
      
      case 'customer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-medium">{modalData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(modalData.status)}`}>
                  {getStatusText(modalData.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">No. Telepon</p>
                <p className="font-medium">{modalData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{modalData.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Alamat</p>
                <p className="font-medium">{modalData.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pesanan</p>
                <p className="font-medium">{modalData.totalOrders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Belanja</p>
                <p className="font-medium">Rp {modalData.totalSpent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bergabung Sejak</p>
                <p className="font-medium">{modalData.joinDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Terakhir Order</p>
                <p className="font-medium">{modalData.lastOrder}</p>
              </div>
            </div>
          </div>
        );
      
      case 'staff':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-medium">{modalData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Posisi</p>
                <p className="font-medium">{modalData.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">No. Telepon</p>
                <p className="font-medium">{modalData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{modalData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gaji</p>
                <p className="font-medium">Rp {modalData.salary.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Performance</p>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${modalData.performance >= 90 ? 'bg-green-500' : modalData.performance >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${modalData.performance}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{modalData.performance}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(modalData.status)}`}>
                  {getStatusText(modalData.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bergabung Sejak</p>
                <p className="font-medium">{modalData.joinDate}</p>
              </div>
            </div>
          </div>
        );
      
      case 'menu':
        return (
          <div className="space-y-4">
            <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg mb-4">
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama Menu</p>
                <p className="font-medium">{modalData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kategori</p>
                <p className="font-medium">{modalData.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Harga</p>
                <p className="font-medium">Rp {modalData.price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(modalData.status === 'available' ? 'active' : 'inactive')}`}>
                  {modalData.status === 'available' ? 'Tersedia' : 'Habis'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Popularitas</p>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{modalData.popularity}%</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deskripsi</p>
              <p className="text-sm">{modalData.description}</p>
            </div>
          </div>
        );
      
      case 'reservation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID Reservasi</p>
                <p className="font-medium">{modalData.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  modalData.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  modalData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  modalData.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {modalData.status === 'confirmed' ? 'Dikonfirmasi' :
                   modalData.status === 'pending' ? 'Menunggu' :
                   modalData.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pelanggan</p>
                <p className="font-medium">{modalData.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">No. Telepon</p>
                <p className="font-medium">{modalData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipe Reservasi</p>
                <p className="font-medium">{modalData.type === 'acara' ? 'Acara' : 'Private Dining'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Paket</p>
                <p className="font-medium">{modalData.packageName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal</p>
                <p className="font-medium">{modalData.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Waktu</p>
                <p className="font-medium">{modalData.time} ({modalData.duration})</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jumlah Tamu</p>
                <p className="font-medium">{modalData.guests} orang</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lokasi</p>
                <p className="font-medium">{modalData.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Harga</p>
                <p className="font-medium">Rp {modalData.totalPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">DP Dibayar</p>
                <p className="font-medium">Rp {modalData.downPayment.toLocaleString()}</p>
              </div>
            </div>
            {modalData.notes && (
              <div>
                <p className="text-sm text-gray-600">Catatan</p>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{modalData.notes}</p>
              </div>
            )}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">Dibuat pada: {modalData.createdAt}</p>
            </div>
          </div>
        );

      case 'package':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama Paket</p>
                <p className="font-medium">{modalData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipe</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  modalData.type === 'acara' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {modalData.type === 'acara' ? 'Acara' : 'Private Dining'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kategori</p>
                <p className="font-medium">{modalData.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(modalData.status)}`}>
                  {modalData.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Harga</p>
                <p className="font-medium">Rp {modalData.price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kapasitas</p>
                <p className="font-medium">{modalData.minGuests} - {modalData.maxGuests} orang</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Durasi</p>
                <p className="font-medium">{modalData.duration}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Booking</p>
                <p className="font-medium">{modalData.totalBookings} kali</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deskripsi</p>
              <p className="text-sm">{modalData.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Fasilitas</p>
              <div className="space-y-1">
                {modalData.facilities?.map((facility: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{facility}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Menu Termasuk</p>
              <div className="space-y-1">
                {modalData.menuIncluded?.map((menu: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{menu}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar */}
        <TopBar 
          activeTab={activeTab} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          notifications={notifications}
        />
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
            <DashboardContent 
              stats={stats}
              setActiveTab={setActiveTab}
              openModal={openModal}
              mockOrders={mockOrders}
              mockMenuItems={menuItems}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          )}
          
          {activeTab === 'orders' && (
            <OrdersContent 
              mockOrders={mockOrders}
              searchTerm={searchTerm}
              openModal={openModal}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          )}
          
          {activeTab === 'menu' && (
            <MenuContent 
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              searchTerm={searchTerm}
              openModal={openModal}
              setIsAddMenuOpen={setIsAddMenuOpen}
              getStatusColor={getStatusColor}
            />
          )}
          
          {activeTab === 'customers' && (
            <CustomersContent 
              mockCustomers={mockCustomers}
              searchTerm={searchTerm}
              openModal={openModal}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          )}
          
          {activeTab === 'staff' && (
            <StaffContent 
              mockStaff={mockStaff}
              openModal={openModal}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          )}
          
          {activeTab === 'packages' && (
            <PackagesContent 
              searchTerm={searchTerm}
              openModal={openModal}
              setIsAddPackageOpen={setIsAddPackageOpen}
              getStatusColor={getStatusColor}
            />
          )}
          
          {activeTab === 'reservations' && (
            <ReservationContent 
              searchTerm={searchTerm}
              openModal={openModal}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          )}
          
          {activeTab === 'analytics' && (
            <div className="text-center py-20">
              <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Analytics & Report</h3>
              <p className="text-gray-600">Fitur ini sedang dalam pengembangan</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={
          modalType === 'order' ? 'Detail Pesanan' :
          modalType === 'customer' ? 'Detail Pelanggan' :
          modalType === 'staff' ? 'Detail Staff' :
          modalType === 'menu' ? 'Detail Menu' :
          modalType === 'reservation' ? 'Detail Reservasi' :
          modalType === 'package' ? 'Detail Paket' : ''
        }
      />
        {renderModalContent()}
      {/* Add Package Modal */}
      <Modal 
        isOpen={isAddPackageOpen} 
        onClose={() => setIsAddPackageOpen(false)}
        title="Tambah Paket Reservasi Baru"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Paket</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500">
                <option value="acara">Acara</option>
                <option value="private">Private Dining</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <input type="text" placeholder="Birthday, Corporate, dll" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durasi</label>
              <input type="text" placeholder="3 jam" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min. Tamu</label>
              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max. Tamu</label>
              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" rows={3}></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fasilitas (pisahkan dengan koma)</label>
            <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" rows={2} placeholder="Dekorasi, Sound system, MC, dll"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Menu Termasuk (pisahkan dengan koma)</label>
            <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" rows={2} placeholder="Welcome drink, Main course, Dessert, dll"></textarea>
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="submit" className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700">
              Simpan Paket
            </button>
            <button type="button" onClick={() => setIsAddPackageOpen(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
              Batal
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Menu Modal */}
      <Modal 
        isOpen={isAddMenuOpen} 
        onClose={() => setIsAddMenuOpen(false)}
        title="Tambah Menu Baru"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500">
                <option>Makanan</option>
                <option>Minuman</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" rows={3}></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Gambar</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Klik untuk upload atau drag & drop</p>
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="submit" className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700">
              Simpan Menu
            </button>
            <button type="button" onClick={() => setIsAddMenuOpen(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;