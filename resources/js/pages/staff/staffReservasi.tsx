import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, Eye, MapPin, CreditCard, Edit3, RefreshCw, AlertCircle, Settings, X } from 'lucide-react';
import { router, useForm } from '@inertiajs/react';

interface Reservation {
  id: number;
  reservation_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  date: string;
  raw_date?: string;     // TAMBAHAN: Format untuk filtering (yyyy-mm-dd)
  time: string;
  raw_time?: string;  
  guests: number;
  table_name?: string;
  table_number?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_method: string;
  payment_method_label: string;
  proof_of_payment?: string;
  special_requests?: string;
  package_name: string;
  total_price: string;
  table_location: string;
  location_detail?: string;
  can_be_confirmed: boolean;
  can_be_cancelled: boolean;
  requires_payment_confirmation: boolean;
}

interface TableReservation {
  id: number;
  reservation_code: string;
  customer_name: string;
  date: string;
  time: string;
  status: string;
  guests: number;
}

interface Table {
  id: number;
  table_number: number;
  meja_name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  location_type: string;
  location_detail?: string;
  full_location: string;
  status_label: string;
  status_color: string;
  is_available: boolean;
  current_reservation?: {
    id: number;
    reservation_code: string;
    customer_name: string;
    time: string;
    guests: number;
    status: string;
  };
  // ENHANCED: Tambahan data reservasi
  next_reservation?: {
    id: number;
    reservation_code: string;
    customer_name: string;
    date: string;
    time: string;
    guests: number;
    status: string;
  };
  today_reservations_count: number;
  upcoming_reservations_count: number;
  all_reservations: TableReservation[]; // ADDED: Daftar semua reservasi
}

interface Props {
  // For when used inside StaffPage
  reservationsData?: Reservation[];
  tablesData?: Table[];
  reservationFilters?: {
    status?: string;
    date?: string;
  };
  // For when used as standalone page
  reservations?: Reservation[];
  tables?: Table[];
  filters?: {
    status?: string;
    date?: string;
  };
  availableTablesForReservation?: Table[];
  error?: string;
}

const StaffReservasi: React.FC<Props> = ({ 
  // Props from StaffPage
  reservationsData,
  tablesData,
  reservationFilters,
  // Props from standalone page
  reservations: standaloneReservations = [], 
  tables: standaloneTables = [], 
  filters: standaloneFilters = {},
  availableTablesForReservation = [],
  error
}) => {
  // Determine which props to use and detect context
  const reservations = reservationsData || standaloneReservations;
  const tables = tablesData || standaloneTables;
  const filters = reservationFilters || standaloneFilters;
  
  // Detect if we're inside StaffPage or standalone
  const isInsideStaffPage = !!reservationsData;
  const currentUrl = isInsideStaffPage ? '/staffPage' : '/staff/reservations';
  const reloadProps = isInsideStaffPage 
    ? ['reservationsData', 'tablesData', 'reservationFilters'] 
    : ['reservations', 'tables', 'filters'];

  const [activeTab, setActiveTab] = useState<'reservations' | 'tables'>('reservations');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showPaymentProof, setShowPaymentProof] = useState(false);
  const [showTableSelection, setShowTableSelection] = useState(false);
  const [showTableDetail, setShowTableDetail] = useState(false);
  const [showTableReservations, setShowTableReservations] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'confirm' | 'cancel' | 'complete'; // Tambahkan 'complete'
    reservation: Reservation | null;
    title: string;
    message: string;
    confirmText: string;
    confirmColor: string;
  }>({
    type: 'confirm',
    reservation: null,
    title: '',
    message: '',
    confirmText: '',
    confirmColor: ''
  });

  // Forms for various actions
  const statusForm = useForm({
    status: '',
    notes: ''
  });

  const tableAssignForm = useForm({
    table_id: 0
  });

  const tableStatusForm = useForm({
    status: ''
  });

  // Fungsi untuk membuka modal konfirmasi - TAMBAHKAN setelah state declarations
