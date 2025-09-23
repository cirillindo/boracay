import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { X, Star, Award, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PromoPackage {
  id: string;
  name: string;
  hero_image: string;
  base_price_php: number;
  is_top_product: boolean;
  is_most_sold: boolean;
}

const PromoPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [promos, setPromos] = useState<PromoPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const popupShown = sessionStorage.getItem('promoPopupShown');
    
    if (!popupShown) {
      const timer = setTimeout(() => {
        loadPromos();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const loadPromos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('packages')
        .select('id, name, hero_image, base_price_php, is_top_product, is_most_sold')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setPromos(data);
        setIsOpen(true);
        setTimeout(() => setIsVisible(true), 100);
        sessionStorage.setItem('promoPopupShown', 'true');
      }
    } catch (err) {
      console.error('Error loading promos:', err);
      setError('Failed to load promos');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const formatPrice = (price: number): string => {
    return `₱${price.toLocaleString('en-PH')}`;
  };

  if (!isOpen) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          isVisible ? 'bg-opacity-40' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup Container */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl w-[85vw] max-h-[80vh] overflow-y-auto sm:w-full sm:max-w-sm md:max-w-2xl lg:max-w-3xl sm:max-h-none sm:overflow-visible transform transition-all duration-500 ${
          isVisible 
            ? 'scale-100 opacity-100 sm:animate-bounceIn' 
            : 'scale-50 opacity-0'
        }`}
      >
        {/* Close Button - Now inside popup container */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-[10000] bg-white/90 hover:bg-white text-red-600 hover:text-red-800 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="relative bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white p-4 sm:p-8 text-center overflow-hidden">
          {/* Mobile simplified header */}
          <div className="sm:hidden">
            <h2 className="text-xl font-bold mb-1">CHECK OUR PROMOS</h2>
            <p className="text-amber-100 text-sm">
              Exclusive Boracay deals
            </p>
          </div>
          
          {/* Desktop header */}
          <div className="hidden sm:block relative z-10">
            <h2 className="text-3xl font-bold mb-2">🎉 Special Boracay Deals!</h2>
            <p className="text-amber-100 text-lg">
              Don't miss out on our exclusive packages
            </p>
          </div>

          {/* Decorative sparkles - Desktop only */}
          <div className="hidden sm:block absolute top-2 left-4">
            <Sparkles className="w-6 h-6 text-amber-200 animate-pulse" />
          </div>
          <div className="hidden sm:block absolute top-6 right-8">
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse delay-300" />
          </div>
          <div className="hidden sm:block absolute bottom-4 left-8">
            <Sparkles className="w-5 h-5 text-amber-200 animate-pulse delay-700" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-center mb-4 sm:mb-6 text-sm sm:text-base">
                Discover amazing activities and packages at unbeatable prices!
              </p>
              
              {/* Mobile - Single Promo */}
              <div className="sm:hidden">
                {promos.length > 0 && (
                  <Link
                    to="/promos"
                    className="block bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 mb-4"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={promos[0].hero_image || 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1747143041/Boracay_sunset_afw4zm.jpg'}
                        alt={promos[0].name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {promos[0].is_top_product && (
                          <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            TOP
                          </span>
                        )}
                        {promos[0].is_most_sold && (
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            BEST
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 hover:text-amber-600 transition-colors">
                        {promos[0].name}
                      </h3>
                      <div className="text-lg font-bold text-amber-600">
                        {formatPrice(promos[0].base_price_php)}
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              {/* Desktop - Promo Cards Grid */}
              <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {promos.map((promo, index) => (
                  <Link
                    key={promo.id}
                    to="/promos"
                    className="group block bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    style={{
                      animationDelay: `${index * 150}ms`
                    }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={promo.hero_image || 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1747143041/Boracay_sunset_afw4zm.jpg'}
                        alt={promo.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {promo.is_top_product && (
                          <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            TOP
                          </span>
                        )}
                        {promo.is_most_sold && (
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            BEST
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">
                        {promo.name}
                      </h3>
                      <div className="text-lg font-bold text-amber-600">
                        {formatPrice(promo.base_price_php)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <Link to="/promos">
                  <button
                    onClick={handleClose}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
                  >
                    View All Promos & Activities {window.innerWidth >= 640 ? '🌴' : ''}
                  </button>
                </Link>
                
                <p className="text-xs text-gray-500 mt-3">
                  Limited time offers • Book now and save!
                </p>
              </div>
            </>
          )}
        </div>

        {/* Decorative bottom border */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>
      </div>
    </div>,
    modalRoot
  );
};

export default PromoPopup;