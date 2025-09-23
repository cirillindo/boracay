import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Container from '../components/ui/Container';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Star, Clock, Users, Tag, Heart, Check, Info, Plus, Minus, Share2, MapPin, Gift, Zap, Sun, Ship, Cog as Yoga, MessageCircle as Massage, Bike, Dumbbell, DollarSign, Palmtree, ShoppingBag, Landmark, Waves, Sailboat, Utensils } from 'lucide-react';
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

const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [selectedDates, setSelectedDates] = useState<Record<string, Date | null>>({});
  const [selectedCurrency, setSelectedCurrency] = useState<string>('PHP');
  const [favorites, setFavorites] = useState<Set<string>>(new Set()); // Not used in this component, but kept for consistency if needed
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState<Record<string, boolean>>({});
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
    { id: 'all', name: 'ALL ACTIVITIES', icon: <Tag className="w-4 h-4" /> },
    { id: 'water_sports', name: 'Water Sports', icon: <Ship className="w-4 h-4" /> },
    { id: 'wellness', name: 'Wellness', icon: <Yoga className="w-4 h-4" /> },
    { id: 'food_drink', name: 'Food & Drinks', icon: <Utensils className="w-4 h-4" /> },
    { id: 'transfer', name: 'Transfers', icon: <MapPin className="w-4 h-4" /> },
    { id: 'rental', name: 'Rentals', icon: <Bike className="w-4 h-4" /> },
    { id: 'celebration', name: 'Celebration', icon: <Gift className="w-4 h-4" /> },
    { id: 'party', name: 'Party', icon: <Zap className="w-4 h-4" /> },
    { id: 'photoshoot', name: 'Photoshoot', icon: <Star className="w-4 h-4" /> }
  ];

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);

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
      
      sortedActivitiesData?.forEach(activity => {
        initialQuantities[`activity-${activity.id}`] = activity.min_pax || 1;
        initialDates[`activity-${activity.id}`] = new Date();
      });

      setActivities(sortedActivitiesData || []);
      setSelectedQuantities(initialQuantities);
      setSelectedDates(initialDates);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Failed to load activities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (id: string, type: 'activity', value: number) => {
    const itemKey = `${type}-${id}`;
    
    if (type === 'activity') {
      const activity = activities.find(a => a.id === id);
      if (activity) {
        // Ensure quantity is at least min_pax
        value = Math.max(value, activity.min_pax || 1);
        // Ensure quantity does not exceed max_pax if defined
        if (activity.max_pax !== null) {
          value = Math.min(value, activity.max_pax);
        }
      }
    }
    
    setSelectedQuantities(prev => ({
      ...prev,
      [itemKey]: value
    }));
  };

  const handleDateChange = (id: string, type: 'activity', date: Date | null) => {
    const itemKey = `${type}-${id}`;
    
    setSelectedDates(prev => ({
      ...prev,
      [itemKey]: date
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

  const getFilteredActivities = () => {
    if (activeTab === 'all') return activities;
    return activities.filter(activity => activity.category === activeTab);
  };

  const handleBuyNow = (id: string, type: 'activity') => {
    let item;
    let totalPrice = 0;
    let title = '';
    let selectedAddonsList: string[] = [];
    
    if (type === 'activity') {
      item = activities.find(a => a.id === id);
      if (!item) return;

      const quantity = selectedQuantities[`activity-${id}`] || item.min_pax || 1;
      totalPrice = item.price_php * quantity;
      title = item.name;
    }
    
    const { original: priceOriginal, converted: priceConverted } = formatPrice(totalPrice, true);
    
    setSelectedServiceForPayment({
      title: title,
      price: priceOriginal,
      priceUSD: priceConverted
    });
    
    setTotalAmountForPayment(totalPrice);
    setSelectedAddonsForPayment(selectedAddonsList);
    setIsPaymentModalOpen(true);
  };
  
  const handleAddToCart = (activity: Activity) => {
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
  
  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
  };

  const handleShareLink = (activityId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Share the URL of the main activities page
    const shareUrl = `https://boracay.house/activities`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        playSound('click.mp3');
        
        setShowCopiedMessage(prev => ({
          ...prev,
          [activityId]: true
        }));
        
        setTimeout(() => {
          setShowCopiedMessage(prev => ({
            ...prev,
            [activityId]: false
          }));
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  const renderActivityCard = (activity: Activity) => {
    const itemKey = `activity-${activity.id}`;
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
            src={activity.hero_image || 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1747143041/Boracay_sunset_afw4zm.jpg'} 
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
          <button
            onClick={(e) => handleShareLink(activity.id, e)}
            className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
            aria-label="Share activity"
          >
            {showCopiedMessage[activity.id] ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Share2 className="w-5 h-5 text-gray-700" />
            )}
          </button>
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
                    (selectedQuantities[itemKey] || activity.min_pax || 1) - 1
                  )}
                  className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={(selectedQuantities[itemKey] || activity.min_pax || 1) <= (activity.min_pax || 1)}
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
                    (selectedQuantities[itemKey] || activity.min_pax || 1) + 1
                  )}
                  className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={(selectedQuantities[itemKey] || activity.min_pax || 1) >= (activity.max_pax || Infinity)}
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
            onClick={() => handleAddToCart(activity)}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <SEO
        title="Things to Do in Boracay – Activities, Transfers, Massage & More"
        description="Discover the best activities and experiences in Boracay. Book reliable transfers, relaxing massages, thrilling water sports, and unforgettable island tours directly with trusted local providers. Plan your perfect Boracay adventure today!"
        keywords="Boracay activities, Things to do in Boracay, Boracay transfers, Boracay massage, Boracay birthday cake, Boracay island hopping, Book activities in Boracay, Boracay experiences, Boracay tours, What to do in Boracay, Boracay water sports, Boracay wellness"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750524212/Boracay_activities_map_tfdy1l.png"
        url="https://boracay.house/activities"
        type="website"
        canonical="https://boracay.house/activities"
        dynamicData={{
          og_title: "Top Things to Do in Boracay – Book Activities & Transfers Online",
          og_description: "Plan your Boracay vacation with ease. Book reliable transfers, island tours, relaxing massages, and even birthday surprises—all in one place. Explore water sports, wellness, and unique local experiences.",
          og_url: "https://boracay.house/activities",
          og_type: "website",
          og_image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1750524212/Boracay_activities_map_tfdy1l.png"
        }}
      />
      <div className="min-h-screen bg-white">
        <div className="h-32" /> {/* Spacer for fixed navbar */}
        
        <div className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 w-full h-full animate-hero"
              style={{
                backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1747143041/Boracay_sunset_afw4zm.jpg)',
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
                Your Ultimate Guide to Boracay Activities & Experiences
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Dive into the vibrant life of Boracay! From thrilling water sports and serene wellness retreats to seamless airport transfers and delightful culinary tours, we offer a curated selection of the island's best. Book directly with trusted local partners for an unforgettable adventure.
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
                  className={`px-4 py-2 rounded-full transition-colors flex items-center gap-2 ${
                    activeTab === category.id
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon}
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
              {/* Thematic Section Introduction */}
              {activeTab === 'all' && (
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore All Boracay Adventures</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    From thrilling water sports to serene wellness experiences, discover every exciting activity Boracay has to offer.
                  </p>
                </div>
              )}
              {activeTab === 'water_sports' && (
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Thrilling Water Sports</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Dive into Boracay's crystal-clear waters with parasailing, jet skiing, banana boat rides, and more.
                  </p>
                </div>
              )}
              {activeTab === 'wellness' && (
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Relaxing Wellness & Spa</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Rejuvenate your body and mind with soothing massages, yoga sessions, and spa treatments.
                  </p>
                </div>
              )}
              {activeTab === 'food_drink' && (
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Delightful Food & Drinks</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Savor the flavors of Boracay with unique dining experiences, beachside cocktails, and local delicacies.
                  </p>
                </div>
              )}
              {activeTab === 'transfer' && (
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Seamless Transfers</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Ensure a smooth journey to and from Boracay with our reliable airport and island transfer services.
                  </p>
                </div>
              )}
              {activeTab === 'rental' && (
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Convenient Rentals</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Explore the island at your own pace with scooter rentals and other convenient options.
                  </p>
                </div>
              )}
              {activeTab === 'celebration' && (
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Special Celebrations</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Make your special occasions unforgettable with custom cakes and celebration packages.
                  </p>
                </div>
              )}
              {activeTab === 'party' && (
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Vibrant Party Experiences</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Join the fun with exciting party events and nightlife experiences on the island.
                  </p>
                </div>
              )}
              {activeTab === 'photoshoot' && (
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Memorable Photoshoots</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Capture your Boracay memories with professional photoshoots against stunning backdrops.
                  </p>
                </div>
              )}

              {/* Activities Grid */}
              {getFilteredActivities().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredActivities().map(activity => renderActivityCard(activity))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <Tag className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No activities available in this category
                  </h3>
                  <p className="text-gray-500">
                    Check back later or explore other categories.
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

export default ActivitiesPage;
