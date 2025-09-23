// src/pages/AirbnbPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search, RotateCcw, ChevronDown, ChevronUp, Check, X, DollarSign, MessageCircle, Shield, CreditCard, Clock, Home, MapPin, Users, Phone, Utensils, Activity } from 'lucide-react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import PropertyCard from '../components/property/PropertyCard';
import BeachesSection from '../components/property/BeachesSection';
import Blog from '../components/home/Blog';
import GuestReviews from '../components/home/GuestReviews';
import type { Property } from '../types';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import SEOJson from '../components/SEOJson';
import Accordion from '../components/ui/Accordion'; // Import Accordion for FAQ-like sections
import areas from '../data/areas'; // Import the areas data

const OG_2400 = "https://res.cloudinary.com/dq3fftsfa/image/upload/c_fill,g_auto,f_auto,q_auto:good,w_2400,h_1260/v20250825/boracay-house/og/airbnb-boracay.jpg";

const AirbnbPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State for search filters
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // State for properties and UI
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [sortOption, setSortOption] = useState('latest');
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set()); // Changed to useState
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  
  // Refs for Vanta.js effects
  const vantaRefSeo = useRef<HTMLDivElement>(null);
  const vantaRefFaq = useRef<HTMLDivElement>(null);
  const [vantaEffectSeo, setVantaEffectSeo] = useState<any>(null);
  const [vantaEffectFaq, setVantaEffectFaq] = useState<any>(null);

  // Refs for new content sections to trigger animations
  const introSectionRef = useRef<HTMLDivElement>(null);
  const typesOfRentalsRef = useRef<HTMLDivElement>(null);
  const neighborhoodsRef = useRef<HTMLDivElement>(null);
  const guestSupportRef = useRef<HTMLDivElement>(null);

  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({});
  const sectionObserverRefs = useRef<Record<string, HTMLDivElement | null>>({});


  // Toggle FAQ item expansion
  const toggleFaq = (index: number) => {
    setExpandedFaqIndex(expandedFaqIndex === index ? null : index);
  };

  // Currency and sort options
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

  // Price options for dropdowns
  const priceOptions = [
    { value: '20', label: '€20' },
    { value: '30', label: '€30' },
    { value: '40', label: '€40' },
    { value: '45', label: '€45' },
    { value: '60', label: '€60' },
    { value: '80', label: '€80' },
    { value: '100', label: '€100' },
    { value: '150', label: '€150' },
    { value: '200', label: '€200' },
    { value: '300', label: '€300' },
    { value: '400', label: '€400' },
    { value: '500', label: '€500' },
    { value: '750', label: '€750' },
    { value: '1000', label: '€1,000' },
    { value: '2000', label: '€2,000' }
  ];

  // Area chips for filtering - NOW DYNAMICALLY GENERATED
  const areaChips = areas.map(area => ({
    label: area.name,
    value: area.id
  }));

  // Load properties when component mounts or filters/sort change
  useEffect(() => {
    loadProperties();
  }, [sortOption]);

  // Initialize Vanta.js effects
  useEffect(() => {
    const initVanta = async () => {
      try {
        const [VANTA, THREE_LIB] = await Promise.all([
          import('vanta/dist/vanta.birds.min'),
          import('three')
        ]);

        if (vantaRefSeo.current && !vantaEffectSeo) {
          const effectSeo = VANTA.default({
            el: vantaRefSeo.current,
            THREE: THREE_LIB.default,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            backgroundColor: 0xffffff,
            color1: 0x74c0f5,
            speedLimit: 4.00,
            quantity: 4.00,
          });
          setVantaEffectSeo(effectSeo);
        }
        
        if (vantaRefFaq.current && !vantaEffectFaq) {
          const effectFaq = VANTA.default({
            el: vantaRefFaq.current,
            THREE: THREE_LIB.default,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            backgroundColor: 0xffffff,
            color1: 0x74c0f5,
            speedLimit: 4.00,
            quantity: 4.00,
          });
          setVantaEffectFaq(effectFaq);
        }
      } catch (error) {
        console.error('Error loading Vanta.js:', error);
        if (vantaRefSeo.current) vantaRefSeo.current.style.backgroundColor = '#ffffff';
        if (vantaRefFaq.current) vantaRefFaq.current.style.backgroundColor = '#ffffff';
      }
    };

    initVanta();

    return () => {
      if (vantaEffectSeo) vantaEffectSeo.destroy();
      if (vantaEffectFaq) vantaEffectFaq.destroy();
    };
  }, []);

  // Intersection observer for property cards
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.getAttribute('data-index')) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            if (entry.isIntersecting) {
              setVisibleCards((prev) => new Set([...prev, index])); // Update visibleCards
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
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

  // Load properties from Supabase
  const loadProperties = async (resetFilters = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from('properties')
        .select('*')
        .eq('is_for_rent', true);

      if (!resetFilters) {
        if (propertyType) query = query.eq('property_type', propertyType.toLowerCase());
        if (bedrooms) query = query.eq('bedrooms', parseInt(bedrooms));
        if (location) query = query.eq('location', location);
        
        // Price filtering - ensure we're comparing numbers
        if (minPrice) {
          const min = parseInt(minPrice);
          query = query.gte('nightly_rate_min', min);
        }
        if (maxPrice) {
          const max = parseInt(maxPrice);
          query = query.lte('nightly_rate_max', max);
        }
      }

      // Apply sorting
      switch (sortOption) {
        case 'latest': 
          query = query.order('created_at', { ascending: false }); 
          break;
        case 'oldest': 
          query = query.order('created_at', { ascending: true }); 
          break;
        case 'highest': 
          query = query.order('nightly_rate_max', { ascending: false }); 
          break;
        case 'lowest': 
          query = query.order('nightly_rate_min', { ascending: true }); 
          break;
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
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
    setBedrooms('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    loadProperties(true);
  };

  // FAQ data organized into two columns
  const faqItems = [
    { question: "Is this the same as Airbnb?",
      answer: "No—we’re not affiliated with Airbnb. We manage Airbnb-style villas and apartments you can book directly with safe payment (Stripe/PayPal) and clear policies." },
    { question: "Do I save the Airbnb guest service fee?",
      answer: "Yes. Direct bookings don’t include third-party guest service fees, so your total is typically lower. We also offer a best-rate guarantee for the same dates and terms." },
    { question: "Is it safe to pay direct?",
      answer: "Yes. Use Stripe or PayPal Goods & Services (buyer protections), receive a signed confirmation and official receipt, or choose pay-on-arrival with a small card pre-auth." },
    { question: "Can you move my active Airbnb booking here?",
      answer: "We follow platform terms and won’t move an active reservation off-platform. For new or future stays, booking direct on our official site is welcomed and cheaper." },
    {
      question: "How do I make a reservation?",
      answer: "You can book directly with us via WhatsApp or email, or through Airbnb if the unit is listed there. We respond fast and confirm within hours."
    },
    {
      question: "What is your cancellation policy?",
      answer: "On Airbnb: we follow a strict policy. Guests who cancel 7 or more days before check-in receive a 50% refund. After that, the booking becomes non-refundable. For promo-rate bookings made directly, no refund is provided."
    },
    {
      question: "Do you require a deposit?",
      answer: "Yes, we require a 20–30% deposit to confirm your stay. Balance is due at check-in or via online transfer. Airbnb bookings follow their payment system."
    },
    {
      question: "What are the check-in and check-out times?",
      answer: "Check-in: from 2:00 PM. Check-out: by 10:00 AM. Early check-in / late check-out may be possible — ask us in advance."
    },
    {
      question: "How do I check in to the property?",
      answer: "We'll meet you in person or send a self-check-in guide depending on arrival time. Our team is always on standby if you need help."
    },
    {
      question: "Are your properties child-friendly?",
      answer: "Yes, most units are family-friendly. Some have stairs or open balconies — ask us about the best fit for your group."
    },
    {
      question: "Are pets allowed?",
      answer: "Some units allow pets; others don't. Please confirm in advance — a pet deposit may apply."
    },
    {
      question: "What amenities are included?",
      answer: (
        <>
          Each listing is unique, but most include:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Fast Wi-Fi</li>
            <li>Kitchen or kitchenette</li>
            <li>Air conditioning</li>
            <li>Towels, bed sheets, and basic toiletries</li>
            <li>Weekly or daily cleaning</li>
            <li>On-call maintenance</li>
            <li>Local guest support</li>
          </ul>
        </>
      )
    },
    {
      question: "Can you help arrange activities and tours?",
      answer: (
        <>
          Absolutely. We connect you with trusted local providers for island hopping, diving, e-bike rental, golf, and more. You can also follow our blog for ideas, inspiration, and tips for your journey: <a href="https://www.boracay.house/blog" className="text-amber-600 hover:text-amber-700 underline">https://www.boracay.house/blog</a>
        </>
      )
    },
    {
      question: "What payment methods do you accept?",
      answer: "Direct bookings: bank transfer (local or international), Wise, Revolut, GCash, or PayPal (fees may apply). Airbnb: through their platform."
    },
    {
      question: "Do you offer airport transfers?",
      answer: "Yes — we can book airport pickup and drop-off with trusted local providers. Let us know your arrival details at least 24 hours in advance, or we'll connect you directly so you can book online yourself."
    },
    {
      question: "Are these Airbnb properties or direct rentals?",
      answer: "Yes — all homes are Airbnb-ready and can be booked either directly or via Airbnb. You get verified hosts, guest-reviewed properties, and simple check-in."
    },
    {
      question: "How close are the homes to White Beach?",
      answer: "Most rentals are 2–10 minutes from White Beach, D'Mall, and Station 1 — walkable but without the beachfront markup. Many units are near Diniwid Beach (4 min walk), and a short E-trike from nightlife and restaurants."
    },
    {
      question: "Can I rent monthly or long-term?",
      answer: "Yes. We welcome digital nomads and long-stay guests. Monthly rates are discounted, especially off-season."
    },
    {
      question: "Can you help manage my property?",
      answer: "Yes — we offer full property management: listings, guest support, cleaning, maintenance, photos, pricing strategy. Hands-free for owners."
    },
    {
      question: "We are a group of 16–20 people — can you organize something for us?",
      answer: "Yes, we specialize in group bookings. We can arrange nearby units or private villas to host your full group. Just send us your dates."
    }
  ];

  // Split FAQ items into two columns
  const faqColumns = [
    faqItems.slice(0, Math.ceil(faqItems.length / 2)),
    faqItems.slice(Math.ceil(faqItems.length / 2))
  ];

  // JSON-LD for FAQPage
  const faqPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": typeof item.answer === 'string' ? item.answer : 'See answer on page.' // Simplified for JSON-LD
      }
    }))
  };

  // JSON-LD for BreadcrumbList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://boracay.house/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Airbnb in Boracay",
        "item": "https://boracay.house/airbnb"
      }
    ]
  };

  // JSON-LD for ItemList (first 12 properties)
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": properties.slice(0, 12).map((property, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://boracay.house/${property.slug}`
    }))
  };

  return (
    <>
      <SEO
        title="Airbnb in Boracay — Villas & Apartments Near White Beach (Direct Booking)"
        description="Discover handpicked Airbnb-style villas, houses & apartments for rent in Boracay near White Beach (Stations 1–3), Diniwid & Bulabog. Book direct with secure Stripe/PayPal and save platform fees. Enjoy local support and verified properties for your perfect island getaway."
        keywords="Airbnb Boracay, Boracay rentals, villas for rent Boracay, apartments for rent Boracay, direct booking Boracay, vacation rentals Boracay, Boracay accommodation, White Beach rentals, Diniwid rentals, Bulabog rentals, long-term rentals Boracay"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/c_fill,g_auto,f_auto,q_auto:eco,w_1200,h_630/v20250825/boracay-house/og/airbnb-boracay.jpg"
        url="https://boracay.house/airbnb"
        canonical="https://boracay.house/airbnb"
        type="website"
      />
      {/* Optional higher-DPI OG */}
      <Helmet>
        <meta property="og:image" content={OG_2400} />
        <meta property="og:image:alt" content="Airbnb-style villas in Boracay near White Beach — Boracay.house" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* JSON-LD Schemas */}
      <SEOJson graphs={[faqPageJsonLd, breadcrumbJsonLd, itemListJsonLd]} />

      <div className="min-h-screen bg-white">
        <div className="h-32" />
        
        <div className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Replaced CSS background with img tag */}
          <img 
            src="https://res.cloudinary.com/dq3fftsfa/image/upload/f_auto,q_auto,w_1920,h_1080,c_fill,g_auto/v1748371588/e37696_e4ae41811242449885effc44c7593d3b_mv2_ajftwb.jpg"
            alt="Airbnb-style villa in Boracay near White Beach"
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="theater-curtain" />

          <Container className="relative z-10">
            <div className="w-full max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-3 rounded-lg transition-all duration-1000 transform translate-y-0 opacity-100">
              <div className="text-center mb-6">
                <h1 className="text-5xl font-bold text-white mb-2">
                  Airbnb in Boracay: Villas & Apartments You Can Book Direct
                </h1>
                <p className="text-xl text-gray-200">
                  Discover handpicked Airbnb-style rentals near Boracay's stunning White Beach (Stations 1–3), tranquil Diniwid, and vibrant Bulabog. Experience the same quality you expect from Airbnb, but with the added benefits of secure direct booking via Stripe/PayPal and no guest service fees.
                </p>
              </div>

              <div className="search-bar-content">
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full h-[42px] px-3 bg-white/80 border-0 rounded text-gray-900 font-medium text-sm"
                  >
                    <option value="">VILLA</option>
                    <option value="villa">Villa</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                  </select>

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
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-[42px] px-3 bg-white/80 border-0 rounded text-gray-900 font-medium text-sm"
                  >
                    <option value="">SELECT AREA</option>
                    {areas.map(area => ( // Dynamically generate options from areas.ts
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <select
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full h-[42px] px-3 bg-white/80 border-0 rounded text-gray-900 font-medium text-sm"
                  >
                    <option value="">MIN PRICE/NIGHT</option>
                    {priceOptions.map((price) => (
                      <option key={`min-${price.value}`} value={price.value}>
                        {price.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full h-[42px] px-3 bg-white/80 border-0 rounded text-gray-900 font-medium text-sm"
                  >
                    <option value="">MAX PRICE/NIGHT</option>
                    {priceOptions.map((price) => (
                      <option key={`max-${price.value}`} value={price.value}>
                        {price.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSearch}
                    className="flex-1 h-[42px] bg-amber-600 hover:bg-amber-700 text-white font-medium rounded flex items-center justify-center gap-2 transition-colors text-sm"
                    data-cta="search_button"
                    data-label="airbnb_search_properties"
                  >
                    <Search className="w-4 h-4" />
                    FIND VILLAS FOR RENT
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
            {/* Area Chips - NOW DYNAMICALLY GENERATED */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {areaChips.map((chip) => (
                <Link
                  key={chip.value}
                  to={`/for-rent?area=${encodeURIComponent(chip.value)}`}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-white/40 transition-colors"
                  data-cta="area_chip"
                  data-label={`airbnb_area_${chip.value.toLowerCase().replace(/\s/g, '_')}`}
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </Container>
        </div>

        {/* Property Listings Section */}
        <Container className="py-16">
          <div className="flex justify-end items-center gap-8 mb-8">
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
                  className="property-card-container transition-opacity duration-300"
                  onClick={() => navigate(`/${property.slug}`)}
                >
                  <PropertyCard 
                    property={{ ...property, selectedCurrency }} 
                    disableNavigation={true}
                    showNightlyRate={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600">
                We couldn't find any rental properties matching your criteria. Please try adjusting your search filters.
              </p>
            </div>
          )}
        </Container>

        {/* Book Direct Comparison Section - IMPROVED DESIGN */}
        <section className="py-16 bg-amber-50 border-b border-amber-200">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Book Direct and Save on Your Boracay Airbnb
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Unlock exclusive benefits and a more personalized experience by booking your Boracay vacation rental directly through us. Avoid unnecessary platform fees and enjoy direct communication with your hosts, ensuring a seamless and cost-effective stay.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* On Airbnb Column */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <X className="w-6 h-6 text-red-500" /> On Airbnb
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-gray-700">Guest service fee: <strong className="text-red-600">Usually added</strong></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-gray-700">Payment: <strong className="text-red-600">Platform checkout</strong></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-gray-700">Support: <strong className="text-red-600">Platform messages</strong></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-gray-700">Room rate: <strong className="text-red-600">Same</strong></span>
                    </li>
                  </ul>
                </div>

                {/* Book Direct Column */}
                <div className="bg-green-50 p-6 rounded-lg shadow-md border border-green-200">
                  <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" /> Book Direct
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Guest service fee: <strong className="text-green-700">₱0</strong></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Payment: <strong className="text-green-700">Stripe • PayPal G&S • Pay on arrival*</strong></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Support: <strong className="text-green-700">Direct host (24/7)</strong></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">Room rate: <strong className="text-green-700">Same or lower</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                * Pay-on-arrival uses a small card pre-authorization to secure your dates.
              </p>
              <Link 
                to="/direct" 
                className="inline-flex items-center px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-lg transition-colors"
                data-cta="book_direct_button"
                data-label="airbnb_book_direct_comparison"
              >
                Learn More & Book Direct →
              </Link>
            </div>
          </Container>
        </section>

        {/* New Section: Types of Rentals Available */}
        <section 
          ref={el => sectionObserverRefs.current['types-of-rentals'] = el}
          data-section-id="types-of-rentals"
          className="py-24 bg-white"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['types-of-rentals'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['types-of-rentals'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Find Your Perfect Stay: Diverse Rental Options in Boracay</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Whether you're traveling solo, as a couple, with family, or a large group, we offer a wide range of rental properties to suit every need and budget.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                  <Home className="w-12 h-12 text-amber-600 mx-auto mb-4"/>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Cozy Studios & Apartments</h3>
                  <p className="text-gray-600">Perfect for solo travelers or couples seeking a comfortable and affordable base to explore the island. Many include kitchenettes and private balconies.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                  <Home className="w-12 h-12 text-blue-600 mx-auto mb-4"/>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Spacious Houses & Villas</h3>
                  <p className="text-gray-600">Ideal for families or groups, offering multiple bedrooms, living areas, and often private gardens or pools. Enjoy privacy and ample space for relaxation.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                  <Home className="w-12 h-12 text-green-600 mx-auto mb-4"/>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Unique Island Retreats</h3>
                  <p className="text-gray-600">Discover charming bungalows, eco-friendly stays, or properties with unique architectural designs for an unforgettable Boracay experience.</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* New Section: Neighborhoods for Rent */}
        <section 
          ref={el => sectionObserverRefs.current['neighborhoods'] = el}
          data-section-id="neighborhoods"
          className="py-24 bg-gray-50"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['neighborhoods'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['neighborhoods'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Discover Boracay's Diverse Neighborhoods for Your Stay</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Each area of Boracay offers a distinct vibe and set of attractions. Choose the perfect neighborhood that matches your vacation style.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                  <MapPin className="w-12 h-12 text-amber-600 mx-auto mb-4"/>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">White Beach (Stations 1, 2, 3)</h3>
                  <p className="text-gray-600">The iconic heart of Boracay, offering vibrant nightlife, diverse dining, and direct access to the famous white sands. Ideal for those who want to be in the center of the action.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                  <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4"/>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Diniwid Beach</h3>
                  <p className="text-gray-600">A tranquil and secluded paradise just north of White Beach. Perfect for a peaceful retreat, romantic getaways, and enjoying stunning sunsets away from the crowds.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                  <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4"/>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Bulabog Beach</h3>
                  <p className="text-gray-600">Known as the island's watersports capital, this side of Boracay is perfect for kitesurfing and windsurfing enthusiasts. It offers a more active vibe with a growing community of adventurers.</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* New Section: Guest Support & Services */}
        <section 
          ref={el => sectionObserverRefs.current['guest-support'] = el}
          data-section-id="guest-support"
          className="py-24 bg-white"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['guest-support'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['guest-support'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Seamless Stays: Our Dedicated Guest Support & Services</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Your comfort and satisfaction are our top priorities. We offer a range of services to ensure your Boracay rental experience is smooth, enjoyable, and stress-free.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                  <Phone className="w-12 h-12 text-amber-600 mx-auto mb-4"/>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Local Assistance</h3>
                  <p className="text-gray-600">Our local team is always on standby to assist you with any needs, questions, or emergencies during your stay.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                  <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4"/>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Activity & Tour Booking</h3>
                  <p className="text-gray-600">We can help arrange island hopping tours, water sports, massages, and other activities with trusted local providers.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                  <Utensils className="w-12 h-12 text-green-600 mx-auto mb-4"/>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Concierge & Housekeeping</h3>
                  <p className="text-gray-600">From regular cleaning services to special requests like private chefs or grocery stocking, we ensure your rental is always comfortable.</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* SEO Section with Vanta Background */}
        <section ref={vantaRefSeo} className="py-24 relative min-h-[60vh] flex items-center overflow-hidden">
          <Container>
            <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Stay Smart in Boracay: Handpicked Airbnb-Style Rentals with Local Service
              </h2>
              <p className="text-lg text-gray-800 leading-relaxed max-w-3xl mx-auto">
                Looking for Airbnb-style rentals in Boracay? We manage high-quality homes, villas, and apartments just minutes from White Beach. Whether you want nightly rentals, long stays, or hidden gems off the main strip, our properties are reviewed, maintained, and ready to book — with real-time availability and local support.
              </p>
              <div className="w-24 h-1 bg-amber-500 mx-auto mt-8" />
            </div>
          </Container>
        </section>

        {/* Promos & Activities Section */}
        <section className="py-16 bg-amber-50">
          <Container>
            <div className="max-w-4xl mx-auto text-center transform hover:scale-105 transition-transform duration-500">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-text-pulse">
                Discover Our <span className="font-licorice text-[3.5rem] text-amber-600">Special</span> Promos & Activities
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Make your Boracay stay unforgettable with our exclusive deals on island activities, 
                tours, and experiences. From island hopping adventures to relaxing spa treatments, 
                we've got something for everyone at special prices.
              </p>
              <Button 
                onClick={() => navigate('/promos')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 add-activities-pulse"
                data-cta="view_promos_button"
                data-label="airbnb_view_all_promos"
              >
                View All Promos & Activities
              </Button>
            </div>
          </Container>
        </section>

        {/* FAQ Section with Vanta Background */}
        <section ref={vantaRefFaq} className="py-24 relative min-h-[70vh] flex items-center overflow-hidden">
          <Container>
            <div className="max-w-6xl mx-auto relative z-10">
              <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
                Frequently Asked Questions
              </h2>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {faqColumns.map((column, colIndex) => (
                    <div key={colIndex} className="space-y-4">
                      {column.map((item, index) => {
                        const globalIndex = colIndex === 0 ? index : index + Math.ceil(faqItems.length / 2);
                        const isExpanded = expandedFaqIndex === globalIndex;
                        
                        return (
                          <div 
                            key={globalIndex} 
                            className="faq-item border-b border-gray-200 pb-4 last:border-0"
                          >
                            <button
                              className="flex items-center justify-between w-full text-left"
                              onClick={() => toggleFaq(globalIndex)}
                            >
                              <h3 className="text-xl font-semibold text-gray-900">
                                {item.question}
                              </h3>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-amber-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-amber-600" />
                              )}
                            </button>
                            
                            <div 
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                isExpanded ? 'max-h-96 mt-4' : 'max-h-0'
                              }`}
                            >
                              <div className="text-gray-700">
                                {item.answer}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center mt-12">
                <a
                  href="https://wa.me/639617928834?text=Hey%20good%20day%2C%20I%20am%20interested%20in%20Airbnb%20in%20Boracay."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-300 text-lg font-medium"
                  data-cta="whatsapp_contact"
                  data-label="airbnb_faq_whatsapp"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Contact us on WhatsApp
                </a>
              </div>
            </div>
          </Container>
        </section>

        <GuestReviews />
        <BeachesSection />
        <Blog />
      </div>
    </>
  );
};

export default AirbnbPage;
