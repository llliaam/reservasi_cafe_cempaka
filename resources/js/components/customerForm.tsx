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
    <div ref={formSectionRef} className="bg-white rounded-xl shadow-md p-6" id="customer-form">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Informasi Pemesan</h2>
        {isLoggedIn && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            Data dari Akun Anda
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Nama Lengkap */}
        <div>
          <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
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
            className={`w-full px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors ${
              isNameFromDatabase ? 'bg-gray-50' : ''
            } ${!customerData.customer_name?.trim() ? 'border-red-300 focus:ring-red-500' : ''}`}
            required
            readOnly={isNameFromDatabase}
          />
          {!customerData.customer_name?.trim() && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Nama lengkap wajib diisi
            </p>
          )}
          {isNameFromDatabase && (
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Data diambil dari profil akun Anda
            </p>
          )}
        </div>
        
        {/* Nomor Telepon */}
        <div>
          <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">
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
            className={`w-full px-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 transition-colors ${
              showPhoneError 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : !customerData.customer_phone?.trim()
                  ? 'border-red-300 focus:ring-red-500'
                  : 'focus:ring-yellow-500 focus:border-transparent'
            }`}
            required
          />
          
          {/* Error Messages */}
          {!customerData.customer_phone?.trim() ? (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Nomor telepon wajib diisi
            </p>
          ) : showPhoneError ? (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Format nomor telepon tidak valid
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              Masukkan nomor telepon yang dapat dihubungi untuk konfirmasi reservasi
            </p>
          )}
          
          {/* Helper text untuk format yang benar */}
          {showPhoneError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700 font-medium mb-1">Format yang diterima:</p>
              <ul className="text-xs text-red-600 space-y-1">
                <li>• 08xxxxxxxxxx (dimulai dengan 08)</li>
                <li>• +62-8xxxxxxxxx (dengan kode negara)</li>
                <li>• 021-xxxxxxxx (nomor rumah Jakarta)</li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Email */}
        <div>
          <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-1">
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
            className={`w-full px-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors ${
              isEmailFromDatabase ? 'bg-gray-50' : ''
            } ${!customerData.customer_email?.trim() ? 'border-red-300 focus:ring-red-500' : ''}`}
            required
            readOnly={isEmailFromDatabase}
          />
          {!customerData.customer_email?.trim() && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Email wajib diisi
            </p>
          )}
          {isEmailFromDatabase && (
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Data diambil dari profil akun Anda
            </p>
          )}
        </div>

        {/* Info kontak */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-blue-800 font-medium">Informasi Kontak</p>
              <p className="text-xs text-blue-700 mt-1">
                Pastikan nomor telepon dan email yang Anda masukkan benar. 
                Kami akan menggunakan informasi ini untuk konfirmasi reservasi.
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