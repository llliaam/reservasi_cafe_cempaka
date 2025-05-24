import React, { useState } from 'react';

interface Package {
  id: number;
  name: string;
}

interface OrderSummaryProps {
  selectedPackage: Package;
  reservation: {
    date: string;
    time: string;
    numberOfPeople: number;
    tableLocation: string;
    type: string;
    totalPrice: number;
  };
  menuItemsCount: number;
  handleSubmit: (e: React.FormEvent) => void;
  formatPrice: (price: number) => string;
}

// Modal Component
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: {
    date: string;
    time: string;
    numberOfPeople: number;
    tableLocation: string;
    type: string;
    totalPrice: number;
  };
  selectedPackage: Package;
  menuItemsCount: number;
  formatPrice: (price: number) => string;
  paymentMethod: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  reservation,
  selectedPackage,
  menuItemsCount,
  formatPrice,
  paymentMethod
}) => {
  const handleDownloadPDF = () => {
    // Implementasi download PDF
    console.log('Downloading PDF...');
    // Di sini Anda bisa menambahkan logika untuk generate dan download PDF
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50 p-4">
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
        </div>

        {/* Body */}
        <div className="p-6">
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
                <span className="text-gray-600">Jenis Reservasi</span>
                <span className="font-medium text-gray-800">
                  {reservation.type === 'private' ? 'Private' : 'Acara'}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Metode Pembayaran</span>
                <span className="font-medium text-gray-800">{paymentMethod}</span>
              </div>
              
              {menuItemsCount > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Menu Tambahan</span>
                  <span className="font-medium text-gray-800">{menuItemsCount} item</span>
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
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedPackage,
  reservation,
  menuItemsCount,
  handleSubmit,
  formatPrice
}) => {
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [showModal, setShowModal] = useState(false);

  const paymentOptions = [
    { value: 'transfer', label: 'Transfer Bank', icon: '🏦' },
    { value: 'bca', label: 'BCA Mobile', icon: '📱' },
    { value: 'mandiri', label: 'Mandiri Online', icon: '📱' },
    { value: 'bni', label: 'BNI Mobile', icon: '📱' },
    { value: 'bri', label: 'BRI Mobile', icon: '📱' },
    { value: 'gopay', label: 'GoPay', icon: '💚' },
    { value: 'ovo', label: 'OVO', icon: '💜' },
    { value: 'dana', label: 'DANA', icon: '💙' },
    { value: 'shopeepay', label: 'ShopeePay', icon: '🧡' },
    { value: 'pay-later', label: 'Bayar di Tempat', icon: '💰' }
  ];

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
    // Panggil handleSubmit yang asli jika diperlukan
    // handleSubmit(e);
  };

  const getPaymentLabel = (value: string) => {
    const option = paymentOptions.find(opt => opt.value === value);
    return option ? option.label : 'Transfer Bank';
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Pesanan</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Paket</span>
            <span className="font-medium text-gray-800">
              {selectedPackage.name}
            </span>
          </div>
          
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Tanggal & Waktu</span>
            <span className="font-medium text-gray-800">
              {reservation.date}, {reservation.time}
            </span>
          </div>
          
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Jumlah Orang</span>
            <span className="font-medium text-gray-800">{reservation.numberOfPeople} orang</span>
          </div>
          
          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Lokasi</span>
            <span className="font-medium text-gray-800">
              {reservation.tableLocation === 'indoor' ? 'Indoor' : 
               reservation.tableLocation === 'outdoor' ? 'Outdoor' : 'Ruang Private'}
            </span>
          </div>

          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-600">Jenis Reservasi</span>
            <span className="font-medium text-gray-800">
              {reservation.type === 'private' ? 'Private' : 'Acara'}
            </span>
          </div>
          
          {menuItemsCount > 0 && (
            <div className="flex justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Menu Tambahan</span>
              <span className="font-medium text-gray-800">{menuItemsCount} item</span>
            </div>
          )}
          
          <div className="pt-3">
            <div className="flex justify-between text-lg text-gray-800 font-bold">
              <span>Total</span>
              <span className="text-yellow-600">{formatPrice(reservation.totalPrice)}</span>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-3">Metode Pembayaran</h3>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
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
            </div>
            
            <button
              type="button"
              onClick={handleConfirmReservation}
              className="w-full mt-6 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Konfirmasi Reservasi
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        reservation={reservation}
        selectedPackage={selectedPackage}
        menuItemsCount={menuItemsCount}
        formatPrice={formatPrice}
        paymentMethod={getPaymentLabel(paymentMethod)}
      />
    </>
  );
};

export default OrderSummary;