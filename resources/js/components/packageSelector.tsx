import React from 'react';

interface Package {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  includes: string[];
  duration: string;
}

interface PackageSelectorProps {
  packages: Package[];
  selectedPackageId: number;
  onPackageSelect: (packageId: number) => void;
  formatPrice: (price: number) => string;
}

const PackageSelector: React.FC<PackageSelectorProps> = ({
  packages,
  selectedPackageId,
  onPackageSelect,
  formatPrice
}) => {
  const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId);

  // Function to get correct image path
  const getImagePath = (imageFilename: string) => {
    if (!imageFilename) {
      // Fallback ke gambar default lokal
      return "/images/paket_reservasi/default-package.jpg";
    }

    // Cek apakah sudah full URL (placeholder lama)
    if (imageFilename.startsWith('http')) {
      return imageFilename;
    }

    // Return path ke folder paket_reservasi
    return `/images/paket_reservasi/${imageFilename}`;
  };

  // Function untuk fallback gambar yang gagal load
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, packageName: string) => {
    const target = e.target as HTMLImageElement;

    // Coba fallback ke gambar default dulu
    if (!target.src.includes('default-package.jpg')) {
      target.src = '/images/paket_reservasi/default-package.jpg';
      return;
    }

    // Jika default-package.jpg juga gagal, buat simple colored div
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent && !parent.querySelector('.fallback-div')) {
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'flex items-center justify-center w-full h-full text-sm font-semibold text-white bg-orange-400 fallback-div';
      fallbackDiv.textContent = packageName.length > 20 ? packageName.substring(0, 17) + '...' : packageName;
      parent.appendChild(fallbackDiv);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl">
      <h2 className="mb-4 text-xl font-bold text-gray-800">Pilih Paket Reservasi</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
              selectedPackageId === pkg.id
                ? 'ring-2 ring-yellow-500 border-yellow-500'
                : 'border-gray-200'
            }`}
            onClick={() => onPackageSelect(pkg.id)}
          >
            <div className="relative h-32 bg-gray-200">
              <img
                src={getImagePath(pkg.image)}
                alt={pkg.name}
                className="object-cover w-full h-full"
                onError={(e) => handleImageError(e, pkg.name)}
              />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-800">{pkg.name}</h3>
              <p className="font-bold text-yellow-600">{formatPrice(pkg.price)}</p>
              <p className="mt-1 text-xs text-gray-500">{pkg.includes.length} item termasuk</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Paket yang Dipilih */}
      {selectedPackage && (
        <div className="p-4 mt-4 bg-orange-100 border border-orange-400 rounded-lg">
          <h3 className="mb-2 font-medium text-gray-800">
            {selectedPackage.name}
          </h3>
          <p className="mb-2 text-sm text-gray-600">
            {selectedPackage.description}
          </p>
          <h4 className="mt-3 mb-1 text-sm font-medium text-gray-700">Termasuk:</h4>
          <ul className="pl-5 space-y-1 text-sm text-gray-600 list-disc">
            {selectedPackage.includes.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-gray-600">
            <span className="font-medium">Durasi:</span> {selectedPackage.duration}
          </p>
        </div>
      )}
    </div>
  );
};

export default PackageSelector;
