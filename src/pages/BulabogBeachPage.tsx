import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/ui/Container';
import SEO from '../components/SEO';
import Blog from '../components/home/Blog';
import { ArrowLeft, ChevronLeft, ChevronRight, Star, Award, Plus, Minus, Share2, Check, Info, Activity, Gift, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import PromoPackageCard from '../components/shared/PromoPackageCard';
import PropertyCard from '../components/property/PropertyCard';
import ProductCarousel from '../components/shared/ProductCarousel';
import Button from '../components/ui/Button';
import { useShoppingCart } from '../context/ShoppingCartContext';
import { playSound } from '../utils/audio';
import Accordion from '../components/ui/Accordion';
import { HelpCircle } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  description: string;
  hero_image: string;
  base_price_php: number;
  is_top_product: boolean;
  is_most_sold: boolean;
  is_sold_out?: boolean;
  min_pax?: number;
  max_pax?: number;
  min_nights?: number;
  max_nights?: number;
  whatsapp_number?: string;
  slug?: string;
  promo_code?: string;
  promo_discount_percentage?: number;
}

interface Activity {
  id: string;
  name: string;
  hero_image: string;
  price_php: number;
  is_most_sold: boolean;
  is_top_product: boolean;
  category: string;
  min_pax: number;
}

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

const bulabogBeachMedia = [
  // Images
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751297927/boracay_real_estate_for_sale_t2kkht.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751297929/boracay_resort_for_sale_rpv4ml.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751297931/homes_for_sale_boracay_philippines_jydzbp.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751297934/boracay_beach_house_for_sale_lzcsav.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751297936/boracay_house_for_rent_xvm4yq.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751297939/boracay_villa_for_sale_lzlohx.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751297941/houses_in_boracay_r4j8dt.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751297944/houses_for_sale_in_boracay_hzzg17.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751297947/real_estate_boracay_ynb58o.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751297949/boracay_homes_for_sale_hgidg3.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751297952/property_for_sale_in_boracay_dag2kw.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298192/houses_for_sale_boracay_mjzbsc.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298189/boracay_house_for_sale_prices_ss4mgy.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298187/boracay_business_for_sale_ph8mhq.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298184/house_in_boracay_for_sale_gs6x2j.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298181/house_for_rent_in_boracay_npkywz.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298179/boracay_house_and_lot_for_sale_ui6q3f.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298176/boracay_rent_house_imtpwp.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298174/real_estate_boracay_philippines_yytbbm.jpg" },
  { type: 'image', src: "https://res.com/dq3fftsfa/image/upload/v1751218590/Bulabog_Handsome_dude_cumem6.webp" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218592/Kitesurf_club_Bulabogwebp_hsu3fh.webp" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218591/Bulabog_Beach_scp8y4.webp" }
];

const BulabogBeachPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart();
  const carouselInnerRef = useRef<HTMLDivElement>(null);
  const originalPropertiesCountRef = useRef<number>(0);
  const AIRBNB_CARDS_PER_VIEW = 3;
  const [mediaVisible, setMediaVisible] = useState<boolean[]>(new Array(bulabogBeachMedia.length).fill(false));
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentVisible, setContentVisible] = useState(false);

  // State for Airbnb Carousel
  const [airbnbProperties, setAirbnbProperties] = useState<Property[]>([]);
  const [loadingAirbnbProperties, setLoadingAirbnbProperties] = useState(true);
  const [airbnbCarouselIndex, setAirbnbCarouselIndex] = useState(0);
  const [isAutoPlayingAirbnb, setIsAutoPlayingAirbnb] = useState(true);
  const airbnbCarouselRef = useRef<HTMLDivElement>(null);

  // State for Packages Section
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [errorPackages, setErrorPackages] = useState<string | null>(null);
  const [packageQuantities, setPackageQuantities] = useState<Record<string, { participants: number; nights: number }>>({});
  const [showCopiedMessage, setShowCopiedMessage] = useState<Record<string, boolean>>({});

  // State for Activities Carousel
  const [activities, setActivities] = useState<Product[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [selectedCurrency] = useState('PHP');

  // FAQ data
  const faqItems = [
    {
      question: "What is the best season for kitesurfing in Bulabog Beach?",
      answer: "The best season for kitesurfing and windsurfing in Bulabog Beach is during the Amihan season, typically from November to April, when the northeast wind blows creating ideal conditions."
    },
    {
      question: "Is Bulabog Beach good for swimming?",
      answer: "Swimming is possible in Bulabog Beach, but it's not as ideal as other beaches in Boracay due to the presence of water sports activities. Tourists should be mindful of kiteboarders and windsurfers and swim in designated swimming areas to avoid accidents."
    },
    {
      question: "How far is Bulabog Beach from D'Mall?",
      answer: "Bulabog Beach is about a 10-minute walk from D'Mall."
    }
  ];

  useEffect(() => {
    loadAirbnbProperties();
    loadPackagesData();
    loadActivitiesData();
  }, []);

  // Auto-scrolling effect for Airbnb carousel
  useEffect(() => {
    if (!isAutoPlayingAirbnb || originalPropertiesCountRef.current === 0) return;

    const interval = setInterval(() => {
      setAirbnbCarouselIndex(prev => {
        const nextIndex = prev + 1;
        
        // When we reach the end of the first set, seamlessly jump to the beginning
        if (nextIndex >= originalPropertiesCountRef.current) {
          // Temporarily disable transition for seamless jump
          if (carouselInnerRef.current) {
            carouselInnerRef.current.style.transition = 'none';
          }
          
          // Jump back to start after a brief moment
          setTimeout(() => {
            if (carouselInnerRef.current) {
              carouselInnerRef.current.style.transition = 'transform 0.5s ease-in-out';
            }
          }, 50);
          
          return 0;
        }
        
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoPlayingAirbnb, originalPropertiesCountRef.current]);

  const loadAirbnbProperties = async () => {
    setLoadingAirbnbProperties(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_for_rent', true)
        .in('location', ['Bulabog', 'Diniwid', 'Monaco Suites']) // Include multiple locations for variety
        .not('nightly_rate_min', 'is', null)
        .order('nightly_rate_min', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Store original count and create seamless loop with triple duplication
        originalPropertiesCountRef.current = data.length;
        const extendedData = [...data, ...data, ...data];
        setAirbnbProperties(extendedData);
      } else {
        originalPropertiesCountRef.current = 0;
        setAirbnbProperties([]);
      }
    } catch (error) {
      console.error('Error loading Airbnb properties:', error);
      originalPropertiesCountRef.current = 0;
    } finally {
      setLoadingAirbnbProperties(false);
    }
  };

  const loadPackagesData = async () => {
    try {
      setLoadingPackages(true);
      setErrorPackages(null);

      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_sold_out', false)
        .order('is_top_product', { ascending: false })
        .order('is_most_sold', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      
      if (data) {
        setPackages(data);
        const initialQuantities: Record<string, { participants: number; nights: number }> = {};
        data.forEach(pkg => {
          initialQuantities[pkg.id] = {
            participants: pkg.min_pax || 2,
            nights: pkg.min_nights || 2
          };
        });
        setPackageQuantities(initialQuantities);
      }
    } catch (err) {
      console.error('Error loading packages:', err);
      setErrorPackages('Failed to load packages. Please try again later.');
    } finally {
      setLoadingPackages(false);
    }
  };

  const loadActivitiesData = async () => {
    try {
      setLoadingActivities(true);
      
      const { data, error } = await supabase
        .from('activities')
        .select('id, name, hero_image, price_php, is_most_sold, is_top_product, category, min_pax')
        .eq('is_online', true)
        .order('is_top_product', { ascending: false })
        .order('is_most_sold', { ascending: false })
        .order('name')
        .limit(9);

      if (error) throw error;
      
      if (data) {
        const formattedActivities: Product[] = data.map(activity => ({
          ...activity,
          type: 'activity' as const,
          price_php: activity.price_php
        }));
        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleQuantityChange = (packageId: string, type: 'participants' | 'nights', value: number) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;
    
    let finalValue = value;
    
    if (type === 'participants') {
      finalValue = Math.max(pkg.min_pax || 1, Math.min(pkg.max_pax || 20, value));
    } else if (type === 'nights') {
      finalValue = Math.max(pkg.min_nights || 1, Math.min(pkg.max_nights || 30, value));
    }
    
    setPackageQuantities(prev => ({
      ...prev,
      [packageId]: {
        ...prev[packageId],
        [type]: finalValue
      }
    }));
  };

  const calculateTotal = (pkg: Package) => {
    const quantities = packageQuantities[pkg.id] || { participants: pkg.min_pax || 2, nights: pkg.min_nights || 2 };
    const baseTotal = pkg.base_price_php * quantities.participants * quantities.nights;
    
    if (pkg.promo_discount_percentage && pkg.promo_discount_percentage > 0) {
      const discount = baseTotal * (pkg.promo_discount_percentage / 100);
      return baseTotal - discount;
    }
    
    return baseTotal;
  };

  const formatPrice = (price: number): string => {
    return `₱${price.toLocaleString('en-PH')}`;
  };

  const handleAddToCart = (pkg: Package) => {
    const quantities = packageQuantities[pkg.id] || { participants: pkg.min_pax || 2, nights: pkg.min_nights || 2 };
    const total = calculateTotal(pkg);
    
    addToCart({
      id: pkg.id,
      name: pkg.name,
      price: total,
      selectedDate: new Date(),
      hero_image: pkg.hero_image,
      min_pax: pkg.min_pax,
      type: 'package',
      min_nights: pkg.min_nights,
      addons_summary: `${quantities.participants} participants × ${quantities.nights} nights`
    }, 1);
    
    playSound('click.mp3');
  };

  const handleShareLink = (pkg: Package, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `https://boracay.house/promos`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        playSound('click.mp3');
        setShowCopiedMessage(prev => ({
          ...prev,
          [pkg.id]: true
        }));
        setTimeout(() => {
          setShowCopiedMessage(prev => ({
            ...prev,
            [pkg.id]: false
          }));
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  const handleCheckAvailability = (pkg: Package) => {
    const quantities = packageQuantities[pkg.id] || { participants: pkg.min_pax || 2, nights: pkg.min_nights || 2 };
    const whatsappNumber = pkg.whatsapp_number || '+639617928834';
    
    const message = encodeURIComponent(
      `Hello! I'm interested in the "${pkg.name}" package for ${quantities.participants} participants and ${quantities.nights} nights. Could you please check availability?`
    );
    
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`, '_blank');
  };

  const handleAddToCartFromCarousel = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price_php || product.base_price_php || 0,
      selectedDate: new Date(),
      hero_image: product.hero_image,
      min_pax: product.min_pax,
      type: product.type
    }, product.min_pax || 1);
  };

  const handleViewPackage = (packageId: string) => {
    navigate('/promos');
  };

  const handleAirbnbPrev = () => {
    setAirbnbCarouselIndex(prev => {
      if (prev === 0) {
        return originalPropertiesCountRef.current - 1;
      }
      return prev - 1;
    });
  };

  const handleAirbnbNext = () => {
    setAirbnbCarouselIndex(prev => {
      if (prev >= originalPropertiesCountRef.current - 1) {
        return 0;
      }
      return prev + 1;
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === mapRef.current) {
              setMapVisible(true);
            } else if (entry.target === contentRef.current) {
              setContentVisible(true);
            } else {
              const index = parseInt(entry.target.getAttribute('data-index') || '0');
              setMediaVisible(prev => {
                const newVisibility = [...prev];
                newVisibility[index] = true;
                return newVisibility;
              });
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    mediaRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      mediaRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
      if (mapRef.current) observer.unobserve(mapRef.current);
      if (contentRef.current) observer.unobserve(contentRef.current);
    };
  }, []);

  const consolidatedSection = (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Plan Your Perfect Boracay Experience
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the best of Boracay with our curated selection of activities, exclusive promos, and comfortable rentals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Activities Card */}
          <Link 
            to="/activities" 
            className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100 hover:border-blue-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-3 rounded-full mb-3 group-hover:bg-blue-200 transition-colors">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                Explore Activities
              </h3>
              <p className="text-gray-600 text-sm">
                Thrilling water sports, relaxing wellness, and island tours.
              </p>
            </div>
          </Link>

          {/* Promos Card */}
          <Link 
            to="/promos" 
            className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100 hover:border-amber-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-amber-100 p-3 rounded-full mb-3 group-hover:bg-amber-200 transition-colors">
                <Gift className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                Discover Promos
              </h3>
              <p className="text-gray-600 text-sm">
                Exclusive deals on accommodations and curated packages.
              </p>
            </div>
          </Link>

          {/* Rentals Card */}
          <Link 
            to="/airbnb" 
            className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100 hover:border-green-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 p-3 rounded-full mb-3 group-hover:bg-green-200 transition-colors">
                <Home className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                Find Rentals
              </h3>
              <p className="text-gray-600 text-sm">
                Cozy studios, spacious villas, and beachfront apartments.
              </p>
            </div>
          </Link>
        </div>
      </Container>
    </section>
  );

  return (
    <>
      <SEO
        title="Bulabog Beach Boracay – Kitesurfing & Island Action Hub"
        description="Bulabog Beach is Boracay's kitesurfing capital. Popular for water sports and morning beach runs—less touristy, more thrill. Find rentals, packages, and activities."
        keywords="Bulabog Beach Boracay, Boracay kitesurfing, Boracay water sports, Boracay east beach, Boracay adventure, Bulabog rentals, Bulabog activities"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1754940299/Bulabog_Kitesrufing_idasmt.webp"
        url="https://boracay.house/beaches/bulabog-beach"
        type="article"
        canonical="https://boracay.house/beaches/bulabog-beach"
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {"@type":"ListItem","position":1,"name":"Beaches","item":"https://boracay.house/beaches"},
              {"@type":"ListItem","position":2,"name":"Bulabog Beach","item":"https://boracay.house/beaches/bulabog-beach"}
            ]
          })}
        </script>
      </Helmet>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Beach",
            "name": "Bulabog Beach, Boracay",
            "description": "Boracay's kitesurfing capital, known for strong winds and water sports, located on the eastern side of the island.",
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 11.963467,
              "longitude": 121.930490
            },
            "url": "https://boracay.house/beaches/bulabog-beach",
            "image": "https://res.cloudinary.com/dq3fftsfa/image/upload/v1754940299/Bulabog_Kitesrufing_idasmt.webp",
            "containedInPlace": {
              "@type": "TouristDestination",
              "name": "Boracay, Malay, Aklan, Philippines"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Bulabog Beach Boracay – Kitesurfing & Island Action Hub",
            "url": "https://boracay.house/beaches/bulabog-beach",
            "primaryImageOfPage": "https://res.cloudinary.com/dq3fftsfa/image/upload/v1754940299/Bulabog_Kitesrufing_idasmt.webp"
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "What is the best season for kitesurfing in Bulabog Beach?", "acceptedAnswer": { "@type": "Answer", "text": "The best season for kitesurfing and windsurfing in Bulabog Beach is during the Amihan season, typically from November to April, when the northeast wind blows creating ideal conditions. [3, 9]" } },
              { "@type": "Question", "name": "Is Bulabog Beach good for swimming?", "acceptedAnswer": { "@type": "Answer", "text": "Swimming is possible in Bulabog Beach, but it's not as ideal as other beaches in Boracay due to the presence of water sports activities. Tourists should be mindful of kiteboarders and windsurfers and swim in designated swimming areas to avoid accidents. [3]" } },
              { "@type": "Question", "name": "How far is Bulabog Beach from D'Mall?", "acceptedAnswer": { "@type": "Answer", "text": "Bulabog Beach is about a 10-minute walk from D'Mall. [5, 12]" } }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="h-32" /> {/* Spacer for fixed navbar */}

        {/* Hero Section */}
        <div className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 w-full h-full animate-hero"
              style={{
                backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1754940299/Bulabog_Kitesrufing_idasmt.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                willChange: 'transform'
              }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="theater-curtain" />

          <Container className="relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                🪁 Bulabog Beach
              </h1>
              <div 
                ref={contentRef}
                className={`transition-all duration-1000 ease-out ${
                  contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <p className="text-lg text-gray-200 max-w-3xl mx-auto">
                  The island's east coast sports beach, Bulabog is famous for wind and waves—kiteboarders and windsurfers call it home from November to April. This action-packed beach offers a completely different vibe from White Beach, with a focus on adventure and adrenaline rather than relaxation.
                </p>
              </div>
            </div>
          </Container>
        </div>

        {/* Airbnb Carousel Section */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Find Your Perfect Stay Near Bulabog Beach
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Browse our handpicked selection of affordable and premium Airbnb-style rentals in Bulabog.
              </p>
            </div>

            {loadingAirbnbProperties ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : airbnbProperties.length > 0 ? (
              <div className="relative">
                <button
                  onClick={handleAirbnbPrev}
                  disabled={originalPropertiesCountRef.current <= AIRBNB_CARDS_PER_VIEW}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleAirbnbNext}
                  disabled={originalPropertiesCountRef.current <= AIRBNB_CARDS_PER_VIEW}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div 
                  ref={airbnbCarouselRef} 
                  className="overflow-hidden"
                  onMouseEnter={() => setIsAutoPlayingAirbnb(false)}
                  onMouseLeave={() => setIsAutoPlayingAirbnb(true)}
                >
                  <div
                    ref={carouselInnerRef}
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${airbnbCarouselIndex * (100 / AIRBNB_CARDS_PER_VIEW)}%)`,
                    }}
                  >
                    {airbnbProperties.map((property, index) => (
                      <div
                        key={`${property.id}-${index}`}
                        className="px-2"
                        style={{ 
                          flexBasis: `calc(100% / ${AIRBNB_CARDS_PER_VIEW})`,
                          flexShrink: 0
                        }}
                      >
                        <PropertyCard
                          property={{ ...property, selectedCurrency: 'EUR' }}
                          showNightlyRate={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center mt-8">
                  <Link to="/airbnb">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      Explore All Rentals →
                    </Button>
                  </Link>
                  <div className="mt-4">
                    <Link 
                      to="/direct"
                      className="inline-block text-amber-600 hover:text-amber-700 font-medium"
                      data-cta="cta_click" 
                      data-label="bulabog_book_direct" 
                      data-page="bulabog"
                    >
                      Book direct for best rate →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No rental properties available in Bulabog at the moment.</p>
              </div>
            )}
          </Container>
        </section>

        {/* Packages Section */}
        <section className="py-16 bg-gradient-to-br from-amber-50 via-white to-blue-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                🌟 Discover Bulabog with Our Exclusive Packages
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Make your Bulabog Beach experience unforgettable with our curated packages and premium accommodations. 
                From kitesurfing lessons to adventure bundles, we have everything you need for the perfect water sports getaway.
              </p>
            </div>

            {loadingPackages ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : errorPackages ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {errorPackages}
              </div>
            ) : packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <PromoPackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No packages available at the moment.</p>
              </div>
            )}
            <div className="text-center mt-8">
              <Link to="/promos">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
                  View All Packages →
                </Button>
              </Link>
            </div>
          </Container>
        </section>

        {/* Activities Carousel Section */}
        <section className="py-16 bg-white">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                🌊 Enhance Your Bulabog Beach Experience
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover amazing activities and experiences to make your Bulabog Beach visit unforgettable. 
                From kitesurfing lessons to relaxing spa treatments, we have everything you need for the perfect adventure.
              </p>
            </div>

            {!loadingActivities && activities.length > 0 && (
              <ProductCarousel
                products={activities}
                onAddToCart={handleAddToCartFromCarousel}
                onViewPackage={handleViewPackage}
                selectedCurrency={selectedCurrency}
              />
            )}
            
            {loadingActivities && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            )}

            <div className="text-center mt-8">
              <Link to="/activities">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3">
                  View All Activities →
                </Button>
              </Link>
            </div>
          </Container>
        </section>

        <Container className="py-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Beaches
          </button>

          {/* Consolidated Section for Activities, Promos, and Rentals (First Instance) */}
          <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
            <Container>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Plan Your Perfect Boracay Experience
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Discover the best of Boracay with our curated selection of activities, exclusive promos, and comfortable rentals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Activities Card */}
                <Link 
                  to="/activities" 
                  className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100 hover:border-blue-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-100 p-3 rounded-full mb-3 group-hover:bg-blue-200 transition-colors">
                      <Activity className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                      Explore Activities
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Thrilling water sports, relaxing wellness, and island tours.
                    </p>
                  </div>
                </Link>

                {/* Promos Card */}
                <Link 
                  to="/promos" 
                  className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100 hover:border-amber-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-amber-100 p-3 rounded-full mb-3 group-hover:bg-amber-200 transition-colors">
                      <Gift className="w-8 h-8 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                      Discover Promos
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Exclusive deals on accommodations and curated packages.
                    </p>
                  </div>
                </Link>

                {/* Rentals Card */}
                <Link 
                  to="/airbnb" 
                  className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100 hover:border-green-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-green-100 p-3 rounded-full mb-3 group-hover:bg-green-200 transition-colors">
                      <Home className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                      Find Rentals
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Cozy studios, spacious villas, and beachfront apartments.
                    </p>
                  </div>
                </Link>
              </div>
            </Container>
          </section>

          {/* Media Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
            {bulabogBeachMedia.map((media, index) => {
              let className = "relative overflow-hidden rounded-lg shadow-lg transition-all duration-1000 ease-out";
              className += ` ${mediaVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`;
              
              // Special sizing for featured images
              if (index === 0) className += " col-span-2 row-span-2"; // Large hero image
              if (index === 3) className += " md:col-span-2"; // Panoramic view
              if (index === 6) className += " md:col-span-2"; // Another wide image

              return (
                <div
                  key={index}
                  ref={el => mediaRefs.current[index] = el}
                  data-index={index}
                  className={className}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <img
                    src={media.src}
                    alt={`Bulabog Beach image ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{ aspectRatio: index === 0 ? '16/9' : '4/3' }}
                  />
                </div>
              );
            })}
          </div>

          {/* Google Maps */}
          <div 
            ref={mapRef}
            className={`w-full rounded-lg overflow-hidden shadow-lg mb-16 transition-all duration-1000 ease-out ${
              mapVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1351.5936825590352!2d121.93343792514229!3d11.959877115471556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a53dd0163cebcd%3A0x3ec83a29b635af60!2sGreenyard%20boardsport!5e0!3m2!1sen!2sat!4v1751221086300!5m2!1sen!2sat" 
              width="100%" 
              height="450" 
              style={{border: 0}} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* Additional Content */}
          <div 
            className={`max-w-4xl mx-auto mb-16 transition-all duration-1000 ease-out ${
              contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Kitesurfing Paradise</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-blue-800 mb-4">Wind Season (November to April)</h3>
                <p className="text-gray-700 mb-4">
                  During the Amihan season (northeast monsoon), Bulabog Beach transforms into a world-class kitesurfing and windsurfing destination with consistent winds and perfect conditions.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Consistent 15-25 knot winds</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Protected by a reef for flat water conditions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Multiple kitesurfing schools and rental shops</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>International kitesurfing community</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-green-800 mb-4">Off-Wind Season (May to October)</h3>
                <p className="text-gray-700 mb-4">
                  During the Habagat season (southwest monsoon), Bulabog Beach becomes calm and peaceful, offering a different experience for visitors.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Calm waters perfect for swimming and paddleboarding</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Quieter atmosphere with fewer tourists</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Beautiful sunrise views over the water</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Local fishing activities to observe</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-lg shadow mb-8">
              <h3 className="text-xl font-bold text-amber-800 mb-4">Learning to Kitesurf</h3>
              <p className="text-gray-700 mb-4">
                Bulabog Beach is one of the best places in Asia to learn kitesurfing, with numerous schools offering lessons for all levels.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Recommended Schools</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span className="font-semibold"><a href="https://www.instagram.com/greenyard_kitesurfing/" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Greenyard Kitesurfing School</a> <span className="text-green-600">(Highly Recommended)</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Isla Kitesurfing</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Habagat Kiteboarding Center</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Freestyle Academy Boracay</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">What to Expect</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Beginner lessons: ₱3,500-5,000 per hour</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Equipment rental: ₱2,000-3,000 per hour</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>3-5 days to learn basics</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>IKO-certified instructors available</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
                <p className="text-amber-800 font-medium">
                  <span className="font-bold">Pro Tip:</span> Greenyard Kitesurfing School is our top recommendation for its excellent instructors, great atmosphere, and professional approach. They're known for their safety standards and personalized instruction.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Beyond Kitesurfing</h3>
              <p className="text-gray-700 mb-4">
                While kitesurfing is the main attraction, Bulabog Beach offers much more for visitors who aren't into water sports.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-gray-600 mr-2">•</span>
                  <span><strong>Morning Walks:</strong> The beach is perfect for sunrise walks and jogging</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-600 mr-2">•</span>
                  <span><strong>Beachfront Cafés:</strong> Several laid-back cafés offer great views of kitesurfers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-600 mr-2">•</span>
                  <span><strong>Photography:</strong> Excellent opportunities to capture action shots and beautiful landscapes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-600 mr-2">•</span>
                  <span><strong>Accommodations:</strong> More affordable options compared to White Beach</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-600 mr-2">•</span>
                  <span><strong>Local Culture:</strong> Closer interaction with local communities and fishermen</span>
                </li>
              </ul>
            </div>
          </div>

          {/* FAQ Section */}
          <div 
            className={`max-w-4xl mx-auto mb-16 transition-all duration-1000 ease-out ${
              contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
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

          <Blog />
        </Container>
      </div>
    </>
  );
};

export default BulabogBeachPage;
