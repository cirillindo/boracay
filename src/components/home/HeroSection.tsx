import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { Search } from 'lucide-react';
import { priceRanges, bedroomOptions } from '../../data/areas';
import ScrollingBanner from '../layout/ScrollingBanner';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedBedrooms, setSelectedBedrooms] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange.split('-');
      params.append('minPrice', min);
      params.append('maxPrice', max);
    }
    
    if (selectedBedrooms) {
      params.append('bedrooms', selectedBedrooms);
    }

    navigate(`/for-sale?${params.toString()}`);
  };

  return (
    <div className="relative w-full min-h-[90vh] flex items-start justify-center overflow-hidden bg-red-500">
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 w-full h-full animate-hero"
          style={{
            backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1748376631/properties/yqbxcbbymtplxjbjswku.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'transform'
          }}
        >
          <img 
            src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1748376631/properties/yqbxcbbymtplxjbjswku.png"
            alt="Boracay houses and villas for sale"
            width={1920}
            height={1080}
            fetchpriority="high" 
            decoding="async"
            className="w-full h-full object-cover opacity-0"
          />
        </div>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="theater-curtain" />

      <ScrollingBanner />

      <Container className="relative z-10 pt-[40vh]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Own a Boracay Studio – Starting at <span className="text-[6rem] font-bold inline-block animate-price-pulse">$80K</span>
          </h1>
          <p className="text-xl text-gray-200 mb-12">
            Sun, sand, and your new home
          </p>

          <div className="relative">
            <div className="search-bar-content bg-white/10 backdrop-blur-md p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full h-[42px] px-3 bg-white/80 border-0 rounded text-gray-900 font-medium text-sm"
                >
                  <option value="">PRICE RANGE</option>
                  {priceRanges.map(range => (
                    <option key={range.min} value={`${range.min}-${range.max}`}>
                      {range.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBedrooms}
                  onChange={(e) => setSelectedBedrooms(e.target.value)}
                  className="w-full h-[42px] px-3 bg-white/80 border-0 rounded text-gray-900 font-medium text-sm"
                >
                  <option value="">BEDROOMS</option>
                  {bedroomOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button 
                className="w-full h-[42px] bg-[#74bfab] hover:bg-[#5aa893] text-white font-medium flex items-center justify-center gap-2"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4" />
                FIND VILLAS FOR SALE
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HeroSection;
