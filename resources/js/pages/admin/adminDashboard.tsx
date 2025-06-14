// pages/AdminDashboard.tsx - Responsive Version
import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
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
  Upload,
  Check,          
  X,              
  XCircle,        
  AlertCircle,    
  CheckCircle,    
  Trash2,         
  Eye,
  Edit3,
  Menu,
  ChevronLeft,
  Shield,
  ShieldOff             
} from 'lucide-react';

interface ReservationData {
  id: number;
  reservation_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  package_name: string;
  table_name?: string;
  table_number?: number;
  date: string;
  time: string;
  guests: number;
  status: string;
  payment_method: string;
  payment_method_label: string;
  total_price: string;
  special_requests?: string;
  table_location: string;
  location_detail?: string;
  proof_of_payment?: string;
  can_be_confirmed: boolean;
  can_be_cancelled: boolean;
  requires_payment_confirmation: boolean;
  package_price: number;
  menu_subtotal: number;
  raw_date: string;
  raw_time: string;
}

interface AdminDashboardProps {
  user: any;
  stats: any;
  notifications: any[];
  recentActivity: any[];
  reservations: ReservationData[];
  orders?: any[];          
  customers?: any[];       
  staff?: any[];          
  menuItems?: any[];
  menuCategories?: any[];    
  packages?: any[];
  
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, 
  stats, 
  notifications, 
  recentActivity, 
  reservations: initialReservations,
  orders: initialOrders = [],
  customers: initialCustomers = [],
  staff: initialStaff = [],
  menuItems: initialMenuItems = [],
  menuCategories = [],
  packages: initialPackages = []
}) => {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_active_tab') || 'dashboard';
    }
    return 'dashboard';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any>(null);
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false);
  const [isEditPackageOpen, setIsEditPackageOpen] = useState(false);
  const [editPackageData, setEditPackageData] = useState({
    id: null,
    name: '',
    price: '',
    duration: '',
    max_people: '',
    description: '',
    includes: '',
    image: null as File | null,
    current_image: ''
  });
  const [isSubmittingEditPackage, setIsSubmittingEditPackage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reservations, setReservations] = useState<ReservationData[]>(initialReservations || []);
  const [orders, setOrders] = useState(initialOrders);
  const [customers, setCustomers] = useState(initialCustomers);
  const [staff, setStaff] = useState(initialStaff);
  const [packages, setPackages] = useState(initialPackages);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [newPackageData, setNewPackageData] = useState({
  name: '',
  price: '',
  duration: '',
  max_people: '',
  description: '',
  includes: '',
  image: null as File | null
});
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
      title: '',
      message: '',
      confirmText: '',
      onConfirm: () => {},
      type: 'danger'
    });
    const [newMenuData, setNewMenuData] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    image: null as File | null
    });
    const [editMenuData, setEditMenuData] = useState({
    id: null,
    name: '',
    category_id: '',
    price: '',
    description: '',
    image: null as File | null,
    current_image: '' // untuk menyimpan gambar yang sudah ada
    });
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isSubmittingEditMenu, setIsSubmittingEditMenu] = useState(false);
  const [showEditPackageConfirm, setShowEditPackageConfirm] = useState(false);
  const [pendingEditPackageData, setPendingEditPackageData] = useState(null);
  
  
  const [isSubmittingMenu, setIsSubmittingMenu] = useState(false);
  
  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('admin_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
  return () => {
    if (newMenuData.image) {
      URL.revokeObjectURL(URL.createObjectURL(newMenuData.image));
    }
  };
}, [newMenuData.image]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const menuButton = document.getElementById('mobile-menu-button');
      
      if (
        isSidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Close sidebar when tab changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);

  // Function to refresh reservations data
  const refreshReservations = async () => {
    setIsRefreshing(true);
    try {
      router.reload({
        only: ['reservations'],
        preserveState: true,
        preserveScroll: true,
        onSuccess: (page) => {
          if (page.props.reservations) {
            setReservations(page.props.reservations);
          }
          console.log('Data reservasi berhasil diperbarui');
        },
        onError: (errors) => {
          console.error('Error refreshing data:', errors);
        }
      });
    } catch (error) {
      console.error('Error refreshing reservations:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleMenuStatus = (id: number) => {
  const menuItem = menuItems.find(item => item.id === id);
  if (!menuItem) return;

  router.patch(`/admin/menu/${id}/toggle-status`, {
    is_available: !menuItem.is_available
  }, {
    preserveState: true,
    preserveScroll: true,
    onSuccess: (page) => {
      if (page.props.menuItems) {
        setMenuItems(page.props.menuItems);
      }
      console.log('Status menu berhasil diupdate');
    },
    onError: (errors) => {
      console.error('Error updating menu status:', errors);
    }
  });
};

  const showImageInModal = (imageUrl: string) => {
    setImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const showConfirmAlert = (config: any) => {
    setAlertConfig(config);
    setShowAlert(true);
  };

  const handleConfirmReservation = (reservationId: number) => {
    showConfirmAlert({
      title: 'Konfirmasi Reservasi',
      message: 'Apakah Anda yakin ingin mengonfirmasi reservasi ini?',
      confirmText: 'Ya, Konfirmasi',
      type: 'success',
      onConfirm: () => {
        router.patch(`/admin/reservations/${reservationId}/status`, {
          status: 'confirmed'
        }, {
          preserveState: true,
          preserveScroll: true,
          onSuccess: (page) => {
            if (page.props.reservations) {
              setReservations(page.props.reservations);
            }
            
            const updatedReservation = page.props.reservations?.find((r: any) => r.id === reservationId);
            if (updatedReservation && modalData && modalData.id === reservationId) {
              setModalData(updatedReservation);
            }
            
            console.log('Reservasi berhasil dikonfirmasi');
          },
          onError: (errors) => {
            console.error('Error confirming reservation:', errors);
          }
        });
        setShowAlert(false);
      }
    });
  };

  const handleCancelReservation = (reservationId: number) => {
    showConfirmAlert({
      title: 'Batalkan Reservasi',
      message: 'Apakah Anda yakin ingin membatalkan reservasi ini?',
      confirmText: 'Ya, Batalkan',
      type: 'warning',
      onConfirm: () => {
        router.patch(`/admin/reservations/${reservationId}/status`, {
          status: 'cancelled'
        }, {
          preserveState: true,
          preserveScroll: true,
          onSuccess: (page) => {
            if (page.props.reservations) {
              setReservations(page.props.reservations);
            }
            
            const updatedReservation = page.props.reservations?.find((r: any) => r.id === reservationId);
            if (updatedReservation && modalData && modalData.id === reservationId) {
              setModalData(updatedReservation);
            }
            
            console.log('Reservasi berhasil dibatalkan');
          },
          onError: (errors) => {
            console.error('Error cancelling reservation:', errors);
          }
        });
        setShowAlert(false);
      }
    });
  };

  const formatRupiahSafe = (amount: any) => {
  const safeAmount = Number(amount) || 0;
  
  if (isNaN(safeAmount)) {
    return 'Rp 0';
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(safeAmount);
};

  const handleDeleteReservation = (reservationId: number) => {
    showConfirmAlert({
      title: 'Hapus Reservasi',
      message: 'Apakah Anda yakin ingin menghapus reservasi ini? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Hapus',
      type: 'danger',
      onConfirm: () => {
        router.delete(`/admin/reservations/${reservationId}`, {
          preserveState: true,
          preserveScroll: true,
          onSuccess: (page) => {
            if (page.props.reservations) {
              setReservations(page.props.reservations);
            }
            closeModal();
            console.log('Reservasi berhasil dihapus');
          },
          onError: (errors) => {
            console.error('Error deleting reservation:', errors);
          }
        });
        setShowAlert(false);
      }
    });
  };

  const handleAddMenu = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmittingMenu(true);

  const formData = new FormData();
  formData.append('name', newMenuData.name);
  formData.append('category_id', newMenuData.category_id);
  formData.append('price', newMenuData.price);
  formData.append('description', newMenuData.description);
  if (newMenuData.image) {
    formData.append('image', newMenuData.image);
  }

  router.post('/admin/menu/store', formData, {
    preserveState: true,
    preserveScroll: true,
    onSuccess: (page) => {
      if (page.props.menuItems) {
        setMenuItems(page.props.menuItems);
      }
      setIsAddMenuOpen(false);
      setNewMenuData({
        name: '',
        category_id: '',
        price: '',
        description: '',
        image: null
      });
      console.log('Menu berhasil ditambahkan');
    },
    onError: (errors) => {
      console.error('Error adding menu:', errors);
    },
    onFinish: () => {
      setIsSubmittingMenu(false);
    }
  });
};

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPackage(true);

    const formData = new FormData();
    formData.append('name', newPackageData.name);
    formData.append('price', newPackageData.price);
    formData.append('duration', newPackageData.duration);
    formData.append('max_people', newPackageData.max_people);
    formData.append('description', newPackageData.description);
    formData.append('includes', newPackageData.includes);
    
    if (newPackageData.image) {
      formData.append('image', newPackageData.image);
    }

    router.post('/admin/packages/store', formData, {
      forceFormData: true,
      preserveState: true,
      preserveScroll: true,
      onSuccess: (page) => {
        // Update dari response server jika ada
        if (page.props.packages) {
          setPackages(page.props.packages);
        } else {
          // Fallback: tambah ke state manual
          const newPackage = {
            id: Date.now(),
            name: newPackageData.name,
            price: parseFloat(newPackageData.price),
            duration: newPackageData.duration,
            maxGuests: parseInt(newPackageData.max_people),
            description: newPackageData.description,
            facilities: newPackageData.includes.split(', ').filter(f => f.trim()),
            menuIncluded: newPackageData.includes.split(', ').filter(f => f.trim()),
            status: 'active',
            popularity: 85,
            totalBookings: 0,
            createdAt: new Date().toISOString().split('T')[0]
          };
          setPackages([newPackage, ...packages]);
        }
        
        setIsAddPackageOpen(false);
        setNewPackageData({
          name: '',
          price: '',
          duration: '',
          max_people: '',
          description: '',
          includes: '',
          image: null
        });
        console.log('Paket berhasil ditambahkan');
      },
      onError: (errors) => {
        console.error('Error adding package:', errors);
        alert('Gagal menambahkan paket!');
      },
      onFinish: () => {
        setIsSubmittingPackage(false);
      }
    });
  };

const handlePackageInputChange = (field: string, value: string | File | null) => {
  setNewPackageData(prev => ({
    ...prev,
    [field]: value
  }));
};

const handleMenuInputChange = (field: string, value: string | File | null) => {
  setNewMenuData(prev => ({
    ...prev,
    [field]: value
  }));
};

const handleEditMenu = (menuData: any) => {
  setEditMenuData({
    id: menuData.id,
    name: menuData.name,
    category_id: menuData.category_id || '',
    price: menuData.price.toString(),
    description: menuData.description || '',
    image: null,
    current_image: menuData.image || ''
  });
  setIsEditMenuOpen(true);
};

const handleEditMenuInputChange = (field: string, value: string | File | null) => {
  setEditMenuData(prev => ({
    ...prev,
    [field]: value
  }));
};

const handleSubmitEditMenu = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmittingEditMenu(true);

  const formData = new FormData();
  formData.append('name', editMenuData.name);
  formData.append('category_id', editMenuData.category_id);
  formData.append('price', editMenuData.price);
  formData.append('description', editMenuData.description);
  formData.append('_method', 'PUT'); // Laravel method spoofing
  
  if (editMenuData.image) {
    formData.append('image', editMenuData.image);
  }

  router.post(`/admin/menu/${editMenuData.id}/update`, formData, {
    forceFormData: true,
    preserveState: true,
    preserveScroll: true,
    onSuccess: (page) => {
      if (page.props.menuItems) {
        setMenuItems(page.props.menuItems);
      }
      setIsEditMenuOpen(false);
      setEditMenuData({
        id: null,
        name: '',
        category_id: '',
        price: '',
        description: '',
        image: null,
        current_image: ''
      });
      console.log('Menu berhasil diupdate');
    },
    onError: (errors) => {
      console.error('Error updating menu:', errors);
    },
    onFinish: () => {
      setIsSubmittingEditMenu(false);
    }
  });
};

const handleEditPackage = (packageData: any) => {
  setEditPackageData({
    id: packageData.id,
    name: packageData.name || '',
    price: packageData.price ? packageData.price.toString() : '',
    duration: packageData.duration || '',
    max_people: packageData.maxGuests ? packageData.maxGuests.toString() : '',
    description: packageData.description || '',
    includes: packageData.facilities ? (Array.isArray(packageData.facilities) ? packageData.facilities.join(', ') : packageData.facilities) : '',
    image: null,
    current_image: packageData.image_url || ''
  });
  setIsEditPackageOpen(true);
};

const handleEditPackageInputChange = (field: string, value: string | File | null) => {
  setEditPackageData(prev => ({
    ...prev,
    [field]: value
  }));
};

 const handleSubmitEditPackage = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Simpan data untuk konfirmasi
  setPendingEditPackageData(editPackageData);
  setShowEditPackageConfirm(true);
};

// Tambahkan fungsi baru untuk eksekusi update
const executeEditPackage = async () => {
  if (!pendingEditPackageData) return;
  
  setIsSubmittingEditPackage(true);

  const formData = new FormData();
  formData.append('name', pendingEditPackageData.name);
  formData.append('price', pendingEditPackageData.price);
  formData.append('duration', pendingEditPackageData.duration);
  formData.append('max_people', pendingEditPackageData.max_people);
  formData.append('description', pendingEditPackageData.description);
  formData.append('includes', pendingEditPackageData.includes);
  formData.append('_method', 'PUT');
  
  if (pendingEditPackageData.image) {
    formData.append('image', pendingEditPackageData.image);
  }

  router.post(`/admin/packages/${pendingEditPackageData.id}/update`, formData, {
    forceFormData: true,
    preserveState: true,
    preserveScroll: true,
    onSuccess: (page) => {
      // Update dari response server jika ada
      if (page.props.packages) {
        setPackages(page.props.packages);
      } else {
        // Fallback: update state manual
        const updatedPackages = packages.map(pkg => 
          pkg.id === pendingEditPackageData.id ? {
            ...pkg,
            name: pendingEditPackageData.name,
            price: parseFloat(pendingEditPackageData.price),
            duration: pendingEditPackageData.duration,
            maxGuests: parseInt(pendingEditPackageData.max_people),
            description: pendingEditPackageData.description,
            facilities: pendingEditPackageData.includes.split(', ').filter(f => f.trim()),
            menuIncluded: pendingEditPackageData.includes.split(', ').filter(f => f.trim())
          } : pkg
        );
        setPackages(updatedPackages);
      }
      
      setIsEditPackageOpen(false);
      setEditPackageData({
        id: null,
        name: '',
        price: '',
        duration: '',
        max_people: '',
        description: '',
        includes: '',
        image: null,
        current_image: ''
      });
      setShowEditPackageConfirm(false);
      setPendingEditPackageData(null);
      console.log('Paket berhasil diupdate');
    },
    onError: (errors) => {
      console.error('Error updating package:', errors);
      alert('Gagal mengupdate paket!');
      setShowEditPackageConfirm(false);
    },
    onFinish: () => {
      setIsSubmittingEditPackage(false);
    }
  });
};

  // Calculate combined stats including reservations
  const combinedStats = {
    totalOrders: stats.total_orders || 0,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalRevenue: stats.total_revenue || 0,
    totalCustomers: stats.total_customers || 0,
    totalReservations: reservations.length,
    pendingReservations: reservations.filter(r => r.status === 'pending').length,
    confirmedReservations: reservations.filter(r => r.status === 'confirmed').length,
    avgOrderValue: stats.avg_order_value || 0,
    monthlyGrowth: stats.monthly_growth || 0,
    
    reservationRevenue: reservations
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + parseFloat(r.total_price.replace(/[^\d]/g, '')), 0),
    todayOrders: stats.today_orders || 0,
    todayReservations: stats.today_reservations || 0,
    newCustomersThisMonth: stats.new_customers_this_month || 0,
    totalStaff: stats.total_staff || 0
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
    case 'blocked': // TAMBAH INI
      return 'bg-red-100 text-red-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
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
      case 'confirmed': return 'Dikonfirmasi';
      case 'cancelled': return 'Dibatalkan';
      case 'blocked': return 'Diblokir';
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

     case 'editPackage':
      // Set data edit package dan buka modal edit
      setEditPackageData({
        id: modalData.id,
        name: modalData.name || '',
        price: modalData.price ? modalData.price.toString() : '',
        duration: modalData.duration || '',
        max_people: modalData.maxGuests ? modalData.maxGuests.toString() : '',
        description: modalData.description || '',
        includes: modalData.facilities ? (Array.isArray(modalData.facilities) ? modalData.facilities.join(', ') : modalData.facilities) : '',
        image: null,
        current_image: modalData.image_url || ''
      });
      setIsEditPackageOpen(true);
      closeModal();
      return null;

      case 'order':
         console.log('modalData:', modalData);
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="font-medium break-words">{modalData.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">No. Telepon</p>
                <p className="font-medium break-words">{modalData.phone}</p>
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
                  <p key={index} className="text-sm break-words">{item}</p>
                ))}
              </div>
            </div>
            {modalData.notes && (
              <div>
                <p className="text-sm text-gray-600">Catatan</p>
                <p className="text-sm break-words">{modalData.notes}</p>
              </div>
            )}
            
             {modalData.paymentProof && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Bukti Pembayaran</p>
              <div 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => showImageInModal(modalData.paymentProof)}
              >
                <img 
                  src={modalData.paymentProof} 
                  alt="Bukti Pembayaran" 
                  className="w-full max-w-sm h-48 object-cover rounded-lg border hover:shadow-md transition-shadow"
                />
                <p className="text-xs text-blue-600 mt-1">Klik untuk memperbesar</p>
              </div>
            </div>
          )}
            {/* Action Buttons */}
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );

      case 'reservation':
        return (
          <div className="space-y-6">
            {/* Detail Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Kode Reservasi</p>
                  <p className="font-medium break-words">{modalData.reservation_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(modalData.status)}`}>
                    {getStatusText(modalData.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pelanggan</p>
                  <p className="font-medium break-words">{modalData.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">No. Telepon</p>
                  <p className="font-medium break-words">{modalData.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium break-words">{modalData.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Paket</p>
                  <p className="font-medium break-words">{modalData.package_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal & Waktu</p>
                  <p className="font-medium">{modalData.date} - {modalData.time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jumlah Tamu</p>
                  <p className="font-medium">{modalData.guests} orang</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Meja</p>
                  <p className="font-medium break-words">{modalData.table_name || 'Belum ditentukan'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lokasi</p>
                  <p className="font-medium break-words">{modalData.location_detail || modalData.table_location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Harga</p>
                  <p className="font-medium">{modalData.total_price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Metode Pembayaran</p>
                  <p className="font-medium break-words">{modalData.payment_method_label}</p>
                </div>
              </div>

              {modalData.special_requests && (
                <div>
                  <p className="text-sm text-gray-600">Permintaan Khusus</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg break-words">{modalData.special_requests}</p>
                </div>
              )}

              {modalData.proof_of_payment && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Bukti Pembayaran</p>
                  <div 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => showImageInModal(modalData.proof_of_payment)}
                  >
                    <img 
                      src={modalData.proof_of_payment} 
                      alt="Bukti Pembayaran" 
                      className="w-full max-w-sm h-48 object-cover rounded-lg border hover:shadow-md transition-shadow"
                    />
                    <p className="text-xs text-blue-600 mt-1">Klik untuk memperbesar</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-4">
              <div className="flex flex-wrap gap-3">
                {modalData.can_be_confirmed && (
                  <button
                    onClick={() => handleConfirmReservation(modalData.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Konfirmasi
                  </button>
                )}
                
                {modalData.can_be_cancelled && (
                  <button
                    onClick={() => handleCancelReservation(modalData.id)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center text-sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Batalkan
                  </button>
                )}
                
                {/* <button
                  onClick={() => handleDeleteReservation(modalData.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </button> */}
                
                <button
                  onClick={closeModal}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'customer':
  return (
    <div className="space-y-6">
      {/* Customer Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Nama</p>
          <p className="font-medium break-words">{modalData.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Status</p>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(modalData.status)}`}>
            {getStatusText(modalData.status)}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-600">No. Telepon</p>
          <p className="font-medium break-words">{modalData.phone}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Email</p>
          <p className="font-medium break-words">{modalData.email}</p>
        </div>
        <div className="col-span-1 sm:col-span-2">
          <p className="text-sm text-gray-600">Alamat</p>
          <p className="font-medium break-words">{modalData.address}</p>
        </div>
      </div>

     {/* Statistics */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="text-lg font-bold text-gray-900">{modalData.totalOrders || 0}</div>
        <div className="text-xs text-gray-600">Total Pesanan</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-gray-900">{modalData.totalReservations || 0}</div>
        <div className="text-xs text-gray-600">Total Reservasi</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-gray-900">
          {formatRupiahSafe(modalData.totalSpent)}
        </div>
        <div className="text-xs text-gray-600">Belanja Pesanan</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-gray-900">
          {formatRupiahSafe(modalData.reservationSpent)}
        </div>
        <div className="text-xs text-gray-600">Belanja Reservasi</div>
      </div>
    </div>

    {/* Total Keseluruhan */}
    <div className="bg-blue-50 p-4 rounded-lg">
      <div className="text-center">
        <div className="text-xl font-bold text-blue-900">
          {formatRupiahSafe((Number(modalData.totalSpent) || 0) + (Number(modalData.reservationSpent) || 0))}
        </div>
        <div className="text-sm text-blue-700">Total Belanja Keseluruhan</div>
      </div>
    </div>

      {/* Recent Orders */}
    {modalData.recentOrders && modalData.recentOrders.length > 0 && (
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Pesanan Terbaru</h4>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {modalData.recentOrders.map((order, index) => (
            <div key={index} className="flex justify-between items-start p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-sm">{order.id}</div>
                <div className="text-xs text-gray-600">{order.date}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {order.items.slice(0, 2).join(', ')}
                  {order.items.length > 2 && ` +${order.items.length - 2} lainnya`}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm">
                  {formatRupiahSafe(order.total)}
                </div>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

      {/* Recent Reservations */}
      {modalData.recentReservations && modalData.recentReservations.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Reservasi Terbaru</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {modalData.recentReservations.map((reservation, index) => (
              <div key={index} className="flex justify-between items-start p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{reservation.id}</div>
                  <div className="text-xs text-gray-600">{reservation.date} - {reservation.time}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {reservation.package} ({reservation.guests} orang)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">
                    {formatRupiahSafe(reservation.total)}
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(reservation.status)}`}>
                    {getStatusText(reservation.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Join Date and Last Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <p className="text-sm text-gray-600">Bergabung Sejak</p>
          <p className="font-medium">{modalData.joinDate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Aktivitas Terakhir</p>
          <p className="font-medium">{modalData.lastActivityDate}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t pt-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              if (confirm(`Apakah Anda yakin ingin ${modalData.is_blocked ? 'membuka blokir' : 'memblokir'} akun ${modalData.name}?`)) {
                router.patch(`/admin/users/${modalData.id}/toggle-block`, {}, {
                  preserveState: true,
                  preserveScroll: true,
                  onSuccess: (page) => {
                    if (page.props.customers) {
                      setCustomers(page.props.customers);
                      // Update modal data
                      const updatedCustomer = page.props.customers.find((c: any) => c.id === modalData.id);
                      if (updatedCustomer) {
                        setModalData(updatedCustomer);
                      }
                    }
                    console.log(`Status blokir berhasil diubah`);
                  },
                  onError: (errors) => {
                    console.error('Error toggling block status:', errors);
                  }
                });
              }
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-white ${
              modalData.is_blocked 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {modalData.is_blocked ? (
              <>
                <ShieldOff className="w-4 h-4 mr-2 inline" />
                Buka Blokir Akun
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2 inline" />
                Blokir Akun
              </>
            )}
          </button>
          <button
            onClick={closeModal}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
    );
      
      case 'staff':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-medium break-words">{modalData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Posisi</p>
                <p className="font-medium break-words">{modalData.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">No. Telepon</p>
                <p className="font-medium break-words">{modalData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium break-words">{modalData.email}</p>
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
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
                {modalData.image_url ? (
                  <img 
                    src={modalData.image_url}
                    alt={modalData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('.fallback-icon');
                      if (fallback) {
                        fallback.classList.remove('hidden');
                      }
                    }}
                  />
                ) : null}
                <div className={`fallback-icon flex items-center justify-center w-full h-full ${modalData.image_url ? 'hidden' : ''}`}>
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama Menu</p>
                <p className="font-medium break-words">{modalData.name}</p>
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
              <p className="text-sm break-words">{modalData.description}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="border-t pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    handleEditMenu(modalData);
                    closeModal();
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Menu
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );

      case 'package':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama Paket</p>
                <p className="font-medium break-words">{modalData.name}</p>
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
              <p className="text-sm break-words">{modalData.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Fasilitas</p>
              <div className="space-y-1">
                {modalData.facilities?.map((facility: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm break-words">{facility}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Menu Termasuk</p>
              <div className="space-y-1">
                {modalData.menuIncluded?.map((menu: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm break-words">{menu}</span>
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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30 lg:z-0
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isMobile={true}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* TopBar */}
        <TopBar 
          activeTab={activeTab} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          notifications={notifications}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'dashboard' && (
              <DashboardContent 
                stats={combinedStats}
                setActiveTab={setActiveTab}
                openModal={openModal}
                orders={orders}
                menuItems={menuItems}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            )}
          
          {activeTab === 'orders' && (
            <OrdersContent 
              orders={orders}
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
              menuCategories={menuCategories} // Pastikan ini ada
              onToggleStatus={handleToggleMenuStatus} // Pastikan ini juga ada
            />
          )}
          
          {activeTab === 'customers' && (
            <CustomersContent 
              customers={customers}
              setCustomers={setCustomers} // TAMBAH INI
              searchTerm={searchTerm}
              openModal={openModal}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          )}
          
          {activeTab === 'staff' && (
            <StaffContent 
              staff={staff}
              searchTerm={searchTerm}
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
            packages={packages}
            setPackages={setPackages}
          />
        )}
          
          {activeTab === 'reservations' && (
            <ReservationContent 
              searchTerm={searchTerm}
              openModal={openModal}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              reservations={reservations}
              onRefresh={refreshReservations}
              isRefreshing={isRefreshing}
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
      >
        {renderModalContent()}
      </Modal>

     {/* Add Package Modal */}
    <Modal 
      isOpen={isAddPackageOpen} 
      onClose={() => setIsAddPackageOpen(false)}
      title="Tambah Paket Reservasi Baru"
    >
      <form onSubmit={handleAddPackage} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Paket</label>
          <input 
            type="text" 
            value={newPackageData.name}
            onChange={(e) => handlePackageInputChange('name', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
            <input 
              type="number" 
              value={newPackageData.price}
              onChange={(e) => handlePackageInputChange('price', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durasi</label>
            <input 
              type="text" 
              value={newPackageData.duration}
              onChange={(e) => handlePackageInputChange('duration', e.target.value)}
              placeholder="2 jam" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max. Orang</label>
          <input 
            type="number" 
            value={newPackageData.max_people}
            onChange={(e) => handlePackageInputChange('max_people', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea 
            value={newPackageData.description}
            onChange={(e) => handlePackageInputChange('description', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" 
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yang Termasuk (pisahkan dengan koma)</label>
          <textarea 
            value={newPackageData.includes}
            onChange={(e) => handlePackageInputChange('includes', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" 
            rows={2} 
            placeholder="2 Main Course, 2 Dessert, 2 Minuman, Dekorasi Meja, Foto Kenangan"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Gambar</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePackageInputChange('image', e.target.files?.[0] || null)}
              className="hidden"
              id="package-image-upload"
            />
            
            {newPackageData.image ? (
              <div className="space-y-3">
                <div className="relative">
                  <img 
                    src={URL.createObjectURL(newPackageData.image)} 
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => handlePackageInputChange('image', null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-green-600 text-center">File: {newPackageData.image.name}</p>
                <label htmlFor="package-image-upload" className="cursor-pointer block text-center text-sm text-blue-600 hover:text-blue-700">
                  Ganti gambar
                </label>
              </div>
            ) : (
              <label htmlFor="package-image-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Klik untuk upload gambar</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (Max: 2MB)</p>
              </label>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
          <button 
            type="submit" 
            disabled={isSubmittingPackage}
            className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {isSubmittingPackage ? 'Menyimpan...' : 'Simpan Paket'}
          </button>
          <button 
            type="button" 
            onClick={() => setIsAddPackageOpen(false)} 
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
          >
            Batal
          </button>
        </div>
      </form>
    </Modal>

      {/* Edit Package Modal */}
      <Modal 
        isOpen={isEditPackageOpen} 
        onClose={() => setIsEditPackageOpen(false)}
        title="Edit Paket Reservasi"
      >
        <form onSubmit={handleSubmitEditPackage} className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Paket</label>
    <input 
      type="text" 
      value={editPackageData.name}
      onChange={(e) => handleEditPackageInputChange('name', e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
      required
    />
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
      <input 
        type="number" 
        value={editPackageData.price}
        onChange={(e) => handleEditPackageInputChange('price', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" 
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Durasi</label>
      <input 
        type="text" 
        value={editPackageData.duration}
        onChange={(e) => handleEditPackageInputChange('duration', e.target.value)}
        placeholder="2 jam" 
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" 
        required
      />
    </div>
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Max. Orang</label>
    <input 
      type="number" 
      value={editPackageData.max_people}
      onChange={(e) => handleEditPackageInputChange('max_people', e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" 
      required
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
    <textarea 
      value={editPackageData.description}
      onChange={(e) => handleEditPackageInputChange('description', e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" 
      rows={3}
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Yang Termasuk (pisahkan dengan koma)</label>
    <textarea 
      value={editPackageData.includes}
      onChange={(e) => handleEditPackageInputChange('includes', e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" 
      rows={2} 
      placeholder="2 Main Course, 2 Dessert, 2 Minuman, Dekorasi Meja, Foto Kenangan"
    />
  </div>
  
  {/* Image Upload Section - sama seperti sebelumnya */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Paket</label>
    
    {editPackageData.current_image && !editPackageData.image && (
      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-2">Gambar saat ini:</p>
        <img 
          src={editPackageData.current_image}
          alt="Current package"
          className="w-32 h-32 object-cover rounded-lg border"
        />
      </div>
    )}
    
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleEditPackageInputChange('image', e.target.files?.[0] || null)}
        className="hidden"
        id="edit-package-image-upload"
      />
      
      {editPackageData.image ? (
        <div className="space-y-3">
          <div className="relative">
            <img 
              src={URL.createObjectURL(editPackageData.image)} 
              alt="New preview"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={() => handleEditPackageInputChange('image', null)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-green-600 text-center">File baru: {editPackageData.image.name}</p>
        </div>
      ) : (
        <label htmlFor="edit-package-image-upload" className="cursor-pointer flex flex-col items-center">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            {editPackageData.current_image ? 'Klik untuk ganti gambar' : 'Klik untuk upload gambar baru'}
          </p>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (Max: 2MB)</p>
        </label>
      )}
    </div>
  </div>
  
  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
    <button 
    type="submit" 
    disabled={isSubmittingEditPackage}
    className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
  >
    {isSubmittingEditPackage ? 'Menyimpan...' : 'Update Paket'}
  </button>
    <button 
      type="button" 
      onClick={() => setIsEditPackageOpen(false)} 
      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
    >
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
        <form onSubmit={handleAddMenu} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
            <input 
              type="text" 
              value={newMenuData.name}
              onChange={(e) => handleMenuInputChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
              required 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select 
                value={newMenuData.category_id}
                onChange={(e) => handleMenuInputChange('category_id', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Pilih Kategori</option>
                {menuCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
              <input 
                type="number" 
                value={newMenuData.price}
                onChange={(e) => handleMenuInputChange('price', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                required 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea 
              value={newMenuData.description}
              onChange={(e) => handleMenuInputChange('description', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" 
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Gambar</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleMenuInputChange('image', e.target.files?.[0] || null)}
                className="hidden"
                id="menu-image-upload"
              />
              
              {/* Preview gambar jika sudah dipilih */}
              {newMenuData.image ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img 
                      src={URL.createObjectURL(newMenuData.image)} 
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => handleMenuInputChange('image', null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-green-600 text-center">File: {newMenuData.image.name}</p>
                  <label htmlFor="menu-image-upload" className="cursor-pointer block text-center text-sm text-blue-600 hover:text-blue-700">
                    Ganti gambar
                  </label>
                </div>
              ) : (
                <label htmlFor="menu-image-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Klik untuk upload gambar</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (Max: 2MB)</p>
                </label>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
            <button 
              type="submit" 
              disabled={isSubmittingMenu}
              className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {isSubmittingMenu ? 'Menyimpan...' : 'Simpan Menu'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsAddMenuOpen(false)} 
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Menu Modal */}
      <Modal 
        isOpen={isEditMenuOpen} 
        onClose={() => setIsEditMenuOpen(false)}
        title="Edit Menu"
      >
        <form onSubmit={handleSubmitEditMenu} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
            <input 
              type="text" 
              value={editMenuData.name}
              onChange={(e) => handleEditMenuInputChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
              required 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select 
                value={editMenuData.category_id}
                onChange={(e) => handleEditMenuInputChange('category_id', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Pilih Kategori</option>
                {menuCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
              <input 
                type="number" 
                value={editMenuData.price}
                onChange={(e) => handleEditMenuInputChange('price', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                required 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea 
              value={editMenuData.description}
              onChange={(e) => handleEditMenuInputChange('description', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" 
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Menu</label>
            
            {/* Current Image Preview */}
            {editMenuData.current_image && !editMenuData.image && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Gambar saat ini:</p>
                <img 
                  src={`/images/poto_menu/${editMenuData.current_image}`}
                  alt="Current menu"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleEditMenuInputChange('image', e.target.files?.[0] || null)}
                className="hidden"
                id="edit-menu-image-upload"
              />
              
              {/* New Image Preview */}
              {editMenuData.image ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img 
                      src={URL.createObjectURL(editMenuData.image)} 
                      alt="New preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => handleEditMenuInputChange('image', null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-green-600 text-center">File baru: {editMenuData.image.name}</p>
                  <label htmlFor="edit-menu-image-upload" className="cursor-pointer block text-center text-sm text-blue-600 hover:text-blue-700">
                    Ganti gambar
                  </label>
                </div>
              ) : (
                <label htmlFor="edit-menu-image-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {editMenuData.current_image ? 'Klik untuk ganti gambar' : 'Klik untuk upload gambar baru'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (Max: 2MB)</p>
                </label>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
            <button 
              type="submit" 
              disabled={isSubmittingEditMenu}
              className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {isSubmittingEditMenu ? 'Menyimpan...' : 'Update Menu'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsEditMenuOpen(false)} 
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
          <div className="max-w-4xl max-h-full w-full">
            <div className="relative">
              <img 
                src={imageUrl} 
                alt="Bukti Pembayaran" 
                className="max-w-full max-h-full w-full object-contain rounded-lg"
              />
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Alert */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${
                alertConfig.type === 'danger' ? 'bg-red-100' :
                alertConfig.type === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                {alertConfig.type === 'danger' ? (
                  <XCircle className="w-6 h-6 text-red-600" />
                ) : alertConfig.type === 'warning' ? (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 break-words">{alertConfig.title}</h3>
            </div>
            <p className="text-gray-600 mb-6 break-words">{alertConfig.message}</p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={alertConfig.onConfirm}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                  alertConfig.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                  alertConfig.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {alertConfig.confirmText}
              </button>
              <button
                onClick={() => setShowAlert(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Edit Package Confirmation Modal */}
      {showEditPackageConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
                <Edit3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Update Paket</h3>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menyimpan perubahan pada paket "{pendingEditPackageData?.name}"? 
              Perubahan akan langsung diterapkan dan mempengaruhi reservasi baru.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={executeEditPackage}
                disabled={isSubmittingEditPackage}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingEditPackage ? 'Menyimpan...' : 'Ya, Update'}
              </button>
              <button
                onClick={() => {
                  setShowEditPackageConfirm(false);
                  setPendingEditPackageData(null);
                }}
                disabled={isSubmittingEditPackage}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;