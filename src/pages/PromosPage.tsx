import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Container from '../components/ui/Container';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Star, Clock, Users, Tag, Heart, Check, Info, Plus, Minus, Share2, ChevronLeft, ChevronRight, Gift, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import PaymentSelectionModal from '../components/modals/PaymentSelectionModal';
import { playSound } from '../utils/audio';
import { useShoppingCart } from '../context/ShoppingCartContext';

interface Activity {
  id: string;
  name: string;
  description: string;
  hero_image: string;
  price_php: number;
  price_type: string;
  min_pax: number;
  max_pax: number | null;
  duration_minutes: number | null;
  is_top_product: boolean;
  is_most_sold: boolean;
  category: string;
}

interface Package {
  id: string;
  name: string;
  description: string;
  hero_image: string;
  base_price_php: number;
  is_top_product: boolean;
  is_most_sold: boolean;
  min_pax: number;
  max_pax: number | null;
  min_nights: number;
  max_nights: number | null;
  whatsapp_number?: string;
  is_sold_out?: boolean;
  activities?: PackageActivity[];
}

interface PackageActivity {
  activity_id: string;
  quantity: number;
  notes?: string;
  activity: Activity;
  selected?: boolean;
  selectedDate?: Date | null;
  selectedQuantity?: number;
}

const PACKAGES_PER_PAGE = 3;

const PromosPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [currentPackagePage, setCurrentPackagePage] = useState(1);
  const [totalPackages, setTotalPackages] = useState(0);
  const [expandedPackageActivities, setExpandedPackageActivities] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('promos');
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [selectedDates, setSelectedDates] = useState<Record<string, Date | null>>({});
  const [selectedActivities, setSelectedActivities] = useState<Record<string, Record<string, boolean>>>({});
  const [selectedAddonQuantities, setSelectedAddonQuantities] = useState<Record<string, Record<string, number>>>({});
  const [selectedCurrency, setSelectedCurrency] = useState<string>('PHP');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState<Record<string, boolean>>({});
  const [packageQuantities, setPackageQuantities] = useState<Record<string, number>>({});
  const [selectedNights, setSelectedNights] = useState<Record<string, number>>({});
  const [selectedServiceForPayment, setSelectedServiceForPayment] = useState<{
    title: string;
    price: string;
    priceUSD: string;
  } | null>(null);
  const [totalAmountForPayment, setTotalAmountForPayment] = useState(0);
  const [selectedAddonsForPayment, setSelectedAddonsForPayment] = useState<string[]>([]);

  const { addToCart } = useShoppingCart();

  // Currency conversion rates
  const currencies = [
    { value: 'PHP', label: 'PHP', symbol: '₱', rate: 1 },
    { value: 'USD', label: 'USD', symbol: '$', rate: 0.0175 },
    { value: 'EUR', label: 'EUR', symbol: '€', rate: 0.016 },
    { value: 'AUD', label: 'AUD', symbol: 'A$', rate: 0.027 },
    { value: 'RUB', label: 'RUB', symbol: '₽', rate: 1.63 },
    { value: 'KRW', label: 'KRW', symbol: '₩', rate: 24 },
    { value: 'CNY', label: 'CNY', symbol: '¥', rate: 0.13 }
  ];

  // Categories for filtering
  const categories = [
    { id: 'promos', name: 'PROMOS' },
    { id: 'water_sports', name: 'Water Sports' },
    { id: 'wellness', name: 'Wellness' },
    { id: 'food_drink', name: 'Food & Drinks' },
    { id: 'transfer', name: 'Transfers' },
    { id: 'rental', name: 'Rentals' },
    { id: 'celebration', name: 'Celebration' },
    { id: 'party', name: 'Party' },
    { id: 'photoshoot', name: 'Photoshoot' }
  ];

  useEffect(() => {
    loadActivitiesAndPackages();
  }, [currentPackagePage]);

  const loadActivitiesAndPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get the total count of packages
      const { count: packageCount, error: countError } = await supabase
        .from('packages')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalPackages(packageCount || 0);

      // Load packages with their activities (paginated)
      const startIndex = (currentPackagePage - 1) * PACKAGES_PER_PAGE;
      const endIndex = startIndex + PACKAGES_PER_PAGE - 1;

      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select(`
          *,
          activities:package_activity_items(
            activity_id,
            quantity,
            notes,
            activity:activities(*)
          )
        `)
        .order('created_at', { ascending: false })
        .order('is_top_product', { ascending: false })
        .order('is_most_sold', { ascending: false })
        .range(startIndex, endIndex);

      if (packagesError) throw packagesError;

      // Load activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('is_online', true)
        .order('is_top_product', { ascending: false })
        .order('is_most_sold', { ascending: false })
        .order('name');

      if (activitiesError) throw activitiesError;

      // Sort activities to prioritize transfers first
      const sortedActivitiesData = activitiesData?.sort((a, b) => {
        // First priority: transfer category
        if (a.category === 'transfer' && b.category !== 'transfer') return -1;
        if (a.category !== 'transfer' && b.category === 'transfer') return 1;
        
        // Second priority: top products
        if (a.is_top_product && !b.is_top_product) return -1;
        if (!a.is_top_product && b.is_top_product) return 1;
        
        // Third priority: most sold
        if (a.is_most_sold && !b.is_most_sold) return -1;
        if (!a.is_most_sold && b.is_most_sold) return 1;
        
        // Fourth priority: alphabetical by name
        return a.name.localeCompare(b.name);
      });

      // Initialize quantities and dates for all activities
      const initialQuantities: Record<string, number> = {};
      const initialDates: Record<string, Date | null> = {};
      const initialSelectedActivities: Record<string, Record<string, boolean>> = {};
      const initialSelectedAddonQuantities: Record<string, Record<string, number>> = {}; 
      const initialPackageQuantities: Record<string, number> = {};
      const initialSelectedNights: Record<string, number> = {};
      
      sortedActivitiesData?.forEach(activity => {
        initialQuantities[`activity-${activity.id}`] = activity.min_pax || 1;
        initialDates[`activity-${activity.id}`] = new Date();
      });
      
      packagesData?.forEach(pkg => {
        initialQuantities[`package-${pkg.id}`] = 1;
        initialPackageQuantities[pkg.id] = pkg.min_pax || 2;
        initialSelectedNights[pkg.id] = pkg.min_nights || 2;
        initialDates[`package-${pkg.id}`] = new Date();
        
        // Initialize selected activities for all activities (not just package activities)
        initialSelectedActivities[pkg.id] = {};
        initialSelectedAddonQuantities[pkg.id] = {};
        
        sortedActivitiesData?.forEach(activity => {
          initialSelectedActivities[pkg.id][activity.id] = false;
          initialSelectedAddonQuantities[pkg.id][activity.id] = activity.min_pax || 1;
          initialDates[`package-${pkg.id}-activity-${activity.id}`] = new Date();
        });
      });

      setActivities(sortedActivitiesData || []);
      setPackages(packagesData || []);
      setSelectedQuantities(initialQuantities);
      setSelectedDates(initialDates);
      setSelectedActivities(initialSelectedActivities);
      setSelectedAddonQuantities(initialSelectedAddonQuantities);
      setPackageQuantities(initialPackageQuantities);
      setSelectedNights(initialSelectedNights);
    } catch (err) {
      console.error('Error loading activities and packages:', err);
      setError('Failed to load activities and packages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePackagePageChange = (page: number) => {
    setCurrentPackagePage(page);
  };

  const handlePreviousPackagePage = () => {
    setCurrentPackagePage(prev => {
      const totalPages = Math.ceil(totalPackages / PACKAGES_PER_PAGE);
      return prev === 1 ? totalPages : prev - 1;
    });
  };

  const handleNextPackagePage = () => {
    setCurrentPackagePage(prev => {
      const totalPages = Math.ceil(totalPackages / PACKAGES_PER_PAGE);
      return prev >= totalPages ? 1 : prev + 1;
    });
  };

  const getPackagePaginationRange = () => {
    const totalPages = Math.ceil(totalPackages / PACKAGES_PER_PAGE);
    const range: (number | string)[] = [];
    
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPackagePage <= 3) {
      range.push(1, 2, 3, 4, '...', totalPages - 1, totalPages);
    } else if (currentPackagePage >= totalPages - 2) {
      range.push(1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      range.push(1, '...', currentPackagePage - 1, currentPackagePage, currentPackagePage + 1, '...', totalPages);
    }

    return range;
  };

  const getPackageRange = () => {
    const start = (currentPackagePage - 1) * PACKAGES_PER_PAGE + 1;
    const end = Math.min(currentPackagePage * PACKAGES_PER_PAGE, totalPackages);
    return `${start}-${end}`;
  };

  const handlePackageQuantityChange = (packageId: string, value: number) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;
    
    const minPax = pkg.min_pax || 2;
    const maxPax = pkg.max_pax || 99;
    const clampedValue = Math.max(minPax, Math.min(value, maxPax));
    
    setPackageQuantities(prev => ({
      ...prev,
      [packageId]: clampedValue
    }));
  };

  const handleNightsChange = (packageId: string, value: number) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;
    
    const minNights = pkg.min_nights || 2;
    const maxNights = pkg.max_nights || 99;
    const clampedValue = Math.max(minNights, Math.min(value, maxNights));
    
    setSelectedNights(prev => ({
      ...prev,
      [packageId]: clampedValue
    }));
  };

  const handleQuantityChange = (id: string, type: 'activity' | 'package', value: number) => {
    const itemKey = `${type}-${id}`;
    
    if (type === 'activity') {
      const activity = activities.find(a => a.id === id);
      if (activity && value < activity.min_pax) {
        value = activity.min_pax;
      }
    }
    
    setSelectedQuantities(prev => ({
      ...prev,
      [itemKey]: value
    }));
  };

  const handleDateChange = (id: string, type: 'activity' | 'package', date: Date | null, activityId?: string) => {
    const itemKey = activityId 
      ? `${type}-${id}-activity-${activityId}` 
      : `${type}-${id}`;
    
    setSelectedDates(prev => ({
      ...prev,
      [itemKey]: date
    }));
  };

  const toggleActivitySelection = (packageId: string, activityId: string) => {
    setSelectedActivities(prev => {
      const packageActivities = prev[packageId] || {};
      return {
        ...prev,
        [packageId]: {
          ...packageActivities,
          [activityId]: !packageActivities[activityId]
        }
      };
    });
  };

  const handleActivityAddonQuantityChange = (packageId: string, activityId: string, value: number) => {
    const packageData = packages.find(p => p.id === packageId);
    const activityData = activities.find(a => a.id === activityId);
    
    if (activityData && value < (activityData.min_pax || 1)) {
      value = activityData.min_pax || 1;
    }
    
    setSelectedAddonQuantities(prev => ({
      ...prev,
      [packageId]: {
        ...(prev[packageId] || {}),
        [activityId]: value
      }
    }));
  };

  const togglePackageActivities = (packageId: string) => {
    setExpandedPackageActivities(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  const formatPrice = (pricePhp: number, showOriginal = false) => {
    const currencyInfo = currencies.find(c => c.value === selectedCurrency) || currencies[0];
    const convertedPrice = pricePhp * currencyInfo.rate;
    
    if (showOriginal) {
      return {
        original: `₱${pricePhp.toLocaleString()}`,
        converted: `${currencyInfo.symbol}${convertedPrice.toLocaleString(undefined, {
          maximumFractionDigits: 2
        })}`
      };
    }
    
    return `${currencyInfo.symbol}${convertedPrice.toLocaleString(undefined, {
      maximumFractionDigits: 2
    })}`;
  };

  const calculatePackageTotal = (pkg: Package) => {
    const quantity = packageQuantities[pkg.id] || pkg.min_pax || 2;
    const nights = selectedNights[pkg.id] || pkg.min_nights || 2;
    
    // 1. Calculate base price (rate × pax × nights)
    let total = pkg.base_price_php * quantity * nights;
    
    // 2. Add ALL included activities (price × quantity × pax for per_pax items, or just price × quantity for per_item)
    pkg.activities?.forEach(item => {
      // Check if the activity is priced per person or per item
      if (item.activity.price_type === 'per_pax') {
        // For per_pax activities, multiply by the number of participants
        total += item.activity.price_php * quantity * item.quantity;
      } else {
        // For per_item activities, don't multiply by the number of participants
        total += item.activity.price_php * item.quantity;
      }
    });
    
    // 3. Add selected additional activities
    Object.entries(selectedActivities[pkg.id] || {}).forEach(([activityId, isSelected]) => {
      if (isSelected) {
        // Check if this activity is not already included in the package
        const isIncluded = pkg.activities?.some(item => item.activity_id === activityId);
        if (!isIncluded) {
          const addonQuantity = selectedAddonQuantities[pkg.id]?.[activityId] || 1;
          const activity = activities.find(a => a.id === activityId);
          if (activity) {
            // Check if the activity is priced per person or per item
            if (activity.price_type === 'per_pax') {
              // For per_pax activities, multiply by the number of participants
              total += activity.price_php * addonQuantity * quantity;
            } else {
              // For per_item activities, don't multiply by the number of participants
              total += activity.price_php * addonQuantity;
            }
          }
        }
      }
    });
    
    return total;
  };

  const getFilteredActivities = () => {
    if (activeTab === 'promos') return activities;
    return activities.filter(activity => 
      activeTab === 'all' || activity.category === activeTab
    );
  };

  const getFilteredPackages = () => {
    if (activeTab !== 'promos') return [];
    return packages;
  };

  const handleBookNow = (id: string, type: 'activity' | 'package') => {
    // Only handle packages now, activities use addToCart
    if (type !== 'package') return;
    
    const item = packages.find(p => p.id === id);
    if (!item || item.is_sold_out) return;

    const totalPrice = calculatePackageTotal(item);
    const title = item.name;
    const selectedAddonsList: string[] = [];

    // Get selected addons for this package (only those not already included)
    Object.entries(selectedActivities[item.id] || {}).forEach(([activityId, isSelected]) => {
      if (isSelected) {
        const isIncluded = item.activities?.some(a => a.activity_id === activityId);
        if (!isIncluded) {
          const activity = activities.find(a => a.id === activityId);
          if (activity) {
            selectedAddonsList.push(activity.name);
          }
        }
      }
    });
    
    const { original: priceOriginal, converted: priceConverted } = formatPrice(totalPrice, true);
    
    setSelectedServiceForPayment({
      title,
      price: priceOriginal,
      priceUSD: priceConverted
    });
    
    setTotalAmountForPayment(totalPrice);
    setSelectedAddonsForPayment(selectedAddonsList);
    setIsPaymentModalOpen(true);
  };
  
  const handleAddToCartActivity = (activity: Activity) => {
    const itemKey = `activity-${activity.id}`;
    const quantity = selectedQuantities[itemKey] || activity.min_pax || 1;
    const selectedDate = selectedDates[itemKey] || new Date();
    
    addToCart({
      id: activity.id,
      name: activity.name,
      price: activity.price_php,
      selectedDate: selectedDate,
      hero_image: activity.hero_image,
      price_type: activity.price_type,
      min_pax: activity.min_pax,
      type: 'activity'
    }, quantity);
    
    playSound('click.mp3');
  };
  
  const handleAddToCartPackage = (pkg: Package) => {
    const quantity = packageQuantities[pkg.id] || pkg.min_pax || 2;
    const nights = selectedNights[pkg.id] || pkg.min_nights || 2;
    const totalPrice = calculatePackageTotal(pkg);
    const selectedDate = selectedDates[`package-${pkg.id}`] || new Date();
    
    // Create addons summary
    const selectedAddonsList: string[] = [];
    Object.entries(selectedActivities[pkg.id] || {}).forEach(([activityId, isSelected]) => {
      if (isSelected) {
        const isIncluded = pkg.activities?.some(a => a.activity_id === activityId);
        if (!isIncluded) {
          const activity = activities.find(a => a.id === activityId);
          if (activity) {
            selectedAddonsList.push(activity.name);
          }
        }
      }
    });
    
    const addonsSummary = selectedAddonsList.length > 0 
      ? `+ ${selectedAddonsList.join(', ')}` 
      : '';
    
    addToCart({
      id: pkg.id,
      name: pkg.name,
      price: totalPrice,
      selectedDate: selectedDate,
      hero_image: pkg.hero_image,
      min_pax: quantity,
      min_nights: nights,
      addons_summary: addonsSummary,
      type: 'package'
    }, 1); // Packages are added as single items with calculated total price
    
    playSound('click.mp3');
  };
  
  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
  };

  const handleShareLink = (packageId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `https://boracay.house/promos`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        playSound('click.mp3');
        
        setShowCopiedMessage(prev => ({
          ...prev,
          [packageId]: true
        }));
        
        setTimeout(() => {
          setShowCopiedMessage(prev => ({
            ...prev,
            [packageId]: false
          }));
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  const renderActivityCard = (activity: Activity) => {
    const itemKey = `activity-${activity.id}`;
    const isFavorite = favorites.has(itemKey);
    const priceDisplay = formatPrice(activity.price_php);
    const quantity = selectedQuantities[itemKey] || (activity.min_pax || 1);
    const totalPrice = activity.price_php * quantity;
    const totalPriceDisplay = formatPrice(totalPrice);
    
    // Format the price type for display
    const getPriceTypeDisplay = (priceType: string): string => {
      switch (priceType) {
        case 'per_pax':
          return 'per pax';
        case 'per_item':
          return 'per item';
        case 'fixed_price':
          return 'fixed price';
        case 'per_duration':
          return 'per duration';
        default:
          return priceType.replace('_', ' ');
      }
    };
    
    return (
      <div 
        key={activity.id} 
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col h-full"
      >
        <div className="relative">
          <img 
            src={activity.hero_image || 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1751535747/Boracay_Real_etate_and_properties_xq8o83.webp'} 
            alt={activity.name}
            className="w-full h-80 object-cover"
          />
          <div className="absolute top-0 right-0 p-2 flex gap-2">
            {activity.is_top_product && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                TOP PICK
              </span>
            )}
            {activity.is_most_sold && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                BEST SELLER
              </span>
            )}
          </div>          
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-900 animate-text-pulse">{activity.name}</h3>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-600">{priceDisplay}</div>
              <div className="text-xs text-gray-500">{getPriceTypeDisplay(activity.price_type)}</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {activity.max_pax && (
              <span className="inline-flex items-center text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                <Users className="w-3 h-3 mr-1" />
                Max {activity.max_pax} pax
              </span>
            )}
            
            {activity.duration_minutes && (
              <span className="inline-flex items-center text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                <Clock className="w-3 h-3 mr-1" />
                {Math.floor(activity.duration_minutes / 60)}h {activity.duration_minutes % 60}m
              </span>
            )}
            
            {activity.min_pax > 1 && (
              <span className="inline-flex items-center text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                <Users className="w-3 h-3 mr-1" />
                Min {activity.min_pax} pax
              </span>
            )}
          </div>
          
          <div className="mb-4">
            <div className="text-gray-600 text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: activity.description || '' }}></div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Participants (min: {activity.min_pax || 1})
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(
                    activity.id, 
                    'activity', 
                    Math.max((selectedQuantities[itemKey] || activity.min_pax || 1) - 1, activity.min_pax || 1)
                  )}
                  className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={activity.min_pax || 1}
                  max={activity.max_pax || 99}
                  value={selectedQuantities[itemKey] || activity.min_pax || 1}
                  onChange={(e) => handleQuantityChange(activity.id, 'activity', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border-y border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(
                    activity.id, 
                    'activity', 
                    Math.min((selectedQuantities[itemKey] || activity.min_pax || 1) + 1, activity.max_pax || 99)
                  )}
                  className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4 mt-auto">
            <div className="text-sm text-gray-500">Total:</div>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-600">{totalPriceDisplay}</div>
            </div>
          </div>
          
          <Button 
            className="w-full"
            onClick={() => handleAddToCartActivity(activity)}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    );
  };

  const renderPackageCard = (pkg: Package) => {
    const itemKey = `package-${pkg.id}`;
    const isFavorite = favorites.has(itemKey);
    const minPax = pkg.min_pax || 2;
    const maxPax = pkg.max_pax || null;
    const basePricePerPaxPerNight = formatPrice(pkg.base_price_php);
    const quantity = packageQuantities[pkg.id] || pkg.min_pax || 2;
    const nights = selectedNights[pkg.id] || pkg.min_nights || 2;
    const totalPrice = calculatePackageTotal(pkg);
    const totalPriceDisplay = formatPrice(totalPrice);
    const isActivitiesExpanded = expandedPackageActivities[pkg.id] || false;
    const isSoldOut = pkg.is_sold_out || false;
    
    return (
      <div 
        key={pkg.id} 
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col h-full"
      >
        <div className="relative overflow-hidden">
          <img 
            src={pkg.hero_image || 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1751535747/Boracay_Real_etate_and_properties_xq8o83.webp'} 
            alt={pkg.name} 
            className="w-full h-80 object-cover"
          />
          <button
            onClick={(e) => handleShareLink(pkg.id, e)}
            className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
            aria-label="Share package"
          >
            {showCopiedMessage[pkg.id] ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Share2 className="w-5 h-5 text-gray-700" />
            )}
          </button>
          {pkg.is_sold_out && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-3xl font-bold bg-red-600 px-6 py-3 rounded-lg transform rotate-12 shadow-lg">
                SOLD OUT
              </span>
            </div>
          )}
          <div className="absolute top-0 right-0 p-2 flex gap-2">
            {pkg.is_top_product && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                TOP PICK
              </span>
            )}
            {pkg.is_most_sold && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                BEST SELLER
              </span>
            )}
          </div>          
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-900 animate-text-pulse">{pkg.name}</h3>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-600">{basePricePerPaxPerNight}</div>
              <div className="text-xs text-gray-500">per pax per night</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-gray-600 text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: pkg.description || '' }}></div>
            {pkg.activities && pkg.activities.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Included Activities:</h4>
                <ul className="space-y-2">
                  {pkg.activities.map(item => (
                    <li key={item.activity_id} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span>
                        {item.activity.name} 
                        {item.quantity > 1 && ` ×${item.quantity}`}
                        {item.notes && ` (${item.notes})`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="space-y-3 mb-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Participants (min: {pkg.min_pax || 2}{pkg.max_pax ? `, max: ${pkg.max_pax}` : ''})
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => handlePackageQuantityChange(
                    pkg.id, 
                    Math.max((packageQuantities[pkg.id] || pkg.min_pax || 2) - 1, pkg.min_pax || 2)
                  )}
                  className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={pkg.min_pax || 2}
                  max={pkg.max_pax || 99}
                  value={packageQuantities[pkg.id] || pkg.min_pax || 2}
                  onChange={(e) => handlePackageQuantityChange(pkg.id, parseInt(e.target.value))}
                  className="w-full px-3 py-2 border-y border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handlePackageQuantityChange(
                    pkg.id, 
                    Math.min((packageQuantities[pkg.id] || pkg.min_pax || 2) + 1, pkg.max_pax || 99)
                  )}
                  className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Nights (min: {pkg.min_nights || 2}{pkg.max_nights ? `, max: ${pkg.max_nights}` : ''})
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleNightsChange(
                    pkg.id, 
                    Math.max((selectedNights[pkg.id] || pkg.min_nights || 2) - 1, pkg.min_nights || 2)
                  )}
                  className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={pkg.min_nights || 2}
                  max={pkg.max_nights || 99}
                  value={selectedNights[pkg.id] || pkg.min_nights || 2}
                  onChange={(e) => handleNightsChange(pkg.id, parseInt(e.target.value))}
                  className="w-full px-3 py-2 border-y border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleNightsChange(
                    pkg.id, 
                    Math.min((selectedNights[pkg.id] || pkg.min_nights || 2) + 1, pkg.max_nights || 99)
                  )}
                  className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* All Available Activities */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Additional Activities</h4>
            <button
              onClick={() => togglePackageActivities(pkg.id)}
              className={`text-amber-600 hover:text-amber-700 text-sm font-medium ${!isActivitiesExpanded ? 'add-activities-pulse' : ''}`}
            >
              {isActivitiesExpanded ? 'Hide Activities' : 'Add Activities'}
            </button>
          </div>
          
          {isActivitiesExpanded && (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                  Select additional activities to customize your package
                </div>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activities.map((activity) => {
                  // Check if this activity is included in the package
                  const isIncluded = pkg.activities?.some(
                    item => item.activity_id === activity.id
                  );
                  
                  return (
                    <div 
                      key={activity.id} 
                      className={`border rounded-lg p-3 transition-colors ${
                        selectedActivities[pkg.id]?.[activity.id] 
                          ? 'border-amber-500 bg-amber-50' 
                          : 'border-gray-200 hover:border-amber-300'
                      } ${isIncluded ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id={`activity-${pkg.id}-${activity.id}`}
                          checked={selectedActivities[pkg.id]?.[activity.id] || false}
                          onChange={() => toggleActivitySelection(pkg.id, activity.id)}
                          className="mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          disabled={isIncluded}
                        />
                        <div className="ml-3 flex-1">
                          <label 
                            htmlFor={`activity-${pkg.id}-${activity.id}`}
                            className={`block text-sm font-medium ${
                              isIncluded ? 'text-blue-700' : 'text-gray-700'
                            } cursor-pointer`}
                          >
                            {activity.name}
                            {isIncluded && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                Included in package
                              </span>
                            )}
                          </label>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                {activity.category.replace('_', ' ')}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-amber-600">
                              {formatPrice(activity.price_php)}
                              {isIncluded && (
                                <span className="text-xs text-gray-500 ml-1">(already included)</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Date picker and quantity selector for selected activities */}
                      {selectedActivities[pkg.id]?.[activity.id] && !isIncluded && (
                        <div className="mt-3 pl-7 space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Activity Date
                            </label>
                            <DatePicker
                              selected={selectedDates[`package-${pkg.id}-activity-${activity.id}`] || new Date()}
                              onChange={(date) => handleDateChange(pkg.id, 'package', date, activity.id)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                              minDate={new Date()}
                              dateFormat="MMMM d, yyyy"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Number of Participants (min: {activity.min_pax || 1})
                            </label>
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => handleActivityAddonQuantityChange(
                                  pkg.id,
                                  activity.id,
                                  Math.max((selectedAddonQuantities[pkg.id]?.[activity.id] || activity.min_pax || 1) - 1, activity.min_pax || 1)
                                )}
                                className="px-2 py-1 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min={activity.min_pax || 1}
                                max={activity.max_pax || 99}
                                value={selectedAddonQuantities[pkg.id]?.[activity.id] || activity.min_pax || 1}
                                onChange={(e) => handleActivityAddonQuantityChange(pkg.id, activity.id, parseInt(e.target.value))}
                                className="w-16 px-2 py-1 border-y border-gray-300 text-center text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleActivityAddonQuantityChange(
                                  pkg.id,
                                  activity.id,
                                  Math.min((selectedAddonQuantities[pkg.id]?.[activity.id] || activity.min_pax || 1) + 1, activity.max_pax || 99)
                                )}
                                className="px-2 py-1 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <span className="ml-2 text-xs text-gray-500">
                                {formatPrice(activity.price_php * (selectedAddonQuantities[pkg.id]?.[activity.id] || 1))}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4 mt-auto">
            <div className="text-sm text-gray-500">Total:</div>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-600">{totalPriceDisplay}</div>
              <div className="text-xs text-gray-500">
                {quantity} pax × {nights} nights
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full" 
            disabled={isSoldOut}
            onClick={() => isSoldOut ? null : handleAddToCartPackage(pkg)}
          >
            {isSoldOut ? 'Sold Out' : 'Add to Cart'}
          </Button>
          
          {pkg.whatsapp_number && (
            <a
              href={`https://wa.me/${pkg.whatsapp_number.replace('+', '')}?text=Hello! I'm interested in the ${pkg.name} package. Is it available for my dates?`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Check Availability
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <SEO
        title="Exclusive Promos & Travel Deals – Boracay Villas & Rentals"
        description="Discover the best Boracay promos, limited-time travel deals, and special offers on beachfront villas, houses, and holiday rentals. Book your dream island escape today."
        keywords="Boracay promos, Boracay travel deals, Boracay villa discounts, Boracay holiday offers, beachfront rentals Boracay, cheap Boracay deals, Boracay limited offers"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751828292/properties/rv4boascbnbuzt5hwvst.webp"
        url="https://boracay.house/promos"
        type="website"
        canonical="https://boracay.house/promos"
        dynamicData={{
          og_title: "Best Boracay Promos & Travel Deals – Save on Villas & Rentals",
          og_description: "Don't miss our limited-time promos on Boracay villas and holiday rentals. Perfect for travelers, couples, or families looking to save.",
          og_url: "https://boracay.house/promos",
          og_type: "website",
          og_image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751828292/properties/rv4boascbnbuzt5hwvst.webp"
        }}
      />
      <div className="min-h-screen bg-white">
        <div className="h-32" /> {/* Spacer for fixed navbar */}
        
        <div className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 w-full h-full animate-hero"
              style={{
                backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1751535747/Boracay_Real_etate_and_properties_xq8o83.webp)',
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
              <h1 className="text-5xl font-bold text-white mb-6">
                Boracay Promos & Deals: Unlock Exclusive Island Experiences
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Discover limited-time offers and special packages for your dream Boracay vacation. From thrilling adventures to relaxing getaways, find the perfect deal to make your trip unforgettable and budget-friendly.
              </p>
            </div>
          </Container>
        </div>
        
        <Container className="py-16">
          {/* Currency Selector */}
          <div className="flex justify-end mb-6">
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
          
          {/* Category Filter */}
          <div className="mb-8 overflow-x-auto sticky top-32 bg-white z-20 py-4 shadow-sm">
            <div className="flex space-x-2 min-w-max">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    activeTab === category.id
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          ) : (
            <div>
              {/* Packages Section (Promos) */}
              {activeTab === 'promos' && getFilteredPackages().length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center mb-6">
                    <Gift className="w-8 h-8 text-amber-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      Exclusive Boracay Packages & Promos
                    </h2>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    Explore our curated selection of special packages designed to offer the best value and unique experiences. Customize your trip by adding extra activities!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredPackages().map(pkg => renderPackageCard(pkg))}
                  </div>
                  
                  {/* Package Pagination */}
                  {totalPackages > PACKAGES_PER_PAGE && (
                    <div className="mt-12">
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-gray-600 text-sm">
                          Showing {getPackageRange()} of {totalPackages} packages
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handlePreviousPackagePage}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                          </button>
                          {getPackagePaginationRange().map((page, index) => (
                            <React.Fragment key={index}>
                              {typeof page === 'string' ? (
                                <span className="text-gray-400">...</span>
                              ) : (
                                <button
                                  onClick={() => handlePackagePageChange(page)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                    currentPackagePage === page
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {page}
                                </button>
                              )}
                            </React.Fragment>
                          ))}
                          <button
                            onClick={handleNextPackagePage}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Activities Section */}
              {getFilteredActivities().length > 0 && (
                <div>
                  <div className="flex items-center mb-6">
                    <Zap className="w-8 h-8 text-blue-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      {activeTab !== 'promos' ? categories.find(c => c.id === activeTab)?.name : 'All Available Activities'}
                    </h2>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    Browse individual activities and experiences to add to your cart. From thrilling water sports to relaxing wellness sessions, find exactly what you need for your Boracay adventure.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredActivities().map(activity => renderActivityCard(activity))}
                  </div>
                </div>
              )}
              
              {/* Empty state */}
              {((activeTab === 'promos' && getFilteredPackages().length === 0 && getFilteredActivities().length === 0) || 
                (activeTab !== 'promos' && getFilteredActivities().length === 0)) && (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <Tag className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No {activeTab === 'promos' ? 'packages' : 'activities'} available
                  </h3>
                  <p className="text-gray-500">
                    Check back later for new {activeTab === 'promos' ? 'packages and promos' : 'activities'}.
                  </p>
                </div>
              )}
            </div>
          )}
        </Container>
      </div>
      
      {/* Payment Selection Modal */}
      {selectedServiceForPayment && (
        <PaymentSelectionModal
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentModalClose}
          service={selectedServiceForPayment}
          totalAmount={totalAmountForPayment}
          selectedAddons={selectedAddonsForPayment}
        />
      )}
    </>
  );
};

export default PromosPage;