const openConfirmModal = (type: 'confirm' | 'cancel' | 'complete', reservation: Reservation) => {
  const actionConfig = {
    confirm: {
      title: 'Konfirmasi Reservasi',
      message: `Apakah Anda yakin ingin mengkonfirmasi reservasi atas nama "${reservation.customer_name}"?\n\nSetelah dikonfirmasi, meja akan otomatis ditetapkan dan status tidak dapat diubah kembali.`,
      confirmText: 'Ya, Konfirmasi',
      confirmColor: 'bg-green-600 hover:bg-green-700'
    },
    cancel: {
      title: 'Tolak Reservasi',
      message: `Apakah Anda yakin ingin menolak reservasi atas nama "${reservation.customer_name}"?\n\nTindakan ini akan membatalkan reservasi dan tidak dapat dibatalkan.`,
      confirmText: 'Ya, Tolak',
      confirmColor: 'bg-red-600 hover:bg-red-700'
    },
    // TAMBAHAN: Case untuk complete
    complete: {
      title: 'Selesaikan Reservasi',
      message: `Apakah Anda yakin ingin menyelesaikan reservasi atas nama "${reservation.customer_name}"?\n\nTindakan ini akan menandai reservasi sebagai selesai dan meja akan tersedia kembali.`,
      confirmText: 'Ya, Selesaikan',
      confirmColor: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const config = actionConfig[type];
  
  setConfirmAction({
    type,
    reservation,
    title: config.title,
    message: config.message,
    confirmText: config.confirmText,
    confirmColor: config.confirmColor
  });
  
  setShowConfirmModal(true);
};

// Fungsi untuk menutup modal - TAMBAHKAN
const closeConfirmModal = () => {
  setShowConfirmModal(false);
  setConfirmAction({
    type: 'confirm',
    reservation: null,
    title: '',
    message: '',
    confirmText: '',
    confirmColor: ''
  });
};

  // Filter form - default to show all
  const filterForm = useForm({
    status: filters?.status || 'all',
    date: filters?.date || ''
  });

  // Smart filter change handler
  const handleFilterChange = (field: 'status' | 'date', value: string) => {
    console.log('Filter changed:', { field, value });
    
    filterForm.setData(field, value);
    
    console.log('Filter updated client-side only, no server reload needed');
  };

  // Fungsi eksekusi aksi setelah konfirmasi - TAMBAHKAN
const executeConfirmedAction = () => {
  if (!confirmAction.reservation) return;
  
  console.log('=== EXECUTING CONFIRMED ACTION ===', {
    type: confirmAction.type,
    reservationId: confirmAction.reservation.id
  });
  
  // PERBAIKAN: Handle all three status types
  let status: 'confirmed' | 'cancelled' | 'completed';
  
  switch (confirmAction.type) {
    case 'confirm':
      status = 'confirmed';
      break;
    case 'cancel':
      status = 'cancelled';
      break;
    case 'complete':
      status = 'completed';
      break;
    default:
      console.error('Unknown action type:', confirmAction.type);
      return;
  }
  
  const reservation = confirmAction.reservation;
  
  // PERBAIKAN: Tutup modal terlebih dahulu dan simpan data
  closeConfirmModal();
  
  // PERBAIKAN: Eksekusi aksi dengan parameter yang sudah disimpan
  updateReservationStatus(reservation, status);
};

  // Update reservation status
  const updateReservationStatus = (reservation: Reservation, status: 'confirmed' | 'cancelled' | 'completed') => {
  console.log('=== UPDATE RESERVATION STATUS ===', {
    reservationId: reservation.id,
    currentStatus: reservation.status,
    newStatus: status,
    processing: statusForm.processing
  });

  // Prevent multiple simultaneous requests
  if (statusForm.processing) {
    console.log('Status form already processing, skipping...');
    return;
  }

  // PERBAIKAN 1: Buat form data baru tanpa useForm
  const formData = {
    status: status,
    notes: status === 'cancelled' ? 'Dibatalkan oleh staff' : 'Dikonfirmasi oleh staff'
  };

  console.log('Form data to send:', formData);

  // PERBAIKAN 2: Gunakan router.patch langsung dengan data eksplisit
  router.patch(`/staff/reservations/${reservation.id}/status`, formData, {
    onBefore: () => {
      console.log('Starting status update request with explicit data:', formData);
      return true;
    },
    onStart: () => {
      console.log('Request started');
      // Set processing state manually untuk UI feedback
      statusForm.processing = true;
    },
    onSuccess: (response) => {
      console.log('Status update successful:', response);
      
      // Clear errors on success
      statusForm.clearErrors();
      
      // Close detail panel
      setSelectedReservation(null);
      
      // Reload data
      const reloadProps = isInsideStaffPage 
        ? ['reservationsData', 'tablesData'] 
        : ['reservations', 'tables'];
      
      router.reload({ 
        only: reloadProps,
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          console.log('Data reloaded successfully');
        }
      });
    },
    onError: (errors) => {
      console.error('Error updating status:', errors);
    },
    onFinish: () => {
      console.log('Status update request finished');
      // Reset processing state
      statusForm.processing = false;
    }
  });
};

const confirmReservationWithTable = (reservation: Reservation) => {
  openConfirmModal('confirm', reservation);
};


// ADD this new function to handle the "Tolak" button:

const cancelReservation = (reservation: Reservation) => {
  openConfirmModal('cancel', reservation);
};

const completeReservation = (reservation: Reservation) => {
  openConfirmModal('complete', reservation);
};

  // Assign table to reservation
  const assignTableToReservation = (reservationId: number, tableId: number) => {
    tableAssignForm.setData('table_id', tableId);

    tableAssignForm.patch(`/staff/reservations/${reservationId}/assign-table`, {
      onSuccess: () => {
        router.reload({ only: reloadProps });
        setShowTableSelection(false);
        
        const updatedReservation = reservations?.find(r => r.id === reservationId);
        if (updatedReservation) {
          setSelectedReservation(updatedReservation);
        }
      },
      onError: (errors) => {
        console.error('Error assigning table:', errors);
      }
    });
  };

  useEffect(() => {
  // Auto-clear errors setelah 5 detik jika tidak ada processing
  const timer = setTimeout(() => {
    if (!statusForm.processing && !tableAssignForm.processing && !tableStatusForm.processing) {
      statusForm.clearErrors();
      tableAssignForm.clearErrors();
      tableStatusForm.clearErrors();
    }
  }, 5000);

  return () => clearTimeout(timer);
}, [statusForm.hasErrors, tableAssignForm.hasErrors, tableStatusForm.hasErrors]);



// 3. GANTI SEPENUHNYA updateTableStatus function (yang sudah ada) dengan ini:
const updateTableStatus = (tableId: number, status: string) => {
  console.log('=== UPDATE TABLE STATUS START ===', {
    tableId,
    status,
    processing: tableStatusForm.processing,
    currentFormData: tableStatusForm.data
  });

  if (tableStatusForm.processing) {
    console.log('Already processing, skipping...');
    return;
  }

  // Validate status
  const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];
  if (!validStatuses.includes(status)) {
    console.error('Invalid status:', status);
    return;
  }

  // CLEAR ERRORS BEFORE REQUEST
  tableStatusForm.clearErrors();

  console.log('About to make request with status:', status);

  // Optimistic update
  if (selectedTable && selectedTable.id === tableId) {
    const optimisticTable = {
      ...selectedTable,
      status: status as 'available' | 'occupied' | 'reserved' | 'maintenance',
      status_label: getTableStatusInfo(status).label,
      status_color: status === 'available' ? 'green' : 
                    status === 'occupied' ? 'red' :
                    status === 'reserved' ? 'yellow' : 'gray'
    };
    setSelectedTable(optimisticTable);
  }

  // Gunakan router.patch langsung dengan data eksplisit
  router.patch(`/staff/tables/${tableId}/status`, 
    { status: status }, // Data eksplisit
    {
      onBefore: () => {
        console.log('Request starting with explicit data:', { status });
        return true;
      },
      onSuccess: (response) => {
        console.log('Table status update successful:', response);
        
        // CLEAR ERRORS ON SUCCESS
        tableStatusForm.clearErrors();
        
        // Reload data
        const tableProps = isInsideStaffPage ? ['tablesData'] : ['tables'];
        
        router.reload({ 
          only: tableProps,
          preserveState: true,
          preserveScroll: true,
          onSuccess: (page: any) => {
            console.log('Data reloaded successfully');
            if (selectedTable && selectedTable.id === tableId) {
              const freshTables = isInsideStaffPage ? page.props.tablesData : page.props.tables;
              const freshTable = freshTables?.find((t: Table) => t.id === tableId);
              
              if (freshTable) {
                setSelectedTable(freshTable);
                console.log('Selected table updated with fresh data');
              }
            }
          }
        });
      },
      onError: (errors) => {
        console.error('Error updating table status:', errors);
        
        // Revert optimistic update
        if (selectedTable && selectedTable.id === tableId) {
          const originalTable = tables?.find(t => t.id === tableId);
          if (originalTable) {
            setSelectedTable(originalTable);
          }
        }
      },
      onFinish: () => {
        console.log('Request finished');
      }
    }
  );
};


