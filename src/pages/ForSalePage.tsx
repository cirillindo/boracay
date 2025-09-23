// src/pages/ForSalePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import { Search, RotateCcw, Mail, DollarSign, Landmark, Users, CheckCircle, Info, Trophy, BarChart2, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PropertyCard from '../components/property/PropertyCard';
import BeachesSection from '../components/property/BeachesSection';
import Blog from '../components/home/Blog';
import FAQSection from '../components/home/FAQSection';
import type { Property } from '../types';
import Button from '../components/ui/Button';
import SEO from '../components/SEO';
import areas from '../data/areas';
import MiniInvestmentCalculatorForm from '../components/shared/MiniInvestmentCalculatorForm';
import Accordion from '../components/ui/Accordion'; // Import Accordion for FAQ-like sections

const ForSalePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [furnishStatus, setFurnishStatus] = useState(searchParams.get('furnishStatus') || '');
  const [propertyCategory, setPropertyCategory] = useState(searchParams.get('category') || '');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [sortOption, setSortOption] = useState('latest');
  const [isVisible, setIsVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [controlsVisible, setControlsVisible] = useState(false);
  const propertiesListRef = useRef<HTMLDivElement>(null);

  // Refs for new sections to trigger animations
  const whyInvestRef = useRef<HTMLDivElement>(null);
  const buyingProcessRef = useRef<HTMLDivElement>(null);
  const popularLocationsRef = useRef<HTMLDivElement>(null);
  const transparencyRef = useRef<HTMLDivElement>(null);

  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({});
  const sectionObserverRefs = useRef<Record<string, HTMLDivElement | null>>({});


  const currencies = [
    { value: 'EUR', label: 'EUR', symbol: '€', rate: 1 },
    { value: 'USD', label: 'USD', symbol: '$', rate: 1.08 },
    { value: 'PHP', label: 'PHP', symbol: '₱', rate: 60.50 },
    { value: 'AUD', label: 'AUD', symbol: 'A$', rate: 1.65 },
    { value: 'RUB', label: 'RUB', symbol: '₽', rate: 98.50 },
    { value: 'KRW', label: '₩', rate: 1450.25 },
    { value: 'CNY', label: 'CNY', symbol: '¥', rate: 7.85 }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest Properties' },
    { value: 'oldest', label: 'Oldest Properties' },
    { value: 'highest', label: 'Highest Price' },
    { value: 'lowest', label: 'Lowest Price' }
  ];

  useEffect(() => {
    setIsVisible(true);
    setTitleVisible(true);
    setSearchVisible(true);
    setControlsVisible(true);
    loadProperties();
  }, [sortOption]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.getAttribute('data-index')) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            if (entry.isIntersecting) {
              setVisibleCards((prev) => new Set([...prev, index]));
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    document.querySelectorAll('.property-card-container').forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [properties]);

  // Observer for new content sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-section-id');
          if (id) {
            setSectionsVisible(prev => ({
              ...prev,
              [id]: entry.isIntersecting
            }));
          }
        });
      },
      { threshold: 0.2 } // Trigger when 20% of the section is visible
    );

    Object.values(sectionObserverRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);


  const loadProperties = async (resetFilters = false) => {
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('is_for_sale', true);

      if (!resetFilters) {
        if (propertyType) {
          query = query.eq('property_type', propertyType.toLowerCase());
        }
        if (bedrooms) {
          query = query.eq('bedrooms', parseInt(bedrooms));
        }
        if (location) {
          query = query.eq('location', location);
        }
        if (minPrice) {
          query = query.gte('price', parseInt(minPrice));
        }
        if (maxPrice) {
          query = query.lte('price', parseInt(maxPrice));
        }
        if (furnishStatus) {
          query = query.eq('furnish_status', furnishStatus);
        }
        if (propertyCategory) {
          query = query.eq('property_category', propertyCategory);
        }
      }

      // First sort by display_order (nulls last), then apply the user-selected sort option
      query = query.order('display_order', { ascending: true, nullsLast: true });

      // Apply secondary sorting based on user selection
      switch (sortOption) {
        case 'latest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('price', { ascending: false });
          break;
        case 'lowest':
          query = query.order('price', { ascending: true });
          break;
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    loadProperties(false);
    setTimeout(() => {
      propertiesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleReset = () => {
    setPropertyType('');
    setBedrooms('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setFurnishStatus('');
    setPropertyCategory('');
    setLoading(true);
    loadProperties(true);
  };

  const handleSendToAgent = () => {
    const propertyLinks = properties
      .map(p => `• ${p.title} - €${p.price.toLocaleString()} - ${window.location.origin}/${p.slug}`)
      .join('\n');

    const mailtoLink = `mailto:info@boracay.house?subject=Interested in Properties&body=I am interested in the following properties:%0D%0A%0D%0A${encodeURIComponent(propertyLinks)}`;
    
    window.location.href = mailtoLink;
  };

  return (
    <>
      <SEO
        title="Boracay Properties for Sale – Villas, Houses, Condos & Land Listings"
        description="Discover exclusive properties for sale in Boracay. Browse beachfront villas, modern houses, luxury condos, and prime land plots. Find your dream investment with transparent listings, local expertise, and no hidden fees. Explore opportunities in Diniwid, Station 1, Bulabog, and more."
        keywords="Boracay property for sale, real estate Boracay, villas for sale Boracay, houses for sale Boracay, condos for sale Boracay, land for sale Boracay, invest in Boracay, Boracay property listings, property near White Beach, titled land Boracay, Diniwid property, Station 1 real estate"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677233/38_marketing_copy_j9vspj.jpg"
        url="https://boracay.house/for-sale"
        type="website"
        canonical="https://boracay.house/for-sale"
        dynamicData={{
          og_title: "Boracay Properties for Sale – Villas, Houses, Condos & Land Listings",
          og_description: "Discover exclusive properties for sale in Boracay. Browse beachfront villas, modern houses, luxury condos, and prime land plots. Find your dream investment with transparent listings, local expertise, and no hidden fees. Explore opportunities in Diniwid, Station 1, Bulabog, and more.",
          og_image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677233/38_marketing_copy_j9vspj.jpg",
          og_url: "https://boracay.house/for-sale",
          og_type: "website"
        }}
      />

      <div className="min-h-screen bg-white">
        <div className="h-32" />
        
        <div className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 w-full h-full animate-hero"
              style={{
                backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1748342160/Screenshot_2025-05-27_at_12.35.43_PM_tnz2rh.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                willChange: 'transform'
              }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="theater-curtain" />

          <Container className="relative z-10">
            <div 
              className={`w-full max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-3 rounded-lg transition-all duration-1000 transform ${
                titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
              }`}
            >
              <div className="text-center mb-6">
                <h1 className="text-5xl font-bold text-white mb-2">
                  Boracay Properties for Sale: Your Island Investment Starts Here
                </h1>
                <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                  Discover your dream property in paradise. Explore our exclusive collection of villas, houses, condos, and land plots in Boracay's most desirable locations.
                </p>
              </div>

              <div className="search-bar-content">
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full h-[42px] px-3 bg-white/80 border-0 rounded text-gray-900 font-medium text-sm"
                  >
                    <option value="">PROPERTY TYPE</option>
                    <option value="villa">Villa</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="lot">Lot</option>
                    <option value="condo">Condo</option>
                    <option value="studio">Studio</option>
                  </select>

                  <select
                    value={propertyCategory}
                    onChange={(e) => setPropertyCategory(e.target.value)}
                    className="w-full h-[42px] px-3 bg-white/80 border-0 rounded text-gray-900 font-medium text-sm"
                  >
                    <option value="">CATEGORY</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Residential and Commercial">Residential & Commercial</option>
                    <option value="Lot">Lot</option>
                  </select>

                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-[42px] px-3 bg-white/80 border-0 rounded text-gray-900 font-medium text-sm"
                  >
                    <option value="">LOCATION</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-2">
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full h-[42px] px-3 bg-white/80 border-0 rounded text-gray-900 font-medium text-sm"
                  >
                    <option value="">BEDROOMS</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4 Bedrooms</option>
                    <option value="5">5+ Bedrooms</option>
                  </select>

                  <select
                    value={furnishStatus}
                    onChange={(e) => setFurnishStatus(e.target.value)}
                    className="w-full h-[42px] px-3 bg-white/80 border-0 rounded text-gray-900 font-medium text-sm"
                  >
                    <option value="">FURNISH STATUS</option>
                    <option value="Furnished">Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                  </select>

                  <select
                    value={`${minPrice}-${maxPrice}`}
                    onChange={(e) => {
                      const [min, max] = e.target.value.split('-');
                      setMinPrice(min);
                      setMaxPrice(max);
                    }}
                    className="w-full h-[42px] px-3 bg-white/80 border-0 rounded text-gray-900 font-medium text-sm"
                  >
                    <option value="-">PRICE RANGE</option>
                    <option value="50000-100000">€50,000 - €100,000</option>
                    <option value="100000-200000">€100,000 - €200,000</option>
                    <option value="200000-300000">€200,000 - €300,000</option>
                    <option value="300000-500000">€300,000 - €500,000</option>
                    <option value="500000-1000000">€500,000 - €1,000,000</option>
                    <option value="1000000-">€1,000,000+</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSearch}
                    className="flex-1 h-[42px] bg-amber-600 hover:bg-amber-700 text-white font-medium rounded flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <Search className="w-4 h-4" />
                    FIND PROPERTIES
                  </button>
                  <button
                    onClick={handleReset}
                    className="h-[42px] px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </Container>
        </div>

        <section className="py-16 bg-white">
          <Container>
            <div
              className="max-w-3xl mx-auto text-center"
              style={{
                opacity: controlsVisible ? 1 : 0,
                transform: `translateY(${controlsVisible ? '0' : '20px'})`,
                transition: 'all 1s ease-out',
                transitionDelay: '0.3s'
              }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Villas, Houses, Condos & Land for Sale in Boracay
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Welcome to your premier destination for Boracay real estate. We offer a curated selection of properties that provide genuine value and income potential. Unlike typical agencies, we focus on transparent listings, clean titles, and properties located just minutes from the beach – avoiding the legal complexities and inflated prices of beachfront land.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mt-4">
                Whether you're an astute investor seeking high rental yields, a retiree dreaming of a peaceful island home, or a local buyer looking for a secure asset, our listings are handpicked to meet diverse needs. Each property comes with the promise of local support and a straightforward buying experience.
              </p>
              <div
                className="w-24 h-1 bg-amber-500 mx-auto mt-8"
                style={{
                  transform: `scaleX(${controlsVisible ? 1 : 0})`,
                  transition: 'transform 1.5s ease-out',
                  transitionDelay: '0.8s'
                }}
              />
            </div>
          </Container>
        </section>

        <Container className="py-16">
          <div 
            className="flex justify-end items-center gap-8 mb-8"
            style={{
              opacity: controlsVisible ? 1 : 0,
              transform: `translateY(${controlsVisible ? '0' : '20px'})`,
              transition: 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Currency:</span>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {currencies.map(currency => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600">Sort by:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div ref={propertiesListRef}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : properties.length > 0 ? (
              <>
                <div className="flex justify-end mb-6">
                  <Button
                    onClick={handleSendToAgent}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Send to Agent
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {properties.map((property, index) => (
                    <div 
                      key={property.id}
                      data-index={index}
                      className="property-card-container"
                      style={{
                        opacity: visibleCards.has(index) ? 1 : 0,
                        transform: `perspective(1000px) ${visibleCards.has(index) 
                          ? 'rotateY(0) translateY(0)' 
                          : 'rotateY(-45deg) translateY(100px)'}`,
                        transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.15}s`
                      }}
                    >
                      <PropertyCard 
                        property={{
                          ...property,
                          selectedCurrency
                        }}
                        displayAsSale={true}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600">
                  We couldn't find any properties matching your criteria. Please try adjusting your search filters.
                </p>
              </div>
            )}
          </div>
        </Container>

        <MiniInvestmentCalculatorForm />

        {/* NEW: Dream Bid Section */}
        <section className="py-20 bg-gradient-to-br from-amber-50 to-white">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Place Your Dream Bid
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
                Found a property you love but it's outside your budget? Place a non-binding "Dream Bid" and get notified if it matches your target price.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Non-Binding Offers</h3>
                  <p className="text-gray-600">
                    Submit your ideal price without any commitment.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Price Match Alerts</h3>
                  <p className="text-gray-600">
                    We'll notify you if a property's price drops to your bid.
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/dream-bid')}
                className="text-lg px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Place Your Dream Bid
              </Button>
            </div>
          </Container>
        </section>
        {/* END NEW: Dream Bid Section */}

        {/* NEW: Property Stats Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Unlock Boracay's Real Estate Secrets
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
                Curious about property values, market trends, or how your dream bid compares? Dive into our comprehensive statistics page for data-driven insights.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Market Trends</h3>
                  <p className="text-gray-600">
                    See average prices per square meter for built and land areas.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Dream Bid Insights</h3>
                  <p className="text-gray-600">
                    Analyze average bids, median bids, and bid distribution for properties.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Value Comparison</h3>
                  <p className="text-gray-600">
                    Understand how property size affects its value per square meter.
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/property-stats')}
                className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Explore Property Stats
              </Button>
            </div>
          </Container>
        </section>
        {/* END NEW: Property Stats Section */}

        <FAQSection vantaEffect="birds" />
        <BeachesSection />
        <Blog />
      </div>
    </>
  );
};

export default ForSalePage;
