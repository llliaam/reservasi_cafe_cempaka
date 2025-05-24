import React, { useState, useEffect } from "react";
import { usePage, Link } from '@inertiajs/react';
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
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Reservation {
  packageId: number;
  numberOfPeople: number;
  totalPrice: number;
  [key: string]: any; // opsional, jika kamu menambahkan field lain
}

interface CustomerData {
  [key: string]: string;
}


// Import data (bisa diubah menjadi fetch API nantinya)
export const reservationPackages = [
  { 
    id: 1, 
    name: "Paket Romantis (2 Orang)", 
    price: 299000, 
    image: "romantic_package.jpg",
    description: "Makan malam romantis untuk dua orang dengan lilin dan dekorasi bunga",
    includes: ["2 Main Course", "2 Dessert", "2 Minuman", "Dekorasi Meja", "Foto Kenangan"],
    duration: "2 jam"
  },
  { 
    id: 2, 
    name: "Paket Keluarga (4 Orang)", 
    price: 499000, 
    image: "family_package.jpg",
    description: "Paket makan bersama keluarga dengan suasana yang hangat",
    includes: ["4 Main Course", "4 Dessert", "4 Minuman", "Free Kids Dessert"],
    duration: "3 jam"
  },
  { 
    id: 3, 
    name: "Paket Gathering (8 Orang)", 
    price: 899000, 
    image: "gathering_package.jpg",
    description: "Paket untuk acara kumpul bersama teman atau kolega",
    includes: ["8 Main Course", "8 Dessert", "8 Minuman", "1 Appetizer Platter", "1 Birthday Cake"],
    duration: "4 jam"
  }
];

// Data menu
export const menuItems = {
  food: [
    { id: 1, name: "Nasi Goreng Spesial", price: 45000, image: "nasgor.jpg", description: "Nasi goreng dengan telur, ayam, dan sayuran segar" },
    { id: 2, name: "Sate Ayam", price: 35000, image: "sate.jpg", description: "Sate ayam dengan bumbu kacang khas Indonesia" },
    { id: 3, name: "Ayam Bakar", price: 55000, image: "ayam_bakar.jpg", description: "Ayam bakar dengan bumbu rempah khas Cempaka" },
    { id: 4, name: "Mie Goreng", price: 40000, image: "mie_goreng.jpg", description: "Mie goreng dengan telur dan ayam cincang" },
    { id: 5, name: "Rendang Sapi", price: 65000, image: "rendang.jpg", description: "Rendang sapi autentik dengan rempah pilihan" },
    { id: 6, name: "Ikan Bakar", price: 60000, image: "ikan_bakar.jpg", description: "Ikan gurame bakar utuh dengan sambal dabu-dabu" }
  ],
  beverage: [
    { id: 7, name: "Es Teh Manis", price: 15000, image: "es_teh.jpg", description: "Teh manis dengan es batu" },
    { id: 8, name: "Jus Alpukat", price: 25000, image: "jus_alpukat.jpg", description: "Jus alpukat segar dengan susu kental manis" },
    { id: 9, name: "Lemon Tea", price: 20000, image: "lemon_tea.jpg", description: "Teh lemon segar dengan es batu" },
    { id: 10, name: "Kopi Hitam", price: 18000, image: "kopi.jpg", description: "Kopi hitam khas Cempaka dengan biji pilihan" },
    { id: 11, name: "Smoothies", price: 30000, image: "smoothies.jpg", description: "Smoothies buah-buahan segar pilihan" },
    { id: 12, name: "Air Mineral", price: 10000, image: "air_mineral.jpg", description: "Air mineral dalam kemasan" }
  ],
  dessert: [
    { id: 13, name: "Es Krim", price: 25000, image: "es_krim.jpg", description: "Es krim 3 rasa dengan topping" },
    { id: 14, name: "Pudding Coklat", price: 20000, image: "pudding.jpg", description: "Pudding coklat dengan saus vanilla" },
    { id: 15, name: "Pisang Goreng", price: 25000, image: "pisang_goreng.jpg", description: "Pisang goreng dengan saus karamel" }
  ]
};

