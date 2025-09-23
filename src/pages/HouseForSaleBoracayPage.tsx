import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import PropertyCard from '../components/property/PropertyCard';
import Accordion from '../components/ui/Accordion';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import { Helmet } from 'react-helmet-async';
import { Home, MapPin, DollarSign, Users, MessageCircle, Phone, HelpCircle, TrendingUp, Building, Landmark } from 'lucide-react';

const HouseForSaleBoracayPage: React.FC = () => {
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

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_for_sale', true)
        .in('property_type', ['house', 'villa'])
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

  const faqItems = [
    {
      question: "Can I buy a house in Boracay as a foreigner?",
     answer: "Foreigners can own buildings (like houses or villas) but not the land. Most buyers looking for a house in Boracay use long-term leases or set up a Philippine-registered company."
    },
    {
      question: "What is included in a 'house and lot' listing?",
     answer: "A house and lot for sale in Boracay usually includes a titled structure (house) and lease or tax-declared land. Ask us for title details — we verify each case."
    },
    {
      question: "Can I rent the house out?",
     answer: "Yes. Many owners of houses in Boracay use their properties as vacation rentals. We can connect you with local managers."
    },
    {
      question: "Where are houses located?",
      answer: "Common areas include White Beach (Station 1–3), Diniwid, Bulabog, and the hills above Yapak."
    },
    {
      question: "Can you help with paperwork?",
      answer: "Yes — we work with legal experts to ensure title clarity, lease security, and proper due diligence."
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
    "description": "Houses for sale in Boracay - villas, homes and house-and-lot listings",
    "areaServed": {
      "@type": "Place",
      "name": "Boracay Island, Philippines"
    },
    "serviceType": "Real Estate Sales"
  };

  return (
    <>
      <SEO
        title="Houses for Sale in Boracay – Villas, Homes & Lots (2025)"
        description="Discover houses for sale in Boracay: beachfront villas, family homes, and house-and-lot listings. View available properties and book a tour."
        keywords="house for sale boracay, boracay house for sale, boracay houses for sale, house and lot for sale in boracay, house in boracay, houses for sale boracay philippines, beachfront house for sale in boracay, boracay homes for sale"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677233/38_marketing_copy_j9vspj.jpg"
        url="https://boracay.house/house-for-sale-boracay"
        type="website"
        canonical="https://boracay.house/house-for-sale-boracay"
        dynamicData={{
          og_title: "Houses for Sale in Boracay – Villas, Homes & Lots (2025)",
          og_description: "Browse verified houses for sale in Boracay, Philippines. Find your beachfront home, hillside villa or house-and-lot deal. No agent fees.",
          og_url: "https://boracay.house/house-for-sale-boracay",
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
                House for Sale Boracay – Find Your Dream Home in Paradise
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Discover your perfect boracay house for sale. From beachfront villas to family homes.
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
                  Looking for a <strong>house in Boracay</strong>? Whether you're dreaming of a <strong>beachfront house for sale in Boracay</strong> or a quiet <strong>family home near Diniwid</strong>, this page features our most up-to-date <strong>boracay house for sale</strong> listings across the island.
                </p>
                <p className="text-lg">
                  All <strong>boracay homes for sale</strong> are verified, and we work directly with the owners or developers. Our team is based on the island and ready to guide you through the legal and buying process for any <strong>house and lot for sale in Boracay</strong>.
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
              <h2 className="text-3xl font-bold text-gray-900">Boracay Houses for Sale</h2>
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
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Houses Found</h3>
                <p className="text-gray-600">
                  We're currently updating our house listings. Please check back soon or contact us for off-market properties.
                </p>
              </div>
            )}
          </Container>
        </section>

        {/* Why Buy a House in Boracay Section */}
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
                <h2 className="text-4xl font-bold mb-6">Why Buy a House in Boracay?</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  <strong>Boracay houses offer the perfect blend of investment potential and lifestyle benefits.</strong> Whether you're looking for a vacation home, rental property, or permanent residence, houses in Boracay provide excellent value and growth potential.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-amber-50 p-8 rounded-xl shadow-lg">
                  <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Building className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">House Types Available</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Beachfront Villas</strong> - Luxury homes with ocean access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Family Homes</strong> - 2-4 bedroom houses with gardens</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>House and Lot</strong> - Complete packages with land</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span><strong>Vacation Rentals</strong> - Income-generating properties</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-8 rounded-xl shadow-lg">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Prime House Locations</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>White Beach</strong> - Station 1, 2 & 3 areas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>Diniwid</strong> - Peaceful residential area</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>Bulabog</strong> - Water sports community</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span><strong>Yapak Hills</strong> - Elevated with views</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 p-8 rounded-xl shadow-lg">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">House Price Ranges</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>₱15M - ₱25M</strong> - Simple family homes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>₱25M - ₱40M</strong> - Modern houses with amenities</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>₱40M - ₱60M+</strong> - Luxury beachfront villas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>House & Lot</strong> - Complete ownership packages</span>
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
                    <h3 className="text-xl font-bold mb-3">House Ownership Structure</h3>
                    <p className="text-gray-700 leading-relaxed">
                      You can <strong>lease land long-term (50+50 years)</strong> and own the house structure, or <strong>buy the complete house and lot via a registered Philippine company</strong>. We'll help you understand the best option for your situation and connect you with trusted legal partners for a smooth transaction.
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
                  Get answers to common questions about buying houses in Boracay
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
                  <Home className="w-8 h-8 text-amber-600" />
                  <h2 className="text-3xl font-bold text-gray-900">🏡 Not seeing the house you want?</h2>
                </div>
                
                <p className="text-xl text-gray-600 mb-8">
                  We often have <strong>off-market listings</strong> or early-stage properties.<br />
                  Tell us what you're looking for — we\'ll help you find it.
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
                    href="https://wa.me/639617928834?text=Hello! I'm looking for a house for sale in Boracay. Can you help me find available properties?"
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
          Houses for sale in Boracay including beachfront house for sale in Boracay, boracay house for sale, house and lot for sale in Boracay, houses for sale Boracay Philippines, boracay homes for sale, and quiet family homes near Diniwid or Bulabog.
        </div>
      </div>
    </>
  );
};

export default HouseForSaleBoracayPage;