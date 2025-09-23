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

const iliganBeachImages = [
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298674/boracay_real_estate_dcztd5.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298672/boracay_house_for_sale_sthnez.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298669/boracay_property_for_sale_hafvla.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298666/property_for_sale_in_boracay_bxrtor.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298663/house_for_sale_boracay_sslhac.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298661/real_estate_boracay_ivwa4v.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298658/boracay_homes_for_sale_af2pto.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298655/property_for_sale_boracay_pmkvb7.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298653/boracay_properties_for_sale_l0odgo.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298650/boracay_for_sale_owxlfl.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298647/house_for_sale_in_boracay_fly1yg.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298644/boracay_houses_for_sale_ebskzd.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298642/properties_for_sale_in_boracay_bisuim.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298639/homes_for_sale_in_boracay_philippines_gpmkq1.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298636/boracay_philippines_real_estate_mj0nbi.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298634/boracay_apartment_for_sale_s06n0p.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298631/boracay_house_imxyea.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298629/boracay_real_estate_for_sale_rstvqc.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298626/boracay_resort_for_sale_rbp3ok.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298623/houses_for_sale_in_boracay_xmvhet.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298621/houses_in_boracay_inbbhb.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298618/boracay_villa_for_sale_qjev4o.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298616/boracay_house_for_rent_erfzb3.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298613/boracay_beach_house_for_sale_p1kj1w.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298611/homes_for_sale_boracay_philippines_f5wvns.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751298609/boracay_properties_blimzf.jpg",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218635/Iligajn_Beachwebp_ntyigy.webp",
  "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218635/ilig-iligan-beach_qrrxpd.webp"
];

const IliganBeachPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart();
  const carouselInnerRef = useRef<HTMLDivElement>(null);
  const originalPropertiesCountRef = useRef<number>(0);
  const AIRBNB_CARDS_PER_VIEW = 3;
  const [imagesVisible, setImagesVisible] = useState<boolean[]>(new Array(iliganBeachImages.length).fill(false));
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
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
        .eq('location', 'Diniwid') // Filter for Diniwid location (closest to Iligan Beach)
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
              setImagesVisible(prev => {
                const newVisibility = [...prev];
                newVisibility[index] = true;
                return newVisibility;
              });
            }
            observer.unobserve(entry.target); // Stop observing once visible
          }
        });
      },
      { threshold: 0.1 }
    );

    imageRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      imageRefs.current.forEach(ref => {
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
        title="Iligan Beach Boracay – Hidden Snorkeling Spot Near Diniwid"
        description="Visit Iligan Beach, one of Boracay's best-kept secrets. Ideal for snorkeling, swimming, and relaxing away from White Beach crowds. Find nearby rentals, packages, and activities."
        keywords="Iligan Beach Boracay, Ilig-Iligan, snorkeling Boracay, east Boracay beach, hidden beach Boracay, Iligan Beach rentals, Iligan Beach activities"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218635/Iligajn_Beachwebp_ntyigy.webp"
        url="https://boracay.house/beaches/iligan"
        type="article"
        canonical="https://boracay.house/beaches/iligan"
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {"@type":"ListItem","position":1,"name":"Beaches","item":"https://boracay.house/beaches"},
              {"@type":"ListItem","position":2,"name":"Iligan Beach","item":"https://boracay.house/beaches/ilig-iligan-beach"}
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
                backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218635/Iligajn_Beachwebp_ntyigy.webp)',
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
                🏖️ Iligan Beach (Ilig-Iligan)
              </h1>
              <div 
                ref={contentRef}
                className={`transition-all duration-1000 ease-out ${
                  contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <p className="text-lg text-gray-200 max-w-3xl mx-auto">
                  A hidden gem on the east side, Iligan Beach is great for snorkeling and swimming in calm, clear water. Perfect for adventurers and families seeking a peaceful shore.
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
                Find Your Perfect Stay Near Iligan Beach
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Browse our handpicked selection of affordable and premium Airbnb-style rentals near Iligan Beach.
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleAirbnbNext}
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
                  <Link to="/airbnb?location=Diniwid">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      Explore All Diniwid Rentals →
                    </Button>
                  </Link>
                  <div className="mt-4">
                    <Link 
                      to="/direct"
                      className="inline-block text-amber-600 hover:text-amber-700 font-medium"
                      data-cta="cta_click" 
                      data-label="iligan_book_direct" 
                      data-page="iligan"
                    >
                      Book direct for best rate →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No rental properties available near Iligan Beach at the moment.</p>
              </div>
            )}
          </Container>
        </section>

        {/* Packages Section */}
        <section className="py-16 bg-gradient-to-br from-amber-50 via-white to-blue-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                🌟 Discover Iligan Beach with Our Exclusive Packages
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Make your Iligan Beach experience unforgettable with our curated packages and premium accommodations. 
                From snorkeling adventures to peaceful retreats, we have everything you need for the perfect hidden gem getaway.
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
                  View All Promos →
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
                🌊 Enhance Your Iligan Beach Experience
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover amazing activities and experiences to make your Iligan Beach visit unforgettable. 
                From snorkeling tours to relaxing spa treatments, we have everything you need for the perfect hidden gem adventure.
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

          {/* Image Mosaic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            {iliganBeachImages.slice(0, 12).map((src, index) => {
              let className = "relative overflow-hidden rounded-lg shadow-lg transition-all duration-1000 ease-out";
              className += ` ${imagesVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`;

              // Special sizing for featured images
              if (index === 0) className += " col-span-2 row-span-2"; // Large hero image
              if (index === 3) className += " md:col-span-2"; // Panoramic view
              if (index === 7) className += " md:col-span-2"; // Another wide image

              return (
                <div
                  key={index}
                  ref={el => imageRefs.current[index] = el}
                  data-index={index}
                  className={className}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <img
                    src={src}
                    alt={`Iligan Beach image ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{ aspectRatio: index === 0 ? '16/9' : '4/3' }} // Different aspect ratio for hero
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3521.5154470259054!2d121.92338273148778!3d11.984554500137579!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a53c5e108c4deb%3A0xbc9ed02c483c67d5!2sIlig%20-%20Iligan%20Beach!5e0!3m2!1sen!2sat!4v1751219860237!5m2!1sen!2sat" 
              width="100%" 
              height="450" 
              style={{border: 0}} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* Consolidated Section for Activities, Promos, and Rentals (Second Instance) */}
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

          {/* Exceptional Blog for Boracay section */}
          <Blog />
        </Container>
      </div>
    </>
  );
};

export default IliganBeachPage;
