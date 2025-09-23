import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Property } from '../../types';
import { supabase } from '../../lib/supabase';

interface PropertyCarouselProps {
  currentPropertyId: string;
}

const PropertyCarousel: React.FC<PropertyCarouselProps> = ({ currentPropertyId }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProperties();
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [currentPropertyId]);

  const loadProperties = async () => {
    try {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .neq('id', currentPropertyId)
        .limit(12)
        .order('created_at', { ascending: false });

      if (data) {
        // Duplicate the first few items at the end for smooth infinite scroll
        const extendedData = [...data, ...data.slice(0, 3)];
        setProperties(extendedData);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  useEffect(() => {
    const startScrolling = () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }

      scrollIntervalRef.current = setInterval(() => {
        if (!isPaused && properties.length > 3) {
          setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            // When we reach the duplicated items, quickly reset to the start
            if (nextIndex >= properties.length - 3) {
              return 0;
            }
            return nextIndex;
          });
        }
      }, 5000);
    };

    startScrolling();

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isPaused, properties.length]);

  const handlePrevious = () => {
    if (currentIndex === 0) {
      // Jump to the end of the original items
      setCurrentIndex(properties.length - 4);
    } else {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex >= properties.length - 4) {
      // Jump to the start
      setCurrentIndex(0);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePropertyClick = (property: Property) => {
    navigate(`/${property.slug}`);
    window.scrollTo(0, 0);
  };

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="relative inline-block mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Similar Properties You May Like
          </h2>
          <div className="absolute -bottom-1 left-0 h-0.5 bg-amber-600 w-full transform origin-left transition-transform duration-1000"></div>
        </div>
        
        <div className="relative">
          <button
            onClick={handlePrevious}
            className="absolute left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 md:-right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          <div 
            ref={containerRef}
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentIndex * 100}%) translateX(-${currentIndex * 50}%) translateX(-${currentIndex * (100/3)}%)`,
                '@media (min-width: 768px)': {
                  transform: `translateX(-${currentIndex * 50}%)`
                },
                '@media (min-width: 1024px)': {
                  transform: `translateX(-${currentIndex * (100/3)}%)`
                }
              }}
            >
              {properties.map((property, index) => (
                <div 
                  key={`${property.id}-${index}`}
                  className="min-w-[90%] md:min-w-[50%] lg:min-w-[33.333%] px-2 md:px-3"
                  onClick={() => handlePropertyClick(property)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="property-card bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="property-card__image relative aspect-video">
                      <img 
                        src={property.grid_photo || property.images?.[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-wrap gap-1 md:gap-2">
                        <span className="px-2 md:px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded">
                          {property.status.toLowerCase()}
                        </span>
                        {property.grid_photo_overlay && (
                          <span className="px-2 md:px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded">
                            {property.grid_photo_overlay}
                          </span>
                        )}
                      </div>

                      {/* Hover Info */}
                      <div className="property-card__info-hover">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <span className="text-xs md:text-sm">
                            {new Date(property.created_at || '').toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Image Hover Effect */}
                      <div 
                        className="property-card__image-hover"
                        style={{ backgroundImage: `url(${property.images?.[1] || property.grid_photo})` }}
                      />
                    </div>

                    <div className="p-3 md:p-4">
                      <div className="flex items-center text-gray-600 text-xs md:text-sm mb-2">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        <span className="truncate">{property.location_name || property.location}</span>
                      </div>
                      
                      <h3 className="text-sm md:text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-base md:text-xl font-bold text-amber-600">
                          €{property.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCarousel;