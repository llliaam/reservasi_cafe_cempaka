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

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Pilih Paket Reservasi</h2>
      
      <div className="grid sm:grid-cols-3 gap-4">
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
            <div className="h-32 bg-gray-200">
              <img 
                src={`/images/${pkg.image}`} 
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-800">{pkg.name}</h3>
              <p className="text-yellow-600 font-bold">{formatPrice(pkg.price)}</p>
              <p className="text-gray-500 text-xs mt-1">{pkg.includes.length} item termasuk</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Detail Paket yang Dipilih */}
      {selectedPackage && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-gray-800 mb-2">
            {selectedPackage.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {selectedPackage.description}
          </p>
          <h4 className="text-sm font-medium text-gray-700 mt-3 mb-1">Termasuk:</h4>
          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
            {selectedPackage.includes.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-600 mt-3">
            <span className="font-medium">Durasi:</span> {selectedPackage.duration}
          </p>
        </div>
      )}
    </div>
  );
};

export default PackageSelector;