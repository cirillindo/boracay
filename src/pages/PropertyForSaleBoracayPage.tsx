import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import PropertyCard from '../components/property/PropertyCard';
import Accordion from '../components/ui/Accordion';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import { Helmet } from 'react-helmet-async';
import { Home, MapPin, DollarSign, Users, MessageCircle, Phone, HelpCircle, TrendingUp, Building, Landmark, Search, RotateCcw } from 'lucide-react';

const PropertyForSaleBoracayPage: React.FC = () => {
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
  const [propertyCategory, setPropertyCategory] = useState('');

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
        .not('property_type', 'ilike', '%house%'); // Exclude house-type properties

      if (!resetFilters) {
        if (propertyType) {
          query = query.eq('property_type', propertyType.toLowerCase());
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
        if (propertyCategory) {
          query = query.eq('property_category', propertyCategory);
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
    setPropertyCategory('');
    loadProperties(true);
  };

  const faqItems = [
    {
      question: "Can foreigners buy land in Boracay?",
      answer: "Not directly — but you can lease land long-term (up to 50 years + renewal) or buy through a Philippine-registered corporation."
    },
    {
      question: "Is it safe to buy raw land?",
      answer: "Only if you verify the title and zoning. We help with due diligence and connect you with trusted local lawyers."
    },
    {
      question: "Are condos available for foreigners?",
      answer: "Yes, up to 40% of any condo project may be owned by foreigners. Condos are the most common entry point."
    },
    {
      question: "Can I build a rental property or Airbnb?",
      answer: "In many areas, yes — but zoning rules apply. Ask us for help reviewing local laws."
    },
    {
      question: "How do I know if a property is clean title?",
      answer: "We verify every listing and provide title status, tax documents, and property history upon request."
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
    "description": "Property for sale in Boracay - land, condos, apartments and commercial properties",
    "areaServed": {
      "@type": "Place",
      "name": "Boracay Island, Philippines"
    },
    "serviceType": "Real Estate Sales"
  };

  return (
    <>
      <SEO
        title="Property for Sale in Boracay – Land, Condos & Investment Lots (2025)"
        description="Browse available property for sale in Boracay: raw land, apartments, condos, and commercial spaces. Buy direct from owners and developers."
        keywords="property for sale boracay, boracay property for sale, lot for sale in boracay, boracay land for sale, condo for sale in boracay, boracay apartment for sale, boracay commercial property"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677233/38_marketing_copy_j9vspj.jpg"
        url="https://boracay.house/property-for-sale-boracay"
        type="website"
        canonical="https://boracay.house/property-for-sale-boracay"
        dynamicData={{
          og_title: "Property for Sale in Boracay – Land, Condos & Investment Lots (2025)",
          og_description: "Browse verified property for sale in Boracay: raw land, apartments, condos, and commercial spaces. Buy direct from owners and developers.",
          og_url: "https://boracay.house/property-for-sale-boracay",
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
              className="max-w-4xl mx-auto text-center"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 1s ease-out'
              }}
            >
              <h1 className="text-5xl font-bold text-white mb-6">
                Property for Sale in Boracay – Land, Condos & More
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Discover investment opportunities across Boracay: raw land, condos, apartments, and commercial properties.
              </p>
            </div>
          </Container>
        </div>

        {/* Search Filters Section */}
        <section className="py-8 bg-gray-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Filter Properties</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">All Property Types</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="lot">Lot</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
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
                    value={propertyCategory}
                    onChange={(e) => setPropertyCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Residential and Commercial">Residential & Commercial</option>
                    <option value="Lot">Lot</option>
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
                      Search
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
                  Looking to buy <strong>property in Boracay</strong>? This page lists all available <strong>land, lots, apartments, condos, and investment properties</strong> on the island.
                </p>
                <p className="text-lg">
                  From hillside plots with panoramic views to income-ready <strong>condos near White Beach</strong>, we cover the full range. Listings are verified and direct — no agent markup. Our team assists with <strong>legal checks and local advice</strong>.
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
              <h2 className="text-3xl font-bold text-gray-900">Boracay Property for Sale</h2>
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
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600">
                  We're currently updating our property listings. Please check back soon or contact us for off-market opportunities.
                </p>
              </div>
            )}
          </Container>
        </section>

        {/* Property Types Section */}
        <section 
          ref={el => sectionRefs.current['property-types'] = el}
          data-section-id="property-types"
          className="py-24 bg-white"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['property-types'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['property-types'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">Types of Boracay Property for Sale</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  <strong>Boracay offers diverse investment opportunities</strong> beyond traditional homes. From raw land for development to income-generating condos, find the right property type for your goals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-amber-50 p-8 rounded-xl shadow-lg">
                  <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Building className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Land & Lots</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Raw Land</strong> - Development opportunities</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Residential Lots</strong> - Build your dream home</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Commercial Lots</strong> - Business locations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Beachfront Plots</strong> - Premium locations</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-8 rounded-xl shadow-lg">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Home className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Condos & Apartments</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>Studio Units</strong> - Perfect for Airbnb</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>1-2 Bedroom Condos</strong> - Investment ready</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>Penthouse Units</strong> - Luxury living</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>Apartment Buildings</strong> - Multi-unit investments</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 p-8 rounded-xl shadow-lg">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Commercial Property</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>Retail Spaces</strong> - D'Mall area shops</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>Restaurant Buildings</strong> - Food & beverage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>Hotel Properties</strong> - Hospitality investments</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>Mixed-Use Buildings</strong> - Residential + commercial</span>
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
                    <h3 className="text-xl font-bold mb-3">Investment Opportunities</h3>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Boracay property for sale</strong> offers excellent ROI potential. <strong>Lot for sale in Boracay</strong> can be developed for rental income, while <strong>condo for sale in Boracay</strong> provides immediate rental opportunities. We help you evaluate each opportunity based on location, zoning, and income potential.
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
                  Get answers to common questions about buying property in Boracay
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
                  <Building className="w-8 h-8 text-amber-600" />
                  <h2 className="text-3xl font-bold text-gray-900">🏗️ Looking for investment or development property?</h2>
                </div>
                
                <p className="text-xl text-gray-600 mb-8">
                  We can show you <strong>off-market land deals</strong> and connect you with local architects and builders.<br />
                  Tell us what you're looking for — and we\'ll send you options.
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
                    href="https://wa.me/639617928834?text=Hello! I'm looking for investment property for sale in Boracay. Can you help me find land, condos, or commercial opportunities?"
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
          Property for sale in Boracay including boracay land for sale, lot for sale in boracay, condo for sale in boracay, apartment for sale in boracay, boracay commercial property, and beachfront investment opportunities. Buy Boracay property direct from verified owners.
        </div>
      </div>
    </>
  );
};

export default PropertyForSaleBoracayPage;