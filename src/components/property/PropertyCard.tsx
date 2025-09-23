// src/components/property/PropertyCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bed, Bath, Home, MapPin, Star, FileText, Share2, Check, DollarSign } from 'lucide-react'; // Added DollarSign
import { Property } from '../../types';
import { playSound } from '../../utils/audio';
import Button from '../ui/Button'; // Import Button component

interface PropertyCardProps {
  property: Property & { selectedCurrency?: string };
  disableNavigation?: boolean;
  showNightlyRate?: boolean;
  displayAsSale?: boolean;
  showDreamBidButton?: boolean; // New prop
  onDreamBidClick?: (property: Property) => void; // New callback prop
}

const formatPrice = (price: number, currency = 'EUR'): string => {
  const symbols: { [key: string]: string } = {
    EUR: '€',
    USD: '$',
    PHP: '₱',
    AUD: 'A$',
    RUB: '₽',
    KRW: '₩',
    CNY: '¥'
  };

  const rates: { [key: string]: number } = {
    EUR: 1,
    USD: 1.08,
    PHP: 60.50,
    AUD: 1.65,
    RUB: 98.50,
    KRW: 1450.25,
    CNY: 7.85
  };

  const convertedPrice = price * (rates[currency] || 1);
  return `${symbols[currency] || '€'}${convertedPrice.toLocaleString('en-US', {
    maximumFractionDigits: 0
  })}`;
};

