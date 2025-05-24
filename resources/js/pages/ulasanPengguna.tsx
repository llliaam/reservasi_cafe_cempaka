import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
    Star, 
    Calendar,
    Edit,
    Trash2,
    Search,
    Filter,
    MessageCircle,
    ThumbsUp,
    Eye
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Ulasan Saya',
        href: '/ulasan',
    },
];

// Sample data ulasan
const myReviews = [
    {
        id: 1,
        orderId: 'ORD-2025-001',
        menuName: 'Nasi Goreng Special',
        rating: 5,
        comment: 'Sangat enak! Porsi besar dan bumbu meresap sempurna. Pelayanan juga ramah dan cepat.',
        date: '2025-05-24',
        helpful: 12,
        response: {
            text: 'Terima kasih atas ulasan positifnya! Kami senang Anda menyukai Nasi Goreng Special kami.',
            date: '2025-05-25',
            author: 'Cemapaka Cafe Team'
        }
    },
    {
        id: 2,
        orderId: 'ORD-2025-002',
        menuName: 'Mie Ayam Bakso',
        rating: 4,
        comment: 'Rasa mie ayamnya enak, baksonya juga kenyal. Cuma kuahnya agak asin menurut saya.',
        date: '2025-05-20',
        helpful: 8,
        response: null
    },
    {
        id: 3,
        orderId: 'ORD-2025-004',
        menuName: 'Gado-gado',
        rating: 5,
        comment: 'Gado-gado terenak yang pernah saya coba! Sayurannya segar dan bumbu kacangnya pas banget.',
        date: '2025-05-15',
        helpful: 15,
        response: {
            text: 'Wah, terima kasih banyak! Kami memang selalu menggunakan sayuran segar setiap hari.',
            date: '2025-05-16',
            author: 'Chef Cemapaka'
        }
    },
    {
        id: 4,
        orderId: 'ORD-2025-005',
        menuName: 'Es Campur',
        rating: 3,
        comment: 'Es campurnya biasa saja, tidak terlalu istimewa. Mungkin bisa ditambah variasi toppingnya.',
        date: '2025-05-12',
        helpful: 3,
        response: {
            text: 'Terima kasih atas sarannya! Kami akan pertimbangkan untuk menambah variasi topping es campur.',
            date: '2025-05-13',
            author: 'Cemapaka Cafe Team'
        }
    }
];

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
        <Star
            key={index}
            className={`w-4 h-4 ${
                index < rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
            }`}
        />
    ));
};

export default function UlasanSaya() {
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');

    const filteredReviews = myReviews.filter(review => {
        const matchesSearch = review.menuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            review.comment.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
        return matchesSearch && matchesRating;
    });

    const totalReviews = myReviews.length;
    const averageRating = myReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const totalHelpful = myReviews.reduce((sum, review) => sum + review.helpful, 0);
    const reviewsWithResponse = myReviews.filter(review => review.response).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ulasan Saya" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Total Ulasan */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Ulasan</p>
                                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                                    {totalReviews}
                                </p>
                                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                                    {reviewsWithResponse} mendapat respon
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Rating Rata-rata */}
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Rating Rata-rata</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                                        {averageRating.toFixed(1)}
                                    </p>
                                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                                </div>
                                <div className="flex gap-1 mt-1">
                                    {renderStars(Math.round(averageRating))}
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-white fill-current" />
                            </div>
                        </div>
                    </div>

                    {/* Total Helpful */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Helpful</p>
                                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                                    {totalHelpful}
                                </p>
                                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                                    Rata-rata {Math.round(totalHelpful / totalReviews)} per ulasan
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                <ThumbsUp className="w-6 h-6 text-white" />
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
                                    Ulasan Saya
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                    Semua ulasan yang pernah Anda berikan
                                </p>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan nama menu atau ulasan..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={ratingFilter}
                                    onChange={(e) => setRatingFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                >
                                    <option value="all">Semua Rating</option>
                                    <option value="5">5 Bintang</option>
                                    <option value="4">4 Bintang</option>
                                    <option value="3">3 Bintang</option>
                                    <option value="2">2 Bintang</option>
                                    <option value="1">1 Bintang</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="flex-1 overflow-auto">
                        {filteredReviews.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    {searchTerm || ratingFilter !== 'all' ? 'Tidak ada ulasan yang sesuai dengan filter' : 'Belum ada ulasan yang diberikan'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredReviews.map((review) => (
                                    <div key={review.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {review.menuName}
                                                    </h3>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        ({review.orderId})
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="flex gap-1">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {review.rating}/5
                                                    </span>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(review.date)}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 border border-purple-200 hover:border-purple-300 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {review.comment}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                    <ThumbsUp className="w-4 h-4" />
                                                    <span>{review.helpful} orang merasa terbantu</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Restaurant Response */}
                                        {review.response && (
                                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 ml-4 border-l-4 border-purple-500">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                                                        <MessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                            {review.response.author}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatDate(review.response.date)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed ml-10">
                                                    {review.response.text}
                                                </p>
                                            </div>
                                        )}
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