// components/PackagesContent.tsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, Upload, Package, Edit3, Trash2, Eye, Star, Users, Clock,
  DollarSign, Check, X, Filter
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface PackagesContentProps {
  searchTerm: string;
  openModal: (type: string, data?: any) => void;
  setIsAddPackageOpen: (open: boolean) => void;
  getStatusColor: (status: string) => string;
  packages: any[];
  setPackages: (packages: any[]) => void;
}

const PackagesContent: React.FC<PackagesContentProps> = ({
  searchTerm,
  openModal,
  setIsAddPackageOpen,
  getStatusColor,
  packages,
  setPackages
}) => {

  const [filteredPackages, setFilteredPackages] = useState(packages);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    confirmAction: () => {},
    type: 'danger' // 'danger', 'warning', 'success'
  });

  const showConfirmation = (config: any) => {
    setConfirmConfig(config);
    setShowConfirmModal(true);
  };
  

  useEffect(() => {
    let filtered = packages;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(pkg => pkg.type === filterType);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(pkg => pkg.status === filterStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(pkg => 
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPackages(filtered);
  }, [filterType, filterStatus, searchTerm, packages]);

const handleToggleStatus = (id: number) => {
  const packageItem = packages.find(pkg => pkg.id === id);
  if (!packageItem) return;

  const newStatus = packageItem.status === 'active' ? 'inactive' : 'active';
  
  showConfirmation({
    title: newStatus === 'active' ? 'Aktifkan Paket' : 'Nonaktifkan Paket',
    message: newStatus === 'active' 
      ? 'Apakah Anda yakin ingin mengaktifkan paket ini? Paket akan tersedia untuk reservasi.'
      : 'Apakah Anda yakin ingin menonaktifkan paket ini? Paket tidak akan tersedia untuk reservasi baru.',
    confirmText: newStatus === 'active' ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan',
    type: newStatus === 'active' ? 'success' : 'warning',
    confirmAction: () => {
      // Update state langsung (optimistic update)
      const updatedPackages = packages.map(pkg => 
        pkg.id === id ? { ...pkg, status: newStatus } : pkg
      );
      setPackages(updatedPackages);
      
      router.patch(`/admin/packages/${id}/toggle-status`, {
        is_active: newStatus === 'active'
      }, {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          console.log('Status paket berhasil diupdate');
        },
        onError: (errors) => {
          // Rollback jika error
          setPackages(packages);
          console.error('Error updating package status:', errors);
          alert('Gagal mengupdate status paket!');
        }
      });
      setShowConfirmModal(false);
    }
  });
};

const handleDeletePackage = (id: number) => {
  const packageItem = packages.find(pkg => pkg.id === id);
  if (!packageItem) return;

  showConfirmation({
    title: 'Hapus Paket',
    message: `Apakah Anda yakin ingin menghapus paket "${packageItem.name}"? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.`,
    confirmText: 'Ya, Hapus',
    type: 'danger',
    confirmAction: () => {
      // Update state dulu (optimistic update)
      const updatedPackages = packages.filter(pkg => pkg.id !== id);
      setPackages(updatedPackages);

      // Kirim request ke backend
      router.delete(`/admin/packages/${id}/delete`, {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          console.log('Paket berhasil dihapus');
        },
        onError: (errors) => {
          // Rollback jika error
          setPackages(packages);
          console.error('Error deleting package:', errors);
          alert('Gagal menghapus paket!');
        }
      });
      setShowConfirmModal(false);
    }
  });
};

const handleEditPackage = (packageData: any) => {
  openModal('editPackage', packageData);
};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paket Reservasi</h2>
          <p className="text-gray-600">Kelola paket reservasi acara dan private dining</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsAddPackageOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Paket
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{packages.length}</div>
              <div className="text-sm text-gray-600">Total Paket</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{packages.filter(p => p.status === 'active').length}</div>
              <div className="text-sm text-gray-600">Paket Aktif</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{packages.filter(p => p.type === 'acara').length}</div>
              <div className="text-sm text-gray-600">Paket Acara</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{packages.filter(p => p.type === 'private').length}</div>
              <div className="text-sm text-gray-600">Private Dining</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Semua Tipe</option>
            <option value="acara">Paket Acara</option>
            <option value="private">Private Dining</option>
          </select>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
          
          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-sm text-gray-600">
              Menampilkan {filteredPackages.length} dari {packages.length} paket
            </span>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      pkg.type === 'acara' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {pkg.type === 'acara' ? 'Acara' : 'Private'}
                    </span>
                    <span className="text-sm text-gray-500">{pkg.category}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(pkg.status)}`}>
                  {pkg.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <span>Harga</span>
                  </div>
                  <p className="font-semibold text-gray-900">Rp {pkg.price.toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Kapasitas</span>
                  </div>
                  <p className="font-semibold text-gray-900">{pkg.maxGuests} orang</p>
                </div>
                <div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Durasi</span>
                  </div>
                  <p className="font-semibold text-gray-900">{pkg.duration}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Star className="w-4 h-4" />
                    <span>Popularitas</span>
                  </div>
                  <p className="font-semibold text-gray-900">{pkg.popularity}% ({pkg.totalBookings} booking)</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Isi Paket : </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {pkg.facilities.slice(0, 3).map((facility, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {facility}
                    </span>
                  ))}
                  {pkg.facilities.length > 3 && (
                    <span className="text-xs text-gray-500">+{pkg.facilities.length - 3} lainnya</span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button 
                  onClick={() => openModal('package', pkg)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Detail
                </button>
                <button 
                  onClick={() => handleEditPackage(pkg)}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 text-sm flex items-center justify-center"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button 
                  onClick={() => handleToggleStatus(pkg.id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                    pkg.status === 'active' 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {pkg.status === 'active' ? 'Non-aktifkan' : 'Aktifkan'}
                </button>
                <button 
                  onClick={() => handleDeletePackage(pkg.id)}
                  className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
       {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-full mr-4 flex-shrink-0 ${
                confirmConfig.type === 'danger' ? 'bg-red-100' :
                confirmConfig.type === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                {confirmConfig.type === 'danger' ? (
                  <Trash2 className="w-6 h-6 text-red-600" />
                ) : confirmConfig.type === 'warning' ? (
                  <X className="w-6 h-6 text-yellow-600" />
                ) : (
                  <Check className="w-6 h-6 text-green-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{confirmConfig.title}</h3>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">{confirmConfig.message}</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={confirmConfig.confirmAction}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-colors ${
                  confirmConfig.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                  confirmConfig.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : 
                  'bg-green-600 hover:bg-green-700'
                }`}
              >
                {confirmConfig.confirmText}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 font-medium transition-colors"
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

export default PackagesContent;