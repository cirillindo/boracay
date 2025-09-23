// src/pages/BoracayRealEstatePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import PropertyCard from '../components/property/PropertyCard';
import Accordion from '../components/ui/Accordion';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import { Helmet } from 'react-helmet-async';
import { Home, MapPin, DollarSign, Users, MessageCircle, Phone, HelpCircle, TrendingUp, Building, Landmark, Search, RotateCcw, Trophy, BarChart2 } from 'lucide-react'; // Added Trophy, BarChart2, TrendingUp
import MiniInvestmentCalculatorForm from '../components/shared/MiniInvestmentCalculatorForm'; // Ensure this is imported

const BoracayRealEstatePage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const currencies = [
    { value: 'EUR', label: 'EUR', symbol: '€', rate: 1 },
    { value: 'USD', label: 'USD', symbol: '$', rate: 1.08 },
    { value: 'PHP', label: 'PHP', symbol: '₱', rate: 60.50 },
    { value: 'AUD', label: 'AUD', symbol: 'A$', rate: 1.65 },
    { value: 'RUB', label: 'RUB', symbol: '₽', rate: 98.50 },
    { value: 'KRW', label: '₩', rate: 1450.25 },
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

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_for_sale', true)
        .order('display_order', { ascending: true, nullsLast: true })
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const faqItems = [
    {
      question: "Can foreigners buy property in Boracay?",
      answer: "Foreigners can own condos and buildings, but not land directly. Most investors lease land long-term or purchase through a Philippine-registered company."
    },
    {
      question: "What are the prices for houses or villas?",
      answer: "Simple apartments start at ₱5M. Houses near White Beach or Diniwid range from ₱15M to ₱60M+."
    },
    {
      question: "How can I view the property if I'm abroad?",
      answer: "We offer remote video tours and legal assistance for remote transactions."
    },
    {
      question: "Is there a property tax?",
      answer: "Yes, local real estate taxes apply. We'll guide you through all costs including transfer tax and title registration."
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
    "description": "Real estate listings in Boracay - houses, condos, villas and land for sale",
    "areaServed": {
      "@type": "Place",
      "name": "Boracay Island, Philippines"
    },
    "serviceType": "Real Estate Sales"
  };

  return (
    <>
      <SEO
        title="Boracay Real Estate for Sale – Houses, Lots & Condos (2025)"
        description="Explore real estate in Boracay: beachfront villas, homes for sale, condos, and lots. See properties available in Station 1, Bulabog, and Diniwid. Direct listings, no agent fees."
        keywords="boracay real estate, boracay property for sale, boracay house for sale, house for sale boracay, houses for sale in boracay, boracay homes for sale, real estate boracay philippines, house in boracay, boracay villas for sale, boracay apartments for sale, condo for sale in boracay, boracay house and lot for sale"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677233/38_marketing_copy_j9vspj.jpg"
        url="https://boracay.house/boracay-real-estate"
        type="website"
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
                Boracay Real Estate – Houses, Condos & Land for Sale in 2025
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Find your perfect property in paradise. From beachfront villas to investment condos.
              </p>
            </div>
          </Container>
        </div>

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
                  Looking for <strong>real estate in Boracay</strong>? Whether you're searching for a <strong>beachfront house</strong>, a quiet <strong>villa in Diniwid</strong>, or a <strong>lot to build your dream home</strong> — you're in the right place.
                </p>
                <p className="text-lg">
                  We list <strong>houses, condos, apartments, and land for sale</strong> directly from owners and developers. No hidden fees, no agents unless requested. Our team is based in Boracay and ready to assist with legal guidance, viewings, and paperwork.
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
              <h2 className="text-3xl font-bold text-gray-900">Featured Properties for Sale</h2>
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
                  We're currently updating our listings. Please check back soon.
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

        {/* Why Buy Property in Boracay Section */}
        <section 
          ref={el => sectionRefs.current['why-buy'] = el}
          data-section-id="why-buy"
          className="py-24 bg-white"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['why-buy'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['why-buy'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">Why Buy Property in Boracay?</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  <strong>Boracay is more than a beach — it's an investment.</strong> Property demand is strong from both locals and foreigners. Tourist foot traffic guarantees rental income potential, and the island is continuously growing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-amber-50 p-8 rounded-xl shadow-lg">
                  <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Building className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Property Types</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Homes</strong> - Single family houses and villas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Apartments</strong> - Studio to 3-bedroom units</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Villas</strong> - Luxury beachside properties</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Commercial</strong> - Business opportunities</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-8 rounded-xl shadow-lg">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Prime Locations</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>White Beach</strong> - Tourist hotspot</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>Bulabog</strong> - Water sports area</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>Diniwid</strong> - Peaceful residential</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>Yapak</strong> - Emerging development</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 p-8 rounded-xl shadow-lg">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Price Range</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>₱5M - ₱15M</strong> - Apartments & studios</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>₱15M - ₱30M</strong> - Houses & small villas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>₱30M - ₱60M+</strong> - Luxury villas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>Land lots</strong> - Various sizes available</span>
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
                    <h3 className="text-xl font-bold mb-3">Legal Structure</h3>
                    <p className="text-gray-700 leading-relaxed">
                      You can <strong>lease land long-term (50+50 years)</strong> or <strong>buy buildings via a registered company</strong>. We'll help you with the paperwork and connect you with trusted legal partners to ensure a smooth transaction.
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
                  Get answers to common questions about buying real estate in Boracay
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

        {/* Final CTA Section */}
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
                  <MessageCircle className="w-8 h-8 text-amber-600" />
                  <h2 className="text-3xl font-bold text-gray-900">Want to receive private or off-market listings?</h2>
                </div>
                
                <p className="text-xl text-gray-600 mb-8">
                  Message us directly on WhatsApp or send your requirements through the contact form. We'll help you find your place in Boracay.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/contact')}
                    className="flex items-center gap-2 text-lg px-8 py-4"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contact Us
                  </Button>
                  
                  <a
                    href="https://wa.me/639617928834?text=Hello! I'm interested in Boracay real estate listings. Can you help me find properties for sale?"
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
          Boracay real estate for sale including houses for sale in Boracay, boracay villas for sale, boracay apartments for sale, condo for sale in boracay, boracay house and lot for sale, real estate boracay philippines, house in boracay, boracay homes for sale, boracay property for sale.
        </div>
      </div>
    </>
  );
};

export default BoracayRealEstatePage;
