// components/CategoryFilter.jsx
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Category = {
  name: string;
  icon: React.ReactNode;
  count: number;
};

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory
}) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // 🛠️ Tipe untuk ref DOM element
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Kategori</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full transition-all duration-200 ${
              canScrollLeft 
                ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-full transition-all duration-200 ${
              canScrollRight 
                ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Category Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`flex-shrink-0 flex flex-col items-center p-4 rounded-2xl min-w-[120px] transition-all duration-200 transform hover:scale-105 ${
                selectedCategory === category.name
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 shadow-md hover:shadow-lg border border-gray-100'
              }`}
            >
              {/* Icon */}
              <div className={`text-3xl mb-2 p-3 rounded-full ${
                selectedCategory === category.name
                  ? 'bg-white/20 backdrop-blur-sm'
                  : 'bg-orange-50'
              }`}>
                {category.icon}
              </div>
              
              {/* Category Name */}
              <span className="font-semibold text-sm text-center leading-tight">
                {category.name}
              </span>
              
              {/* Item Count */}
              <span className={`text-xs mt-1 px-2 py-1 rounded-full ${
                selectedCategory === category.name
                  ? 'bg-white/20 text-white'
                  : 'bg-orange-100 text-orange-600'
              }`}>
                {category.count} items
              </span>
            </button>
          ))}
        </div>

        {/* Gradient Overlays */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-orange-50 to-transparent pointer-events-none z-10" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-orange-50 to-transparent pointer-events-none z-10" />
        )}
      </div>

      {/* Selected Category Info */}
      <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {categories.find(cat => cat.name === selectedCategory)?.icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                {selectedCategory}
              </h4>
              <p className="text-sm text-gray-600">
                {categories.find(cat => cat.name === selectedCategory)?.count} produk tersedia
              </p>
            </div>
          </div>
          
          {selectedCategory !== 'All Menu' && (
            <button
              onClick={() => setSelectedCategory('All Menu')}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Lihat Semua
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {['🔥 Populer', '💰 Hemat', '⭐ Rating Tinggi', '🚀 Terbaru'].map((tag) => (
          <button
            key={tag}
            className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors duration-200"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;