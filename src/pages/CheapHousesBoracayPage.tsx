// src/pages/BoracayHomesForSalePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import PropertyCard from '../components/property/PropertyCard';
import Accordion from '../components/ui/Accordion';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import { Helmet } from 'react-helmet-async';
import { Home, MapPin, DollarSign, Users, MessageCircle, Phone, HelpCircle, TrendingUp, Building, Landmark, Trophy, BarChart2 } from 'lucide-react'; // Added Trophy, BarChart2, TrendingUp
import MiniInvestmentCalculatorForm from '../components/shared/MiniInvestmentCalculatorForm';

const BoracayHomesForSalePage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Filter states
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  const currencies = [
    { value: 'EUR', label: 'EUR', symbol: '€', rate: 1 },
    { value: 'USD', label: 'USD', symbol: '$', rate: 1.08 },
    { value: 'PHP', label: 'PHP', symbol: '₱', rate: 60.50 },
    { value: 'AUD', label: 'AUD', symbol: 'A$', rate: 1.65 },
    { value: 'RUB', label: 'RUB', symbol: '₽', rate: 98.50 },
    { value: 'KRW', label: 'KRW', symbol: '₩', rate: 1450.25 },
    { value: 'CNY', label: 'CNY', symbol: '¥', rate: 7.85 }
  ];

  useEffect(() => {
    setIsVisible(true);
    loadProperties();
  }, []);

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
      { threshold: 0.2 }
    );

    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards((prev) => new Set([...prev, index]));
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

  const loadProperties = async (resetFilters = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from('properties')
        .select('*')
        .eq('is_for_sale', true)
        .in('property_type', ['house', 'villa', 'apartment', 'studio']); // Include home-type properties

      if (!resetFilters) {
        if (propertyType) {
          query = query.eq('property_type', propertyType.toLowerCase());
        }
        if (location) {
          query = query.eq('location', location);
        }
        if (bedrooms) {
          query = query.eq('bedrooms', parseInt(bedrooms));
        }
        if (minPrice) {
          query = query.gte('price', parseInt(minPrice));
        }
        if (maxPrice) {
          query = query.lte('price', parseInt(maxPrice));
        }
      }

      const { data, error } = await query
        .order('display_order', { ascending: true, nullsLast: true })
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadProperties(false);
  };

  const handleReset = () => {
    setPropertyType('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    loadProperties(true);
  };

  const faqItems = [
    {
      question: "What's the difference between house and home listings?",
      answer: "\"Homes\" can include both standalone houses and villas with land. They may also include duplex or shared-lot setups."
    },
    {
      question: "What's a 'house and lot'?",
      answer: "A house sold with land — sometimes fully titled, sometimes leased or tax-declared. We clarify each listing's legal status."
    },
    {
      question: "Can I use the home for Airbnb?",
      answer: "Yes — many buyers rent their Boracay homes part-time. We can advise on legal setup and connect you with local managers."
    },
    {
      question: "Are these listings ready to move in?",
      answer: "Some are fully furnished and turnkey. Others may need renovation — ask us for inspection info."
    },
    {
      question: "Do you offer off-market homes?",
      answer: "Yes — we maintain a private list. Send us your budget or area and we'll match you with hidden options."
    }
  ];

  // JSON-LD Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Boracay.house",
    "url": "https://boracay.house",
    "logo": "https://boracay.house/logo.png",
    "description": "Boracay homes for sale - villas, houses, apartments and residential properties",
    "areaServed": {
      "@type": "Place",
      "name": "Boracay Island, Philippines"
    },
    "serviceType": "Real Estate Sales"
  };

  return (
    <>
      <SEO
        title="Boracay Homes for Sale – Beachfront & Residential (2025)"
        description="Browse homes for sale in Boracay: villas, houses, and house-and-lot listings from verified owners. Explore beachfront and residential properties."
        keywords="boracay homes for sale, homes for sale in boracay, home for sale boracay, house and lot for sale boracay, beachfront homes for sale in boracay, homes for sale boracay philippines"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677233/38_marketing_copy_j9vspj.jpg"
        url="https://boracay.house/boracay-homes-for-sale"
        type="website"
        canonical="https://boracay.house/boracay-homes-for-sale"
        dynamicData={{
          og_title: "Boracay Homes for Sale – Beachfront & Residential (2025)",
          og_description: "Browse verified homes for sale in Boracay: villas, houses, and house-and-lot listings from owners. Beachfront and residential properties.",
          og_url: "https://boracay.house/boracay-homes-for-sale",
          og_type: "website",
          og_image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677233/38_marketing_copy_j9vspj.jpg"
        }}
      />
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="h-32" />
        
        {/* Hero Section */}
        <div className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 w-full h-full animate-hero"
              style={{
                backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1748367634/482324584_1130259389112739_6638706798572273322_n_hihhyf.jpg)',
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
              className="max-w-4xl mx-auto text-center"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 1s ease-out'
              }}
            >
              <h1 className="text-5xl font-bold text-white mb-6">
                Boracay Homes for Sale – Villas, Houses & More
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Discover your perfect home in paradise. From beachfront villas to quiet residential properties.
              </p>
            </div>
          </Container>
        </div>

        {/* Search Filters Section */}
        <section className="py-8 bg-gray-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Find Your Perfect Home</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">All Home Types</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="apartment">Apartment</option>
                    <option value="studio">Studio</option>
                  </select>

                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">All Locations</option>
                    <option value="Diniwid">Diniwid</option>
                    <option value="Monaco Suites">Monaco Suites</option>
                    <option value="Bulabog">Bulabog</option>
                  </select>

                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">All Bedrooms</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4 Bedrooms</option>
                    <option value="5">5+ Bedrooms</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select
                    value={`${minPrice}-${maxPrice}`}
                    onChange={(e) => {
                      const [min, max] = e.target.value.split('-');
                      setMinPrice(min);
                      setMaxPrice(max);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="-">All Price Ranges</option>
                    <option value="50000-100000">€50,000 - €100,000</option>
                    <option value="100000-200000">€100,000 - €200,000</option>
                    <option value="200000-300000">€200,000 - €300,000</option>
                    <option value="300000-500000">€300,000 - €500,000</option>
                    <option value="500000-1000000">€500,000 - €1,000,000</option>
                    <option value="1000000-">€1,000,000+</option>
                  </select>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSearch}
                      className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      Search Homes
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Intro Section */}
        <section className="py-16 bg-white">
          <Container>
            <div 
              className="max-w-4xl mx-auto text-center"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 1s ease-out',
                transitionDelay: '0.3s'
              }}
            >
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <p className="text-xl mb-6">
                  Looking for a <strong>home in Boracay</strong>? This page lists <strong>beachfront villas, quiet hillside homes, and house-and-lot properties</strong> available across the island.
                </p>
                <p className="text-lg">
                  All listings are <strong>direct from owners and verified by our local team</strong>. Whether you're buying to live, rent, or invest — we're here to help you every step of the way.
                </p>
              </div>
              <div className="w-24 h-1 bg-amber-500 mx-auto mt-8" />
            </div>
          </Container>
        </section>

        {/* Properties Listing Section */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Boracay Homes for Sale</h2>
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
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : properties.length > 0 ? (
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
            ) : (
              <div className="text-center py-16">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Homes Found</h3>
                <p className="text-gray-600">
                  We're currently updating our home listings. Please check back soon or contact us for off-market properties.
                </p>
              </div>
            )}
          </Container>
        </section>

        {/* Mini Investment Calculator Form */}
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

        {/* Home Types Section */}
        <section 
          ref={el => sectionRefs.current['home-types'] = el}
          data-section-id="home-types"
          className="py-24 bg-white"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['home-types'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['home-types'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">Types of Boracay Homes for Sale</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  <strong>Boracay homes offer diverse living options</strong> from luxury beachfront villas to cozy residential houses. Find the perfect home that matches your lifestyle and investment goals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-amber-50 p-8 rounded-xl shadow-lg">
                  <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Building className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Beachfront Homes</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Luxury Villas</strong> - Ocean view properties</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Beach Houses</strong> - Direct beach access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Waterfront Condos</strong> - Modern amenities</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Resort-Style Homes</strong> - Premium locations</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-8 rounded-xl shadow-lg">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Home className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Residential Homes</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>Family Houses</strong> - 2-4 bedroom homes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>Hillside Villas</strong> - Panoramic views</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>Garden Homes</strong> - Private outdoor space</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>Duplex Units</strong> - Shared-lot properties</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 p-8 rounded-xl shadow-lg">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Investment Homes</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>Rental-Ready Homes</strong> - Furnished properties</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>Airbnb Properties</strong> - High occupancy areas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>Fixer-Uppers</strong> - Renovation opportunities</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>Multi-Unit Properties</strong> - Multiple income streams</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Landmark className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">House and Lot Packages</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Many <strong>homes for sale in Boracay</strong> come as complete <strong>house and lot packages</strong>. These may be fully titled, leased, or tax-declared properties. We provide full transparency on the legal status of each listing and connect you with trusted legal partners for due diligence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* FAQ Section */}
        <section 
          ref={el => sectionRefs.current['faq'] = el}
          data-section-id="faq"
          className="py-24 bg-gray-50"
        >
          <Container>
            <div 
              className="max-w-4xl mx-auto"
              style={{
                opacity: sectionsVisible['faq'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['faq'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">Frequently Asked Questions</h2>
                <p className="text-lg text-gray-600">
                  Get answers to common questions about buying homes in Boracay
                </p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <Accordion 
                    key={index}
                    title={item.question}
                    icon={<HelpCircle className="w-5 h-5" />}
                    defaultOpen={index === 0}
                  >
                    <p className="text-gray-700">{item.answer}</p>
                  </Accordion>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section 
          ref={el => sectionRefs.current['cta'] = el}
          data-section-id="cta"
          className="py-24 bg-white"
        >
          <Container>
            <div 
              className="max-w-4xl mx-auto text-center"
              style={{
                opacity: sectionsVisible['cta'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['cta'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Home className="w-8 h-8 text-amber-600" />
                  <h2 className="text-3xl font-bold text-gray-900">🏠 Not sure what kind of home fits your needs?</h2>
                </div>
                
                <p className="text-xl text-gray-600 mb-8">
                  We help buyers find the right match — from <strong>beachfront villas to quiet residential homes</strong>.<br />
                  Send us your preferences, and we\'ll show you what\'s available.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => navigate('/contact')}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg transition-colors duration-300 text-lg font-medium"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contact Us
                  </button>
                  
                  <a
                    href="https://wa.me/639617928834?text=Hello! I'm looking for homes for sale in Boracay. Can you help me find the perfect property?"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg transition-colors duration-300 text-lg font-medium"
                  >
                    <Phone className="w-5 h-5" />
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Hidden SEO text */}
        <div className="sr-only">
          Boracay homes for sale including homes for sale in Boracay, house and lot for sale in Boracay, beachfront homes for sale in Boracay, boracay villas for sale, and quiet residential homes. Find your Boracay home today.
        </div>
      </div>
    </>
  );
};

export default BoracayHomesForSalePage;
