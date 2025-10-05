import React, { useState } from 'react';
import { Home, Bed, Bath, Maximize2, Calendar, Image, MapPin, Star, TrendingUp, X, Heart, Share2, Info } from 'lucide-react';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  images: string[];
  daysOnMarket: number;
  yearBuilt?: number;
  lotSize?: number;
  description?: string;
  mlsId?: string;
  schoolRatings?: {
    elementary?: number;
    middle?: number;
    high?: number;
  };
  agentInfo?: {
    name: string;
    phone: string;
    email: string;
  };
}

interface PropertyMatch {
  property: Property;
  matchScore: number;
  matchReasons: string[];
  missingFeatures: string[];
}

interface PropertyCardProps {
  match: PropertyMatch;
  onScheduleShowing: (propertyId: string, propertyAddress: string) => void;
  onSaveFavorite?: (propertyId: string, propertyAddress: string) => void;
  onViewDetails?: (propertyId: string) => void;
  onShare?: (propertyId: string, propertyAddress: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  match,
  onScheduleShowing,
  onSaveFavorite,
  onViewDetails,
  onShare,
}) => {
  const [showPhotos, setShowPhotos] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const { property, matchReasons, matchScore } = match;

  // Calculate match percentage (0-100%)
  const maxScore = 200; // From enhanced matching algorithm
  const matchPercentage = Math.min(Math.round((matchScore / maxScore) * 100), 100);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const avgSchoolRating = property.schoolRatings
    ? ((property.schoolRatings.elementary || 0) + 
       (property.schoolRatings.middle || 0) + 
       (property.schoolRatings.high || 0)) / 3
    : 0;

  return (
    <>
      <div className="bg-white rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl">
        {/* Property Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[0]}
              alt={property.address}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home size={64} className="text-blue-300" />
            </div>
          )}
          
          {/* Match Percentage Badge */}
          <div className={`absolute top-3 left-3 px-4 py-2 rounded-full font-bold text-lg shadow-lg ${
            matchPercentage >= 90 ? 'bg-green-600 text-white' :
            matchPercentage >= 75 ? 'bg-blue-600 text-white' :
            matchPercentage >= 60 ? 'bg-yellow-600 text-white' :
            'bg-gray-600 text-white'
          }`}>
            {matchPercentage}% Match
          </div>

          {/* Price Badge */}
          <div className="absolute top-14 left-3 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full font-bold text-base shadow-lg">
            ${property.price.toLocaleString()}
          </div>

          {/* Days on Market Badge */}
          {property.daysOnMarket <= 7 && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
              <TrendingUp size={14} />
              {property.daysOnMarket === 0 ? 'Just Listed!' : `${property.daysOnMarket}d ago`}
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorited(!isFavorited);
              if (onSaveFavorite) {
                onSaveFavorite(property.id, property.address);
              }
            }}
            className={`absolute top-14 right-3 p-2 rounded-full shadow-lg transition-all ${
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart size={20} className={isFavorited ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Property Details */}
        <div className="p-4">
          {/* Address */}
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="text-blue-500 mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-lg text-gray-800">{property.address}</h3>
              <p className="text-gray-600 text-sm">
                {property.city}, {property.state} {property.zipCode}
              </p>
            </div>
          </div>

          {/* Property Stats */}
          <div className="flex items-center gap-4 mb-3 text-gray-700">
            <div className="flex items-center gap-1">
              <Bed size={18} className="text-blue-500" />
              <span className="font-semibold">{property.bedrooms}</span>
              <span className="text-sm">bed</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath size={18} className="text-blue-500" />
              <span className="font-semibold">{property.bathrooms}</span>
              <span className="text-sm">bath</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize2 size={18} className="text-blue-500" />
              <span className="font-semibold">{property.sqft.toLocaleString()}</span>
              <span className="text-sm">sqft</span>
            </div>
          </div>

          {/* Match Reasons */}
          {matchReasons.length > 0 && (
            <div className="mb-3 space-y-1">
              {matchReasons.slice(0, 4).map((reason, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}

          {/* School Ratings */}
          {avgSchoolRating > 0 && (
            <div className="mb-3 flex items-center gap-2 text-sm">
              <Star className="text-yellow-500 fill-yellow-500" size={16} />
              <span className="font-semibold text-gray-700">
                {avgSchoolRating.toFixed(1)}/10
              </span>
              <span className="text-gray-600">School Rating</span>
            </div>
          )}

          {/* Property Type & Year Built */}
          <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
            <span className="font-medium capitalize">{property.propertyType?.replace(/-/g, ' ')}</span>
            {property.yearBuilt && (
              <>
                <span>•</span>
                <span>Built {property.yearBuilt}</span>
              </>
            )}
            {property.lotSize && (
              <>
                <span>•</span>
                <span>{(property.lotSize / 43560).toFixed(2)} acres</span>
              </>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowPhotos(true)}
              disabled={!property.images || property.images.length === 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Image size={18} />
              Photos ({property.images?.length || 0})
            </button>
            <button
              onClick={() => onScheduleShowing(property.id, property.address)}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Calendar size={18} />
              Schedule Tour
            </button>
          </div>

          {/* Secondary Action Buttons */}
          <div className="flex gap-2 mt-2">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(property.id)}
                className="flex-1 bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700 font-medium py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Info size={16} />
                Details
              </button>
            )}
            {onShare && (
              <button
                onClick={() => onShare(property.id, property.address)}
                className="flex-1 bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700 font-medium py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                Share
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {showPhotos && property.images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full relative">
            {/* Close Button */}
            <button
              onClick={() => setShowPhotos(false)}
              className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-200 transition-colors z-10"
            >
              <X size={24} />
            </button>

            {/* Image */}
            <div className="relative bg-white rounded-lg overflow-hidden">
              <img
                src={property.images[currentImageIndex]}
                alt={`${property.address} - Photo ${currentImageIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />

              {/* Navigation Arrows */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full p-3 transition-all"
                  >
                    ←
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full p-3 transition-all"
                  >
                    →
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
                {currentImageIndex + 1} / {property.images.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Example usage with demo data
export default function PropertyResults() {
  const demoMatches: PropertyMatch[] = [
    {
      property: {
        id: '1',
        address: '123 Oak Street',
        city: 'Nashville',
        state: 'TN',
        zipCode: '37209',
        price: 385000,
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1850,
        propertyType: 'single-family',
        images: [
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
        ],
        daysOnMarket: 2,
        schoolRatings: {
          elementary: 9,
          middle: 8,
          high: 9,
        },
      },
      matchScore: 95,
      matchReasons: [
        'Great value - $115,000 under budget',
        'Large backyard with deck',
        'Sparkling pool',
        'Recently renovated kitchen',
        'Top-rated schools nearby',
      ],
      missingFeatures: [],
    },
    {
      property: {
        id: '2',
        address: '456 Maple Avenue',
        city: 'Nashville',
        state: 'TN',
        zipCode: '37205',
        price: 395000,
        bedrooms: 3,
        bathrooms: 2.5,
        sqft: 2100,
        propertyType: 'single-family',
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
        ],
        daysOnMarket: 1,
      },
      matchScore: 92,
      matchReasons: [
        'Just listed!',
        '2.5 bathrooms',
        'Fenced backyard with pool',
        'Granite countertops',
      ],
      missingFeatures: [],
    },
  ];

  const handleScheduleShowing = (propertyId: string) => {
    alert(`Scheduling showing for property ${propertyId}`);
    // In real implementation, this would open a booking modal or redirect
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Your Property Matches
          </h1>
          <p className="text-gray-600">
            We found {demoMatches.length} homes that match your preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {demoMatches.map((match) => (
            <PropertyCard
              key={match.property.id}
              match={match}
              onScheduleShowing={handleScheduleShowing}
            />
          ))}
        </div>
      </div>
    </div>
  );
}