// 4. JIKA router.patch tidak bekerja, gunakan method alternatif ini:
const updateTableStatusFetch = async (tableId: number, status: string) => {
  console.log('=== FETCH UPDATE METHOD ===', { tableId, status });

  try {
    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    // Optimistic update
    if (selectedTable && selectedTable.id === tableId) {
      const optimisticTable = {
        ...selectedTable,
        status: status as 'available' | 'occupied' | 'reserved' | 'maintenance',
        status_label: getTableStatusInfo(status).label,
        status_color: status === 'available' ? 'green' : 
                      status === 'occupied' ? 'red' :
                      status === 'reserved' ? 'yellow' : 'gray'
      };
      setSelectedTable(optimisticTable);
    }

    const response = await fetch(`/staff/tables/${tableId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': csrfToken || '',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ status: status })
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      console.log('Update successful via fetch');
      
      // Reload data
      const tableProps = isInsideStaffPage ? ['tablesData'] : ['tables'];
      router.reload({ 
        only: tableProps,
        preserveState: true,
        preserveScroll: true
      });
    } else {
      const errorData = await response.json();
      console.error('Update failed:', errorData);
      
      // Revert optimistic update
      if (selectedTable && selectedTable.id === tableId) {
        const originalTable = tables?.find(t => t.id === tableId);
        if (originalTable) {
          setSelectedTable(originalTable);
        }
      }
    }

  } catch (error) {
    console.error('Network error:', error);
    
    // Revert optimistic update
    if (selectedTable && selectedTable.id === tableId) {
      const originalTable = tables?.find(t => t.id === tableId);
      if (originalTable) {
        setSelectedTable(originalTable);
      }
    }
  }
};

// ALTERNATIF: Jika router.patch tidak bekerja, gunakan fetch API
const updateTableStatusAlternative = async (tableId: number, status: string) => {
  console.log('=== ALTERNATIVE UPDATE METHOD ===', { tableId, status });

  if (tableStatusForm.processing) {
    console.log('Already processing, skipping...');
    return;
  }

  // Validate status
  const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];
  if (!validStatuses.includes(status)) {
    console.error('Invalid status:', status);
    return;
  }

  try {
    tableStatusForm.processing = true;

    // Optimistic update
    if (selectedTable && selectedTable.id === tableId) {
      const optimisticTable = {
        ...selectedTable,
        status: status as 'available' | 'occupied' | 'reserved' | 'maintenance',
        status_label: getTableStatusInfo(status).label,
        status_color: status === 'available' ? 'green' : 
                      status === 'occupied' ? 'red' :
                      status === 'reserved' ? 'yellow' : 'gray'
      };
      setSelectedTable(optimisticTable);
    }

    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    const response = await fetch(`/staff/tables/${tableId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': csrfToken || '',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ status: status })
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      console.log('Update successful');
      
      // Reload data menggunakan router
      const tableProps = isInsideStaffPage ? ['tablesData'] : ['tables'];
      router.reload({ 
        only: tableProps,
        preserveState: true,
        preserveScroll: true,
        onSuccess: (page: any) => {
          if (selectedTable && selectedTable.id === tableId) {
            const freshTables = isInsideStaffPage ? page.props.tablesData : page.props.tables;
            const freshTable = freshTables?.find((t: Table) => t.id === tableId);
            
            if (freshTable) {
              setSelectedTable(freshTable);
            }
          }
        }
      });
    } else {
      const errorData = await response.json();
      console.error('Update failed:', errorData);
      
      // Revert optimistic update
      if (selectedTable && selectedTable.id === tableId) {
        const originalTable = tables?.find(t => t.id === tableId);
        if (originalTable) {
          setSelectedTable(originalTable);
        }
      }
    }

  } catch (error) {
    console.error('Network error:', error);
    
    // Revert optimistic update
    if (selectedTable && selectedTable.id === tableId) {
      const originalTable = tables?.find(t => t.id === tableId);
      if (originalTable) {
        setSelectedTable(originalTable);
      }
    }
  } finally {
    tableStatusForm.processing = false;
  }
};


  // Get available tables for selected reservation
  const loadAvailableTablesForReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowTableSelection(true);
  };

  // Show table detail modal
  const showTableDetailModal = (table: Table) => {
  setSelectedTable(table);
  setShowTableDetail(true);
};

