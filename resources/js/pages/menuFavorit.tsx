import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
    Heart, 
    Star, 
    ShoppingCart,
    Clock,
    Search,
    Filter,
    Plus,
    Minus,
    Eye
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Menu Favorit',
        href: '/menu-favorit',
    },
];

// Sample data menu favorit
const favoriteMenus = [
    {
        id: 1,
        name: 'Nasi Goreng Special',
        category: 'Makanan Utama',
        price: 45000,
        image: '/api/placeholder/300/200',
        rating: 4.8,
        totalOrders: 12,
        lastOrdered: '2025-05-24',
        description: 'Nasi goreng dengan telur, ayam, dan sayuran segar',
        isAvailable: true,
        cookingTime: '15-20 menit'
    },
    {
        id: 2,
        name: 'Es Teh Manis',
        category: 'Minuman',
        price: 8000,
        image: '/api/placeholder/300/200',
        rating: 4.5,
        totalOrders: 15,
        lastOrdered: '2025-05-22',
        description: 'Teh manis dingin segar',
        isAvailable: true,
        cookingTime: '5 menit'
    },
    {
        id: 3,
        name: 'Ayam Bakar',
        category: 'Makanan Utama',
        price: 35000,
        image: '/api/placeholder/300/200',
        rating: 4.7,
        totalOrders: 8,
        lastOrdered: '2025-05-20',
        description: 'Ayam bakar bumbu khas dengan nasi dan lalapan',
        isAvailable: false,
        cookingTime: '25-30 menit'
    },
    {
        id: 4,
        name: 'Sate Ayam',
        category: 'Makanan Utama',
        price: 30000,
        image: '/api/placeholder/300/200',
        rating: 4.6,
        totalOrders: 6,
        lastOrdered: '2025-05-18',
        description: 'Sate ayam dengan bumbu kacang dan lontong',
        isAvailable: true,
        cookingTime: '20-25 menit'
    }
];

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export default function MenuFavorit() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [quantities, setQuantities] = useState({});

    const filteredMenus = favoriteMenus.filter(menu => {
        const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || menu.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(favoriteMenus.map(menu => menu.category))];
    const totalFavorites = favoriteMenus.length;
    const totalOrders = favoriteMenus.reduce((sum, menu) => sum + menu.totalOrders, 0);
    const avgRating = favoriteMenus.reduce((sum, menu) => sum + menu.rating, 0) / favoriteMenus.length;

    const updateQuantity = (menuId, change) => {
        setQuantities(prev => ({
            ...prev,
            [menuId]: Math.max(0, (prev[menuId] || 0) + change)
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Favorit" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Total Favorit */}
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-xl border border-pink-200/50 dark:border-pink-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-pink-600 dark:text-pink-400">Menu Favorit</p>
                                <p className="text-3xl font-bold text-pink-900 dark:text-pink-100 mt-1">
                                    {totalFavorites}
                                </p>
                                <p className="text-xs text-pink-600/70 dark:text-pink-400/70 mt-1">
                                    {favoriteMenus.filter(m => m.isAvailable).length} tersedia
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
                                <Heart className="w-6 h-6 text-white fill-current" />
                            </div>
                        </div>
                    </div>

                    {/* Total Pesanan */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Pesanan</p>
                                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                                    {totalOrders}
                                </p>
                                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                                    Dari menu favorit
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Rating Rata-rata */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Rating Rata-rata</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                                        {avgRating.toFixed(1)}
                                    </p>
                                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                                </div>
                                <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                                    Menu favorit
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-white fill-current" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex-1 flex flex-col min-h-[70vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Menu Favorit Saya
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                    Menu yang paling sering Anda pesan
                                </p>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Cari menu favorit..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                >
                                    <option value="all">Semua Kategori</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Menu Grid */}
                    <div className="flex-1 overflow-auto p-6">
                        {filteredMenus.length === 0 ? (
                            <div className="text-center py-12">
                                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    {searchTerm || categoryFilter !== 'all' ? 'Tidak ada menu yang sesuai dengan filter' : 'Belum ada menu favorit'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredMenus.map((menu) => (
                                    <div key={menu.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-lg transition-shadow">
                                        {/* Menu Image */}
                                        <div className="relative">
                                            <img 
                                                src={menu.image} 
                                                alt={menu.name}
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <div className="bg-pink-500 text-white rounded-full p-2">
                                                    <Heart className="w-4 h-4 fill-current" />
                                                </div>
                                            </div>
                                            {!menu.isAvailable && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                        Tidak Tersedia
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Menu Info */}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                        {menu.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {menu.category}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {menu.rating}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                {menu.description}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {menu.cookingTime}
                                                </div>
                                                <div>
                                                    Dipesan {menu.totalOrders}x
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {formatCurrency(menu.price)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Terakhir: {formatDate(menu.lastOrdered)}
                                                    </p>
                                                </div>

                                                {menu.isAvailable ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                                            <button
                                                                onClick={() => updateQuantity(menu.id, -1)}
                                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-l-lg"
                                                                disabled={!quantities[menu.id]}
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="px-3 py-1 text-sm">
                                                                {quantities[menu.id] || 0}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(menu.id, 1)}
                                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-lg"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        {quantities[menu.id] > 0 && (
                                                            <button className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                                                <ShoppingCart className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button 
                                                        disabled
                                                        className="bg-gray-300 text-gray-500 px-3 py-1.5 rounded-lg text-sm font-medium cursor-not-allowed"
                                                    >
                                                        Tidak Tersedia
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}