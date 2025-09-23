import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/ui/Container';
import SEO from '../components/SEO';
import Blog from '../components/home/Blog';
import { ArrowLeft, Activity, Gift, Home } from 'lucide-react'; // Added Activity, Gift, Home for new section icons
import { supabase } from '../lib/supabase';
import PropertyCard from '../components/property/PropertyCard';
import PromoPackageCard from '../components/shared/PromoPackageCard';
import ProductCarousel from '../components/shared/ProductCarousel';
import Button from '../components/ui/Button';
import { useShoppingCart } from '../context/ShoppingCartContext';
import { Property, Package as PackageType, Activity as ActivityType, Product } from '../types';
import { playSound } from '../utils/audio'; // Ensure playSound is imported

const diniwidBeachMedia = [
  // Original Images
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218611/Diniwid_beach_sunset_rnzv4n.webp" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218612/Diniwid_Beach_wvg5mw.webp" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218610/Diniwid_Beach_relax_vyv3bm.webp" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218609/Diniwid_Beach_Boracay_ycusek.webp" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218608/Diniwid_Beach_baby_zrbh6c.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218612/Diniwid_from_air_sxldvd.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218614/Diniwid_real_estate_uynyp6.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218613/Diniwid_real_aestate_us9pio.webp" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218608/Buy_a_house_in_Diniwid_op4558.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218608/Buy_a_house_in_Boracay_ofkkl3.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218608/Boracay_properties_guvrew.jpg" },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218615/Move_to_Boracay_cwkrs3.jpg" },
  
  // New Images
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751443743/DJI_0571_hmpj75.jpg" },

  // Vertical Videos
  { 
    type: 'video', 
    src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443733/DJI_0585_zulcsr.mov",
    poster: "https://res.cloudinary.com/dq3fftsfa/image/upload/w_500/v1751443733/DJI_0585_zulcsr.jpg",
    formats: [
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443733/IMG_9659_xhdwqf.mp4", type: "video/mp4" },
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_vp9/v1751443733/IMG_9659_xhdwqf.webm", type: "video/webm" }
    ],
    orientation: 'vertical'
  },
  { 
    type: 'video', 
    src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443659/IMG_9659_xhdwqf.mov",
    poster: "https://res.cloudinary.com/dq3fftsfa/image/upload/w_500/v1751443659/IMG_9659_xhdwqf.jpg",
    formats: [
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443659/IMG_9659_xhdwqf.mp4", type: "video/mp4" },
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_vp9/v1751443659/IMG_9659_xhdwqf.webm", type: "video/webm" }
    ],
    orientation: 'vertical'
  },
  { 
    type: 'video', 
    src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443587/IMG_1510_wbuo3j.mov",
    poster: "https://res.cloudinary.com/dq3fftsfa/image/upload/w_500/v1751443587/IMG_1510_wbuo3j.jpg",
    formats: [
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443587/IMG_1510_wbuo3j.mp4", type: "video/mp4" },
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_vp9/v1751443587/IMG_1510_wbuo3j.webm", type: "video/webm" }
    ],
    orientation: 'vertical'
  },
  { 
    type: 'video', 
    src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443531/IMG_1507_wsmtc0.mov",
    poster: "https://res.cloudinary.com/dq3fftsfa/image/upload/w_500/v1751443531/IMG_1507_wsmtc0.jpg",
    formats: [
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443531/IMG_1507_wsmtc0.mp4", type: "video/mp4" },
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_vp9/v1751443531/IMG_1507_wsmtc0.webm", type: "video/webm" }
    ],
    orientation: 'vertical'
  },
  { 
    type: 'video', 
    src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443283/WhatsApp_Video_2024-06-07_at_15.14.31_3_wab2qb.mp4",
    poster: "https://res.cloudinary.com/dq3fftsfa/image/upload/w_500/v1751443283/WhatsApp_Video_2024-06-07_at_15.14.31_3_wab2qb.jpg",
    formats: [
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443283/WhatsApp_Video_2024-06-07_at_15.14.31_3_wab2qb.mp4", type: "video/mp4" },
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_vp9/v1751443283/WhatsApp_Video_2024-06-07_at_15.14.31_3_wab2qb.webm", type: "video/webm" }
    ],
    orientation: 'vertical'
  },
  { 
    type: 'video', 
    src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443361/IMG_1437_smqtb3.mov",
    poster: "https://res.cloudinary.com/dq3fftsfa/image/upload/w_500/v1751443361/IMG_1437_smqtb3.jpg",
    formats: [
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443361/IMG_1437_smqtb3.mp4", type: "video/mp4" },
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_vp9/v1751443361/IMG_1437_smqtb3.webm", type: "video/webm" }
    ],
    orientation: 'vertical'
  },
  { 
    type: 'video', 
    src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443243/4995001665119761816_mphp4c.mov",
    poster: "https://res.cloudinary.com/dq3fftsfa/image/upload/w_500/v1751443243/4995001665119761816_mphp4c.jpg",
    formats: [
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443243/IMG_9030_ptsmzg.mp4", type: "video/mp4" },
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_vp9/v1751443243/IMG_9030_ptsmzg.webm", type: "video/webm" }
    ],
    orientation: 'vertical'
  }
];

const DiniwidBeachPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart();
  
  // Existing state
  const [mediaVisible, setMediaVisible] = useState<boolean[]>(new Array(diniwidBeachMedia.length).fill(false));
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentVisible, setContentVisible] = useState(false);
  
  // New state for sections
  const [rentalProperties, setRentalProperties] = useState<Property[]>([]);
  const [loadingRentalProperties, setLoadingRentalProperties] = useState(true);
  const [promoPackages, setPromoPackages] = useState<PackageType[]>([]);
  const [loadingPromoPackages, setLoadingPromoPackages] = useState(true);
  const [activitiesForCarousel, setActivitiesForCarousel] = useState<Product[]>([]);
  const [loadingActivitiesForCarousel, setLoadingActivitiesForCarousel] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'PHP' | 'EUR'>('PHP');

  // Handler functions
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

  // Data fetching
  const loadSectionData = async () => {
    try {
      // Fetch all data concurrently using Promise.all for faster loading
      const [
        rentalsResponse,
        packagesResponse,
        activitiesResponse,
        packagesForCarouselResponse
      ] = await Promise.all([
        // Fetch rental properties near Diniwid
        supabase
          .from('properties')
          .select('*')
          .eq('is_for_rent', true)
          .in('location', ['Diniwid', 'Monaco Suites', 'Bulabog'])
          .not('nightly_rate_min', 'is', null)
          .order('created_at', { ascending: false })
          .limit(12),
        
        // Fetch promo packages
        supabase
          .from('packages')
          .select('*')
          .order('is_top_product', { ascending: false })
          .order('is_most_sold', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(6),
        
        // Fetch activities for carousel
        supabase
          .from('activities')
          .select('*')
          .eq('is_online', true)
          .order('is_top_product', { ascending: false })
          .order('is_most_sold', { ascending: false })
          .order('name')
          .limit(9),
        
        // Fetch packages for carousel
        supabase
          .from('packages')
          .select('*')
          .order('is_top_product', { ascending: false })
          .order('is_most_sold', { ascending: false })
          .limit(9)
      ]);

      // Process rental properties
      if (rentalsResponse.data) {
        setRentalProperties(rentalsResponse.data);
        console.log('Rental properties data:', rentalsResponse.data);
      }
       if (rentalsResponse.error) {
         console.error('Error loading rental properties:', rentalsResponse.error);
       }
      setLoadingRentalProperties(false);

      // Process promo packages
      if (packagesResponse.data) {
         // Filter out sold out packages for display
         const availablePackages = packagesResponse.data.filter(pkg => !pkg.is_sold_out);
         setPromoPackages(availablePackages);
         console.log('Promo packages data (before filter):', packagesResponse.data);
         console.log('Available packages (after filter):', availablePackages);
      }
       if (packagesResponse.error) {
         console.error('Error loading packages:', packagesResponse.error);
       }
      setLoadingPromoPackages(false);

      // Process activities and packages for carousel
      const activities = activitiesResponse.data || [];
      const packagesForCarousel = packagesForCarouselResponse.data || [];

      // Combine and format for carousel
      const combinedProducts: Product[] = [
        ...activities.map(activity => ({
          ...activity,
          type: 'activity' as const
        })),
        ...packagesForCarousel.map(pkg => ({
          ...pkg,
          type: 'package' as const,
          price_php: pkg.base_price_php
        }))
      ];

      setActivitiesForCarousel(combinedProducts);
      console.log('Activities for carousel:', activities);
      console.log('Packages for carousel:', packagesForCarousel);
      setLoadingActivitiesForCarousel(false);
    } catch (error) {
      console.error('Error loading section data:', error);
      setLoadingRentalProperties(false);
      setLoadingPromoPackages(false);
      setLoadingActivitiesForCarousel(false);
    }
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
              
              if (diniwidBeachMedia[index].type === 'video' && videoRefs.current[index]) {
                videoRefs.current[index]?.play().catch(e => console.log('Video play failed:', e));
              }
            }
            observer.unobserve(entry.target);
          } else {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            if (diniwidBeachMedia[index].type === 'video' && videoRefs.current[index]) {
              videoRefs.current[index]?.pause();
            }
          }
        });
      },
      { threshold: 0.5 }
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

    // Load section data
    loadSectionData();

    return () => {
      mediaRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
      if (mapRef.current) observer.unobserve(mapRef.current);
      if (contentRef.current) observer.unobserve(contentRef.current);
    };
  }, []);

  // Build unique list of images for JSON-LD
  const beachImages = [...new Map(
    diniwidBeachMedia.filter(m => m.type === 'image').map(m => [m.src, m])
  ).values()].slice(0, 6).map(m => m.src);

  // JSON-LD Schemas
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Beaches", "item": "https://boracay.house/beaches" },
      { "@type": "ListItem", "position": 2, "name": "Diniwid Beach", "item": "https://boracay.house/beaches/diniwid-beach" }
    ]
  };

  const beachSchema = {
    "@context": "https://schema.org",
    "@type": "Beach",
    "name": "Diniwid Beach, Boracay",
    "description": "Quiet cove north of White Beach with a scenic cliff path from Station 1 and sunset views.",
    "geo": { "@type": "GeoCoordinates", "latitude": 11.9763, "longitude": 121.9091 },
    "url": "https://boracay.house/beaches/diniwid-beach",
    "image": beachImages,
    "containedInPlace": { "@type": "TouristDestination", "name": "Boracay, Malay, Aklan, Philippines" }
  };

  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Diniwid Beach Boracay — Quiet Cove by Station 1",
    "url": "https://boracay.house/beaches/diniwid-beach",
    "primaryImageOfPage": beachImages?.[0]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How do I get to Diniwid from Station 1?", "acceptedAnswer": { "@type": "Answer", "text": "Walk the cliff path at the north end of Station 1 (check tides) or take an e-trike in ~8–12 minutes." } },
      { "@type": "Question", "name": "Is Diniwid good for swimming?", "acceptedAnswer": { "@type": "Answer", "text": "On calm days, yes. It's a small, sheltered cove. Avoid rough seas." } },
      { "@type": "Question", "name": "How far is Diniwid from D'Mall?", "acceptedAnswer": { "@type": "Answer", "text": "About 10–15 minutes by e-trike depending on traffic." } },
      { "@type": "Question", "name": "Where to stay near Diniwid?", "acceptedAnswer": { "@type": "Answer", "text": "Boutique hotels and hillside villas by the cove; many options a short walk or e-trike from White Beach." } }
    ]
  };

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
        title="Diniwid Beach Boracay — Quiet Cove by Station 1 (Map, Path, Stays)"
        description="Small, peaceful cove just north of White Beach. Map, cliff path from Station 1, best time, and places to stay near Diniwid: villas, apartments, boutique hotels."
        keywords="Diniwid Beach Boracay,Diniwid map,Diniwid cliff path,how to get to Diniwid,hotels near Diniwid,villas near Diniwid"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218611/Diniwid_beach_sunset_rnzv4n.webp"
        url="https://boracay.house/beaches/diniwid-beach"
        type="article"
        canonical="https://boracay.house/beaches/diniwid-beach"
      />

      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
        <script type="application/ld+json">{JSON.stringify(beachSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(webpage)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        {rentalProperties?.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "itemListElement": rentalProperties.map((p, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "url": `https://boracay.house/${p.slug}`,
                "name": p.title
              }))
            })}
          </script>
        )}
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="h-32" /> {/* Spacer for fixed navbar */}

        {/* Hero Section with Video */}
        <div className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              poster="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218611/Diniwid_beach_sunset_rnzv4n.webp"
            >
              <source src="https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1754914853/Diniwib_beach_Boracay_pogbop.mov" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <Container className="relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold text-white mb-6">
                🏝️ Diniwid Beach
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Small, intimate, and just north of White Beach, Diniwid is a quiet oasis that still offers easy access to Boracay nightlife and restaurants. With its golden sand, stunning sunsets, and relaxed atmosphere, it's perfect for those seeking a more authentic island experience.
              </p>
            </div>
          </Container>
        </div>

        {/* Intro and Navigation */}
        <Container className="pt-8">
          <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto text-center mb-4">
            Diniwid Beach is a small, quiet cove just north of White Beach (Station 1). Use the cliff path, grab sunset views, and stay in boutique hotels or hillside villas nearby.
          </p>
          <nav aria-label="On-page">
            <ul className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
              <li><a className="text-amber-700 underline" href="#map">Map & access</a></li>
              <li><a className="text-amber-700 underline" href="#stays">Places to stay</a></li>
              <li><a className="text-amber-700 underline" href="#faq">FAQ</a></li>
            </ul>
          </nav>
        </Container>

        {/* Rental Properties Section */}
        <section id="stays" className="py-16 bg-white">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Find Your Perfect Stay Near Diniwid Beach
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Browse our handpicked selection of affordable and premium Airbnb-style rentals in Diniwid.
              </p>
            </div>

            {loadingRentalProperties ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : rentalProperties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {rentalProperties.slice(0, 3).map((property, index) => (
                    <div 
                      key={property.id}
                      className="transform transition-all duration-500 hover:scale-105"
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                    <PropertyCard
                      key={property.id}
                      property={{ ...property, selectedCurrency: 'EUR' }}
                      showNightlyRate={true}
                    />
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Link to="/airbnb?location=Diniwid">
                    <Button className="bg-primary hover:bg-primary-600 text-white px-8 py-3">
                      Explore all Diniwid stays →
                    </Button>
                  </Link>
                  <div className="mt-4">
                    <Link 
                      to="/direct"
                      className="inline-block text-amber-600 hover:text-amber-700 font-medium"
                      data-cta="cta_click" 
                      data-label="diniwid_book_direct" 
                      data-page="diniwid"
                    >
                      Book direct for best rate →
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No rental properties available at the moment.</p>
              </div>
            )}
          </Container>
        </section>

        <section className="py-16 bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                ⭐ Discover Diniwid with Our Exclusive Packages
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Make your Diniwid Beach experience unforgettable with our curated packages and premium accommodations. 
                From luxury stays to adventure bundles, we have everything you need for the perfect Boracay getaway.
              </p>
            </div>

            {loadingPromoPackages ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : promoPackages.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {promoPackages.slice(0, 3).map((pkg, index) => (
                    <div 
                      key={pkg.id}
                      className="transform transition-all duration-500 hover:scale-105"
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                    <PromoPackageCard key={pkg.id} pkg={pkg} />
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Link to="/promos">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3">
                      View All Promos →
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No promo packages available at the moment.</p>
              </div>
            )}
          </Container>
        </section>

        {/* Activities Section */}
        <section className="py-16 bg-white">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                🌊 Enhance Your Diniwid Beach Experience
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover amazing activities and experiences to make your Diniwid Beach visit unforgettable. From water sports to relaxing spa treatments, we have everything you need for the perfect Boracay adventure.
              </p>
            </div>

            {loadingActivitiesForCarousel ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : activitiesForCarousel.length > 0 ? (
              <>
                <ProductCarousel
                  products={activitiesForCarousel.slice(0, 3)}
                  onAddToCart={handleAddToCartFromCarousel}
                  onViewPackage={handleViewPackage}
                  selectedCurrency={selectedCurrency}
                />
                <div className="text-center mt-8">
                  <Link to="/activities">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3">
                      View All Activities →
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No activities available at the moment.</p>
              </div>
            )}
          </Container>
        </section>

        <Container className="py-16">
          <a href="/beaches" className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors mb-8">
            <ArrowLeft className="w-5 h-5" />
            Beaches
          </a>

          {/* Consolidated Section for Activities, Promos, and Rentals (First Instance) */}
          {consolidatedSection}

          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {diniwidBeachMedia.map((media, index) => {
              const isVerticalVideo = media.type === 'video' && media.orientation === 'vertical';
              
              let className = "relative overflow-hidden rounded-xl shadow-lg transition-all duration-1000 ease-out bg-gray-100";
              className += ` ${mediaVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`;
              
              // Special sizing for featured media
              if (index === 0) className += " col-span-1 sm:col-span-2 lg:col-span-3"; // Large hero media
              if (index === 5) className += " sm:col-span-2"; // Panoramic view
              if (index === 8) className += " sm:col-span-2"; // Another wide image

              return (
                <div
                  key={index}
                  ref={el => mediaRefs.current[index] = el}
                  data-index={index}
                  className={className}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    aspectRatio: isVerticalVideo ? '9/16' : index === 0 ? '16/9' : '4/3'
                  }}
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.src}
                      alt={index === 0 ? "Diniwid Beach Boracay at sunset — quiet cove north of White Beach" : `Diniwid Beach Boracay photo ${index + 1}`}
                      width={index === 0 ? 1920 : 1200} // Adjust width for hero
                      height={index === 0 ? 1080 : 900} // Adjust height for hero
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={index === 0 ? "high" : "auto"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        ref={el => videoRefs.current[index] = el}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={`absolute inset-0 w-full h-full ${
                          isVerticalVideo ? 'object-contain' : 'object-cover'
                        } bg-black`}
                        poster={media.poster}
                        preload="metadata"
                      >
                        {media.formats?.map((format, i) => (
                          <source key={i} src={format.src} type={format.type} />
                        ))}
                        Your browser does not support HTML5 video.
                      </video>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-30">
                        <div className="w-16 h-16 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Google Maps with Lazy Loading */}
          <div 
            id="map"
            ref={mapRef}
            className={`w-full rounded-lg overflow-hidden shadow-lg mb-16 transition-all duration-1000 ease-out ${
              mapVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {!mapLoaded ? (
              <button 
                onClick={() => setMapLoaded(true)} 
                className="w-full p-6 bg-gray-50 hover:bg-gray-100 text-amber-700 font-semibold rounded-lg border-2 border-dashed border-amber-300 hover:border-amber-500 transition-colors"
              >
                Show Diniwid Beach map
              </button>
            ) : (
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.974080863589!2d121.90908741224413!3d11.976295288206153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a53c1291734c89%3A0x9d59764264cb4756!2sDiniwid%20Beach!5e0!3m2!1sen!2sat!4v1751220198939!5m2!1sen!2sat" 
                width="100%" 
                height="450" 
                style={{border: 0}} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Diniwid Beach Boracay Map"
              />
            )}
          </div>

          {/* Consolidated Section for Activities, Promos, and Rentals (Second Instance) */}
          {consolidatedSection}

          {/* Additional Content */}
          <div 
            id="faq"
            ref={contentRef}
            className={`max-w-4xl mx-auto mb-16 transition-all duration-1000 ease-out ${
              contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Diniwid Beach?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-amber-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-amber-800 mb-4">For Visitors</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>Quieter alternative to White Beach with fewer crowds</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>Stunning sunset views from a more intimate setting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>Easy 10-minute walk to White Beach via scenic coastal path</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>Boutique accommodations and cliffside restaurants</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>More authentic local atmosphere</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-blue-800 mb-4">For Property Buyers</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Premium location with excellent rental potential</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Properties with ocean views and hillside advantages</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Close to amenities but away from the main tourist crowds</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Strong appreciation potential as Boracay continues to develop</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Ideal for both personal use and investment properties</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Diniwid Beach Bar Section */}
          <section className="py-16 bg-amber-50">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                🍹 Diniwid Beach Bar — Sunset Paradise
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Experience the perfect sunset at Diniwid Beach Bar, an amazing spot right on the beach with great cocktails, fantastic views, and superb music. Everything matches up to enjoy a perfect sunset!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img
                  src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1754919064/Diniwid_Beach_copy_hh8pop.webp"
                  alt="Diniwid Beach Bar sunset views"
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img
                  src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1754919065/Diniwid_Beach_Bar_copy_e1vl8o.webp"
                  alt="Diniwid Beach Bar cocktails and atmosphere"
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img
                  src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1754919064/Diniwid_Beach_bar_Boracay_copy_pztppv.webp"
                  alt="Diniwid Beach Bar beachfront location"
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-700 mb-6">
                The bar/restaurant has an amazing island life vibe with a great crowd, fantastic views, and superb music. 
                The staff is well aware of the menu and very prompt. Perfect for watching the sunset with a refreshing drink in hand.
              </p>
              <a
                href="https://www.instagram.com/dinibeachbar/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Follow @dinibeachbar
              </a>
            </div>
          </section>

          {/* Available Studios Section */}
          <section className="py-16 bg-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                🏠 Our Available Studios Near Diniwid Beach
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Stay in our carefully curated studios and apartments just minutes from Diniwid Beach. Perfect for couples, solo travelers, and small groups seeking comfort and convenience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img
                  src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1754919064/Diniwid_Beach_bar_Boracay_copy_pztppv.webp"
                  alt="Studio accommodation near Diniwid Beach"
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img
                  src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751307518/properties/s86ctguq8gcsrjuz0wiq.jpg"
                  alt="Comfortable studio interior near Diniwid"
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img
                  src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751307516/properties/kjqnh82ee5cblniz0ynb.jpg"
                  alt="Modern studio amenities Diniwid area"
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img
                  src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751270077/properties/ipxou3qiv2pk0s0z0fi2.webp"
                  alt="Cozy studio space near Diniwid Beach"
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-700 mb-6">
                Our studios are strategically located just minutes from Diniwid Beach, offering the perfect balance of tranquility and accessibility. 
                Each unit is fully furnished with modern amenities, fast Wi-Fi, and everything you need for a comfortable stay.
              </p>
              <Link to="/airbnb">
                <Button className="bg-primary hover:bg-primary-600 text-white px-8 py-3">
                  View All Available Studios →
                </Button>
              </Link>
            </div>
          </section>

          {/* Nearby & Useful Guides */}
          <section className="max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl font-bold mb-3">Nearby & useful guides</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><a className="text-amber-700 underline" href="/beaches/white-beach">White Beach (Stations 1–3)</a></li>
              <li><a className="text-amber-700 underline" href="/blog/boracay-s-guide/where-to-stay-in-boracay-station-1-vs-station-2">Where to stay in Boracay</a></li>
              <li><a className="text-amber-700 underline" href="/airbnb?location=Diniwid">Villas & apartments near Diniwid</a></li>
              <li><a className="text-amber-700 underline" href="/for-sale?location=Diniwid">Homes for sale near Diniwid</a></li>
            </ul>
          </section>

          <Blog />
        </Container>
      </div>
    </>
  );
};

export default DiniwidBeachPage;