const ReservationPage = () => {
  const { auth } = usePage<SharedData>().props;
  
  // State untuk data pelanggan
  const [customerData, setCustomerData] = useState({
    name: "John Doe", // Data default
    phone: "081234567890",
    email: "johndoe@example.com",
    specialRequests: "",
  });
  
  // State untuk reservasi
  const [reservation, setReservation] = useState({
    packageId: 1,
    date: "",
    time: "18:00",
    numberOfPeople: 2,
    tableLocation: "indoor",
    totalPrice: reservationPackages[0].price
  });
  
  // State untuk popup menu
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("food");
  
  // State untuk item menu yang dipilih
  const [selectedMenuItems, setSelectedMenuItems] = useState([]);
  
  // Mengatur tanggal default ke hari ini + 2 hari
  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 2); // Minimal reservasi 2 hari ke depan
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    
    setReservation(prev => ({
      ...prev,
      date: formattedDate
    }));
  }, []);
  
  // Handle perubahan input customer
 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setCustomerData({
    ...customerData,
    [name]: value,
  });
};
  
  // Handle perubahan paket
  const handlePackageChange = (packageId: number) => {
  const selectedPackage = reservationPackages.find(pkg => pkg.id === packageId);

  if (!selectedPackage) {
    console.error("Paket tidak ditemukan");
    return;
  }

  let numberOfPeople = 2;
  if (packageId === 2) numberOfPeople = 4;
  if (packageId === 3) numberOfPeople = 8;

  setReservation({
    ...reservation,
    packageId,
    numberOfPeople,
    totalPrice: selectedPackage.price + calculateMenuSubtotal(),
  });
};
  
  // Handle perubahan reservasi
  const handleReservationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setReservation({
    ...reservation,
    [name]: value,
  });
};
  
  // Toggle popup menu
  const toggleMenuPopup = () => {
    setShowMenuPopup(!showMenuPopup);
  };
  
  // Handle penambahan menu
  const handleAddMenuItem = (item: MenuItem) => {
  const existingItemIndex = selectedMenuItems.findIndex(menuItem => menuItem.id === item.id);

  if (existingItemIndex !== -1) {
    const updatedItems = [...selectedMenuItems];
    updatedItems[existingItemIndex].quantity += 1;
    setSelectedMenuItems(updatedItems);
  } else {
    setSelectedMenuItems([...selectedMenuItems, { ...item, quantity: 1 }]);
  }

  updateTotalPrice();
};
  
  // Handle pengurangan menu
  const handleRemoveMenuItem = (itemId: number) => {
  const existingItemIndex = selectedMenuItems.findIndex(menuItem => menuItem.id === itemId);

  if (existingItemIndex !== -1) {
    const updatedItems = [...selectedMenuItems];
    if (updatedItems[existingItemIndex].quantity > 1) {
      updatedItems[existingItemIndex].quantity -= 1;
      setSelectedMenuItems(updatedItems);
    } else {
      setSelectedMenuItems(updatedItems.filter(item => item.id !== itemId));
    }

    updateTotalPrice();
  }
};
  
  // Update total harga
  const updateTotalPrice = () => {
  const selectedPackage = reservationPackages.find(pkg => pkg.id === reservation.packageId);
  const packagePrice = selectedPackage?.price ?? 0;
  const menuTotal = calculateMenuSubtotal();

  setReservation({
    ...reservation,
    totalPrice: packagePrice + menuTotal,
  });
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
  }).format(price);
};
  
  // Handle submit form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  console.log("Reservation data:", {
    customer: customerData,
    reservation: reservation,
    menuItems: selectedMenuItems,
  });

  alert("Reservasi berhasil dibuat! Terima kasih telah memesan di Cempaka Cafe.");
};

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
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Form dan Paket - 2 kolom di desktop */}
            <div className="md:col-span-2 space-y-6">
              {/* Form Data Pelanggan */}
              <CustomerForm 
                customerData={customerData} 
                handleInputChange={handleInputChange} 
              />
              
              {/* Paket Reservasi */}
              <PackageSelector 
                packages={reservationPackages} 
                selectedPackageId={reservation.packageId} 
                onPackageSelect={handlePackageChange} 
                formatPrice={formatPrice}
              />
              
              {/* Detail Reservasi */}
              <ReservationDetails 
                reservation={reservation} 
                specialRequests={customerData.specialRequests}
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
            </div>
            
            {/* Ringkasan Pesanan - 1 kolom di desktop */}
            <div className="md:col-span-1">
              <OrderSummary 
                selectedPackage={reservationPackages.find(pkg => pkg.id === reservation.packageId)}
                reservation={reservation}
                menuItemsCount={selectedMenuItems.length}
                handleSubmit={handleSubmit}
                formatPrice={formatPrice}
              />
            </div>
          </div>
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