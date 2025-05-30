import React, { useState, useEffect, useRef } from "react";
import { usePage, Link, useForm } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Head } from '@inertiajs/react';

// Import komponen
import CustomerForm from '@/components/customerForm';
import PackageSelector from '@/components/packageSelector';
import ReservationDetails from '@/components/reservationDetail';
import MenuSelector from '@/components/menuSelector';
import MenuPopup from '@/components/menuPopup';
import OrderSummary from '@/components/orderSummary'; 

interface Package {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  includes: string[];
  duration: string;
  maxPeople: number;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// PERBAIKAN: Interface untuk data dari controller dengan fallback
interface PageProps extends SharedData {
  packages: Package[];
  menuItems: {[key: string]: MenuItem[]};
  defaultData?: {
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    special_requests?: string;
    package_id?: number;
    reservation_date?: string;
    reservation_time?: string;
    number_of_people?: number;
    table_location?: string;
    package_price?: number;
    menu_subtotal?: number;
    total_price?: number;
    payment_method?: string;
  };
  userProfile?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  queryParams?: {
    date?: string;
    time?: string;
  };
}

// Image Upload Component tetap sama...
const ImageUploadSection = ({ onProofOfPaymentChange, onAdditionalImagesChange, selectedPaymentMethod }) => {
  // ... kode component ImageUploadSection tetap sama seperti sebelumnya ...
  const [proofOfPayment, setProofOfPayment] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [proofPreview, setProofPreview] = useState(null);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [errors, setErrors] = useState([]);
  
  const proofInputRef = useRef(null);
  const additionalInputRef = useRef(null);

  // Check if proof of payment is required based on payment method
  const isProofRequired = selectedPaymentMethod !== 'pay-later';

  const validateFile = (file) => {
    const maxSize = 2048 * 1024; // 2MB in bytes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'File harus berupa gambar (JPG, PNG, GIF)';
    }
    
    if (file.size > maxSize) {
      return 'Ukuran file maksimal 2MB';
    }
    
    return null;
  };

