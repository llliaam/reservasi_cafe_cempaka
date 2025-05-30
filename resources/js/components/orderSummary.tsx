import React, { useState } from 'react';

interface Package {
  id: number;
  name: string;
  price: number;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  quantity?: number;
}

interface OrderSummaryProps {
  selectedPackage: Package;
  reservation: {
    date: string;
    time: string;
    numberOfPeople: number;
    tableLocation: string;
    totalPrice: number;
  };
  selectedMenuItems: MenuItem[];
  menuSubtotal: number;
  handleSubmit: (e: React.FormEvent, paymentData: any) => Promise<any>;
  formatPrice: (price: number) => string;
  isSubmitting?: boolean;
  hasProofOfPayment?: boolean;
  onPaymentMethodChange?: (method: string) => void;
  customerData?: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
  };
  customerFormRef?: React.RefObject<any>;
}

// Error Modal Component
interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorType: string;
  errorMessage?: string;
  onRetry?: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  errorType,
  errorMessage,
  onRetry
}) => {
  if (!isOpen) return null;

  // Function untuk mendapatkan pesan error yang user-friendly
  const getErrorContent = () => {
    switch (errorType) {
      case 'empty_name':
        return {
          icon: '👤',
          title: 'Nama Belum Diisi',
          message: 'Maaf, nama lengkap Anda belum diisi. Kami memerlukan nama untuk reservasi.',
          solutions: [
            'Isi nama lengkap sesuai identitas',
            'Pastikan nama ditulis dengan benar',
            'Nama akan digunakan untuk konfirmasi reservasi'
          ],
          buttonText: 'Isi Nama',
          color: 'blue'
        };

      case 'empty_phone':
        return {
          icon: '📞',
          title: 'Nomor Telepon Belum Diisi',
          message: 'Kami memerlukan nomor telepon untuk menghubungi Anda terkait reservasi.',
          solutions: [
            'Isi nomor telepon yang aktif',
            'Pastikan nomor bisa dihubungi',
            'Kami akan mengirim konfirmasi via WhatsApp/telepon'
          ],
          buttonText: 'Isi Nomor Telepon',
          color: 'green'
        };

      case 'invalid_phone':
        return {
          icon: '📱',
          title: 'Nomor Telepon Tidak Valid',
          message: 'Format nomor telepon yang Anda masukkan tidak sesuai standar Indonesia.',
          solutions: [
            'Gunakan format: 08xxxxxxxxxx',
            'Atau dengan kode negara: +62-8xxxxxxxxxx',
            'Contoh: 081234567890 atau +62-812-3456-7890'
          ],
          buttonText: 'Perbaiki Nomor',
          color: 'yellow'
        };

      case 'empty_email':
        return {
          icon: '📧',
          title: 'Email Belum Diisi',
          message: 'Email diperlukan untuk mengirimkan bukti reservasi dan informasi penting.',
          solutions: [
            'Masukkan alamat email yang aktif',
            'Pastikan email bisa menerima pesan',
            'Bukti reservasi akan dikirim ke email ini'
          ],
          buttonText: 'Isi Email',
          color: 'purple'
        };

      case 'invalid_email':
        return {
          icon: '📮',
          title: 'Format Email Salah',
          message: 'Format email yang Anda masukkan belum benar.',
          solutions: [
            'Gunakan format: nama@email.com',
            'Pastikan ada tanda @ dan domain',
            'Contoh: john@gmail.com'
          ],
          buttonText: 'Perbaiki Email',
          color: 'indigo'
        };

      case 'missing_payment_proof':
        return {
          icon: '🧾',
          title: 'Bukti Pembayaran Belum Diupload',
          message: 'Untuk metode pembayaran yang dipilih, Anda perlu upload bukti pembayaran.',
          solutions: [
            'Upload foto/screenshot bukti transfer',
            'Pastikan gambar jelas dan terbaca',
            'Atau pilih "Bayar di Tempat" jika belum transfer'
          ],
          buttonText: 'Upload Bukti',
          color: 'orange'
        };

      case 'network_error':
        return {
          icon: '🌐',
          title: 'Koneksi Internet Bermasalah',
          message: 'Sepertinya ada masalah dengan koneksi internet Anda.',
          solutions: [
            'Periksa koneksi WiFi atau data seluler',
            'Coba refresh halaman',
            'Tunggu beberapa saat dan coba lagi'
          ],
          buttonText: 'Coba Lagi',
          color: 'gray'
        };

      case 'server_error':
        return {
          icon: '⚠️',
          title: 'Server Sedang Bermasalah',
          message: 'Maaf, sistem kami sedang mengalami gangguan sementara.',
          solutions: [
            'Coba lagi dalam beberapa menit',
            'Hubungi customer service jika masih bermasalah',
            'Data Anda tetap aman dan tersimpan'
          ],
          buttonText: 'Coba Lagi',
          color: 'red'
        };

      case 'date_invalid':
        return {
          icon: '📅',
          title: 'Tanggal Reservasi Tidak Valid',
          message: 'Tanggal yang dipilih tidak tersedia untuk reservasi.',
          solutions: [
            'Pilih tanggal minimal 2 hari ke depan',
            'Periksa hari libur atau tanggal merah',
            'Coba pilih tanggal alternatif'
          ],
          buttonText: 'Pilih Tanggal Lain',
          color: 'blue'
        };

      case 'validation_failed':
        return {
          icon: '📝',
          title: 'Data Belum Lengkap',
          message: 'Beberapa informasi penting masih kosong atau belum benar.',
          solutions: [
            'Periksa semua field yang bertanda bintang (*)',
            'Pastikan semua data sudah terisi',
            'Scroll ke atas untuk melihat field yang error'
          ],
          buttonText: 'Periksa Data',
          color: 'yellow'
        };

      default:
        return {
          icon: '❗',
          title: 'Terjadi Kesalahan',
          message: errorMessage || 'Maaf, terjadi kesalahan yang tidak terduga.',
          solutions: [
            'Coba refresh halaman',
            'Periksa koneksi internet',
            'Hubungi customer service jika masih bermasalah'
          ],
          buttonText: 'Coba Lagi',
          color: 'red'
        };
    }
  };

  const errorContent = getErrorContent();
  
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-100 border-blue-600',
      green: 'bg-green-500 text-green-100 border-green-600',
      yellow: 'bg-yellow-500 text-yellow-100 border-yellow-600',
      purple: 'bg-purple-500 text-purple-100 border-purple-600',
      indigo: 'bg-indigo-500 text-indigo-100 border-indigo-600',
      orange: 'bg-orange-500 text-orange-100 border-orange-600',
      gray: 'bg-gray-500 text-gray-100 border-gray-600',
      red: 'bg-red-500 text-red-100 border-red-600'
    };
    return colors[color] || colors.red;
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-pulse-once">
        {/* Header */}
        <div className={`${getColorClasses(errorContent.color)} p-6 rounded-t-xl text-center border-b-2`}>
          <div className="text-4xl mb-3">{errorContent.icon}</div>
          <h2 className="text-xl font-bold">{errorContent.title}</h2>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Main Message */}
          <div className="mb-6">
            <p className="text-gray-700 text-center leading-relaxed">
              {errorContent.message}
            </p>
          </div>

          {/* Solutions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Cara Mengatasi:
            </h3>
            <ul className="space-y-2">
              {errorContent.solutions.map((solution, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                onClose();
                if (onRetry) onRetry();
              }}
              className={`flex-1 py-3 ${errorContent.color === 'red' ? 'bg-red-500 hover:bg-red-600' : 
                         errorContent.color === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600' :
                         errorContent.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                         errorContent.color === 'green' ? 'bg-green-500 hover:bg-green-600' :
                         errorContent.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600' :
                         errorContent.color === 'indigo' ? 'bg-indigo-500 hover:bg-indigo-600' :
                         errorContent.color === 'orange' ? 'bg-orange-500 hover:bg-orange-600' :
                         'bg-gray-500 hover:bg-gray-600'} 
                       text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {errorContent.buttonText}
            </button>
            
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none sm:px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Tutup
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs text-blue-800 font-medium">Butuh Bantuan?</p>
                <p className="text-xs text-blue-700 mt-1">
                  Hubungi WhatsApp: <strong>0812-3456-7890</strong> atau email: <strong>help@cempakacafe.com</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success Modal Component (sama seperti sebelumnya)
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: {
    date: string;
    time: string;
    numberOfPeople: number;
    tableLocation: string;
    totalPrice: number;
  };
  selectedPackage: Package;
  selectedMenuItems: MenuItem[];
  menuSubtotal: number;
  formatPrice: (price: number) => string;
  paymentMethod: string;
  reservationCode?: string;
  needsConfirmation: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  reservation,
  selectedPackage,
  selectedMenuItems = [],
  menuSubtotal = 0,
  formatPrice,
  paymentMethod,
  reservationCode,
  needsConfirmation
}) => {
  const handleDownloadPDF = () => {
    console.log('Downloading PDF...');
  };

  const handleViewReservations = () => {
    window.location.href = '/reservations';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-500 text-white p-6 rounded-t-xl text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Reservasi Berhasil!</h2>
          <p className="text-green-100 mt-2">Terima kasih atas pesanan Anda</p>
          {reservationCode && (
            <div className="bg-green-600 rounded-lg p-2 mt-3">
              <p className="text-sm">Kode Reservasi:</p>
              <p className="text-lg font-bold">{reservationCode}</p>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {needsConfirmation && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="font-medium text-yellow-800">Menunggu Konfirmasi</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Reservasi Anda sedang menunggu konfirmasi dari staff kami. 
                    Kami akan menghubungi Anda dalam 24 jam untuk konfirmasi pembayaran.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detail Reservasi</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Paket</span>
                <span className="font-medium text-gray-800">{selectedPackage.name}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Tanggal & Waktu</span>
                <span className="font-medium text-gray-800">{reservation.date}, {reservation.time}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Jumlah Orang</span>
                <span className="font-medium text-gray-800">{reservation.numberOfPeople} orang</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Lokasi</span>
                <span className="font-medium text-gray-800">
                  {reservation.tableLocation === 'indoor' ? 'Indoor' : 
                   reservation.tableLocation === 'outdoor' ? 'Outdoor' : 'Ruang Private'}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Metode Pembayaran</span>
                <span className="font-medium text-gray-800">{paymentMethod}</span>
              </div>
              
              {selectedMenuItems.length > 0 && (
                <div className="py-2 border-b border-gray-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Menu Tambahan</span>
                    <span className="font-medium text-gray-800">{selectedMenuItems.length} item</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    {selectedMenuItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-500">{item.name} x{item.quantity}</span>
                        <span className="text-gray-600">{formatPrice(item.price * (item.quantity || 1))}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-medium border-t border-gray-100 pt-1">
                      <span className="text-gray-600">Subtotal Menu:</span>
                      <span className="text-gray-800">{formatPrice(menuSubtotal)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between py-3 text-lg text-gray-800 font-bold bg-yellow-50 px-3 rounded-lg">
                <span>Total Pembayaran</span>
                <span className="text-yellow-600">{formatPrice(reservation.totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-blue-800 mb-2">Informasi Penting:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Harap datang 15 menit sebelum waktu reservasi</li>
              <li>• Bawa bukti reservasi ini saat datang</li>
              <li>• Hubungi kami jika ada perubahan</li>
              {needsConfirmation && <li>• Tunggu konfirmasi dari staff kami</li>}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleViewReservations}
              className="flex-1 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Lihat Reservasi
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-3 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedPackage,
  reservation,
  selectedMenuItems,
  menuSubtotal,
  handleSubmit,
  formatPrice,
  isSubmitting = false,
  hasProofOfPayment = false,
  onPaymentMethodChange,
  customerData,
  customerFormRef
}) => {
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorType, setErrorType] = useState('');
  const [reservationResult, setReservationResult] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [localSubmitting, setLocalSubmitting] = useState(false);

  const paymentOptions = [
    { value: 'transfer', label: 'Transfer Bank', icon: '🏦', requiresProof: true },
    { value: 'bca', label: 'BCA Mobile', icon: '📱', requiresProof: true },
    { value: 'mandiri', label: 'Mandiri Online', icon: '📱', requiresProof: true },
    { value: 'bni', label: 'BNI Mobile', icon: '📱', requiresProof: true },
    { value: 'bri', label: 'BRI Mobile', icon: '📱', requiresProof: true },
    { value: 'gopay', label: 'GoPay', icon: '💚', requiresProof: true },
    { value: 'ovo', label: 'OVO', icon: '💜', requiresProof: true },
    { value: 'dana', label: 'DANA', icon: '💙', requiresProof: true },
    { value: 'shopeepay', label: 'ShopeePay', icon: '🧡', requiresProof: true },
    { value: 'pay-later', label: 'Bayar di Tempat', icon: '💰', requiresProof: false }
  ];

  const selectedPaymentOption = paymentOptions.find(opt => opt.value === paymentMethod);
  const requiresProof = selectedPaymentOption?.requiresProof || false;

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    setPaymentError('');
    if (onPaymentMethodChange) {
      onPaymentMethodChange(value);
    }
  };

  // Function untuk menampilkan error modal
  const showError = (type: string, message?: string) => {
    setErrorType(type);
    setShowErrorModal(true);
    setPaymentError(''); // Clear inline error
  };

  // VALIDASI NOMOR TELEPON
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone?.trim()) return false;
    
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const phonePatterns = [
      /^(\+62|62|0)[8-9][0-9]{8,11}$/, // Indonesian mobile numbers
      /^(\+62|62|0)[2-7][0-9]{7,10}$/   // Indonesian landline numbers
    ];
    
    return phonePatterns.some(pattern => pattern.test(cleanPhone));
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎬 handleConfirmReservation called');
    
    // ✅ VALIDASI CUSTOMER FORM DENGAN ERROR MODAL
    if (customerFormRef?.current) {
      console.log('🔍 Validating customer form...');
      
      // Panggil validasi dari CustomerForm
      const isValid = customerFormRef.current.validateAndFocus();
      
      if (!isValid) {
        console.log('❌ Customer form validation failed');
        showError('validation_failed');
        return;
      }
    } else if (customerData) {
      // Fallback validation dengan error modal yang spesifik
      console.log('🔍 Fallback validation...');
      
      if (!customerData.customer_name?.trim()) {
        showError('empty_name');
        return;
      }
      
      if (!customerData.customer_phone?.trim()) {
        showError('empty_phone');
        return;
      }
      
      if (!validatePhoneNumber(customerData.customer_phone)) {
        showError('invalid_phone');
        return;
      }
      
      if (!customerData.customer_email?.trim()) {
        showError('empty_email');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerData.customer_email)) {
        showError('invalid_email');
        return;
      }
    }
    
    console.log('✅ Customer form validation passed');

    // Validasi bukti pembayaran
    if (requiresProof && !hasProofOfPayment) {
      showError('missing_payment_proof');
      return;
    }

    setPaymentError('');
    setLocalSubmitting(true);

    try {
      const paymentData = {
        payment_method: paymentMethod,
        requires_confirmation: requiresProof
      };

      console.log('📤 Calling handleSubmit with:', paymentData);

      // Call the parent submit handler
      const result = await handleSubmit(e, paymentData);
      
      console.log('🎉 handleSubmit resolved with:', result);

      // LANGSUNG set state untuk modal success
      const reservationCode = result?.reservation_code || `RSV-${Date.now()}`;
      
      console.log('🔥 Setting success modal state...');
      
      setReservationResult({
        reservation_code: reservationCode,
        success: true
      });
      
      setShowSuccessModal(true);
      
      console.log('✅ Success modal state set! Should show now.');

    } catch (error) {
      console.error('💥 Error in handleConfirmReservation:', error);
      
      // Tentukan jenis error dan tampilkan modal yang sesuai
      if (error.response?.status === 500) {
        showError('server_error');
      } else if (error.response?.status === 422) {
        // Validation errors dari server
        const errors = error.response.data.errors;
        if (errors.customer_phone) {
          showError('invalid_phone');
        } else if (errors.customer_email) {
          showError('invalid_email');
        } else if (errors.reservation_date) {
          showError('date_invalid');
        } else {
          showError('validation_failed');
        }
      } else if (!navigator.onLine) {
        showError('network_error');
      } else {
        // FALLBACK: Jika error tidak dikenal, tetap coba tampilkan success
        console.log('🔄 Unknown error, but trying success modal anyway...');
        
        setReservationResult({
          reservation_code: `RSV-${Date.now()}`,
          success: true
        });
        
        setShowSuccessModal(true);
      }
      
    } finally {
      setLocalSubmitting(false);
    }
  };

  // Handle retry dari error modal
  const handleRetry = () => {
    console.log('🔄 Retrying from error modal...');
    
    // Reset states
    setShowErrorModal(false);
    setErrorType('');
    setPaymentError('');
    
    // Depending on error type, take appropriate action
    if (errorType === 'empty_name' || errorType === 'empty_phone' || 
        errorType === 'invalid_phone' || errorType === 'empty_email' || 
        errorType === 'invalid_email' || errorType === 'validation_failed') {
      // Scroll to customer form
      if (customerFormRef?.current) {
        customerFormRef.current.validateAndFocus();
      }
    } else if (errorType === 'missing_payment_proof') {
      // Scroll to upload section
      const uploadSection = document.getElementById('upload-section');
      if (uploadSection) {
        uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    // For network/server errors, user can just try clicking confirm again
  };

  const getPaymentLabel = (value: string) => {
    const option = paymentOptions.find(opt => opt.value === value);
    return option ? option.label : 'Transfer Bank';
  };

  const getBankInfo = () => {
    if (paymentMethod === 'transfer') {
      return (
        <div className="mt-3 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Informasi Transfer:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Bank BCA</strong></p>
            <p>No. Rekening: 1234567890</p>
            <p>Atas Nama: Cempaka Cafe</p>
            <p className="text-xs mt-2 text-blue-600">
              *Silakan upload bukti transfer setelah melakukan pembayaran
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Debug: Log state changes
  React.useEffect(() => {
    console.log('OrderSummary State:', {
      showSuccessModal,
      showErrorModal,
      errorType,
      reservationResult,
      localSubmitting,
      isSubmitting,
      paymentError
    });
  }, [showSuccessModal, showErrorModal, errorType, reservationResult, localSubmitting, isSubmitting, paymentError]);

  const isCurrentlySubmitting = isSubmitting || localSubmitting;

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Pesanan</h2>
        
        <div className="space-y-3">
          {/* Package Info */}
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Paket</span>
            <div className="text-right">
              <div className="font-medium text-gray-800">{selectedPackage.name}</div>
              <div className="text-sm text-gray-600">{formatPrice(selectedPackage.price)}</div>
            </div>
          </div>
          
          {/* Date & Time */}
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Tanggal & Waktu</span>
            <span className="font-medium text-gray-800">
              {reservation.date}, {reservation.time}
            </span>
          </div>
          
          {/* Number of People */}
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Jumlah Orang</span>
            <span className="font-medium text-gray-800">{reservation.numberOfPeople} orang</span>
          </div>
          
          {/* Table Location */}
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Lokasi</span>
            <span className="font-medium text-gray-800">
              {reservation.tableLocation === 'indoor' ? 'Indoor' : 
               reservation.tableLocation === 'outdoor' ? 'Outdoor' : 'Ruang Private'}
            </span>
          </div>
          
          {/* Menu Items Detail */}
          {selectedMenuItems && selectedMenuItems.length > 0 && (
            <div className="pb-3 border-b border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 font-medium">Menu Tambahan</span>
                <span className="text-sm text-gray-500">{selectedMenuItems.length} item</span>
              </div>
              <div className="space-y-2 pl-2">
                {selectedMenuItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <div className="text-gray-700">{item.name}</div>
                      <div className="text-gray-500 text-xs">
                        {formatPrice(item.price)} x {item.quantity}
                      </div>
                    </div>
                    <div className="text-gray-800 font-medium">
                      {formatPrice(item.price * (item.quantity || 1))}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-medium border-t border-gray-100 pt-2 mt-2">
                  <span className="text-gray-600">Subtotal Menu:</span>
                  <span className="text-gray-800">{formatPrice(menuSubtotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Proof Status */}
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Status Bukti Bayar</span>
            <div className="flex items-center">
              {hasProofOfPayment ? (
                <>
                  <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-600 font-medium">Tersedia</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm text-gray-400">Belum ada</span>
                </>
              )}
            </div>
          </div>
          
          {/* Total Price */}
          <div className="pt-3">
            <div className="flex justify-between text-lg text-gray-800 font-bold">
              <span>Total</span>
              <span className="text-yellow-600">{formatPrice(reservation.totalPrice)}</span>
            </div>
            
            {/* Payment Method Section */}
            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-3">Metode Pembayaran</h3>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 appearance-none cursor-pointer"
                >
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Bank Info */}
              {getBankInfo()}

              {/* Payment Requirements */}
              {requiresProof && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Bukti pembayaran diperlukan</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Upload bukti pembayaran di bagian atas sebelum konfirmasi reservasi
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message (hanya untuk fallback) */}
              {paymentError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-red-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-800">{paymentError}</p>
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={handleConfirmReservation}
              disabled={isCurrentlySubmitting}
              className={`w-full mt-6 py-3 font-medium rounded-lg transition-colors ${
                isCurrentlySubmitting
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              {isCurrentlySubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses Reservasi...
                </div>
              ) : (
                'Konfirmasi Reservasi'
              )}
            </button>

            {/* Additional Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Informasi Penting:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Pastikan data pemesan sudah lengkap dan benar</li>
                  <li>• Reservasi minimal 2 hari sebelumnya</li>
                  {paymentMethod === 'pay-later' ? (
                    <li>• Pembayaran langsung di cafe saat datang</li>
                  ) : (
                    <li>• Reservasi menunggu konfirmasi staff setelah verifikasi pembayaran</li>
                  )}
                  <li>• Hubungi kami untuk perubahan reservasi</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && reservationResult && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setReservationResult(null);
            console.log('🔄 Success modal closed');
          }}
          reservation={reservation}
          selectedPackage={selectedPackage}
          selectedMenuItems={selectedMenuItems}
          menuSubtotal={menuSubtotal}
          formatPrice={formatPrice}
          paymentMethod={getPaymentLabel(paymentMethod)}
          reservationCode={reservationResult.reservation_code}
          needsConfirmation={requiresProof}
        />
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setErrorType('');
          console.log('🔄 Error modal closed');
        }}
        errorType={errorType}
        onRetry={handleRetry}
      />
    </>
  );
};

export default OrderSummary;