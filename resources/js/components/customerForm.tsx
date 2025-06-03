import React, { useRef, forwardRef, useImperativeHandle } from 'react';

interface CustomerFormProps {
  customerData: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    special_requests?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isLoggedIn?: boolean;
  userProfile?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

// Expose methods untuk parent component
export interface CustomerFormRef {
  validateAndFocus: () => boolean;
  scrollToPhone: () => void;
}

const CustomerForm = forwardRef<CustomerFormRef, CustomerFormProps>(({
  customerData,
  handleInputChange,
  isLoggedIn = false,
  userProfile
}, ref) => {
  // Refs untuk input fields
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  // Check apakah data diambil dari database
  const isNameFromDatabase = isLoggedIn && userProfile?.name && customerData.customer_name === userProfile.name;
  const isEmailFromDatabase = isLoggedIn && userProfile?.email && customerData.customer_email === userProfile.email;

  // Validasi nomor telepon Indonesia
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove spaces, dashes, and other non-digit characters except +
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Check for Indonesian phone number patterns
    const phonePatterns = [
      /^(\+62|62|0)[8-9][0-9]{8,11}$/, // Indonesian mobile numbers
      /^(\+62|62|0)[2-7][0-9]{7,10}$/   // Indonesian landline numbers
    ];

    return phonePatterns.some(pattern => pattern.test(cleanPhone));
  };

  // Function untuk scroll ke nomor telepon dan focus
  const scrollToPhone = () => {
    if (phoneInputRef.current && formSectionRef.current) {
      // Scroll ke form section terlebih dahulu
      formSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Delay focus untuk memastikan scroll selesai
      setTimeout(() => {
        phoneInputRef.current?.focus();
        phoneInputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);
    }
  };

  // Function untuk validasi dan focus ke field yang error
  const validateAndFocus = (): boolean => {
    // Check nama
    if (!customerData.customer_name?.trim()) {
      nameInputRef.current?.focus();
      nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    // Check nomor telepon
    if (!customerData.customer_phone?.trim()) {
      scrollToPhone();
      return false;
    }

    // Validasi format nomor telepon
    if (!validatePhoneNumber(customerData.customer_phone)) {
      scrollToPhone();
      return false;
    }

    // Check email
    if (!customerData.customer_email?.trim()) {
      emailInputRef.current?.focus();
      emailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.customer_email)) {
      emailInputRef.current?.focus();
      emailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    return true;
  };

  // Expose methods ke parent
  useImperativeHandle(ref, () => ({
    validateAndFocus,
    scrollToPhone
  }));

  // Check if phone number is valid
  const isPhoneValid = customerData.customer_phone ? validatePhoneNumber(customerData.customer_phone) : true;
  const showPhoneError = customerData.customer_phone && !isPhoneValid;

  return (
    <div ref={formSectionRef} className="p-8 mb-6 bg-white border border-gray-100 shadow-lg rounded-2xl" id="customer-form">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Informasi Pemesan</h2>
        {isLoggedIn && (
          <span className="px-4 py-2 text-sm font-medium text-white rounded-full shadow-sm bg-gradient-to-r from-orange-400 to-orange-500">
            Data dari Akun Anda
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Nama Lengkap */}
        <div>
          <label htmlFor="customer_name" className="block mb-2 text-sm font-semibold text-gray-700">
            Nama Lengkap *
          </label>
          <input
            ref={nameInputRef}
            type="text"
            id="customer_name"
            name="customer_name"
            value={customerData.customer_name || ''}
            onChange={handleInputChange}
            placeholder='Masukkan nama lengkap Anda'
            className={`w-full px-4 py-3 border-2 text-gray-900 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 ${
              isNameFromDatabase
                ? 'bg-orange-50 border-orange-200'
                : !customerData.customer_name?.trim()
                  ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                  : 'border-gray-200 hover:border-gray-300'
            }`}
            required
            readOnly={isNameFromDatabase}
          />
          {!customerData.customer_name?.trim() && (
            <p className="flex items-center mt-2 text-sm text-red-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Nama lengkap wajib diisi
            </p>
          )}
          {isNameFromDatabase && (
            <p className="flex items-center mt-2 text-sm text-orange-600">
            </p>
          )}
        </div>

        {/* Nomor Telepon */}
        <div>
          <label htmlFor="customer_phone" className="block mb-2 text-sm font-semibold text-gray-700">
            Nomor Telepon *
          </label>
          <input
            ref={phoneInputRef}
            type="tel"
            id="customer_phone"
            name="customer_phone"
            value={customerData.customer_phone || ''}
            onChange={handleInputChange}
            placeholder='Contoh: 08123456789'
            className={`w-full px-4 py-3 border-2 text-gray-800 rounded-xl focus:ring-2 transition-all duration-200 ${
              showPhoneError
                ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                : !customerData.customer_phone?.trim()
                  ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                  : 'border-gray-200 hover:border-gray-300 focus:ring-orange-400 focus:border-orange-400'
            }`}
            required
          />

          {/* Error Messages */}
          {!customerData.customer_phone?.trim() ? (
            <p className="flex items-center mt-2 text-sm text-red-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Nomor telepon wajib diisi
            </p>
          ) : showPhoneError ? (
            <p className="flex items-center mt-2 text-sm text-red-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Format nomor telepon tidak valid
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              Masukkan nomor telepon yang dapat dihubungi untuk konfirmasi reservasi
            </p>
          )}

          {/* Helper text untuk format yang benar */}
          {showPhoneError && (
            <div className="p-4 mt-3 border border-red-200 bg-red-50 rounded-xl">
              <p className="mb-2 text-sm font-semibold text-red-700">Format yang diterima:</p>
              <ul className="space-y-1 text-sm text-red-600">
                <li>• 08xxxxxxxxxx (dimulai dengan 08)</li>
                <li>• +62-8xxxxxxxxx (dengan kode negara)</li>
                <li>• 021-xxxxxxxx (nomor rumah Jakarta)</li>
              </ul>
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="customer_email" className="block mb-2 text-sm font-semibold text-gray-700">
            Email *
          </label>
          <input
            ref={emailInputRef}
            type="email"
            id="customer_email"
            name="customer_email"
            value={customerData.customer_email || ''}
            onChange={handleInputChange}
            placeholder='example@gmail.com'
            className={`w-full px-4 py-3 border-2 text-gray-800 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 ${
              isEmailFromDatabase
                ? 'bg-orange-50 border-orange-200'
                : !customerData.customer_email?.trim()
                  ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                  : 'border-gray-200 hover:border-gray-300'
            }`}
            required
            readOnly={isEmailFromDatabase}
          />
          {!customerData.customer_email?.trim() && (
            <p className="flex items-center mt-2 text-sm text-red-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Email wajib diisi
            </p>
          )}
          {isEmailFromDatabase && (
            <p className="flex items-center mt-2 text-sm text-orange-600">

            </p>
          )}
        </div>

        {/* Info kontak */}
        <div className="p-4 border border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-orange-400 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="mb-1 text-base font-semibold text-orange-800">Informasi Kontak</p>
              <p className="text-sm leading-relaxed text-orange-700">
                Pastikan nomor telepon dan email yang Anda masukkan benar.
                Kami akan menggunakan informasi ini untuk konfirmasi reservasi dan mengirimkan detail pesanan Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CustomerForm.displayName = 'CustomerForm';

export default CustomerForm;
