import { useState } from 'react';

const MenuPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Sample product data - you can replace with your actual data
  const products = [
    { id: 1, name: "Café Latte", price: "$3.99", category: "Hot Coffee" },
    { id: 2, name: "Cappuccino", price: "$3.99", category: "Hot Coffee" },
    { id: 3, name: "Americano", price: "$2.99", category: "Hot Coffee" },
    { id: 4, name: "Espresso", price: "$2.99", category: "Hot Coffee" },
    { id: 5, name: "Mocha", price: "$4.99", category: "Hot Coffee" },
    { id: 6, name: "Iced Coffee", price: "$3.99", category: "Cold Coffee" },
    { id: 7, name: "Cheesecake", price: "$5.99", category: "Desserts" },
    { id: 8, name: "Croissant", price: "$2.99", category: "Breakfast" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Menu Page Header */}
      <div className="bg-gray-800 text-white p-2 text-center">
        <h2>Menu Page v2(item)</h2>
      </div>
      
      {/* Navigation */}
      <div className="bg-white shadow-md p-3 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/api/placeholder/50/50" alt="Cafe Logo" className="h-8" />
          <span className="text-green-600 font-script ml-2 text-xl">Cafe Cempaka</span>
        </div>
        <div className="flex space-x-2">
          <button className="bg-teal-800 text-white px-3 py-1 text-sm rounded">Home</button>
          <button className="bg-teal-800 text-white px-3 py-1 text-sm rounded">Menu</button>
          <button className="bg-teal-800 text-white px-3 py-1 text-sm rounded">About</button>
          <button className="bg-orange-400 text-white px-3 py-1 text-sm rounded">Cart</button>
        </div>
      </div>
      
      <div className="flex flex-1 relative">
        {/* Main Content */}
        <div className="flex-1 p-4 bg-yellow-50">
          {/* Search Bar */}
          <div className="bg-gray-200 p-3 mb-4 rounded">
            <input 
              type="text" 
              placeholder="Search Bar" 
              className="w-full p-2 rounded border-0"
            />
          </div>
          
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
                <div className="bg-gray-200 h-32 mb-2 flex items-center justify-center rounded">
                  <p className="text-gray-500">Gambar Produk</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-2 mt-auto">
                  <p className="font-medium">{product.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-gray-700">{product.price}</p>
                    <p className="text-gray-500">Rating</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* See More Button */}
          <div className="text-center pb-4">
            <button className="bg-gray-200 px-4 py-2 rounded">See more</button>
          </div>
          
          {/* Additional Content */}
          <div className="bg-gray-200 p-4 mb-4 rounded">
            <p className="text-center text-gray-700 font-medium">some shit i guess</p>
          </div>
        </div>
        
        {/* Detail Pemesanan Sidebar - Hidden on mobile unless toggled */}
        <div className={`bg-white shadow-lg absolute top-0 right-0 h-full w-64 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 z-20 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4 text-center">Detail Pemesanan</h3>
            <div className="space-y-2">
              <p className="text-gray-700">Nama</p>
              <p className="text-gray-700">Jumlah</p>
              <p className="text-gray-700">Nama pemesan</p>
              <p className="text-gray-700">Jenis pemesanan</p>
              <p className="text-gray-700">Tanggal</p>
              <p className="text-gray-700">Metode pembayaran</p>
              <p className="text-gray-700">Harga</p>
              <p className="text-gray-700">Pajak</p>
              <div className="border-t pt-2 mt-4">
                <p className="font-bold">Total Harga</p>
              </div>
              <div className="pt-4">
                <button className="w-full bg-green-600 text-white rounded py-2">Order</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Toggle Sidebar Button - Visible only on mobile/tablet */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed bottom-4 right-4 lg:hidden bg-green-600 text-white rounded-full p-3 shadow-lg z-30"
        >
          {isSidebarOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18v18H3V3z"></path>
            </svg>
          )}
        </button>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-200 p-4 text-center">
        <p>FOOTTER</p>
      </div>
    </div>
  );
};

export default MenuPage;