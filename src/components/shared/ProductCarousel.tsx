import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Star, Award } from 'lucide-react';
import Button from '../ui/Button';

interface Product {
  id: string;
  name: string;
  hero_image?: string;
  price_php?: number;
  base_price_php?: number;
  is_most_sold: boolean;
  is_top_product: boolean;
  type: 'activity' | 'package';
  min_pax?: number;
  category?: string;
}

interface ProductCarouselProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewPackage: (packageId: string) => void;
  selectedCurrency: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  onAddToCart,
  onViewPackage,
  selectedCurrency
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemsPerView = 3; // Show 3 items at a time

  // Filter out invalid products to prevent empty cards
  const validProducts = products.filter(product => 
    product && 
    product.id && 
    product.name && 
    product.name.trim() !== ''
  );

  // Currency conversion rates
  const currencies = [
    { value: 'PHP', label: 'PHP', symbol: '₱', rate: 1 },
    { value: 'USD', label: 'USD', symbol: '$', rate: 0.0175 },
    { value: 'EUR', label: 'EUR', symbol: '€', rate: 0.016 },
    { value: 'AUD', label: 'AUD', symbol: 'A$', rate: 0.027 },
    { value: 'RUB', label: 'RUB', symbol: '₽', rate: 1.63 },
    { value: 'KRW', label: 'KRW', symbol: '₩', rate: 24 },
    { value: 'CNY', label: 'CNY', symbol: '¥', rate: 0.13 }
  ];

  const formatPrice = (pricePhp: number) => {
    const currencyInfo = currencies.find(c => c.value === selectedCurrency) || currencies[0];
    const convertedPrice = pricePhp * currencyInfo.rate;
    
    return `${currencyInfo.symbol}${convertedPrice.toLocaleString(undefined, {
      maximumFractionDigits: 2
    })}`;
  };

  // Auto-play functionality - moving right to left
  useEffect(() => {
    if (!isAutoPlaying || validProducts.length <= itemsPerView) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const maxIndex = Math.max(0, validProducts.length - itemsPerView);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, validProducts.length]);

  const handlePrevious = () => {
    setCurrentIndex(prev => {
      const maxIndex = Math.max(0, validProducts.length - itemsPerView);
      return prev <= 0 ? maxIndex : prev - 1;
    });
  };

  const handleNext = () => {
    setCurrentIndex(prev => {
      const maxIndex = Math.max(0, validProducts.length - itemsPerView);
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  if (validProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            You Might Also Like
          </h3>
          <p className="text-gray-600">Popular activities and packages</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            disabled={validProducts.length <= itemsPerView}
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            disabled={validProducts.length <= itemsPerView}
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div 
        ref={carouselRef}
        className="overflow-hidden"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            width: `${(validProducts.length / itemsPerView) * 100}%`
          }}
        >
          {validProducts.map((product) => {
            const price = product.price_php || product.base_price_php || 0;
            
            return (
              <div 
                key={`${product.type}-${product.id}`}
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / validProducts.length}%` }}
              >
                <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.hero_image || 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1747143041/Boracay_sunset_afw4zm.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {product.is_top_product && (
                        <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          TOP
                        </span>
                      )}
                      {product.is_most_sold && (
                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          BEST
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-base">
                      {product.name}
                    </h4>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-amber-600">
                        {formatPrice(price)}
                      </span>
                      {product.category && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {product.category.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      {product.type === 'activity' ? (
                        <Button
                          onClick={() => onAddToCart(product)}
                          className="w-full text-sm py-3 flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Add to Cart
                        </Button>
                      ) : (
                        <Button
                          onClick={() => onViewPackage(product.id)}
                          variant="outline"
                          className="w-full text-sm py-3 border-amber-500 text-amber-600 hover:bg-amber-50 font-medium"
                        >
                          View Package
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots indicator - positioned horizontally at the bottom */}
      {validProducts.length > itemsPerView && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: Math.ceil(validProducts.length / itemsPerView) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === Math.floor(currentIndex)
                  ? 'bg-amber-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Link to Activities Page */}
      <div className="mt-6 text-center">
        <Link to="/activities">
          <Button
            variant="outline"
            className="w-full text-amber-600 border-amber-600 hover:bg-amber-50"
          >
            View All Activities →
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProductCarousel;