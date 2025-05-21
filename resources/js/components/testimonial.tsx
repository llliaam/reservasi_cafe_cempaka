import React from 'react';

interface ReviewCardProps {
  username: string;
  profileImage: string;
  rating: number;
  foodImage: string;
  reviewText: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ 
  username, 
  profileImage, 
  rating, 
  foodImage, 
  reviewText 
}) => {
  // Generate star rating based on the rating value (1-5)
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const starColor = i <= rating 
        ? 'text-yellow-400' // filled star for ratings
        : 'text-gray-300';  // empty star
        
      stars.push(
        <svg 
          key={i}
          className={`w-6 h-6 ${starColor}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" 
            clipRule="evenodd" 
          />
        </svg>
      );
    }
    
    return stars;
  };

  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Food Image Section */}
      <div className="w-full h-48 overflow-hidden">
        <img 
          src={foodImage} 
          alt="Food item" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Rating Section */}
      <div className="flex justify-center -mt-4 relative z-10">
        <div className="flex bg-white rounded-full px-3 py-1 shadow-md">
          {renderStars()}
        </div>
      </div>
      
      {/* User Profile and Review Text */}
      <div className="p-5">
        {/* User Info */}
        <div className="flex items-center mb-4">
          <img 
            src={profileImage} 
            alt={username} 
            className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-green-500"
          />
          <h3 className="font-semibold text-lg text-gray-800">{username}</h3>
        </div>
        
        {/* Review Text */}
        <p className="text-gray-700 text-sm leading-relaxed">
          {reviewText}
        </p>
      </div>
    </div>
  );
};

// Example usage - demonstrate the component with dummy data
const ReviewCardExample = () => {
  const dummyData = [
    {
      id: 1,
      username: "Jacob",
      profileImage: "/api/placeholder/50/50", // Using placeholder
      rating: 5,
      foodImage: "/api/placeholder/400/300", // Using placeholder
      reviewText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean luctus turpis in sem pulvinar convallis. Phasellus aliquam sem varius ligula congue, id luctus ante finibus."
    },
    {
      id: 2,
      username: "Alice",
      profileImage: "/api/placeholder/50/50", // Using placeholder
      rating: 3,
      foodImage: "/api/placeholder/400/300", // Using placeholder
      reviewText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean luctus turpis in sem pulvinar convallis. Phasellus aliquam sem varius ligula congue, id luctus ante finibus."
    },
    {
      id: 3,
      username: "James",
      profileImage: "/api/placeholder/50/50", // Using placeholder
      rating: 1,
      foodImage: "/api/placeholder/400/300", // Using placeholder
      reviewText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean luctus turpis in sem pulvinar convallis. Phasellus aliquam sem varius ligula congue, id luctus ante finibus."
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-100">
      <h2 className="text-2xl font-semibold mb-8 text-center text-gray-800">
        Ulasan Pelanggan Kami
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dummyData.map(review => (
          <ReviewCard 
            key={review.id}
            username={review.username}
            profileImage={review.profileImage}
            rating={review.rating}
            foodImage={review.foodImage}
            reviewText={review.reviewText}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewCardExample;