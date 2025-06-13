import { Head, router, Link } from '@inertiajs/react';
import {
    Star,
    Calendar,
    Edit,
    Trash2,
    Search,
    Filter,
    MessageCircle,
    ThumbsUp,
    Eye,
    ChevronLeft,
    ChevronRight,
    Plus,
    Award,
    CheckCircle
} from 'lucide-react';
import { useState } from 'react';

// Types untuk data dari ReviewController->index()
interface Review {
    id: number;
    orderId: string;
    menuName: string;
    menuItems: string[];
    rating: number;
    comment: string | null;
    date: string;
    helpful: number;
    response: {
        text: string;
        date: string;
        author: string;
    } | null;
    canEdit: boolean;
    orderDate: string;
    totalAmount: number;
    isVerified: boolean;
    isFeatured: boolean;
}

interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    totalHelpful: number;
    reviewsWithResponse: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}

interface PaginatedReviews {
    data: Review[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    reviews: PaginatedReviews;
    stats: ReviewStats;
    filters: {
        rating: string;
        search: string;
    };
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

const renderStars = (rating: number) => {
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

export default function UlasanSaya({ reviews, stats, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [ratingFilter, setRatingFilter] = useState(filters.rating);

    // Handle search & filter dengan Inertia router
    const handleFilterSubmit = () => {
        router.get(route('reviews.index'), {
            search: searchTerm || undefined,
            rating: ratingFilter !== 'all' ? ratingFilter : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleRatingFilterChange = (rating: string) => {
        setRatingFilter(rating);
        router.get(route('reviews.index'), {
            search: searchTerm || undefined,
            rating: rating !== 'all' ? rating : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (url: string) => {
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleEditReview = (reviewId: number) => {
        router.get(route('reviews.edit', reviewId));
    };

    const handleDeleteReview = (reviewId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) {
            router.delete(route('reviews.destroy', reviewId), {
                preserveScroll: true,
                onSuccess: () => {
                    // Flash message akan ditampilkan otomatis dari controller
                }
            });
        }
    };

    const handleMarkHelpful = (reviewId: number) => {
        router.post(route('reviews.mark-helpful', reviewId), {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // Flash message akan ditampilkan otomatis dari controller
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Head title="Ulasan Saya" />

            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8">
    <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ulasan Saya
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
            Kelola dan lihat semua ulasan yang pernah Anda berikan
        </p>
    </div>
    <div className="flex items-center gap-4"> {/* Tambahkan div ini untuk menampung tombol */}
        <Link
            href={route('home')} // Ganti 'home' dengan nama route yang sesuai untuk beranda Anda
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg shadow-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Beranda
        </Link>
        <Link
            href={route('reviews.create')}
            className="inline-flex items-center gap-2 px-6 py-3 text-white transition-colors bg-purple-600 rounded-lg shadow-lg hover:bg-purple-700"
        >
            <Plus className="w-5 h-5" />
            Buat Ulasan
        </Link>
    </div>
</div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Ulasan */}
                    <div className="p-6 border shadow-sm bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl border-purple-200/50 dark:border-purple-800/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Ulasan</p>
                                <p className="mt-1 text-3xl font-bold text-purple-900 dark:text-purple-100">
                                    {stats.totalReviews}
                                </p>
                                <p className="mt-1 text-xs text-purple-600/70 dark:text-purple-400/70">
                                    {stats.reviewsWithResponse} mendapat respon
                                </p>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-xl">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Rating Rata-rata */}
                    <div className="p-6 border shadow-sm bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl border-amber-200/50 dark:border-amber-800/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Rating Rata-rata</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                                        {stats.averageRating.toFixed(1)}
                                    </p>
                                    <Star className="w-5 h-5 fill-current text-amber-500" />
                                </div>
                                <div className="flex gap-1 mt-1">
                                    {renderStars(Math.round(stats.averageRating))}
                                </div>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-amber-500 rounded-xl">
                                <Star className="w-6 h-6 text-white fill-current" />
                            </div>
                        </div>
                    </div>

                    {/* Total Helpful */}
                    <div className="p-6 border shadow-sm bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-green-200/50 dark:border-green-800/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Helpful</p>
                                <p className="mt-1 text-3xl font-bold text-green-900 dark:text-green-100">
                                    {stats.totalHelpful}
                                </p>
                                <p className="mt-1 text-xs text-green-600/70 dark:text-green-400/70">
                                    {stats.totalReviews > 0 ? `Rata-rata ${Math.round(stats.totalHelpful / stats.totalReviews)} per ulasan` : 'Belum ada ulasan'}
                                </p>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-xl">
                                <ThumbsUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Achievement */}
                    <div className="p-6 border shadow-sm bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border-blue-200/50 dark:border-blue-800/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Achievement</p>
                                <p className="mt-1 text-lg font-bold text-blue-900 dark:text-blue-100">
                                    {stats.totalReviews >= 10 ? 'Expert Reviewer' :
                                     stats.totalReviews >= 5 ? 'Active Reviewer' :
                                     stats.totalReviews >= 1 ? 'New Reviewer' : 'No Reviews'}
                                </p>
                                <p className="mt-1 text-xs text-blue-600/70 dark:text-blue-400/70">
                                    {stats.totalReviews < 10 && `${10 - stats.totalReviews} lagi untuk level berikutnya`}
                                </p>
                            </div>
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rating Distribution */}
                {stats.totalReviews > 0 && (
                    <div className="p-6 mb-8 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 rounded-xl">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Distribusi Rating
                        </h3>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <div key={rating} className="flex items-center gap-3">
                                    <div className="flex items-center w-16 gap-1">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{rating}</span>
                                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    </div>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                                        <div
                                            className="h-2 transition-all duration-300 bg-yellow-400 rounded-full"
                                            style={{
                                                width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews * 100) : 0}%`
                                            }}
                                        />
                                    </div>
                                    <span className="w-8 text-sm text-gray-600 dark:text-gray-400">
                                        {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 rounded-xl">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Daftar Ulasan
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Menampilkan {reviews.total} ulasan
                                </p>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col gap-3 mt-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan nama menu atau ulasan..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilterSubmit()}
                                    className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={ratingFilter}
                                    onChange={(e) => handleRatingFilterChange(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="all">Semua Rating</option>
                                    <option value="5">5 Bintang</option>
                                    <option value="4">4 Bintang</option>
                                    <option value="3">3 Bintang</option>
                                    <option value="2">2 Bintang</option>
                                    <option value="1">1 Bintang</option>
                                </select>
                            </div>
                            <button
                                onClick={handleFilterSubmit}
                                className="px-4 py-2 text-sm text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
                            >
                                Cari
                            </button>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="min-h-[60vh]">
                        {reviews.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="mb-4 text-gray-500 dark:text-gray-400">
                                    {searchTerm || ratingFilter !== 'all' ? 'Tidak ada ulasan yang sesuai dengan filter' : 'Belum ada ulasan yang diberikan'}
                                </p>
                                {!searchTerm && ratingFilter === 'all' && (
                                    <Link
                                        href={route('reviews.create')}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Buat Ulasan Pertama
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {reviews.data.map((review) => (
                                    <div key={review.id} className="p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {review.menuName}
                                                    </h3>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        ({review.orderId})
                                                    </span>
                                                    {review.menuItems.length > 1 && (
                                                        <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-400">
                                                            +{review.menuItems.length - 1} item lainnya
                                                        </span>
                                                    )}
                                                    {review.isFeatured && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                                                            <Award className="w-3 h-3" />
                                                            Featured
                                                        </span>
                                                    )}
                                                    {review.isVerified && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-600 bg-green-100 rounded dark:bg-green-900/20 dark:text-green-400">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Verified
                                                        </span>
                                                    )}
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

                                                {/* Order Details */}
                                                <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                                                    <span>Pesanan: {formatDate(review.orderDate)}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>Total: {formatCurrency(review.totalAmount)}</span>
                                                </div>
                                            </div>

                                            {review.canEdit && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditReview(review.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 border border-purple-200 hover:border-purple-300 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Hapus
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {review.comment && (
                                            <div className="mb-4">
                                                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => handleMarkHelpful(review.id)}
                                                    className="flex items-center gap-1 text-sm text-gray-500 transition-colors dark:text-gray-400 hover:text-purple-600"
                                                >
                                                    <ThumbsUp className="w-4 h-4" />
                                                    <span>{review.helpful} orang merasa terbantu</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Restaurant Response */}
                                        {review.response && (
                                            <div className="p-4 ml-4 border-l-4 border-purple-500 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full dark:bg-purple-900/20">
                                                        <MessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {review.response.author}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatDate(review.response.date)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="ml-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                                    {review.response.text}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {reviews.last_page > 1 && (
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span>
                                        Menampilkan {((reviews.current_page - 1) * reviews.per_page) + 1} - {Math.min(reviews.current_page * reviews.per_page, reviews.total)} dari {reviews.total} ulasan
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    {reviews.links.map((link, index) => {
                                        if (link.label.includes('Previous')) {
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => link.url && handlePageChange(link.url)}
                                                    disabled={!link.url}
                                                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                            );
                                        }

                                        if (link.label.includes('Next')) {
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => link.url && handlePageChange(link.url)}
                                                    disabled={!link.url}
                                                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            );
                                        }

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => link.url && handlePageChange(link.url)}
                                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                    link.active
                                                        ? 'bg-purple-600 text-white'
                                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {link.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