const showTableReservationsList = (table: Table) => {
  setSelectedTable(table);
  setShowTableReservations(true);
};

  // Refresh all data
  const refreshData = () => {
    router.reload();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`;
  };

  const getTableStatusColor = (statusColor: string) => {
    const colors = {
      green: 'bg-green-100 border-green-300 text-green-800',
      red: 'bg-red-100 border-red-300 text-red-800',
      yellow: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      gray: 'bg-gray-100 border-gray-300 text-gray-800'
    };
    return colors[statusColor as keyof typeof colors] || colors.gray;
  };

  const getTableStatusInfo = (status: string) => {
    const statusInfo = {
      available: { label: 'Tersedia', color: 'bg-green-500', textColor: 'text-green-800' },
      occupied: { label: 'Terisi', color: 'bg-red-500', textColor: 'text-red-800' },
      reserved: { label: 'Direservasi', color: 'bg-yellow-500', textColor: 'text-yellow-800' },
      maintenance: { label: 'Maintenance', color: 'bg-gray-500', textColor: 'text-gray-800' }
    };
    return statusInfo[status as keyof typeof statusInfo] || statusInfo.available;
  };

  const formatDate = (dateString: string) => {
  if (!dateString) return 'Invalid Date';
  
  try {
    // Coba parse dengan berbagai format
    let date: Date;
    
    if (dateString.includes('/')) {
      // Format dd/mm/yyyy atau mm/dd/yyyy
      const parts = dateString.split('/');
      if (parts.length === 3) {
        // Assume dd/mm/yyyy format
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        date = new Date(dateString);
      }
    } else {
      // Format yyyy-mm-dd atau lainnya
      date = new Date(dateString);
    }
    
    // Validate date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid Date';
  }
};

const getFilteredReservations = () => {
    if (!reservations) return [];
    
    console.log('Filtering reservations:', {
      total: reservations.length,
      status_filter: filterForm.data.status,
      date_filter: filterForm.data.date
    });
    
    return reservations.filter(reservation => {
      // Filter by status - PERBAIKAN: Filter status di client
      if (filterForm.data.status !== 'all' && reservation.status !== filterForm.data.status) {
        return false;
      }
      
      // Filter by date - sudah benar sebelumnya
      if (filterForm.data.date && filterForm.data.date.trim() !== '') {
        const filterDate = filterForm.data.date; // Format: yyyy-mm-dd
        const reservationDate = reservation.raw_date || reservation.date;
        
        // Convert display date (dd/mm/yyyy) to comparable format if needed
        let comparableDate = reservationDate;
        if (reservationDate && reservationDate.includes('/')) {
          const parts = reservationDate.split('/');
          if (parts.length === 3) {
            comparableDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert dd/mm/yyyy to yyyy-mm-dd
          }
        }
        
        console.log('Date comparison:', {
          filterDate,
          reservationDate,
          comparableDate,
          match: comparableDate === filterDate
        });
        
        if (comparableDate !== filterDate) {
          return false;
        }
      }
      
      return true;
    });
  };

 const resetFilters = () => {
    filterForm.setData({
      status: 'all',
      date: ''
    });

    console.log('Filters reset client-side only');
  };


const filteredReservations = getFilteredReservations();


  // Get table stats - safely handle empty arrays
  const tableStats = {
    total: tables?.length || 0,
    available: tables?.filter(t => t.status === 'available').length || 0,
    occupied: tables?.filter(t => t.status === 'occupied').length || 0,
    reserved: tables?.filter(t => t.status === 'reserved').length || 0,
    maintenance: tables?.filter(t => t.status === 'maintenance').length || 0,
  };

  // Filter available tables for reservation - safely handle empty arrays
  const getAvailableTablesForCurrentReservation = () => {
    if (!selectedReservation || !tables?.length) return [];
    
    return tables.filter(table =>
      (table.is_available || table.table_number === selectedReservation.table_number) &&
      table.capacity >= selectedReservation.guests &&
      table.location_type === selectedReservation.table_location
    ).sort((a, b) => a.capacity - b.capacity);
  };

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-amber-800">Daftar Reservasi</h1>
            <p className="text-gray-600">Kelola reservasi dan meja yang tersedia</p>
            {isInsideStaffPage && (
              <p className="text-xs text-amber-600 mt-1">Mode: Integrated Staff Dashboard</p>
            )}
          </div>
          <button
            onClick={refreshData}
            disabled={statusForm.processing || tableAssignForm.processing || tableStatusForm.processing}
            className="flex items-center px-4 py-2 space-x-2 transition-colors rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50"
          >
            <RefreshCw size={16} className={statusForm.processing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Show error message if any */}
        {error && (
          <div className="flex items-center p-4 mb-6 text-red-800 bg-red-100 border border-red-300 rounded-lg">
            <AlertCircle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Show processing indicators */}
        {statusForm.processing && (
  <div className="flex items-center justify-center mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <RefreshCw size={16} className="mr-2 animate-spin text-blue-600" />
    <span className="text-sm text-blue-800">
      {statusForm.data.status === 'confirmed' ? 'Mengkonfirmasi reservasi...' : 'Membatalkan reservasi...'}
    </span>
  </div>
)}

{/* Show errors if any */}
{statusForm.hasErrors && (
  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-start">
      <AlertCircle size={16} className="mr-2 text-red-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-red-800 mb-1">Gagal mengupdate status:</p>
        <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
          {Object.entries(statusForm.errors).map(([field, messages]) => (
            <li key={field}>
              {Array.isArray(messages) ? messages.join(', ') : messages}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
)}

        {/* Show errors - IMPROVED ERROR HANDLING */}
{(
  (statusForm.hasErrors && Object.keys(statusForm.errors).length > 0) || 
  (tableAssignForm.hasErrors && Object.keys(tableAssignForm.errors).length > 0) || 
  (tableStatusForm.hasErrors && Object.keys(tableStatusForm.errors).length > 0)
) && (
  <div className="flex items-center p-4 mb-6 text-red-800 bg-red-100 border border-red-300 rounded-lg">
    <AlertCircle size={20} className="mr-2" />
    <div>
      <p className="font-medium">Terjadi kesalahan:</p>
      <ul className="mt-1 text-sm list-disc list-inside">
        {statusForm.hasErrors && Object.entries(statusForm.errors).map(([field, messages]) => (
          <li key={`status-${field}`}>
            Reservasi: {Array.isArray(messages) ? messages.join(', ') : messages}
          </li>
        ))}
        {tableAssignForm.hasErrors && Object.entries(tableAssignForm.errors).map(([field, messages]) => (
          <li key={`assign-${field}`}>
            Penugasan meja: {Array.isArray(messages) ? messages.join(', ') : messages}
          </li>
        ))}
        {tableStatusForm.hasErrors && Object.entries(tableStatusForm.errors).map(([field, messages]) => (
          <li key={`table-${field}`}>
            Status meja: {Array.isArray(messages) ? messages.join(', ') : messages}
          </li>
        ))}

        
      </ul>
    </div>
    <button
      onClick={() => {
        statusForm.clearErrors();
        tableAssignForm.clearErrors();
        tableStatusForm.clearErrors();
      }}
      className="ml-auto p-1 hover:bg-red-200 rounded"
      title="Tutup pesan error"
    >
      <XCircle size={16} />
    </button>
  </div>
)}

        {/* Tabs */}
        <div className="flex p-1 mb-6 space-x-1 rounded-lg bg-amber-50">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'reservations'
                ? 'bg-amber-200 text-amber-800'
                : 'text-amber-600 hover:text-amber-800'
            }`}
            onClick={() => setActiveTab('reservations')}
          >
            Daftar Reservasi ({reservations?.length || 0})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'tables'
                ? 'bg-amber-200 text-amber-800'
                : 'text-amber-600 hover:text-amber-800'
            }`}
            onClick={() => setActiveTab('tables')}
          >
            Status Meja ({tables?.length || 0})
          </button>
        </div>

        {activeTab === 'reservations' ? (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 p-4 mb-6 bg-white rounded-lg shadow-sm">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Tanggal</label>
                  <input
                    type="date"
                    value={filterForm.data.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Pilih tanggal untuk filter"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {filterForm.data.date 
                      ? `Filter: ${formatDate(filterForm.data.date)}` 
                      : 'Kosongkan untuk menampilkan semua tanggal'
                    }
                  </p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={filterForm.data.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 text-sm text-amber-700 bg-amber-100 rounded-md hover:bg-amber-200 transition-colors"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>


            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Reservations List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {filterForm.data.date ? `Reservasi ${formatDate(filterForm.data.date)}` : 'Semua Reservasi'}
                      {filterForm.data.status !== 'all' && (
                        <span className="ml-2 text-sm text-gray-600">
                          - {filterForm.data.status}
                        </span>
                      )}
                      <span className="ml-2 text-sm text-gray-500">
                        ({filteredReservations?.length || 0} reservasi)
                      </span>
                    </h2>
                  </div>
                  
                  {!filteredReservations || filteredReservations.length === 0 ? (
                        <div className="p-8 text-center">
                          <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">
                            {filterForm.data.date || filterForm.data.status !== 'all' 
                              ? 'Tidak ada reservasi untuk filter ini' 
                              : 'Tidak ada reservasi tersedia'
                            }
                          </p>
                          {filterForm.data.date && (
                            <p className="text-xs text-gray-400 mt-2">
                              Filter tanggal: {formatDate(filterForm.data.date)}
                            </p>
                          )}
                          {filterForm.data.status !== 'all' && (
                            <p className="text-xs text-gray-400 mt-1">
                              Filter status: {filterForm.data.status}
                            </p>
                          )}
                          <button
                            onClick={resetFilters}
                            className="mt-4 px-4 py-2 text-sm bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors"
                          >
                            Lihat Semua Reservasi
                          </button>
                        </div>
                      ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredReservations.map((reservation) => (
                          <div
                            key={reservation.id}
                            className={`p-4 cursor-pointer transition-colors ${
                              selectedReservation?.id === reservation.id ? 'bg-amber-50' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedReservation(reservation)}
                          >
                            {/* Reservation item content - pastikan menggunakan formatDate */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-gray-900">{reservation.customer_name}</h3>
                                <span className={getStatusBadge(reservation.status)}>
                                  {reservation.status}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">#{reservation.reservation_code}</span>
                            </div>

                            <div className="flex items-center mb-2 space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock size={16} />
                                <span>{reservation.time}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users size={16} />
                                <span>{reservation.guests} orang</span>
                              </div>
                              {reservation.table_name ? (
                                <div className="flex items-center space-x-1">
                                  <MapPin size={16} />
                                  <span>{reservation.table_name}</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 text-orange-600">
                                  <MapPin size={16} />
                                  <span>Belum ada meja</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                {reservation.payment_method_label}
                              </span>
                              <div className="text-right">
                                <div className="text-sm text-gray-500">{reservation.package_name}</div>
                                <div className="font-medium text-gray-900">{reservation.total_price}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>

              {/* Reservation Details */}
              <div className="lg:col-span-1">
                {selectedReservation ? (
                  <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Detail Reservasi</h2>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Kode Reservasi
                        </label>
                        <p className="font-mono text-gray-900">{selectedReservation.reservation_code}</p>
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Nama Pelanggan
                        </label>
                        <p className="text-gray-900">{selectedReservation.customer_name}</p>
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          No. Telepon
                        </label>
                        <p className="text-gray-900">{selectedReservation.customer_phone}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Tanggal
                          </label>
                          <p className="text-gray-900">{formatDate(selectedReservation.date)}</p>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Waktu
                          </label>
                          <p className="text-gray-900">{selectedReservation.time}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Jumlah Tamu
                          </label>
                          <p className="text-gray-900">{selectedReservation.guests} orang</p>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Paket
                          </label>
                          <p className="text-gray-900">{selectedReservation.package_name}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Nomor Meja
                        </label>
                        <div className="flex items-center space-x-2">
                          {selectedReservation.table_name ? (
                            <div>
                              <p className="text-gray-900">{selectedReservation.table_name}</p>
                              {selectedReservation.location_detail && (
                                <p className="text-sm text-gray-600">{selectedReservation.location_detail}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-orange-600">Belum dipilih</p>
                          )}
                          <button
                            className="flex items-center px-2 py-1 space-x-1 text-xs transition-colors rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50"
                            onClick={() => loadAvailableTablesForReservation(selectedReservation)}
                            disabled={tableAssignForm.processing}
                          >
                            <Edit3 size={12} />
                            <span>{selectedReservation.table_name ? 'Ubah' : 'Pilih'}</span>
                          </button>
                        </div>
                      </div>

                      {selectedReservation.special_requests && (
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Permintaan Khusus
                          </label>
                          <p className="text-gray-900">{selectedReservation.special_requests}</p>
                        </div>
                      )}

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Total Harga
                        </label>
                        <p className="text-lg font-semibold text-gray-900">{selectedReservation.total_price}</p>
                      </div>

                      {selectedReservation.proof_of_payment && (
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Bukti Pembayaran
                          </label>
                          <button
                            className="flex items-center px-3 py-2 space-x-2 text-sm transition-colors rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200"
                            onClick={() => setShowPaymentProof(true)}
                          >
                            <Eye size={16} />
                            <span>Lihat Bukti Pembayaran</span>
                          </button>
                        </div>
                      )}

                     {selectedReservation.status === 'pending' && (
                          <div className="flex pt-4 space-x-2">
                            <button
                              className="flex items-center justify-center flex-1 px-4 py-2 space-x-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => confirmReservationWithTable(selectedReservation)}
                              disabled={statusForm.processing}
                            >
                              {statusForm.processing && statusForm.data.status === 'confirmed' ? (
                                <>
                                  <RefreshCw size={16} className="animate-spin" />
                                  <span>Mengkonfirmasi...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={16} />
                                  <span>Konfirmasi</span>
                                </>
                              )}
                            </button>
                            
                            <button
                              className="flex items-center justify-center flex-1 px-4 py-2 space-x-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => cancelReservation(selectedReservation)}
                              disabled={statusForm.processing}
                            >
                              {statusForm.processing && statusForm.data.status === 'cancelled' ? (
                                <>
                                  <RefreshCw size={16} className="animate-spin" />
                                  <span>Membatalkan...</span>
                                </>
                              ) : (
                                <>
                                  <XCircle size={16} />
                                  <span>Tolak</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {selectedReservation.status === 'confirmed' && (
                          <div className="flex pt-4">
                            <button
                              className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => completeReservation(selectedReservation)}
                              disabled={statusForm.processing}
                            >
                                {statusForm.processing && statusForm.data.status === 'completed' ? (
                                <>
                                  <RefreshCw size={16} className="animate-spin" />
                                  <span>Menyelesaikan...</span>
                                </>
                              ) : statusForm.processing && statusForm.data.status === 'confirmed' ? (
                                <>
                                  <RefreshCw size={16} className="animate-spin" />
                                  <span>Mengkonfirmasi...</span>
                                </>
                              ) : statusForm.processing && statusForm.data.status === 'cancelled' ? (
                                <>
                                  <RefreshCw size={16} className="animate-spin" />
                                  <span>Membatalkan...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={16} />
                                  <span>Selesai</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white rounded-lg shadow-sm">
                    <div className="mb-4 text-gray-400">
                      <Calendar size={48} className="mx-auto" />
                    </div>
                    <p className="text-gray-500">Pilih reservasi untuk melihat detail</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Tables View */
          <div className="space-y-6">
            {/* Table Statistics */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-900">{tableStats.total}</div>
                <div className="text-sm text-gray-600">Total Meja</div>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">{tableStats.available}</div>
                <div className="text-sm text-gray-600">Tersedia</div>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-red-600">{tableStats.occupied}</div>
                <div className="text-sm text-gray-600">Terisi</div>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-yellow-600">{tableStats.reserved}</div>
                <div className="text-sm text-gray-600">Direservasi</div>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-gray-600">{tableStats.maintenance}</div>
                <div className="text-sm text-gray-600">Maintenance</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Status Meja</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Klik pada meja untuk melihat detail dan mengubah status
                </p>
              </div>
              <div className="p-6">
                {!tables || tables.length === 0 ? (
                  <div className="py-8 text-center">
                    <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Tidak ada data meja</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {tables.map((table) => (
                      <div
                        key={table.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${getTableStatusColor(table.status_color)}`}
                        onClick={() => showTableDetailModal(table)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{table.meja_name}</h3>
                          <div className="flex items-center space-x-1">
                            <span className="px-2 py-1 text-xs font-medium bg-white bg-opacity-50 rounded-full">
                              {table.status_label}
                            </span>
                            {table.today_reservations_count > 0 && (
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {table.today_reservations_count}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1 text-sm mb-3">
                          <div className="flex items-center space-x-1">
                            <Users size={14} />
                            <span>{table.capacity} kursi</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin size={14} />
                            <span>{table.full_location}</span>
                          </div>
                        </div>

                        {/* Current reservation info */}
                        {table.current_reservation && (
                          <div className="p-2 mb-2 text-xs bg-blue-50 text-blue-800 rounded">
                            <div className="font-medium">{table.current_reservation.customer_name}</div>
                            <div>{table.current_reservation.time}</div>
                          </div>
                        )}

                        {/* 🎯 TAMBAHKAN CODE INI DI SINI */}
                        {table.all_reservations && table.all_reservations.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showTableReservationsList(table);
                            }}
                            className="w-full mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            Lihat {table.all_reservations.length} Reservasi
                          </button>
                        )}

                        {/* Click indicator */}
                        <div className="flex items-center justify-center pt-2 text-xs text-gray-500">
                          <Settings size={12} className="mr-1" />
                          <span>Klik untuk detail</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Legend - only show if tables exist */}
                {tables && tables.length > 0 && (
                  <div className="flex flex-wrap gap-4 pt-4 mt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
                      <span className="text-sm text-gray-600">Tersedia</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
                      <span className="text-sm text-gray-600">Direservasi</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
                      <span className="text-sm text-gray-600">Terisi</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                      <span className="text-sm text-gray-600">Maintenance</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Table Detail Modal */}
        {showTableDetail && selectedTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-2xl max-h-screen overflow-auto bg-white rounded-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detail Meja - {selectedTable.meja_name}
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowTableDetail(false)}
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6">
                {/* Table Information */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Informasi Meja</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nama Meja</label>
                        <p className="text-gray-900 font-medium">{selectedTable.meja_name}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Meja</label>
                        <p className="text-gray-900">{selectedTable.table_number}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Kapasitas</label>
                        <div className="flex items-center space-x-1">
                          <Users size={16} className="text-gray-400" />
                          <span className="text-gray-900">{selectedTable.capacity} kursi</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Lokasi</label>
                        <div className="flex items-center space-x-1">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="text-gray-900">{selectedTable.full_location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Status & Aktivitas</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status Saat Ini</label>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getTableStatusInfo(selectedTable.status).color}`}></div>
                          <span className={`font-medium ${getTableStatusInfo(selectedTable.status).textColor}`}>
                            {getTableStatusInfo(selectedTable.status).label}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Reservasi Hari Ini</label>
                        <div className="flex items-center space-x-1">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="text-gray-900">{selectedTable.today_reservations_count} reservasi</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Ketersediaan</label>
                        <span className={`text-sm font-medium ${selectedTable.is_available ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedTable.is_available ? 'Dapat direservasi' : 'Tidak dapat direservasi'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Reservation Info */}
                {selectedTable.current_reservation && (
                  <div className="p-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Reservasi Aktif</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Nama:</span>
                        <span className="ml-2 text-blue-900">{selectedTable.current_reservation.customer_name}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Waktu:</span>
                        <span className="ml-2 text-blue-900">{selectedTable.current_reservation.time}</span>
                      </div>
                    </div>
                  </div>
                )}

              {/* Status Change Section - IMPROVED LAYOUT */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Ubah Status Meja</h4>
                
                {/* Status Buttons Grid - 2x2 Layout */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Row 1 */}
                  <button
                    type="button"
                    onClick={() => {
                      tableStatusForm.clearErrors(); // Clear errors sebelum update
                      updateTableStatus(selectedTable.id, 'available');
                    }}
                    disabled={tableStatusForm.processing || selectedTable.status === 'available'}
                    className={`flex flex-col items-center justify-center px-4 py-4 rounded-lg border-2 transition-all min-h-[80px] ${
                      selectedTable.status === 'available'
                        ? 'border-green-300 bg-green-50 text-green-600 cursor-not-allowed'
                        : tableStatusForm.processing
                        ? 'border-green-300 bg-green-100 text-green-700 opacity-75'
                        : 'border-green-200 hover:border-green-300 hover:bg-green-50 text-green-700 hover:shadow-md'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span className="font-semibold text-sm">Tersedia</span>
                    </div>
                    {selectedTable.status === 'available' && !tableStatusForm.processing && (
                      <CheckCircle size={18} className="text-green-600" />
                    )}
                    {tableStatusForm.processing && (
                      <RefreshCw size={18} className="animate-spin text-green-600" />
                    )}
                    {selectedTable.status !== 'available' && !tableStatusForm.processing && (
                      <span className="text-xs text-gray-500">Klik untuk ubah</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      tableStatusForm.clearErrors(); // Clear errors sebelum update
                      updateTableStatus(selectedTable.id, 'occupied');
                    }}
                    disabled={tableStatusForm.processing || selectedTable.status === 'occupied'}
                    className={`flex flex-col items-center justify-center px-4 py-4 rounded-lg border-2 transition-all min-h-[80px] ${
                      selectedTable.status === 'occupied'
                        ? 'border-red-300 bg-red-50 text-red-600 cursor-not-allowed'
                        : tableStatusForm.processing
                        ? 'border-red-300 bg-red-100 text-red-700 opacity-75'
                        : 'border-red-200 hover:border-red-300 hover:bg-red-50 text-red-700 hover:shadow-md'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                      <span className="font-semibold text-sm">Terisi</span>
                    </div>
                    {selectedTable.status === 'occupied' && !tableStatusForm.processing && (
                      <CheckCircle size={18} className="text-red-600" />
                    )}
                    {tableStatusForm.processing && (
                      <RefreshCw size={18} className="animate-spin text-red-600" />
                    )}
                    {selectedTable.status !== 'occupied' && !tableStatusForm.processing && (
                      <span className="text-xs text-gray-500">Klik untuk ubah</span>
                    )}
                  </button>

                  {/* Row 2 */}
                  <button
                    type="button"
                    onClick={() => {
                      tableStatusForm.clearErrors(); // Clear errors sebelum update
                      updateTableStatus(selectedTable.id, 'reserved');
                    }}
                    disabled={tableStatusForm.processing || selectedTable.status === 'reserved'}
                    className={`flex flex-col items-center justify-center px-4 py-4 rounded-lg border-2 transition-all min-h-[80px] ${
                      selectedTable.status === 'reserved'
                        ? 'border-yellow-300 bg-yellow-50 text-yellow-600 cursor-not-allowed'
                        : tableStatusForm.processing
                        ? 'border-yellow-300 bg-yellow-100 text-yellow-700 opacity-75'
                        : 'border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50 text-yellow-700 hover:shadow-md'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="font-semibold text-sm">Direservasi</span>
                    </div>
                    {selectedTable.status === 'reserved' && !tableStatusForm.processing && (
                      <CheckCircle size={18} className="text-yellow-600" />
                    )}
                    {tableStatusForm.processing && (
                      <RefreshCw size={18} className="animate-spin text-yellow-600" />
                    )}
                    {selectedTable.status !== 'reserved' && !tableStatusForm.processing && (
                      <span className="text-xs text-gray-500">Klik untuk ubah</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      tableStatusForm.clearErrors(); // Clear errors sebelum update
                      updateTableStatus(selectedTable.id, 'maintenance');
                    }}
                    disabled={tableStatusForm.processing || selectedTable.status === 'maintenance'}
                    className={`flex flex-col items-center justify-center px-4 py-4 rounded-lg border-2 transition-all min-h-[80px] ${
                      selectedTable.status === 'maintenance'
                        ? 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
                        : tableStatusForm.processing
                        ? 'border-gray-300 bg-gray-100 text-gray-700 opacity-75'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 hover:shadow-md'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
                      <span className="font-semibold text-sm">Maintenance</span>
                    </div>
                    {selectedTable.status === 'maintenance' && !tableStatusForm.processing && (
                      <CheckCircle size={18} className="text-gray-600" />
                    )}
                    {tableStatusForm.processing && (
                      <RefreshCw size={18} className="animate-spin text-gray-600" />
                    )}
                    {selectedTable.status !== 'maintenance' && !tableStatusForm.processing && (
                      <span className="text-xs text-gray-500">Klik untuk ubah</span>
                    )}
                  </button>
                </div>

                {/* Loading indicator untuk seluruh operasi */}
                {tableStatusForm.processing && (
                  <div className="flex items-center justify-center mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <RefreshCw size={20} className="mr-3 animate-spin text-blue-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-blue-900">Mengupdate status meja...</p>
                      <p className="text-xs text-blue-600">Mohon tunggu sebentar</p>
                    </div>
                  </div>
                )}

                {/* Success indicator */}
                {!tableStatusForm.processing && !tableStatusForm.hasErrors && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle size={16} className="mr-2 text-green-600" />
                      <p className="text-sm text-green-800">
                        Status berhasil diubah ke: <span className="font-semibold">{getTableStatusInfo(selectedTable.status).label}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Error display - ONLY show validation errors */}
                {tableStatusForm.hasErrors && Object.keys(tableStatusForm.errors).length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle size={16} className="mr-2 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800 mb-1">Gagal mengupdate status:</p>
                        <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                          {Object.entries(tableStatusForm.errors).map(([field, messages]) => (
                            <li key={field}>
                              {Array.isArray(messages) ? messages.join(', ') : messages}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

                {/* Action Buttons */}
                <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowTableDetail(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Reservations List Modal */}
        {showTableReservations && selectedTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-4xl max-h-screen overflow-auto bg-white rounded-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Daftar Reservasi - {selectedTable.meja_name}
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowTableReservations(false)}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                {/* Table Info */}
                <div className="p-4 mb-6 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Kapasitas:</span>
                      <span className="ml-2">{selectedTable.capacity} kursi</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Lokasi:</span>
                      <span className="ml-2">{selectedTable.full_location}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        selectedTable.status_color === 'green' ? 'bg-green-100 text-green-800' :
                        selectedTable.status_color === 'red' ? 'bg-red-100 text-red-800' :
                        selectedTable.status_color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedTable.status_label}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Reservasi:</span>
                      <span className="ml-2">{selectedTable.all_reservations.length}</span>
                    </div>
                  </div>
                </div>

                {/* Current & Next Reservation Info */}
                {(selectedTable.current_reservation || selectedTable.next_reservation) && (
                  <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                    {selectedTable.current_reservation && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Reservasi Aktif</h4>
                        <div className="text-sm space-y-1">
                          <div className="font-medium text-blue-800">
                            {selectedTable.current_reservation.customer_name}
                          </div>
                          <div className="text-blue-700">
                            {selectedTable.current_reservation.reservation_code}
                          </div>
                          <div className="text-blue-600">
                            {selectedTable.current_reservation.time} • {selectedTable.current_reservation.guests} orang
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedTable.next_reservation && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="text-sm font-medium text-green-900 mb-2">Reservasi Selanjutnya</h4>
                        <div className="text-sm space-y-1">
                          <div className="font-medium text-green-800">
                            {selectedTable.next_reservation.customer_name}
                          </div>
                          <div className="text-green-700">
                            {selectedTable.next_reservation.reservation_code}
                          </div>
                          <div className="text-green-600">
                            {selectedTable.next_reservation.date} • {selectedTable.next_reservation.time} • {selectedTable.next_reservation.guests} orang
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* All Reservations List */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Semua Reservasi ({selectedTable.all_reservations.length})
                  </h4>
                  
                  {selectedTable.all_reservations.length === 0 ? (
                    <div className="py-8 text-center">
                      <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Belum ada reservasi untuk meja ini</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedTable.all_reservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h5 className="font-medium text-gray-900">
                                {reservation.customer_name}
                              </h5>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                reservation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {reservation.status}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{reservation.date}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock size={14} />
                                <span>{reservation.time}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users size={14} />
                                <span>{reservation.guests} orang</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.reservation_code}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowTableReservations(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Selection Modal */}
        {showTableSelection && selectedReservation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-4xl max-h-screen overflow-auto bg-white rounded-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pilih Meja untuk {selectedReservation.customer_name}
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowTableSelection(false)}
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Jumlah tamu: <span className="font-medium">{selectedReservation.guests} orang</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Paket: <span className="font-medium">{selectedReservation.package_name}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Preferensi lokasi: <span className="font-medium">{selectedReservation.table_location}</span>
                  </p>
                  {selectedReservation.special_requests && (
                    <p className="text-sm text-gray-600">
                      Permintaan khusus: <span className="font-medium">{selectedReservation.special_requests}</span>
                    </p>
                  )}
                </div>

                {getAvailableTablesForCurrentReservation().length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="mb-4 text-gray-400">
                      <MapPin size={48} className="mx-auto" />
                    </div>
                    <p className="text-gray-500">
                      Tidak ada meja yang tersedia untuk {selectedReservation.guests} orang di area {selectedReservation.table_location}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {getAvailableTablesForCurrentReservation().map((table) => (
                      <div
                        key={table.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          table.table_number === selectedReservation.table_number
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-amber-300'
                        } ${tableAssignForm.processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !tableAssignForm.processing && assignTableToReservation(selectedReservation.id, table.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{table.meja_name}</h4>
                          {table.table_number === selectedReservation.table_number && (
                            <div className="px-2 py-1 text-xs font-medium rounded-full bg-amber-200 text-amber-800">
                              Terpilih
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users size={14} />
                            <span>{table.capacity} kursi</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin size={14} />
                            <span>{table.full_location}</span>
                          </div>
                        </div>
                        {table.capacity >= selectedReservation.guests && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                              Sesuai kapasitas
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Proof Modal */}
        {showPaymentProof && selectedReservation?.proof_of_payment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-2xl max-h-screen overflow-auto bg-white rounded-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Bukti Pembayaran</h3>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPaymentProof(false)}
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-4">
                <img
                  src={selectedReservation.proof_of_payment}
                  alt="Bukti Pembayaran"
                  className="w-full h-auto rounded-lg"
                />
                
                {/* HANYA BUTTON TUTUP - HAPUS KONFIRMASI PEMBAYARAN */}
                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 text-gray-800 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                    onClick={() => setShowPaymentProof(false)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi */}
{showConfirmModal && confirmAction.reservation && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
    <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${
            confirmAction.type === 'confirm' 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
          }`}>
            {confirmAction.type === 'confirm' ? (
              <CheckCircle size={20} />
            ) : (
              <XCircle size={20} />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {confirmAction.title}
          </h3>
        </div>
        <button
          className="text-gray-400 hover:text-gray-600 transition-colors"
          onClick={closeConfirmModal}
          disabled={statusForm.processing}
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Reservation Info */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Detail Reservasi:</div>
          <div className="font-medium text-gray-900">{confirmAction.reservation.customer_name}</div>
          <div className="text-sm text-gray-600">
            {confirmAction.reservation.date} • {confirmAction.reservation.time} • {confirmAction.reservation.guests} orang
          </div>
          <div className="text-sm text-gray-600">
            {confirmAction.reservation.package_name} • {confirmAction.reservation.total_price}
          </div>
        </div>

        {/* Confirmation Message */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {confirmAction.message}
          </p>
        </div>

        {/* Special info for confirmation */}
        {confirmAction.type === 'confirm' && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="p-1 bg-blue-100 rounded">
                <AlertCircle size={14} className="text-blue-600" />
              </div>
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">Yang akan terjadi setelah konfirmasi:</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Sistem akan otomatis mencari dan menetapkan meja yang sesuai</li>
                  <li>Status reservasi berubah menjadi "Dikonfirmasi"</li>
                  <li>Pelanggan akan diberitahu (jika fitur notifikasi aktif)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Special info for cancellation */}
        {confirmAction.type === 'cancel' && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="p-1 bg-yellow-100 rounded">
                <AlertCircle size={14} className="text-yellow-600" />
              </div>
              <div className="text-sm text-yellow-800">
                <div className="font-medium mb-1">Perhatian:</div>
                <p className="text-xs">
                  Tindakan ini akan membatalkan reservasi secara permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
        <button
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          onClick={closeConfirmModal}
          disabled={statusForm.processing}
        >
          Batal
        </button>
        <button
          className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmAction.confirmColor}`}
          onClick={executeConfirmedAction}
          disabled={statusForm.processing}
        >
          {statusForm.processing ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              {confirmAction.type === 'confirm' ? (
                <CheckCircle size={16} />
              ) : (
                <XCircle size={16} />
              )}
              <span>{confirmAction.confirmText}</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default StaffReservasi;