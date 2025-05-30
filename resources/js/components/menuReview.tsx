// MenuReviews.tsx - Komponen untuk menampilkan review di halaman menu
// DIPERBAIKI: Menggunakan props dari controller, tidak ada API calls
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    Star, 
    MessageCircle, 
    ThumbsUp, 
    User,
    Award,
    CheckCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface Review {
    id: number;
    rating: number;
    comment: string;
    reviewer_name: string;
    reviewed_at: string;
    helpful_count: number;
    is_featured: boolean;
    admin_response?: {
        text: string;
        date: string;
        author: string;
    };
}

interface ReviewStats {
    total_reviews: number;
    average_rating: number;
    rating_distribution: {
        [key: number]: number;
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
    // Data diterima langsung dari controller sebagai props
    reviews: PaginatedReviews;
    stats: ReviewStats;
    menuItem: {
        id: number;
        name: string;
    };
}

const MenuReviews: React.FC<Props> = ({ reviews, stats, menuItem }) => {
    const [showAllReviews, setShowAllReviews] = useState(false);

    // Handle pagination menggunakan Inertia router
    const handleLoadMore = () => {
        if (reviews.current_page < reviews.last_page) {
            router.get(route('menu-item.reviews', menuItem.id), {
                page: reviews.current_page + 1
            }, {
                preserveState: true,
                preserveScroll: true,
                only: ['reviews'] // Only reload reviews data
            });
        }
    };

    // Handle mark helpful menggunakan form submission
    const handleMarkHelpful = (reviewId: number) => {
        router.post(route('reviews.mark-helpful', reviewId), {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // Flash message akan ditampilkan otomatis
            },
            onError: (errors) => {
                console.error('Error marking review as helpful:', errors);
            }
        });
    };

    const renderStars = (rating: number, size = 'w-4 h-4') => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                className={`${size} ${
                    index < rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    const getRatingPercentage = (rating: number) => {
        if (!stats || stats.total_reviews === 0) return 0;
        return (stats.rating_distribution[rating] / stats.total_reviews) * 100;
    };

    if (!stats || stats.total_reviews === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Ulasan Pelanggan
                </h3>
                <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Belum ada ulasan untuk menu ini</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Jadilah yang pertama memberikan ulasan!
                    </p>
                </div>
            </div>
        );
    }

    const displayedReviews = showAllReviews ? reviews.data : reviews.data.slice(0, 3);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Ulasan Pelanggan untuk {menuItem.name}
                </h3>

                {/* Rating Summary */}
                <div className="flex items-center gap-6 mb-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                            {stats.average_rating.toFixed(1)}
                        </div>
                        <div className="flex justify-center gap-1 mb-1">
                            {renderStars(Math.round(stats.average_rating), 'w-5 h-5')}
                        </div>
                        <div className="text-sm text-gray-500">
                            {stats.total_reviews} ulasan
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1 w-12">
                                    <span className="text-sm text-gray-600">{rating}</span>
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${getRatingPercentage(rating)}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-500 w-8">
                                    {stats.rating_distribution[rating] || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {displayedReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-gray-900">
                                        {review.reviewer_name}
                                    </span>
                                    {review.is_featured && (
                                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded">
                                            <Award className="w-3 h-3" />
                                            Featured
                                        </span>
                                    )}
                                    <span className="text-sm text-gray-500">
                                        {review.reviewed_at}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex gap-1">
                                        {renderStars(review.rating)}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {review.rating}/5
                                    </span>
                                </div>
                                
                                {review.comment && (
                                    <p className="text-gray-700 leading-relaxed mb-3">
                                        {review.comment}
                                    </p>
                                )}
                                
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleMarkHelpful(review.id)}
                                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                        <span>Membantu ({review.helpful_count})</span>
                                    </button>
                                </div>
                                
                                {/* Admin Response */}
                                {review.admin_response && (
                                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <span className="font-medium text-blue-900 text-sm">
                                                    {review.admin_response.author}
                                                </span>
                                                <span className="text-xs text-blue-600 ml-2">
                                                    {review.admin_response.date}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-blue-800 text-sm leading-relaxed ml-8">
                                            {review.admin_response.text}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Show More/Less Button */}
            {reviews.data.length > 3 && (
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        {showAllReviews ? (
                            <>
                                <ChevronUp className="w-4 h-4" />
                                Tampilkan Lebih Sedikit
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4" />
                                Lihat Semua Ulasan ({reviews.data.length})
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Load More Button for Pagination */}
            {showAllReviews && reviews.current_page < reviews.last_page && (
                <div className="mt-4 text-center">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-2 border border-gray-300 rounded-lg font-medium transition-colors bg-white text-gray-700 hover:bg-gray-50"
                    >
                        Muat Lebih Banyak
                    </button>
                </div>
            )}
        </div>
    );
};

export default MenuReviews;