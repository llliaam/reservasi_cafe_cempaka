import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';


export default function ImageGallery() {
  const thumbnails = ["cafe3.webp", "cafe_1.jpg", "cafe2.webp", "cafe.webp"];
  const [mainImage, setMainImage] = useState(thumbnails[0]);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  // Handle navigasi galeri
  const handlePrevious = () => {
    const currentIndex = thumbnails.indexOf(mainImage);
    const prevIndex = currentIndex === 0 ? thumbnails.length - 1 : currentIndex - 1;
    setMainImage(thumbnails[prevIndex]);
  };

  const handleNext = () => {
    const currentIndex = thumbnails.indexOf(mainImage);
    const nextIndex = currentIndex === thumbnails.length - 1 ? 0 : currentIndex + 1;
    setMainImage(thumbnails[nextIndex]);
  };

  // Handle submit reservasi sederhana
 const handleReservation = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Ambil value dari form dengan casting agar tidak error
  const people = (document.getElementById('people') as HTMLInputElement)?.value;
  const date = (document.getElementById('date') as HTMLInputElement)?.value;
  const time = (document.getElementById('time') as HTMLInputElement)?.value;

  // Validasi sederhana
  if (!date) {
    setFormError("Pilih tanggal reservasi");
    return;
  }

  setFormError("");
  setIsSubmitting(true);

  // Simulasi pengiriman data
  setTimeout(() => {
    console.log('Reservation submitted:', { people, date, time });
    setIsSubmitting(false);

    // Langsung redirect ke halaman reservation
    window.location.href = '/reservation';
  }, 1000);
};


  return (
    <section id="dashboard"className="bg-green-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Galeri & Reservasi
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* Gambar Utama dengan Kontrol */}
          <div className="md:col-span-2 mb-6 md:mb-0">
            <div className="relative rounded-xl overflow-hidden shadow-md">
              {/* Main image */}
              <img
                src={`/images/${mainImage}`}
                alt="Cempaka Cafe"
                className="w-full h-64 sm:h-80 md:h-96 object-cover"
              />
              
              {/* Navigation buttons */}
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md opacity-80 hover:opacity-100 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                aria-label="Gambar sebelumnya"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md opacity-80 hover:opacity-100 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                aria-label="Gambar berikutnya"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-2 mt-3 justify-center flex-wrap">
              {thumbnails.map((img, idx) => (
                <button
                  key={idx}
                  className={`rounded-md overflow-hidden transition-all ${
                    mainImage === img 
                      ? "ring-2 ring-yellow-500" 
                      : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setMainImage(img)}
                  aria-label={`Tampilkan gambar ${idx + 1}`}
                >
                  <img
                    src={`/images/${img}`}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-16 h-14 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Form Reservasi Sederhana */}
          <div className="col-span-1">
            <form 
              onSubmit={handleReservation}
              className="bg-white text-gray-800 rounded-xl shadow-md p-5 space-y-4"
            >
              <h3 className="text-xl font-bold text-center">Reservasi Sekarang</h3>
              
              {formError && (
                <div className="p-2 bg-red-100 text-red-700 text-sm rounded-md" role="alert">
                  {formError}
                </div>
              )}

              {/* Jumlah Orang */}
              <div>
                <label htmlFor="people" className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah orang
                </label>
                <select 
                  id="people" 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="1">1 Orang</option>
                  <option value="2">2 Orang</option>
                  <option value="4">4 Orang</option>
                  <option value="6">6 Orang</option>
                  <option value="8+">8+ Orang</option>
                </select>
              </div>

              {/* Tanggal */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih tanggal
                </label>
                <input
                  type="date"
                  id="date"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Jam */}
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih jam
                </label>
                <select 
                  id="time" 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="12:00">12:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                  <option value="20:00">20:00</option>
                </select>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Proses...
                  </span>
                ) : (
                  "Reservasi"
                )}
              </button>
              
              {/* Info bantuan */}
              <p className="text-xs text-gray-500 text-center mt-3">
                Informasi lebih lanjut dan detail menu akan tersedia di halaman berikutnya
              </p>
            </form>
            
            {/* Info tambahan */}
            <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 text-gray-700 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Jam Buka</span>
              </div>
              <p className="text-sm text-gray-600 ml-7">
                Sen-Jum: 10:00 - 22:00<br />
                Sab-Min: 09:00 - 23:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}