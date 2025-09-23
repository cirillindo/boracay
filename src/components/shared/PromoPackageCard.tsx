import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, Plus, Minus, Check, Info } from 'lucide-react';
import Button from '../ui/Button';
import { useShoppingCart } from '../../context/ShoppingCartContext';
import { playSound } from '../../utils/audio';

interface PromoPackage {
  id: string;
  name: string;
  description: string;
  hero_image: string;
  base_price_php: number;
  is_top_product: boolean;
  is_most_sold: boolean;
  min_pax?: number;
  max_pax?: number | null;
  min_nights?: number;
  max_nights?: number | null;
  promo_code?: string;
  promo_discount_percentage?: number;
  whatsapp_number?: string;
}

interface PromoPackageCardProps {
  pkg: PromoPackage;
}

const PromoPackageCard: React.FC<PromoPackageCardProps> = ({ pkg }) => {
  const { addToCart } = useShoppingCart();
  const [selectedParticipants, setSelectedParticipants] = useState(pkg.min_pax || 1);
  const [selectedNights, setSelectedNights] = useState(pkg.min_nights || 1);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    // Ensure participants and nights are within min/max bounds when pkg props change
    setSelectedParticipants(prev => Math.max(pkg.min_pax || 1, prev));
    setSelectedNights(prev => Math.max(pkg.min_nights || 1, prev));
  }, [pkg]);

  const calculateTotalPrice = () => {
    let price = pkg.base_price_php * selectedParticipants * selectedNights;
    if (pkg.promo_discount_percentage) {
      price -= price * (pkg.promo_discount_percentage / 100);
    }
    return price;
  };

  const formatPrice = (price: number): string => {
    return `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const handleParticipantsChange = (delta: number) => {
    setSelectedParticipants(prev => {
      const newCount = prev + delta;
      const min = pkg.min_pax || 1;
      const max = pkg.max_pax || Infinity;
      return Math.min(Math.max(newCount, min), max);
    });
  };

  const handleNightsChange = (delta: number) => {
    setSelectedNights(prev => {
      const newCount = prev + delta;
      const min = pkg.min_nights || 1;
      const max = pkg.max_nights || Infinity;
      return Math.min(Math.max(newCount, min), max);
    });
  };

  const handleAddToCart = () => {
    addToCart({
      id: pkg.id,
      name: pkg.name,
      price: pkg.base_price_php, // Store base price, total calculated in cart context
      quantity: selectedParticipants,
      selectedDate: new Date(), // Placeholder, packages might not have specific dates
      hero_image: pkg.hero_image,
      min_pax: pkg.min_pax,
      min_nights: pkg.min_nights,
      type: 'package',
      addons_summary: `Participants: ${selectedParticipants}, Nights: ${selectedNights}`
    });
    playSound('click.mp3');
  };

  const handleCheckAvailability = () => {
    const whatsappMessage = encodeURIComponent(
      `Hello! I'm interested in the "${pkg.name}" package for ${selectedParticipants} participants and ${selectedNights} nights. Could you please check availability?`
    );
    const whatsappLink = `https://wa.me/${pkg.whatsapp_number || '+639617928834'}?text=${whatsappMessage}`;
    window.open(whatsappLink, '_blank');
  };

  const handleShareLink = () => {
    const shareUrl = `https://boracay.house/promos`; // Link to the main promos page
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setShowCopiedMessage(true);
        playSound('click.mp3');
        setTimeout(() => setShowCopiedMessage(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
      <div className="relative h-64 overflow-hidden">
        <img
          src={pkg.hero_image || 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1747143041/Boracay_sunset_afw4zm.jpg'}
          alt={pkg.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          {pkg.is_top_product && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <Star className="w-3 h-3" />
              TOP
            </span>
          )}
          {pkg.is_most_sold && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <Award className="w-3 h-3" />
              BEST
            </span>
          )}
        </div>
        <button
          onClick={handleShareLink}
          className="absolute top-2 left-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
          aria-label="Share package"
        >
          {showCopiedMessage ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          )}
        </button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
        <div 
          className="text-gray-600 text-sm mb-4 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: pkg.description }}
        />

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Participants (min: {pkg.min_pax || 1})
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleParticipantsChange(-1)}
                disabled={selectedParticipants <= (pkg.min_pax || 1)}
                className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={pkg.min_pax || 1}
                max={pkg.max_pax || 99}
                value={selectedParticipants}
                onChange={(e) => setSelectedParticipants(parseInt(e.target.value) || (pkg.min_pax || 1))}
                className="w-full px-3 py-2 border-y border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => handleParticipantsChange(1)}
                disabled={selectedParticipants >= (pkg.max_pax || Infinity)}
                className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Nights (min: {pkg.min_nights || 1})
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleNightsChange(-1)}
                disabled={selectedNights <= (pkg.min_nights || 1)}
                className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={pkg.min_nights || 1}
                max={pkg.max_nights || 99}
                value={selectedNights}
                onChange={(e) => setSelectedNights(parseInt(e.target.value) || (pkg.min_nights || 1))}
                className="w-full px-3 py-2 border-y border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => handleNightsChange(1)}
                disabled={selectedNights >= (pkg.max_nights || Infinity)}
                className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 mt-auto">
          <div className="text-sm text-gray-500">Total:</div>
          <div className="text-right">
            <div className="text-lg font-bold text-amber-600">{formatPrice(totalPrice)}</div>
            <div className="text-xs text-gray-500">
              {selectedParticipants} pax x {selectedNights} nights
            </div>
          </div>
        </div>

        <Button onClick={handleAddToCart} className="w-full mb-2">
          Add to Cart
        </Button>
        <Button onClick={handleCheckAvailability} variant="outline" className="w-full">
          Check Availability
        </Button>
      </div>
    </div>
  );
};

export default PromoPackageCard;