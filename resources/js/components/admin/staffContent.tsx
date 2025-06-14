
import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
  Plus, TrendingUp, UserCheck, DollarSign, Star, Calendar, 
  Eye, Edit3, MoreHorizontal, Shield, ShieldOff
} from 'lucide-react';

interface StaffContentProps {
  staff: any[];
  setStaff: (staff: any[]) => void; // TAMBAH INI
  searchTerm: string;
  openModal: (type: string, data?: any) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

const StaffContent: React.FC<StaffContentProps> = ({
  staff = [],
  setStaff,
  searchTerm,
  openModal,
  getStatusColor,
  getStatusText
}) => {
  const [filteredStaff, setFilteredStaff] = useState(staff);

  useEffect(() => {
  let filtered = staff;
  
  if (searchTerm) {
    filtered = filtered.filter(staffMember => {
      const name = staffMember.name || '';
      const position = staffMember.position || '';
      const phone = staffMember.phone || '';
      const email = staffMember.email || '';
      
      return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             position.toLowerCase().includes(searchTerm.toLowerCase()) ||
             phone.includes(searchTerm) ||
             email.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }
  
  setFilteredStaff(filtered);
}, [searchTerm, staff]);

const [showConfirmModal, setShowConfirmModal] = useState(false);
const [confirmData, setConfirmData] = useState({
  staffId: 0,
  staffName: '',
  isBlocked: false,
  action: ''
});
const [isProcessing, setIsProcessing] = useState(false);

const handleToggleBlock = (staffId: number, staffName: string, isBlocked: boolean) => {
  const action = isBlocked ? 'membuka blokir' : 'memblokir';
  
  setConfirmData({
    staffId,
    staffName,
    isBlocked,
    action
  });
  setShowConfirmModal(true);
};

const confirmToggleBlock = () => {
  setIsProcessing(true);
  
  router.patch(`/admin/users/${confirmData.staffId}/toggle-block`, {}, {
    preserveState: true,
    preserveScroll: true,
    onSuccess: () => {
      const updatedStaff = staff.map(staffMember => 
        staffMember.id === confirmData.staffId 
          ? { 
              ...staffMember, 
              is_blocked: !staffMember.is_blocked,
              status: staffMember.is_blocked ? 'active' : 'blocked'
            }
          : staffMember
      );
      
      setStaff(updatedStaff);
      setShowConfirmModal(false);
      setIsProcessing(false);
    },
    onError: () => {
      alert('Gagal mengubah status blokir!');
      setIsProcessing(false);
    }
  });
};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Staff</h2>
          <p className="text-gray-600">Kelola data karyawan dan performance</p>
        </div>
        {/* <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Staff
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance Report
          </button>
        </div> */}
      </div>

      {/* Staff Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{staff.filter(s => s.status === 'active').length}</div>
              <div className="text-sm text-gray-600">Staff Aktif</div>
            </div>
          </div>
        </div>
        {/* <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">Rp {staff.reduce((sum, staff) => sum + staff.salary, 0).toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Gaji</div>
            </div>
          </div>
        </div> */}
        {/* <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(staff.reduce((sum, staff) => sum + staff.performance, 0) / staff.length)}%</div>
              <div className="text-sm text-gray-600">Avg Performance</div>
            </div>
          </div>
        </div> */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{staff.length}</div>
              <div className="text-sm text-gray-600">Total Staff</div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posisi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {staff.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-500">Bergabung: {staff.joinDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{staff.phone}</div>
                    <div className="text-sm text-gray-500">{staff.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(staff.status)}`}>
                      {getStatusText(staff.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* <button 
                        onClick={() => openModal('staff', staff)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit3 className="w-4 h-4" />
                      </button> */}
                      <button 
                          onClick={() => handleToggleBlock(staff.id, staff.name, staff.is_blocked)}
                          className={`px-3 py-1 rounded flex items-center text-xs ${
                            staff.is_blocked 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {staff.is_blocked ? (
                            <>
                              <ShieldOff className="w-3 h-3 mr-1" />
                              Unblock
                            </>
                          ) : (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              Block
                            </>
                          )}
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        {/* Confirm Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {confirmData.isBlocked ? 'Buka Blokir Staff' : 'Blokir Staff'}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  Apakah Anda yakin ingin <strong>{confirmData.action}</strong> akun <strong>{confirmData.staffName}</strong>?
                </p>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={confirmToggleBlock}
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                    confirmData.isBlocked 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {isProcessing ? 'Memproses...' : `Ya, ${confirmData.isBlocked ? 'Buka Blokir' : 'Blokir'}`}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
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

export default StaffContent;