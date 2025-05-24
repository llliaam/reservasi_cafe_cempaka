import React from 'react';

interface ReservationDetailsProps {
  reservation: {
    date: string;
    time: string;
    tableLocation: string;
    type: string;
  };
  specialRequests: string;
  handleReservationChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ReservationDetails: React.FC<ReservationDetailsProps> = ({ 
  reservation, 
  specialRequests,
  handleReservationChange,
  handleInputChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Detail Reservasi</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Reservasi
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={reservation.date}
            onChange={handleReservationChange}
            min={reservation.date} // Minimal hari ini
            className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
            Jam Reservasi
          </label>
          <select
            id="time"
            name="time"
            value={reservation.time}
            onChange={handleReservationChange}
            className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="12:00">12:00</option>
            <option value="13:00">13:00</option>
            <option value="14:00">14:00</option>
            <option value="15:00">15:00</option>
            <option value="16:00">16:00</option>
            <option value="17:00">17:00</option>
            <option value="18:00">18:00</option>
            <option value="19:00">19:00</option>
            <option value="20:00">20:00</option>
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="tableLocation" className="block text-sm font-medium text-gray-700 mb-1">
          Lokasi Meja
        </label>
        <select
          id="tableLocation"
          name="tableLocation"
          value={reservation.tableLocation}
          onChange={handleReservationChange}
          className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        >
          <option value="indoor">Indoor</option>
          <option value="outdoor">Outdoor</option>
          <option value="private">Ruang Private</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="reserveCategory" className='block text-sm font-medium text-gray-700 mb-1x'>
          Jenis Reservasi
        </label>
        <select 
          name="type" 
          id="type"
          value={reservation.type}
          onChange={handleReservationChange}
          className='w-full px-4 py-2 text-gray-800 border border-gray-300 mb-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent'
          >
            <option value="private">Private</option>
            <option value="acara">Acara</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
          Permintaan Khusus
        </label>
        <textarea
          id="specialRequests"
          name="specialRequests"
          value={specialRequests}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          placeholder="Misalnya: dekorasi ulang tahun, alergi makanan, dll."
        ></textarea>
      </div>
    </div>
  );
};

export default ReservationDetails;