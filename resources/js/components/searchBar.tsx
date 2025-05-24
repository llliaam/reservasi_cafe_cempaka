// components/SearchBar.jsx
import { Search, Grid, List, Filter, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm, viewMode, setViewMode }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('popular');

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rating' },
    { value: 'newest', label: 'Newest' }
  ];

  return (
    <div className="mb-8">
      {/* Main Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari makanan atau minuman favorit kamu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-orange-400 focus:ring-0 transition-colors duration-200 text-gray-700 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'list' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List size={18} />
            </button>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              isFilterOpen 
                ? 'bg-orange-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <SlidersHorizontal size={18} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Urutkan Berdasarkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-orange-400 focus:ring-0 transition-colors duration-200"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Rentang Harga
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
                  <span className="text-sm text-gray-600">Di bawah Rp 20.000</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
                  <span className="text-sm text-gray-600">Rp 20.000 - Rp 40.000</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
                  <span className="text-sm text-gray-600">Di atas Rp 40.000</span>
                </label>
              </div>
            </div>

            {/* Special Offers */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Penawaran Khusus
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
                  <span className="text-sm text-gray-600">🔥 Populer</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
                  <span className="text-sm text-gray-600">💰 Diskon</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
                  <span className="text-sm text-gray-600">⭐ Rating Tinggi</span>
                </label>
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-100">
            <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200">
              Reset Filter
            </button>
            <button className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
              Terapkan Filter
            </button>
          </div>
        </div>
      )}

      {/* Search Results Info */}
      {searchTerm && (
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>Menampilkan hasil untuk "{searchTerm}"</span>
          <button 
            onClick={() => setSearchTerm('')}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Hapus pencarian
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;