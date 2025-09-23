// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import PropertyListings from '../components/home/PropertyListings';
import Services from '../components/home/Services';
import Statistics from '../components/home/Statistics';
import InvestmentGuarantee from '../components/home/InvestmentGuarantee';
import GuestReviews from '../components/home/GuestReviews';
import TargetAudience from '../components/home/TargetAudience';
import Blog from '../components/home/Blog';
import BeachesSection from '../components/property/BeachesSection';
import FAQSection from '../components/home/FAQSection';
import Container from '../components/ui/Container';
import PropertyCard from '../components/property/PropertyCard';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import type { Property } from '../types';
import { ArrowRight, BarChart2, TrendingUp, DollarSign, MapPin } from 'lucide-react'; // Added BarChart2, TrendingUp, DollarSign, MapPin
import SEO from '../components/SEO';
import InvestmentCalculatorPromo from '../components/shared/InvestmentCalculatorPromo';

// OG Image constants - bump the version when you change the image
const OG_1200 = 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1755080886/Boracay.house_Home_gmkkd3.jpg';
const OG_2400 = 'https://res.cloudinary.com/dq3fftsfa/image/upload/c_fill,g_auto,f_auto,q_auto:good,w_2400,h_1260/v1755080886/Boracay.house_Home_gmkkd3.jpg';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadProperties();
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
        .order('created_at', { ascending: false })
        .limit(9);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Boracay.house",
    "url": "https://boracay.house",
    "logo": "https://boracay.house/logo.png",
    "areaServed": "Boracay, Malay, Aklan, Philippines",
    "sameAs": [
      "https://www.facebook.com/boracaybedandbreakfast",
      "https://www.instagram.com/ilawilawvillas/"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://boracay.house",
    "name": "Boracay.house",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://boracay.house/search?q={query}",
      "query-input": "required name=query"
    }
  };

  const itemListSchema = properties.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": properties.slice(0, 9).map((property, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://boracay.house/${property.slug}`,
      "name": property.title,
      "item": {
        "@type": "RealEstateListing",
        "name": property.title,
        "url": `https://boracay.house/${property.slug}`,
        "price": property.price,
        "priceCurrency": "EUR"
      }
    }))
  } : null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Do you sell beachfront property?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. We don't list direct beachfront properties. Instead, we focus on homes and land just minutes from the beach — where ownership is safer, returns are stronger, and paperwork is simpler."
        }
      },
      {
        "@type": "Question",
        "name": "Can foreigners buy property in Boracay?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Foreigners can't own land directly. Most either buy a condo or apartment, with individual ownership and shared title or Tax Declaration, or they form a Philippine corporation (minimum 60% Filipino ownership) to legally purchase land. We don't offer legal advice, but we can share real-world experience and connect you with trusted local contacts."
        }
      },
      {
        "@type": "Question",
        "name": "How fast can I list my property here?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If your paperwork is clean and you provide good photos and details, we can usually publish within 1–2 days. Send us an email with your info, and we'll help you get it live — no hidden fees, no delays."
        }
      }
    ]
  };

  return (
    <>
      <SEO
        title="Boracay Real Estate — Houses, Villas & Condos for Sale | Boracay.house"
        description="Buy a home in Boracay. Curated houses, villas, and condos with real photos, clean paperwork, and straight advice."
        keywords="boracay real estate, boracay property for sale, boracay house for sale, house for sale boracay, boracay condo for sale"
        ogImage={OG_1200}
        ogImageAlt="Ocean-view villas in Boracay at sunset — Boracay.house"
        ogImageHighRes={OG_2400}
        ogImageHighResWidth={2400}
        ogImageHighResHeight={1260}
        url="https://boracay.house/"
        canonical="https://boracay.house/"
        jsonLdSchemas={[
          organizationSchema,
          websiteSchema,
          ...(itemListSchema ? [itemListSchema] : []),
          faqSchema
        ]}
      />
      
      <HeroSection />
      
      {/* Browse by navigation */}
      <section className="bg-white py-8">
        <Container>
          <nav aria-label="Browse by" className="max-w-4xl mx-auto text-center">
            <ul className="flex flex-wrap gap-3 justify-center text-sm md:text-base">
              <li><a href="/for-sale" className="text-amber-700 underline" data-cta="homepage_link_click" data-dest="/for-sale">Houses for sale in Boracay</a></li>
              <li><a href="/airbnb" className="text-amber-700 underline" data-cta="homepage_link_click" data-dest="/airbnb">Villas & apartments for rent</a></li>
              <li><a href="/beaches/white-beach" className="text-amber-700 underline" data-cta="homepage_link_click" data-dest="/beaches/white-beach">White Beach guide</a></li>
              <li><a href="/beaches/diniwid-beach" className="text-amber-700 underline" data-cta="homepage_link_click" data-dest="/beaches/diniwid-beach">Diniwid Beach guide</a></li>
              <li><a href="/blog/boracay-s-guide/where-to-stay-in-boracay-station-1-vs-station-2" className="text-amber-700 underline" data-cta="homepage_link_click" data-dest="/blog/boracay-s-guide/where-to-stay-in-boracay-station-1-vs-station-2">Where to stay in Boracay</a></li>
            </ul>
          </nav>
        </Container>
      </section>
      
      {/* Indexable intro content */}
      <section className="bg-white py-8">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-700 leading-relaxed">
              Buy property in Boracay with clear guidance. We list houses, villas, and condos near Diniwid, Station 1–3, and Bulabog. Real photos, seller-ready paperwork, straight pricing. Start with the full sale list or ask for a viewing.
            </p>
          </div>
        </Container>
      </section>
      
      <PropertyListings />
      
      {/* Browse by section with real internal links */}
      <section className="bg-white py-8">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Property Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link 
                to="/house-for-sale-boracay" 
                className="bg-gray-50 hover:bg-amber-50 p-4 rounded-lg transition-colors text-center"
                aria-label="Browse houses for sale in Boracay"
              >
                <span className="text-gray-900 font-medium">Houses for sale in Boracay</span>
              </Link>
              <Link 
                to="/boracay-homes-for-sale" 
                className="bg-gray-50 hover:bg-amber-50 p-4 rounded-lg transition-colors text-center"
                aria-label="Browse homes for sale in Boracay"
              >
                <span className="text-gray-900 font-medium">Boracay homes for sale</span>
              </Link>
              <Link 
                to="/property-for-sale-boracay" 
                className="bg-gray-50 hover:bg-amber-50 p-4 rounded-lg transition-colors text-center"
                aria-label="Browse all property for sale in Boracay"
              >
                <span className="text-gray-900 font-medium">Villas near Diniwid</span>
              </Link>
              <Link 
                to="/cheap-houses-boracay" 
                className="bg-gray-50 hover:bg-amber-50 p-4 rounded-lg transition-colors text-center"
                aria-label="Browse affordable houses in Boracay"
              >
                <span className="text-gray-900 font-medium">Bulabog houses</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>
      
      <section className="bg-white">
        <Container className="py-16">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
              <div className="flex justify-center">
                <a 
                  href="/for-sale"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-medium rounded-md transition-colors duration-300 focus:outline-none text-lg px-8 py-4"
                  aria-label="View all properties for sale in Boracay"
                  data-cta="homepage_cta_click"
                  data-dest="/for-sale"
                >
                  View all properties for sale
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </>
          )}
        </Container>
      </section>

      <InvestmentCalculatorPromo />

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

      <Statistics />
      <InvestmentGuarantee />
      <GuestReviews />
      <TargetAudience />
      <BeachesSection />
      <Services />
      <Blog />
      <FAQSection />
    </>
  );
};

export default HomePage;