  const handleProofOfPaymentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setErrors([error]);
      return;
    }

    setErrors([]);
    setProofOfPayment(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setProofPreview(e.target.result);
    reader.readAsDataURL(file);
    
    if (onProofOfPaymentChange) {
      onProofOfPaymentChange(file);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const newErrors = [];
    
    if (files.length > 5) {
      newErrors.push('Maksimal 5 gambar tambahan');
      return;
    }

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    setAdditionalImages(validFiles);
    
    // Create previews
    const previews = [];
    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push({
          id: index,
          name: file.name,
          url: e.target.result
        });
        
        if (previews.length === validFiles.length) {
          setAdditionalPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (onAdditionalImagesChange) {
      onAdditionalImagesChange(validFiles);
    }
  };

  const removeProofOfPayment = () => {
    setProofOfPayment(null);
    setProofPreview(null);
    if (proofInputRef.current) {
      proofInputRef.current.value = '';
    }
    if (onProofOfPaymentChange) {
      onProofOfPaymentChange(null);
    }
  };

  const removeAdditionalImage = (index) => {
    const newFiles = additionalImages.filter((_, i) => i !== index);
    const newPreviews = additionalPreviews.filter((_, i) => i !== index);
    
    setAdditionalImages(newFiles);
    setAdditionalPreviews(newPreviews);
    
    if (onAdditionalImagesChange) {
      onAdditionalImagesChange(newFiles);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Upload Gambar</h3>
      
      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-red-800 text-sm">
            <p className="font-semibold mb-1">Error:</p>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Proof of Payment */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-gray-700">
            Bukti Pembayaran {isProofRequired && <span className="text-red-500">*</span>}
          </h4>
          {isProofRequired && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Wajib
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          {isProofRequired 
            ? "Upload bukti transfer atau pembayaran reservasi Anda" 
            : "Opsional - Upload bukti pembayaran jika sudah melakukan transfer"}
        </p>
        
        {!proofPreview ? (
          <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${
            isProofRequired ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300'
          }`}>
            <input
              ref={proofInputRef}
              type="file"
              name="proof_of_payment"
              accept="image/*"
              onChange={handleProofOfPaymentChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => proofInputRef.current?.click()}
              className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto ${
                isProofRequired ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Pilih Bukti Pembayaran</span>
            </button>
            <p className="text-sm text-gray-500 mt-2">JPG, PNG, GIF - Maksimal 2MB</p>
          </div>
        ) : (
          <div className="relative">
            <img
              src={proofPreview}
              alt="Bukti Pembayaran"
              className="w-full max-w-xs mx-auto rounded-lg shadow-sm"
            />
            <button
              type="button"
              onClick={removeProofOfPayment}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <p className="text-sm text-gray-600 text-center mt-2">{proofOfPayment?.name}</p>
          </div>
        )}
      </div>

      {/* Additional Images */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">Gambar Tambahan (Opsional)</h4>
        <p className="text-sm text-gray-600 mb-3">
          Upload gambar permintaan dekorasi khusus atau referensi lainnya (maksimal 5 gambar)
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors mb-4">
          <input
            ref={additionalInputRef}
            type="file"
            name="additional_images"
            accept="image/*"
            multiple
            onChange={handleAdditionalImagesChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => additionalInputRef.current?.click()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Pilih Gambar Tambahan</span>
          </button>
          <p className="text-sm text-gray-500 mt-2">JPG, PNG, GIF - Maksimal 2MB per file</p>
        </div>

        {/* Additional Images Preview */}
        {additionalPreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {additionalPreviews.map((preview) => (
              <div key={preview.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => removeAdditionalImage(preview.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <p className="text-xs text-gray-600 mt-1 truncate" title={preview.name}>
                  {preview.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReservationPage = () => {
  // PERBAIKAN: Gunakan destructuring dengan fallback
  const pageProps = usePage<PageProps>().props;
  const { 
    auth, 
    packages = [], 
    menuItems = {}, 
    defaultData = {}, 
    userProfile = {}, 
    queryParams = {}, 
    flash = {}, 
    errors = {} 
  } = pageProps;
  
  // PERBAIKAN: Siapkan default values dengan fallback yang aman
  const safeDefaults = {
    customer_name: defaultData?.customer_name || userProfile?.name || '',
    customer_phone: defaultData?.customer_phone || userProfile?.phone || '',
    customer_email: defaultData?.customer_email || userProfile?.email || '',
    special_requests: defaultData?.special_requests || '',
    package_id: defaultData?.package_id || (packages.length > 0 ? packages[0].id : 1),
    reservation_date: defaultData?.reservation_date || new Date(Date.now() + 86400000).toISOString().split('T')[0], // besok
    reservation_time: defaultData?.reservation_time || '19:00',
    number_of_people: defaultData?.number_of_people || 2,
    table_location: defaultData?.table_location || 'indoor',
    package_price: defaultData?.package_price || (packages.length > 0 ? packages[0].price : 0),
    menu_subtotal: defaultData?.menu_subtotal || 0,
    total_price: defaultData?.total_price || (packages.length > 0 ? packages[0].price : 0),
    payment_method: defaultData?.payment_method || 'transfer',
    menu_items: [],
    proof_of_payment: null,
    additional_images: []
  };
  
  // PERBAIKAN: Form handling dengan data yang aman
  const { data, setData, post, processing } = useForm(safeDefaults);
  
  // State untuk popup menu
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("food");
  
  // State untuk item menu yang dipilih
  const [selectedMenuItems, setSelectedMenuItems] = useState([]);
  
  // State untuk gambar
  const [proofOfPaymentFile, setProofOfPaymentFile] = useState(null);
  const [additionalImagesFiles, setAdditionalImagesFiles] = useState([]);

  // PERBAIKAN: useEffect untuk mengatur data query parameters
  useEffect(() => {
    if (queryParams?.date || queryParams?.time) {
      setData(prev => ({
        ...prev,
        reservation_date: queryParams.date || prev.reservation_date,
        reservation_time: queryParams.time || prev.reservation_time
      }));
    }
  }, [queryParams]);

  // Handle perubahan input customer
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(name as keyof typeof data, value);
  };
  
  // Handle perubahan paket
  const handlePackageChange = (packageId: number) => {
    const selectedPackage = packages.find(pkg => pkg.id === packageId);

    if (!selectedPackage) {
      console.error("Paket tidak ditemukan");
      return;
    }

    // Tentukan jumlah orang berdasarkan package name
    let numberOfPeople = 2;
    if (selectedPackage.name.includes('4 Orang')) numberOfPeople = 4;
    if (selectedPackage.name.includes('8 Orang')) numberOfPeople = 8;

    setData(prev => ({
      ...prev,
      package_id: packageId,
      number_of_people: numberOfPeople,
      package_price: selectedPackage.price,
      total_price: selectedPackage.price + calculateMenuSubtotal()
    }));
  };
  
  // Handle perubahan reservasi
  const handleReservationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(name as keyof typeof data, value);
  };
  
  // Toggle popup menu
  const toggleMenuPopup = () => {
    setShowMenuPopup(!showMenuPopup);
  };
  
  // Handle penambahan menu
const handleAddMenuItem = (item: MenuItem) => {
  const existingItemIndex = selectedMenuItems.findIndex(menuItem => menuItem.id === item.id);

  let updatedItems;
  if (existingItemIndex !== -1) {
    updatedItems = [...selectedMenuItems];
    updatedItems[existingItemIndex].quantity += 1;
  } else {
    updatedItems = [...selectedMenuItems, { ...item, quantity: 1 }];
  }
  
  setSelectedMenuItems(updatedItems);
  
  // Kalkulasi langsung dengan updatedItems
  const selectedPackage = packages.find(pkg => pkg.id === data.package_id);
  const packagePrice = selectedPackage?.price || 0;
  const menuTotal = updatedItems.reduce((total, menuItem) => 
    total + (menuItem.price * (menuItem.quantity || 1)), 0
  );
  
  // Update langsung
  setData(prev => ({
    ...prev,
    menu_subtotal: menuTotal,
    total_price: Number(packagePrice) + Number(menuTotal)
  }));
    // TAMBAH DEBUG INI TEPAT SETELAH setData:
    console.log('=== MENU ADDED DEBUG ===');
    console.log('Package ID:', data.package_id);
    console.log('Package Price:', packagePrice);
    console.log('Menu Total:', menuTotal);
    console.log('Should be Total:', packagePrice + menuTotal);
    console.log('Current data.total_price:', data.total_price);
};

  
  // Handle pengurangan menu
const handleRemoveMenuItem = (itemId: number) => {
  const existingItemIndex = selectedMenuItems.findIndex(menuItem => menuItem.id === itemId);

  if (existingItemIndex !== -1) {
    let updatedItems = [...selectedMenuItems];
    if (updatedItems[existingItemIndex].quantity > 1) {
      updatedItems[existingItemIndex].quantity -= 1;
    } else {
      updatedItems = updatedItems.filter(item => item.id !== itemId);
    }
    
    setSelectedMenuItems(updatedItems);
    
    // Kalkulasi langsung dengan updatedItems
    const selectedPackage = packages.find(pkg => pkg.id === data.package_id);
    const packagePrice = Number(selectedPackage?.price) || 0;
    const menuTotal = updatedItems.reduce((total, menuItem) => 
      total + (menuItem.price * (menuItem.quantity || 1)), 0
    );
    
    // Update langsung
    setData(prev => ({
      ...prev,
      menu_subtotal: menuTotal,
      total_price: Number(packagePrice) + Number(menuTotal)
    }));

    console.log('=== MENU REMOVED DEBUG ===');
    console.log('Package Price:', packagePrice);
    console.log('Menu Total:', menuTotal);
    console.log('Should be Total:', packagePrice + menuTotal);
    console.log('==========================');
  }
};
  
  // Hitung subtotal menu
  const calculateMenuSubtotal = (): number => {
    return selectedMenuItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };
  
  // Format harga ke Rupiah
 const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,  // ← TAMBAH INI
  }).format(Math.round(price));  // ← TAMBAH Math.round
};

  // Handle image uploads
  const handleProofOfPaymentChange = (file) => {
    setProofOfPaymentFile(file);
    setData('proof_of_payment', file);
  };

  const handleAdditionalImagesChange = (files) => {
    setAdditionalImagesFiles(files);
    setData('additional_images', files);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setData('payment_method', method);
  };
  
  // Handle submit form using Inertia.js
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, paymentData?: any) => {
  e.preventDefault();
  
  if (!auth?.user) {
    alert("Anda harus login terlebih dahulu untuk membuat reservasi.");
    return Promise.reject('Not authenticated');
  }

  console.log('🚀 Starting reservation submission...');

  // Update menu items in form data
  const formDataToSubmit = {
    ...data,
    menu_items: JSON.stringify(selectedMenuItems),
    menu_subtotal: calculateMenuSubtotal(),
    payment_method: paymentData?.payment_method || data.payment_method
  };

  // Return promise untuk OrderSummary modal
  return new Promise((resolve, reject) => {
    post('/reservations', {
      data: formDataToSubmit,
      forceFormData: true,
      onSuccess: (page) => {
        console.log('✅ SUCCESS! Page props:', page.props);
        
        // Coba extract reservation code dari berbagai lokasi
        const reservationCode = 
          page.props?.reservation?.reservation_code ||
          page.props?.flash?.reservation_code ||
          page.props?.reservation_code ||
          `RSV-${Date.now()}`;

        console.log('🎯 Reservation code found:', reservationCode);

        // PASTI resolve dengan data
        resolve({
          reservation_code: reservationCode,
          success: true
        });
      },
      onError: (errors) => {
        console.error('❌ Error:', errors);
        
        // BAHKAN jika error, tetap coba resolve (karena data mungkin tersimpan)
        if (Object.keys(errors).length === 0) {
          console.log('🔄 Empty error, assuming success');
          resolve({
            reservation_code: `RSV-${Date.now()}`,
            success: true
          });
        } else {
          reject(errors);
        }
      }
    });
  });
};

  // Loading state
  if (packages.length === 0) {
    return (
      <>
        <Head title="Reservasi" />
        <div className="bg-green-50 min-h-screen py-10 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Packages Available</h2>
                  <p className="text-yellow-600">Tidak ada paket reservasi yang tersedia saat ini.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head title="Reservasi" />

      <div className="bg-green-50 min-h-screen py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Kembali ke Beranda
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Detail Reservasi</h1>
          <p className="text-gray-600 mb-8 text-center">Lengkapi informasi reservasi Anda di Cempaka Cafe</p>
          
          {/* User Info Display */}
          {userProfile?.name && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-blue-800 font-medium">
                  Reservasi atas nama: {userProfile.name} ({userProfile.email})
                </span>
              </div>
            </div>
          )}

          {/* Flash Messages */}
          {flash?.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="text-green-800">{flash.success}</div>
            </div>
          )}

          {flash?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-800">{flash.error}</div>
            </div>
          )}

          {/* Validation Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-800">
                <p className="font-semibold">Error:</p>
                <ul className="list-disc list-inside mt-1">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Form dan Paket - 2 kolom di desktop */}
              <div className="md:col-span-2 space-y-6">
                {/* Form Data Pelanggan */}
                <CustomerForm 
                  customerData={data} 
                  handleInputChange={handleInputChange}
                  isLoggedIn={!!auth?.user}
                  userProfile={userProfile}
                />
                
                {/* Paket Reservasi */}
                <PackageSelector 
                  packages={packages}
                  selectedPackageId={data.package_id} 
                  onPackageSelect={handlePackageChange} 
                  formatPrice={formatPrice}
                />
                
                {/* Detail Reservasi */}
                <ReservationDetails 
                  reservation={data} 
                  specialRequests={data.special_requests}
                  handleReservationChange={handleReservationChange} 
                  handleInputChange={handleInputChange} 
                />
                
                {/* Menu Tambahan */}
                <MenuSelector 
                  selectedMenuItems={selectedMenuItems} 
                  handleAddMenuItem={handleAddMenuItem} 
                  handleRemoveMenuItem={handleRemoveMenuItem}
                  toggleMenuPopup={toggleMenuPopup}
                  calculateMenuSubtotal={calculateMenuSubtotal}
                  formatPrice={formatPrice}
                />

                {/* Image Upload Section */}
                <ImageUploadSection
                  onProofOfPaymentChange={handleProofOfPaymentChange}
                  onAdditionalImagesChange={handleAdditionalImagesChange}
                  selectedPaymentMethod={data.payment_method}
                />
              </div>
              
              {/* Ringkasan Pesanan - 1 kolom di desktop */}
              <div className="md:col-span-1">
                <OrderSummary 
                  selectedPackage={packages.find(pkg => pkg.id === data.package_id)}
                  reservation={{
                    // Mapping data structure untuk OrderSummary
                    date: data.reservation_date,
                    time: data.reservation_time,
                    tableLocation: data.table_location,
                    numberOfPeople: data.number_of_people,
                    totalPrice: data.total_price
                  }}
                  selectedMenuItems={selectedMenuItems}  // ← UBAH INI
                  menuSubtotal={calculateMenuSubtotal()} // ← TAMBAH INI
                  formatPrice={formatPrice}
                  isSubmitting={processing}
                  hasProofOfPayment={!!proofOfPaymentFile}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  handleSubmit={handleSubmit}
                />
              </div>
            </div>
          </form>
        </div>
        
        {/* Popup Menu */}
        <MenuPopup 
          showPopup={showMenuPopup}
          closePopup={toggleMenuPopup}
          menuItems={menuItems}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          handleAddMenuItem={handleAddMenuItem}
          selectedMenuItems={selectedMenuItems}
          calculateMenuSubtotal={calculateMenuSubtotal}
          formatPrice={formatPrice}
        />
      </div>
    </>
  );
};

export default ReservationPage;