import React, { useState } from 'react';
import { Heart, Share2, MapPin, Star, ExternalLink, Clock, Phone, Instagram, Facebook, Youtube, Menu } from 'lucide-react';
import { Restaurant } from '../../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement share functionality
    alert(`Sharing ${restaurant.name}`);
  };

  const renderPriceLevel = (level: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3].map((i) => (
          <span 
            key={i} 
            className={`text-lg ${i <= level ? 'text-amber-500' : 'text-gray-300'}`}
          >
            $
          </span>
        ))}
      </div>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${
              i <= Math.floor(rating) 
                ? 'fill-amber-400 text-amber-400' 
                : i <= rating 
                  ? 'fill-amber-400 text-amber-400 opacity-50' 
                  : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">
          {rating.toFixed(1)} ({restaurant.rating_count})
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col md:flex-row">
        {/* Restaurant Image */}
        <div className="md:w-1/3 h-48 md:h-auto relative">
          <img 
            src={restaurant.image_url} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <button 
              onClick={toggleFavorite}
              className="p-1.5 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
              aria-label="Add to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            <button 
              onClick={handleShare}
              className="p-1.5 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="md:w-2/3 p-4 md:p-6">
          {/* Cuisine Type Tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            {restaurant.cuisine_type.split(', ').map((cuisine, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-md"
              >
                {cuisine}
              </span>
            ))}
          </div>

          {/* Restaurant Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{restaurant.name}</h3>

          {/* Location */}
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{restaurant.location}</span>
          </div>

          {/* Rating and Price */}
          <div className="flex justify-between items-center mb-4">
            {renderStars(restaurant.rating)}
            <span className="text-gray-700 font-medium">{restaurant.price_range}</span>
          </div>

          {/* Excerpt */}
          <p className="text-gray-600 mb-4 line-clamp-2">
            {restaurant.excerpt}
          </p>

          {/* Read More Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-amber-600 hover:text-amber-700 font-medium text-sm"
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-6 border-t border-gray-100 pt-6 space-y-4">
              {/* Full Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                <p className="text-gray-600">{restaurant.description}</p>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {restaurant.features.map((feature, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {restaurant.specialties.map((specialty, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Atmosphere */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Atmosphere</h4>
                <p className="text-gray-600">{restaurant.atmosphere}</p>
              </div>

              {/* Contact & Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {restaurant.hours && (
                  <div className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 text-gray-500 mt-1" />
                    <span className="text-gray-600">{restaurant.hours}</span>
                  </div>
                )}
                
                {restaurant.phone && (
                  <div className="flex items-start">
                    <Phone className="w-4 h-4 mr-2 text-gray-500 mt-1" />
                    <a 
                      href={`tel:${restaurant.phone}`} 
                      className="text-amber-600 hover:text-amber-700"
                    >
                      {restaurant.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Social Media Links */}
              <div className="flex flex-wrap gap-4">
                {restaurant.instagram && (
                  <a 
                    href={restaurant.instagram.startsWith('http') ? restaurant.instagram : `https://instagram.com/${restaurant.instagram.replace('@', '')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-pink-600 hover:text-pink-700"
                  >
                    <Instagram className="w-4 h-4 mr-1" />
                    <span className="text-sm">Instagram</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
                
                {restaurant.facebook && (
                  <a 
                    href={restaurant.facebook.startsWith('http') ? restaurant.facebook : `https://facebook.com/${restaurant.facebook}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Facebook className="w-4 h-4 mr-1" />
                    <span className="text-sm">Facebook</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
                
                {restaurant.youtube && (
                  <a 
                    href={restaurant.youtube.startsWith('http') ? restaurant.youtube : `https://youtube.com/c/${restaurant.youtube}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-red-600 hover:text-red-700"
                  >
                    <Youtube className="w-4 h-4 mr-1" />
                    <span className="text-sm">YouTube</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
                
                {restaurant.menu_url && (
                  <a 
                    href={restaurant.menu_url.startsWith('http') ? restaurant.menu_url : '#'}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-gray-700"
                  >
                    <Menu className="w-4 h-4 mr-1" />
                    <span className="text-sm">Menu</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;