const formatRentalRate = (min?: number, max?: number, currency = 'EUR', period = '/night') => {
  if (!min && !max) return 'Price on request';
  if (min === max) return `${formatPrice(min, currency)}/night`;
  if (!max) return `From ${formatPrice(min, currency)}/night`;
  if (!min) return `Up to ${formatPrice(max, currency)}/night`;
  return `${formatPrice(min, currency)} - ${formatPrice(max, currency)}${period}`;
};

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  disableNavigation = false,
  showNightlyRate = false,
  displayAsSale = false,
  showDreamBidButton = false, // Default to false
  onDreamBidClick // Destructure new prop
}) => {
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = React.useState(false);

  React.useEffect(() => {
    const favoritesStr = localStorage.getItem('favorites');
    const favorites = favoritesStr ? JSON.parse(favoritesStr) : [];
    setIsFavorite(favorites.includes(property.id));
  }, [property.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const favoritesStr = localStorage.getItem('favorites');
    const favorites = favoritesStr ? JSON.parse(favoritesStr) : [];

    let newFavorites;
    if (favorites.includes(property.id)) {
      newFavorites = favorites.filter((id: string) => id !== property.id);
      setIsFavorite(false);
      playSound('click.mp3'); // Play sound when removing from favorites
    } else {
      newFavorites = [...favorites, property.id];
      setIsFavorite(true);
      playSound('click.mp3'); // Play sound when adding to favorites
    }

    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const handleShareLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Use the production domain instead of window.location.origin
    const baseUrl = "https://boracay.house";
    const propertyUrl = `${baseUrl}/${property.slug}`;

    navigator.clipboard.writeText(propertyUrl)
      .then(() => {
        setShowCopiedMessage(true);
        playSound('click.mp3'); // Play sound when copying link
        setTimeout(() => setShowCopiedMessage(false), 2000); // Hide message after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  const downloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!property.pdf_url) return;

    try {
      // Fetch the PDF file
      const response = await fetch(property.pdf_url);
      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = property.pdf_name || `${property.title.replace(/\s+/g, '_')}.pdf`;

      // Append to the DOM
      document.body.appendChild(link);

      // Trigger the download
      link.click();

      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
      }, 100);

      // Play sound feedback
      playSound('click.mp3');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Fallback to direct method if blob fails
      const fallbackLink = document.createElement('a');
      fallbackLink.href = property.pdf_url;
      fallbackLink.download = property.pdf_name || `${property.title.replace(/\s+/g, '_')}.pdf`;
      fallbackLink.target = '_blank';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
    }
  };

  const getAltText = () => {
    // Special alt text for house sale pages
    if (displayAsSale && property.price && property.price > 0) {
      const location = property.location_name || property.location || 'Boracay';
      const currency = property.selectedCurrency || 'EUR';
      const formattedPrice = formatPrice(property.price, currency);
      return `House for sale in Boracay – ${location} – ${formattedPrice}`;
    }

    const parts = [];

    // Add bedrooms if available
    if (property.bedrooms) {
      parts.push(`${property.bedrooms}BR`);
    }

    // Add property type
    parts.push(property.property_type);

    // Add status (for sale/rent)
    if (property.is_for_sale) {
      parts.push('for sale');
    } else if (property.is_for_rent) {
      parts.push('for rent');
    }

    // Add location
    if (property.location_name) {
      parts.push(`in ${property.location_name}`);
    } else if (property.location) {
      parts.push(`in ${property.location}`);
    }

    // Add furnish status if available
    if (property.furnish_status) {
      parts.push(`- ${property.furnish_status.toLowerCase()}`);
    }

    return `${parts.join(' ')} - Boracay Property`;
  };

  // Unified price display logic
  const getDisplayPrice = () => {
    // Case 0: Force display as sale price (for sale pages)
    if (displayAsSale && property.price && property.price > 0) {
      return formatPrice(property.price, property.selectedCurrency);
    }

    // Case 1: Long-term rental with monthly income
    if (property.is_for_rent &&
        property.is_long_term_rental &&
        property.monthly_income_from_rent &&
        property.monthly_income_from_rent > 0) {
      return formatPrice(property.monthly_income_from_rent, property.selectedCurrency) + '/month';
    }

    // Case 2: Short-term rental with nightly rates
    if (property.is_for_rent &&
        (property.nightly_rate_min || property.nightly_rate_max)) {
      return formatRentalRate(
        property.nightly_rate_min,
        property.nightly_rate_max,
        property.selectedCurrency,
        '/night'
      );
    }

    // Case 3: Property for sale with price
    if (property.is_for_sale && property.price && property.price > 0) {
      return formatPrice(property.price, property.selectedCurrency);
    }

    // Default: No valid price information
    return 'Price on request';
  };

  const CardContent = () => {
    // Calculate price per SQM
    const pricePerBuiltSqm = property.area && property.area > 0
      ? (property.price / property.area)
      : null;

    const pricePerLandSqm = (property.land_size && property.land_size > 0)
      ? (property.price / property.land_size)
      : (property.lot_size && property.lot_size > 0
        ? (property.price / property.lot_size)
        : null);

    const formatSqmPrice = (amount: number | null) => {
      if (amount === null) return 'N/A';
      return `${formatPrice(amount, property.selectedCurrency)}/SQM`;
    };

    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform hover:rotate-1 hover:scale-[1.01] flex flex-col h-full">
        <div className="relative h-[250px] overflow-hidden group">
          <div className="absolute inset-0">
            <img
              src={property.hero_image || property.grid_photo ||
                (property.images && property.images.length > 0
                  ? property.images[0]?.url || property.images[0]
                  : 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg')}
              alt={getAltText()}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>

          {/* Status Overlay */}
          {(property.status === 'rented' || property.status === 'sold') && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
              <span className={`text-white text-3xl font-bold uppercase tracking-wider ${property.status === 'sold' ? 'sold-stamp' : ''}`}>
                {property.status === 'rented' ? 'RENTED' : 'SOLD'}
              </span>
            </div>
          )}

          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
            {property.grid_photo_overlay && (
              <span className="text-xs uppercase font-semibold py-1 px-3 rounded bg-amber-600 text-white">
                {property.grid_photo_overlay}
              </span>
            )}
            {property.tags && property.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs uppercase font-semibold py-1 px-3 rounded bg-white/90 backdrop-blur-sm text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button
              onClick={toggleFavorite}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors heart-radar"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
            </button>

            <button
              onClick={handleShareLink}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              title="Copy link"
            >
              {showCopiedMessage ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Share2 className="w-4 h-4 text-gray-700" />
              )}
            </button>

            {/* PDF Download Button */}
            {property.pdf_url && (
              <button
                onClick={downloadPdf}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                title="Download PDF Brochure"
              >
                <FileText className="w-4 h-4 text-gray-700" />
              </button>
            )}
          </div>

          {/* Fixed dark section at bottom of image with expandable content */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white">
            <div className="p-4">
              <h3 className="text-lg font-semibold line-clamp-1">{property.title}</h3>

              {/* Expandable content */}
              <div className="overflow-hidden transition-all duration-700 ease-in-out max-h-0 group-hover:max-h-[400px]">
                <p className="mt-2 text-sm text-white/90 line-clamp-3">
                  {property.description?.replace(/<[^>]*>/g, '').slice(0, 150)}...
                </p>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="flex flex-col items-center">
                    <Bed className="w-4 h-4 mb-1" />
                    <span className="text-sm">{property.bedrooms || 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bath className="w-4 h-4 mb-1" />
                    <span className="text-sm">{property.bathrooms || 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Home className="w-4 h-4 mb-1" />
                    <span className="text-sm">{property.area || 0}m²</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MapPin className="w-4 h-4 mb-1" />
                    <span className="text-sm">{property.lot_size || 0}m²</span>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <span className="text-sm font-medium">View Details →</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 flex-grow flex flex-col">
          <div className="flex items-center text-gray-600 text-xs mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="font-medium">{property.location_name || property.location}</span>
          </div>

          {/* Price and rating on the same line */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < (property.rating || 5) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                />
              ))}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-lg font-bold text-gray-900">
                {getDisplayPrice()}
              </span>
            </div>
          </div>

          {/* Property specs grid */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100 mt-auto">
            <div className="flex flex-col items-center">
              <Bed className="w-4 h-4 text-gray-400 mb-1" />
              <span className="text-sm font-medium">{property.bedrooms || 0}</span>
              <span className="text-xs text-gray-500">Beds</span>
            </div>
            <div className="flex flex-col items-center">
              <Bath className="w-4 h-4 text-gray-400 mb-1" />
              <span className="text-sm font-medium">{property.bathrooms || 0}</span>
              <span className="text-xs text-gray-500">Baths</span>
            </div>
            <div className="flex flex-col items-center">
              <Home className="w-4 h-4 text-gray-400 mb-1" />
              <span className="text-sm font-medium">{property.area || 0}</span>
              <span className="text-xs text-gray-500">m² Built</span>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-4 h-4 text-gray-400 mb-1" />
              <span className="text-sm font-medium">{property.lot_size || 0}</span>
              <span className="text-xs text-gray-500">m² Lot</span>
            </div>
          </div>
          {/* Dream Bid Button (conditionally rendered) */}
          {showDreamBidButton && (
            <div className="mt-4">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onDreamBidClick) {
                    onDreamBidClick(property);
                  }
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2"
              >
                <DollarSign className="w-5 h-5" /> Place Dream Bid
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (disableNavigation) {
    return <CardContent />;
  }

  return (
    <Link to={`/${property.slug}`} className="block h-full">
      <CardContent />
    </Link>
  );
};

export default PropertyCard;
