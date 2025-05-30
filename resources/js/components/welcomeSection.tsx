import React, { useState, useEffect } from "react";

export default function ImageGallery() {
  const thumbnails = ["cafe3.webp", "cafe_1.jpg", "cafe2.webp", "cafe.webp"];
  const [mainImage, setMainImage] = useState(thumbnails[0]);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("18:00");
  const [availableTimes, setAvailableTimes] = useState([]);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get current hour
  const getCurrentHour = () => {
    return new Date().getHours();
  };

  // All available time slots
  const allTimeSlots = [
    { value: "10:00", label: "10:00" },
    { value: "11:00", label: "11:00" },
    { value: "12:00", label: "12:00" },
    { value: "13:00", label: "13:00" },
    { value: "14:00", label: "14:00" },
    { value: "15:00", label: "15:00" },
    { value: "16:00", label: "16:00" },
    { value: "17:00", label: "17:00" },
    { value: "18:00", label: "18:00" },
    { value: "19:00", label: "19:00" },
    { value: "20:00", label: "20:00" },
    { value: "21:00", label: "21:00" },
    { value: "22:00", label: "22:00" }
  ];

  // Update available times based on selected date
  useEffect(() => {
    const updateAvailableTimes = () => {
      const today = getTodayDate();
      const currentHour = getCurrentHour();

      if (selectedDate === today) {
        // If today, only show times after current hour
        const filteredTimes = allTimeSlots.filter(timeSlot => {
          const timeHour = parseInt(timeSlot.value.split(':')[0]);
          return timeHour > currentHour;
        });
        setAvailableTimes(filteredTimes);

        // If current selected time is not available, set to first available time
        const isCurrentTimeAvailable = filteredTimes.some(time => time.value === selectedTime);
        if (!isCurrentTimeAvailable && filteredTimes.length > 0) {
          setSelectedTime(filteredTimes[0].value);
        }
      } else {
        // If future date, show all time slots
        setAvailableTimes(allTimeSlots);
      }
    };

    if (selectedDate) {
      updateAvailableTimes();
    }
  }, [selectedDate, selectedTime]);

  // Set default date to today on component mount
  useEffect(() => {
    setSelectedDate(getTodayDate());
  }, []);

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

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
  };

  // Handle time change
  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  // Handle submit reservasi dengan pass data ke halaman reservasi
  const handleReservation = (e) => {
    e.preventDefault();

    // Validasi
    if (!selectedDate) {
      setFormError("Pilih tanggal reservasi");
      return;
    }

    if (!selectedTime) {
      setFormError("Pilih jam reservasi");
      return;
    }

    // Validasi tanggal tidak boleh sebelum hari ini
    const today = getTodayDate();
    if (selectedDate < today) {
      setFormError("Tanggal reservasi tidak boleh sebelum hari ini");
      return;
    }

    // Validasi jam jika hari ini
    if (selectedDate === today) {
      const currentHour = getCurrentHour();
      const selectedHour = parseInt(selectedTime.split(':')[0]);
      
      if (selectedHour <= currentHour) {
        setFormError("Jam reservasi sudah berlalu. Pilih jam yang lebih nanti.");
        return;
      }
    }

    setFormError("");
    setIsSubmitting(true);

    // Simulasi pengiriman data
    setTimeout(() => {
      console.log('Reservation data:', { 
        date: selectedDate, 
        time: selectedTime 
      });
      
      setIsSubmitting(false);

      // Redirect ke halaman reservation dengan query parameters
      const params = new URLSearchParams({
        date: selectedDate,
        time: selectedTime
      });
      
      window.location.href = `/reservation?${params.toString()}`;
    }, 1000);
  };

  return (
    <section id="dashboard" className="bg-green-50 py-12 px-4 sm:px-6">
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
                <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-md" role="alert">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {formError}
                  </div>
                </div>
              )}

              {/* Tanggal */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih tanggal *
                </label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={getTodayDate()}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimal reservasi untuk hari ini
                </p>
              </div>

              {/* Jam */}
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih jam *
                </label>
                <select 
                  id="time"
                  value={selectedTime}
                  onChange={handleTimeChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  required
                >
                  {availableTimes.length > 0 ? (
                    availableTimes.map((timeSlot) => (
                      <option key={timeSlot.value} value={timeSlot.value}>
                        {timeSlot.label}
                      </option>
                    ))
                  ) : (
                    <option value="">Tidak ada jam tersedia</option>
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedDate === getTodayDate() 
                    ? "Hanya jam setelah sekarang yang tersedia" 
                    : "Semua jam tersedia"}
                </p>
              </div>

              {/* Info Paket
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Info:</strong> Pilih paket dan jumlah orang di halaman berikutnya
                </p>
              </div> */}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting || availableTimes.length === 0}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  isSubmitting || availableTimes.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : availableTimes.length === 0 ? (
                  "Tidak Ada Jam Tersedia"
                ) : (
                  "Lanjut ke Reservasi"
                )}
              </button>
              
              {/* Info bantuan */}
              <p className="text-xs text-gray-500 text-center mt-3">
                Detail paket, menu, dan pembayaran akan tersedia di halaman berikutnya
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

            {/* Current Time Info */}
            <div className="mt-2 bg-green-100 p-3 rounded-lg">
              <p className="text-xs text-green-800 text-center">
                Waktu sekarang: {new Date().toLocaleString('id-ID', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}