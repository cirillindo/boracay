import React, { useState, useEffect, useRef } from 'react';
import Container from '../components/ui/Container';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import Blog from '../components/home/Blog';
import { ArrowLeft, ChevronLeft, ChevronRight, Star, Award, ShoppingCart, Info, Bed, MessageCircle, Phone, Plus, Minus, Share2, Check, Compass, MapPin, Sun, Home, Activity, Gift, DollarSign } from 'lucide-react'; // Added Activity, Gift, DollarSign for new section icons
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useShoppingCart } from '../context/ShoppingCartContext';
import { Property } from '../types';
import PromoPackageCard from '../components/shared/PromoPackageCard';
import PropertyCard from '../components/property/PropertyCard';
import ProductCarousel from '../components/shared/ProductCarousel';
import { playSound } from '../utils/audio'; // Re-add playSound import

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

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  poster?: string;
  formats?: { src: string; type: string }[];
  orientation?: 'vertical' | 'horizontal';
  layoutType: 'hero' | 'wide' | 'normal' | 'vertical'; // Added layoutType
}

const whiteBeachMedia = [
  // Images
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299514/real_estate_boracay_a1wopy.jpg", layoutType: 'hero' },
  { type: 'image', src: "https://res.cloudinary.com/dayqsxlnt/image/upload/v1757875716/119171204_10157748364443565_6327406065965629675_n_iqvrvw.jpg", layoutType: 'wide' },
  { type: 'image', src: "https://res.cloudinary.com/dayqsxlnt/image/upload/v1757875716/119567061_10157748364898565_1343395690176261180_n_see252.jpg", layoutType: 'wide' },
  { type: 'image', src: "https://res.cloudinary.com/dayqsxlnt/image/upload/v1757875716/119446370_10157748364658565_4810911872129530965_n_fx9cmn.jpg", layoutType: 'wide' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299511/house_for_sale_boracay_llsaqr.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299507/property_for_sale_in_boracay_znwfae.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299504/boracay_property_for_sale_inzpkk.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299501/boracay_house_for_sale_tqompa.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299474/boracay_real_estate_oo4a4e.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299471/boracay_beachfront_properties_for_sale_o3t8yh.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299468/boracay_house_rental_yehgiv.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299465/house_in_boracay_tsowz7.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299462/boracay_apartments_for_sale_jk0ycs.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299459/house_for_sale_boracay_philippines_oe2koc.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299456/houses_for_rent_in_boracay_philippines_yksczu.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299453/boracay_villas_for_sale_imprbs.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299450/land_for_sale_in_boracay_s7wr7z.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299447/house_and_lot_for_sale_in_boracay_yaunnk.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299444/real_estate_boracay_philippines_sza1am.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299441/boracay_rent_house_sdacqp.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299438/boracay_house_and_lot_for_sale_dzxz0c.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299435/house_for_rent_in_boracay_liadvi.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299432/house_in_boracay_for_sale_hwhgza.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299429/boracay_business_for_sale_q4hfig.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299426/boracay_house_for_sale_prices_uslkak.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299423/houses_for_sale_boracay_llylc1.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299420/house_for_sale_in_boracay_philippines_i8dtbq.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299417/property_in_boracay_prc41c.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299414/houses_for_sale_in_boracay_philippines_zkutrn.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299411/boracay_land_for_sale_mekvvq.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299408/boracay_island_real_estate_wl3tfs.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299405/boracay_houses_pvojxc.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299402/house_for_rent_boracay_l3fsxp.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299399/boracay_properties_iz3wii.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299396/homes_for_sale_boracay_philippines_oygtb7.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299393/boracay_beach_house_for_sale_ok14mj.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299390/boracay_house_for_rent_hfxhcn.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299388/boracay_villa_for_sale_ggjhmr.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299385/houses_in_boracay_fipl69.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299382/houses_for_sale_in_boracay_csioiy.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299379/boracay_resort_for_sale_fruhy9.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299376/boracay_real_estate_for_sale_l3fbgt.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299373/boracay_house_ghlqy6.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299370/boracay_apartment_for_sale_p7uxng.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299367/boracay_houses_for_sale_fhfslf.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299365/boracay_philippines_real_estate_bfr5zg.jpg", layoutType: 'normal' },
  { type: 'image', src: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751299361/homes_for_sale_in_boracay_philippines_xqzpol.jpg", layoutType: 'normal' },

  // Vertical Videos
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
    src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443644/IMG_9206_dtzr4l.mov",
    poster: "https://res.cloudinary.com/dq3fftsfa/image/upload/w_500/v1751443644/IMG_9206_dtzr4l.jpg",
    formats: [
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443644/IMG_9206_dtzr4l.mp4", type: "video/mp4" },
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_vp9/v1751443644/IMG_9206_dtzr4l.webm", type: "video/webm" }
    ],
    orientation: 'vertical'
  },
  { 
    type: 'video', 
    src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443630/IMG_9202_gyrwuc.mov",
    poster: "https://res.cloudinary.com/dq3fftsfa/image/upload/w_500/v1751443630/IMG_9202_gyrwuc.jpg",
    formats: [
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443630/IMG_9202_gyrwuc.mp4", type: "video/mp4" },
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_vp9/v1751443630/IMG_9202_gyrwuc.webm", type: "video/webm" }
    ],
    orientation: 'vertical'
  },
  { 
    type: 'video', 
    src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443333/IMG_1300_rmlfmk.mov",
    poster: "https://res.cloudinary.com/dq3fftsfa/image/upload/w_500/v1751443333/IMG_1300_rmlfmk.jpg",
    formats: [
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443333/IMG_1300_rmlfmk.mp4", type: "video/mp4" },
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_vp9/v1751443333/IMG_1300_rmlfmk.webm", type: "video/webm" }
    ],
    orientation: 'vertical'
  },
  { 
    type: 'video', 
    src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443286/WhatsApp_Video_2024-06-07_at_15.14.24_2_pgyxh6.mp4",
    poster: "https://res.cloudinary.com/dq3fftsfa/image/upload/w_500/v1751443286/WhatsApp_Video_2024-06-07_at_15.14.24_2_pgyxh6.jpg",
    formats: [
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443286/WhatsApp_Video_2024-06-07_at_15.14.24_2_pgyxh6.mp4", type: "video/mp4" },
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_vp9/v1751443286/WhatsApp_Video_2024-06-07_at_15.14.24_2_pgyxh6.webm", type: "video/webm" }
    ],
    orientation: 'vertical'
  },
  { 
    type: 'video', 
    src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443237/IMG_9028_bmxjnz.mov",
    poster: "https://res.cloudinary.com/dq3fftsfa/image/upload/w_500/v1751443237/IMG_9028_bmxjnz.jpg",
    formats: [
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443237/IMG_9028_bmxjnz.mp4", type: "video/mp4" },
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_vp9/v1751443237/IMG_9028_bmxjnz.webm", type: "video/webm" }
    ],
    orientation: 'vertical'
  },
  { 
    type: 'video', 
    src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443229/IMG_9030_ptsmzg.mov",
    poster: "https://res.cloudinary.com/dq3fftsfa/image/upload/w_500/v1751443229/IMG_9030_ptsmzg.jpg",
    formats: [
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_h265/v1751443229/IMG_9030_ptsmzg.mp4", type: "video/mp4" },
      { src: "https://res.cloudinary.com/dq3fftsfa/video/upload/f_auto,q_auto,vc_vp9/v1751443229/IMG_9030_ptsmzg.webm", type: "video/webm" }
    ],
    orientation: 'vertical'
  }
];

const WhiteBeachPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart();
  const carouselInnerRef = useRef<HTMLDivElement>(null);
  const originalPropertiesCountRef = useRef<number>(0);
  const AIRBNB_CARDS_PER_VIEW = 3;
  const [mediaVisible, setMediaVisible] = useState<boolean[]>(new Array(whiteBeachMedia.length).fill(false));
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentVisible, setContentVisible] = useState(false);

  // Declare isVisible state here
  const [isVisible, setIsVisible] = useState(false); 

  // State for Airbnb Carousel
  const [airbnbProperties, setAirbnbProperties] = useState<Property[]>([]);
  const [loadingAirbnbProperties, setLoadingAirbnbProperties] = useState(true);
  const [airbnbCarouselIndex, setAirbnbCarouselIndex] = useState(0);
  const [isAutoPlayingAirbnb, setIsAutoPlayingAirbnb] = useState(true);
  const airbnbCarouselRef = useRef<HTMLDivElement>(null);
  const airbnbScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    // Set isVisible to true on component mount for hero animation
    setIsVisible(true);

    loadAirbnbProperties();
    loadPackagesData(); // Renamed from loadPromos for clarity
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
    }, 2000); // Newspaper-style slower scrolling

    return () => clearInterval(interval);
  }, [isAutoPlayingAirbnb, originalPropertiesCountRef.current]);

  const loadAirbnbProperties = async () => {
    setLoadingAirbnbProperties(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_for_rent', true)
        .not('nightly_rate_min', 'is', null)
        .order('nightly_rate_min', { ascending: true }); // Order from cheapest to most expensive

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Store original count and create seamless loop with triple duplication
        originalPropertiesCountRef.current = data.length;
        const extendedData = [...data, ...data, ...data]; // Triple for seamless loop
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

  const loadPackagesData = async () => { // Renamed from loadPromos
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
    addToCart({
      id: pkg.id,
      name: pkg.name,
      price: pkg.base_price_php, // Store base price, total calculated in cart context
      quantity: selectedParticipants,
      selectedDate: new Date(), // Placeholder, packages might not have specific dates
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
    const total = calculateTotal(pkg);
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
              
              if (whiteBeachMedia[index].type === 'video' && videoRefs.current[index]) {
                videoRefs.current[index]?.play().catch(e => console.log('Video play failed:', e));
              }
            }
            observer.unobserve(entry.target);
          } else {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            if (whiteBeachMedia[index].type === 'video' && videoRefs.current[index]) {
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

    return () => {
      mediaRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
      if (mapRef.current) observer.unobserve(mapRef.current);
      if (contentRef.current) observer.unobserve(contentRef.current);
    };
  }, []);

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
        title="White Beach Boracay — Stations 1, 2 & 3 Guide (Map, Best Time, Tips)"
        description="Plan your visit to White Beach, Boracay. Stations 1–3 explained: where to swim, eat, and stay. Map, seasons, and nearby areas like D'Mall and Willy's Rock."
        keywords="White Beach Boracay, Station 1, Station 2, Station 3, Boracay map, Boracay tips"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218560/Move_to_Boracay_u8a1qm.webp"
        url="https://boracay.house/beaches/white-beach"
        type="article"
        canonical="https://boracay.house/beaches/white-beach"
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {"@type":"ListItem","position":1,"name":"Beaches","item":"https://boracay.house/beaches"},
              {"@type":"ListItem","position":2,"name":"White Beach","item":"https://boracay.house/beaches/white-beach"}
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Beach",
            "name": "White Beach, Boracay",
            "description": "4-km white sand beach divided into Station 1, Station 2, and Station 3 with dining, nightlife, and water activities.",
            "touristType": ["Families","Couples","Solo travelers","Groups"],
            "geo": {"@type":"GeoCoordinates","latitude":11.9592,"longitude":121.9240},
            "containedInPlace":{"@type":"TouristDestination","name":"Boracay Island"},
            "url":"https://boracay.house/beaches/white-beach",
            "image": whiteBeachMedia.filter(m=>m.type==='image').slice(0,6).map((m)=>m.src)
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "White Beach Boracay — Stations 1, 2 & 3 Guide",
            "url": "https://boracay.house/beaches/white-beach",
            "primaryImageOfPage": whiteBeachMedia.filter(m=>m.type==='image')[0]?.src,
            "about": {"@type":"Thing","name":"White Beach Boracay"}
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context":"https://schema.org",
            "@type":"FAQPage",
            "mainEntity":[
              {
                "@type":"Question",
                "name":"Which station is best in White Beach Boracay?",
                "acceptedAnswer":{"@type":"Answer","text":"Station 1 has wider beach and upscale spots, Station 2 is the center with D'Mall and nightlife, Station 3 is quieter with budget options."}
              },
              {
                "@type":"Question",
                "name":"When is the best time to visit White Beach?",
                "acceptedAnswer":{"@type":"Answer","text":"November–May offers calmer seas and more sun. June–October is quieter with better prices and occasional showers."}
              },
              {
                "@type":"Question",
                "name":"How long is White Beach and can you walk it?",
                "acceptedAnswer":{"@type":"Answer","text":"About 4 kilometers end‑to‑end. Yes—you can walk the full stretch along the sand."}
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="h-32" /> {/* Spacer for fixed navbar */}

        {/* Hero Section */}
        <section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <video
              className="absolute inset-0 w-full h-full object-cover animate-hero"
              autoPlay
              loop
              muted
              playsInline
              style={{ willChange: 'transform' }}
            >
              <source src="https://res.cloudinary.com/dq3fftsfa/video/upload/v1754913825/White_beach_Boracay_qjnbgz.mov" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="theater-curtain" />

          <Container className="relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                🌊 White Beach
              </h1>
              <div 
                ref={contentRef}
                className={`transition-all duration-1000 ease-out ${
                  contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <p className="text-lg text-gray-200 max-w-3xl mx-auto">
                  Boracay's iconic stretch, White Beach is the heart of the island with fine white sand, bars, shops, and endless beach activities. Divided into three stations, this 4-kilometer paradise offers everything from vibrant nightlife to serene sunset views.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Airbnb Carousel Section */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Find Your Perfect Stay Near White Beach
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Browse our handpicked selection of affordable and premium Airbnb-style rentals.
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
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${airbnbCarouselIndex * (100 / AIRBNB_CARDS_PER_VIEW)}%)`,
                    }}
                  >
                    {airbnbProperties.map((property) => (
                      <div
                        key={property.id}
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
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No rental properties available at the moment.</p>
              </div>
            )}
          </Container>
        </section>

        {/* Packages Section */}
        <section className="py-16 bg-gradient-to-br from-amber-50 via-white to-blue-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                🌟 Discover White Beach with Our Exclusive Packages
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Make your White Beach experience unforgettable with our curated packages and premium accommodations. 
                From luxury stays to adventure bundles, we have everything you need for the perfect Boracay getaway.
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
                🌊 Enhance Your White Beach Experience
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover amazing activities and experiences to make your White Beach visit unforgettable. 
                From water sports to relaxing spa treatments, we have everything you need.
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
          </Container>
        </section>

        <Container className="py-16">
          <a
            href="/beaches"
            className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Beaches
          </a>

          {/* Indexable intro content */}
          <div className="text-center mb-12">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-blue-900 mb-2">Your Complete White Beach Guide</h2>
                  <p className="text-base md:text-lg text-blue-800 leading-relaxed">
                    White Beach is Boracay's main shoreline: a 4‑km stretch split into Station 1, Station 2, and Station 3. Use the map, best‑season tips, and area breakdown below to plan where to swim, eat, and stay.
                  </p>
                </div>
              </div>
            </div>

            <nav aria-label="On-page" className="max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Quick Navigation</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a 
                  href="#stations" 
                  className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100 hover:border-amber-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-amber-100 p-3 rounded-full mb-3 group-hover:bg-amber-200 transition-colors">
                      <Compass className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                      Stations Overview
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      1, 2 & 3 explained
                    </span>
                  </div>
                </a>
                
                <a 
                  href="#map" 
                  className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100 hover:border-blue-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-100 p-3 rounded-full mb-3 group-hover:bg-blue-200 transition-colors">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      Map & Directions
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      How to get there
                    </span>
                  </div>
                </a>
                
                <a 
                  href="#best-time" 
                  className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100 hover:border-orange-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-orange-100 p-3 rounded-full mb-3 group-hover:bg-orange-200 transition-colors">
                      <Sun className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                      Best Time to Visit
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      Seasons & weather
                    </span>
                  </div>
                </a>
                
                <a 
                  href="#stay-nearby" 
                  className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100 hover:border-green-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-green-100 p-3 rounded-full mb-3 group-hover:bg-green-200 transition-colors">
                      <Home className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                      Where to Stay
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      Near White Beach
                    </span>
                  </div>
                </a>
              </div>
            </nav>
          </div>

          {/* Consolidated Section for Activities, Promos, and Rentals (First Instance) */}
          {consolidatedSection}

          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {whiteBeachMedia.map((media, index) => {
              const isVerticalVideo = media.type === 'video' && media.orientation === 'vertical';
              
              let className = "relative overflow-hidden rounded-xl shadow-lg transition-all duration-1000 ease-out bg-gray-100";
              className += ` ${mediaVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`;
              
              // Special sizing for featured media
              if (index === 0) className += " col-span-1 sm:col-span-2 lg:col-span-3"; // Large hero media
              if (index === 3) className += " sm:col-span-2"; // Wide media

              return (
                <div
                  key={index}
                  ref={el => mediaRefs.current[index] = el}
                  data-index={index}
                  className={className}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    aspectRatio: isVerticalVideo ? '9/16' : (media.layoutType === 'hero' ? '16/9' : '4/3')
                  }}
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.src}
                      alt={`White Beach Boracay ${media.layoutType} image ${index + 1}`}
                      width={media.layoutType === 'hero' ? 1920 : 1200} // Adjust width for hero
                      height={media.layoutType === 'hero' ? 1080 : 900} // Adjust height for hero
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

          {/* Google Maps */}
          <div 
            id="map"
            ref={mapRef}
            className={`w-full rounded-lg overflow-hidden shadow-lg mb-16 transition-all duration-1000 ease-out ${
              mapVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7162.675503007256!2d121.91486372811534!3d11.959170728148157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a53c2210040847%3A0x27aa6fffda7727f!2sStation%202!5e0!3m2!1sen!2sat!4v1751220443213!5m2!1sen!2sat" 
              width="100%" 
              height="450" 
              style={{border: 0}} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* Consolidated Section for Activities, Promos, and Rentals (Second Instance) */}
          {consolidatedSection}

          {/* Additional Content */}
          <div 
            className={`mb-16 transition-all duration-1000 ease-out ${
              contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <h2 id="stations" className="text-3xl font-bold text-gray-900 mb-6">Stations 1, 2 & 3 — what's the difference?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-amber-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-amber-800 mb-4">Station 1</h3>
                <p className="text-gray-700 mb-4">
                  The northernmost section of White Beach, known for its wider beachfront, luxury resorts, and upscale dining. This area offers a more relaxed atmosphere while still being close to the action.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>Premium accommodations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>Willy's Rock landmark</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 mr-2">•</span>
                    <span>Spacious beachfront</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-blue-800 mb-4">Station 2</h3>
                <p className="text-gray-700 mb-4">
                  The bustling center of White Beach, home to D'Mall shopping center and the island's main commercial hub. This is where you'll find the most vibrant nightlife, restaurants, and activities.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>D'Mall shopping center</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Lively bars and restaurants</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Water sports activities</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-green-800 mb-4">Station 3</h3>
                <p className="text-gray-700 mb-4">
                  The southernmost and most laid-back section of White Beach. This area offers more budget-friendly accommodations and a quieter atmosphere, perfect for those seeking relaxation.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Budget-friendly options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Relaxed atmosphere</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Local beach bars</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 bg-gray-50 p-8 rounded-lg shadow">
              <h3 id="best-time" className="text-2xl font-bold text-gray-900 mb-4">Best time to visit White Beach</h3>
              <p className="text-gray-700 mb-6">
                White Beach is beautiful year-round, but experiences different moods with the changing seasons:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Peak Season (November to May)</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Clear blue skies and calm waters</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Perfect for swimming and water activities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Vibrant nightlife and busy atmosphere</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Higher prices and more crowds</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Off Season (June to October)</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Occasional rain showers but still plenty of sun</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Fewer tourists and more relaxed vibe</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Better deals on accommodations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Perfect for budget travelers and locals</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Internal linking section */}
          <section id="stay-nearby" className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Where to stay near White Beach</h2>
            <p className="text-gray-700 mb-4">Prefer to be steps from the sand? Browse stays close to Station 1–3.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><a href="/for-sale" className="text-amber-700 underline">Homes for sale near White Beach</a></li>
              <li><a href="/airbnb" className="text-amber-700 underline">Apartments & villas for rent near White Beach</a></li>
              <li><a href="/beaches/diniwid-beach" className="text-amber-700 underline">Diniwid Beach (quiet cove, 4–10 min away)</a></li>
              <li><a href="/beaches/bulabog-beach" className="text-amber-700 underline">Bulabog Beach (watersports, sunrise side)</a></li>
            </ul>
          </section>

          <Blog />
        </Container>
      </div>
    </>
  );
};

export default WhiteBeachPage;
