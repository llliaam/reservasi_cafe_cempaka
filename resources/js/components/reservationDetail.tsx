import React, { useEffect } from 'react';

const ReservationDetails = ({
  reservation,
  specialRequests,
  handleReservationChange,
  handleInputChange,
  initialDate,
  initialTime
}) => {
  // Get current hour untuk validasi
  const getCurrentHour = () => {
    return new Date().getHours();
  };

  // Get today's date
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate available time options based on selected date
  const getAvailableTimeOptions = () => {
    const allTimes = [
      "10:00", "11:00", "12:00", "13:00", "14:00",
      "15:00", "16:00", "17:00", "18:00", "19:00",
      "20:00", "21:00", "22:00"
    ];

    const today = getTodayDate();
    const currentHour = getCurrentHour();

    // PERBAIKAN: Gunakan reservation_date bukan reservation.date
    if (reservation.reservation_date === today) {
      // Jika hari ini, hanya tampilkan jam setelah jam sekarang
      return allTimes.filter(time => {
        const timeHour = parseInt(time.split(':')[0]);
        return timeHour > currentHour;
      });
    } else {
      // Jika bukan hari ini, tampilkan semua jam
      return allTimes;
    }
  };

  const availableTimes = getAvailableTimeOptions();

  return (
    <div className="p-6 bg-white shadow-md rounded-xl">
      <h2 className="mb-4 text-xl font-bold text-gray-800">Detail Reservasi</h2>

      <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
        <div>
          <label htmlFor="reservation_date" className="block mb-1 text-sm font-medium text-gray-700">
            Tanggal Reservasi
          </label>
          <input
            type="date"
            id="reservation_date"
            name="reservation_date"
            value={reservation.reservation_date || ''}
            onChange={handleReservationChange}
            min={getTodayDate()}
            className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Data dari form sebelumnya: {reservation.reservation_date || 'Belum dipilih'}
          </p>
        </div>

        <div>
          <label htmlFor="reservation_time" className="block mb-1 text-sm font-medium text-gray-700">
            Jam Reservasi
          </label>
          <select
            id="reservation_time"
            name="reservation_time"
            value={reservation.reservation_time || ''}
            onChange={handleReservationChange}
            className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          >
            {availableTimes.length > 0 ? (
              availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))
            ) : (
              <option value="">Tidak ada jam tersedia</option>
            )}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Data dari form sebelumnya: {reservation.reservation_time || 'Belum dipilih'}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="table_location" className="block mb-1 text-sm font-medium text-gray-700">
          Lokasi Meja
        </label>
        <select
          id="table_location"
          name="table_location"
          value={reservation.table_location || 'indoor'}
          onChange={handleReservationChange}
          className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        >
          <option value="indoor">Indoor</option>
          <option value="outdoor">Outdoor</option>
          <option value="private">Ruang Private</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="type" className="block mb-1 text-sm font-medium text-gray-700">
          Jenis Reservasi
        </label>
        <select
          name="type"
          id="type"
          value={reservation.type || 'private'}
          onChange={handleReservationChange}
          className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        >
          <option value="private">Private</option>
          <option value="acara">Acara</option>
        </select>
      </div>

      <div>
        <label htmlFor="special_requests" className="block mb-1 text-sm font-medium text-gray-700">
          Permintaan Khusus
        </label>
        <textarea
          id="special_requests"
          name="special_requests"
          value={specialRequests || ''}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          placeholder="Misalnya: dekorasi ulang tahun, alergi makanan, dll."
        />
      </div>
    </div>
  );
};

export default ReservationDetails;
