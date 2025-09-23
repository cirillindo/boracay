import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import SEOJson from '../components/SEOJson';
import { format, subHours } from 'date-fns';
import {
  DollarSign,
  MapPin,
  Users,
  Mail,
  Phone,
  Heart,
  CheckCircle,
  XCircle,
  Trophy,
  Info,
  ArrowLeft,
  ExternalLink,
  User as UserIcon,
  Home,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Clock,
  Building,
  BarChart2, // Added for distribution chart
  TrendingUp // Added for progress bar
} from 'lucide-react';
import { countryCodesList } from '../utils/countryCodes';
import SuccessModal from '../components/ui/SuccessModal'; // Import the existing DreamBidModal (for property page specific bid)
import PropertyCard from '../components/property/PropertyCard';
import DreamBidModal from '../components/DreamBidModal'; // Keep this for the original bid modal
import { useBidNotification } from '../context/BidNotificationContext';
import { convertCurrency, formatCurrency } from '../utils/currency';

// Interfaces for Bid and Property (extended for bidding)
interface Bid {
  id: string;
  property_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  bid_amount: number; // This is now in EUR
  properties?: { title: string; price?: number }; // Added price to properties sub-object
}

// Anonymized bid for the "Latest Dream Bids" list
interface AnonymizedBid {
  id: string;
  created_at: string;
  message: string;
}

interface PropertyWithROI extends Property {
  highest_bid_amount?: number;
}

// New interface for top bids comparison
interface TopBidComparison {
  bidAmount: number;
  marketValue: number;
  percentage: number;
}

// Open Graph + Twitter Images
const OG_1200 = 'https://res.cloudinary.com/dayqsxlnt/image/upload/c_fill,g_auto,f_auto,q_auto:eco,w_1200,h_630/v1756399732/House_for_sale_in_Boracay_copy_ln5imi.jpg';
const OG_2400 = 'https://res.cloudinary.com/dayqsxlnt/image/upload/c_fill,g_auto,f_auto,q_auto:good,w_2400,h_1260/v1756399453/House_for_sale_in_Boracay_copy_dhuvw1.jpg';

const DreamBidPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [anonymizedBids, setAnonymizedBids] = useState<AnonymizedBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [selectedPropertyForBid, setSelectedPropertyForBid] = useState<Property | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { setHasNewBids } = useBidNotification();

  // New state for statistics
  const [totalBids, setTotalBids] = useState(0);
  const [bidsLast24h, setBidsLast24h] = useState(0);
  const [propertiesWithBids, setPropertiesWithBids] = useState(0);
  const [averageBid, setAverageBid] = useState(0);
  const [medianBid, setMedianBid] = useState(0);
  const [mostFrequentBidRange, setMostFrequentBidRange] = useState('');

  // New state for Top 3 Bids Comparison
  const [topBidsComparison, setTopBidsComparison] = useState<TopBidComparison[]>([]);

  // New state for Distribution Chart
  const [bidDistribution, setBidDistribution] = useState({
    under80K: 0,
    between80Kand160K: 0,
    above160K: 0,
    total: 0
  });

  useEffect(() => {
    loadPropertiesAndBids();
  }, []);

  const loadPropertiesAndBids = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all properties that are for sale
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('is_for_sale', true)
        .order('display_order', { ascending: true, nullsLast: true })
        .order('created_at', { ascending: false });

      if (propertiesError) {
        throw new Error('Error loading properties: ' + propertiesError.message);
      }
      setProperties(propertiesData || []);

      // Fetch ALL bids for statistics
      const { data: allBidsData, error: allBidsError } = await supabase
        .from('bids')
        .select(`
          *,
          properties (title, price)
        `)
        .order('created_at', { ascending: false });

      if (allBidsError) {
        throw new Error('Error loading all bids: ' + allBidsError.message);
      }

      // Process bids for display and statistics
      if (allBidsData) {
        // Anonymize bids for the "Latest Dream Bids" list
        const processedAnonymizedBids: AnonymizedBid[] = allBidsData.map(bid => ({
          id: bid.id,
          created_at: bid.created_at,
          message: "A new dream bid has been placed!" // Generic message
        }));
        setAnonymizedBids(processedAnonymizedBids);

        // Calculate general statistics
        setTotalBids(allBidsData.length);

        const twentyFourHoursAgo = subHours(new Date(), 24);
        const recentBids = allBidsData.filter(bid => new Date(bid.created_at) > twentyFourHoursAgo);
        setBidsLast24h(recentBids.length);

        const uniquePropertyIds = new Set(allBidsData.map(bid => bid.property_id));
        setPropertiesWithBids(uniquePropertyIds.size);

        // Calculate Average and Median Bid
        const bidAmounts = allBidsData.map(bid => bid.bid_amount).sort((a, b) => a - b);
        if (bidAmounts.length > 0) {
          const sumBids = bidAmounts.reduce((sum, amount) => sum + amount, 0);
          setAverageBid(sumBids / bidAmounts.length);

          const mid = Math.floor(bidAmounts.length / 2);
          const median = bidAmounts.length % 2 === 0 ? (bidAmounts[mid - 1] + bidAmounts[mid]) / 2 : bidAmounts[mid];
          setMedianBid(median);

          // Calculate Most Frequent Bid Range
          const DISTRIBUTION_THRESHOLD_1 = 80000; // €80,000
          const DISTRIBUTION_THRESHOLD_2 = 160000; // €160,000

          let countUnder80K = 0;
          let countBetween80Kand160K = 0;
          let countAbove160K = 0;

          bidAmounts.forEach(amount => {
            if (amount < DISTRIBUTION_THRESHOLD_1) {
              countUnder80K++;
            } else if (amount >= DISTRIBUTION_THRESHOLD_1 && amount <= DISTRIBUTION_THRESHOLD_2) {
              countBetween80Kand160K++;
            } else {
              countAbove160K++;
            }
          });

          const bidRangeCounts = [
            { label: 'Under €80K', count: countUnder80K },
            { label: '€80K - €160K', count: countBetween80Kand160K },
            { label: 'Above €160K', count: countAbove160K }
          ];

          const mostFrequent = bidRangeCounts.reduce((prev, current) => (prev.count > current.count) ? prev : current);
          setMostFrequentBidRange(mostFrequent.label);

          // Update Bid Distribution percentages for the bar chart
          setBidDistribution({
            under80K: allBidsData.length > 0 ? (countUnder80K / allBidsData.length) * 100 : 0,
            between80Kand160K: allBidsData.length > 0 ? (countBetween80Kand160K / allBidsData.length) * 100 : 0,
            above160K: allBidsData.length > 0 ? (countAbove160K / allBidsData.length) * 100 : 0,
            total: allBidsData.length
          });
        }

        // NEW LOGIC FOR TOP 3 BIDS COMPARISON
        if (allBidsData && allBidsData.length > 0 && propertiesData && propertiesData.length > 0) {
            const bidsWithMarketValue = allBidsData
                .filter(bid => bid.properties && bid.properties.price && bid.properties.price > 0)
                .map(bid => ({
                    bidAmount: bid.bid_amount,
                    marketValue: bid.properties.price as number // Cast to number as we filtered for it
                }))
                .sort((a, b) => b.bidAmount - a.bidAmount); // Sort by bid amount descending

            const top3Bids: TopBidComparison[] = bidsWithMarketValue.slice(0, 3).map(bid => ({
                bidAmount: bid.bidAmount,
                marketValue: bid.marketValue,
                percentage: (bid.bidAmount / bid.marketValue) * 100
            }));
            setTopBidsComparison(top3Bids);
        } else {
            setTopBidsComparison([]);
        }
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load bidding statistics.');
      console.error('Error loading dream bid stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBidClick = (property: Property) => {
    console.log("handlePlaceBidClick called for property:", property.title);
    setSelectedPropertyForBid(property);
    setIsBidModalOpen(true);
    console.log("isBidModalOpen set to true, selectedPropertyForBid set.");
  };

  const handleBidSuccess = () => {
    console.log("handleBidSuccess called.");
    setShowSuccessModal(true);
    setIsBidModalOpen(false);
    setSelectedPropertyForBid(null);
    setHasNewBids(true); // Trigger notification for new bid
    loadPropertiesAndBids(); // Reload stats after a new bid
  };

  const handleCloseSuccessModal = () => {
    console.log("handleCloseSuccessModal called.");
    setShowSuccessModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Dream Bid: Your Boracay Property Game – Place Non-Binding Bids"
        description="Place a non-binding 'Dream Bid' on properties you love. Get notified if a listing matches your target price. Join visionary bidders and see real market insights."
        keywords="dream bid boracay, boracay property game, non-binding bid, real estate boracay, property investment philippines, boracay homes, place a bid, property price match"
        ogImage={OG_1200}
        url="https://boracay.house/dream-bid"
        type="website"
      />

      <Helmet>
        <meta property="og:image" content={OG_2400} />
        <meta property="og:image:alt" content="Aerial view of Boracay island with clear waters and lush hills, representing a dream property location." />
        <meta name="twitter:card" content="summary_large_image" />
        {/* JSON-LD for FAQPage if you add FAQs to this page */}
        {/* <SEOJson graphs={[faqSchema]} /> */}
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="h-32" />
        
        {/* Hero Section */}
        <div className="relative w-full min-h-[50vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 w-full h-full animate-hero"
              style={{
                backgroundImage: 'url(https://res.cloudinary.com/dayqsxlnt/image/upload/v1756457899/Boracay_from_top_e08toq.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                willChange: 'transform'
              }}
            />
            <div className="absolute inset-0 bg-black/40" /> {/* Darkened overlay */}
          </div>

          <div className="theater-curtain" />

          <Container className="relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold text-white mb-6 text-shadow-outline"> {/* Added text-shadow-outline */}
                Dream Bid: Your Boracay Property Game
              </h1>
              <p className="text-xl text-white mb-8 text-shadow-outline"> {/* Added text-shadow-outline */}
                Place your non-binding dream bid on properties you love.
              </p>
              <p className="text-lg text-white max-w-3xl mx-auto mb-8 text-shadow-outline"> {/* Added text-shadow-outline */}
                Dream Bid lets you state the price you'd happily pay for a Boracay home. It's private, non-binding and helps us surface real market matches for you.
              </p>
              {/* Removed: Button to open the new test modal */}
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/for-sale" className="text-amber-300 hover:text-amber-400 underline text-shadow-outline"> {/* Changed color and added text-shadow-outline */}
                  See all homes for sale
                </Link>
                <Link to="/for-sale?propertyType=villa" className="text-amber-300 hover:text-amber-400 underline text-shadow-outline"> {/* Changed color and added text-shadow-outline */}
                  Villas for sale
                </Link>
                <Link to="/for-sale?location=Diniwid" className="text-amber-300 hover:text-amber-400 underline text-shadow-outline"> {/* Changed color and added text-shadow-outline */}
                  Diniwid area homes
                </Link>
              </div>
            </div>
          </Container>
        </div>

        {/* Properties for Dream Bid */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Properties Available for Dream Bid
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Explore our listings and place your non-binding dream bid on properties that catches your eye.
              </p>
            </div>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={{ ...property, selectedCurrency: 'EUR' }}
                    displayAsSale={true}
                    showDreamBidButton={true}
                    onDreamBidClick={handlePlaceBidClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No properties currently available for Dream Bid.</p>
              </div>
            )}

            <div className="text-center mt-12">
              <Button onClick={() => navigate('/for-sale')} className="text-lg px-8 py-4">
                View All Properties for Sale
              </Button>
            </div>
          </Container>
        </section>

        {/* Recent Dream Bids Section (Moved) */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Recent Dream Bids: See Who's Dreaming Big!
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Stay updated with the latest bidding activity and market trends.
              </p>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <BarChart2 className="w-10 h-10 text-amber-600 mb-2" />
                <span className="text-2xl font-bold text-gray-900">{totalBids}</span>
                <span className="text-sm text-gray-600">Total Dream Bids</span>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <Clock className="w-10 h-10 text-blue-600 mb-2" />
                <span className="text-2xl font-bold text-gray-900">{bidsLast24h}</span>
                <span className="text-sm text-gray-600">Bids in Last 24h</span>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <Building className="w-10 h-10 text-green-600 mb-2" />
                <span className="text-2xl font-bold text-gray-900">{propertiesWithBids}</span>
                <span className="text-sm text-gray-600">Properties with Bids</span>
              </div>
              {/* New Stats */}
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <DollarSign className="w-10 h-10 text-purple-600 mb-2" />
                <span className="text-2xl font-bold text-gray-900">€{averageBid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className="text-sm text-gray-600">Average Dream Bid</span>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <Trophy className="w-10 h-10 text-pink-600 mb-2" />
                <span className="text-2xl font-bold text-gray-900">€{medianBid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className="text-sm text-gray-600">Median Dream Bid</span>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <Info className="w-10 h-10 text-teal-600 mb-2" />
                <span className="text-xl font-bold text-gray-900">{mostFrequentBidRange}</span>
                <span className="text-sm text-gray-600">Most Frequent Bid Range</span>
              </div>
            </div>

            {/* NEW: Top 3 Bids Comparison */}
            {topBidsComparison.length > 0 && (
              <div className="bg-purple-50 p-6 rounded-lg shadow-md mb-12">
                <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" /> Top Dream Bids Compared to Market Value
                </h3>
                {topBidsComparison.map((bid, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <div className="flex justify-between text-sm text-gray-700 mb-1">
                      <span>Bid #{index + 1} (Market Value: €{bid.marketValue.toLocaleString()})</span>
                      <span>Bid: €{bid.bidAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min(bid.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      This bid is {bid.percentage.toFixed(1)}% of the market value.
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Bid Distribution Chart */}
            {bidDistribution.total > 0 && (
              <div className="bg-teal-50 p-6 rounded-lg shadow-md mb-12">
                <h3 className="text-xl font-bold text-teal-800 mb-4 flex items-center gap-2">
                  <BarChart2 className="w-6 h-6" /> Bid Distribution by Amount
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  This chart shows the percentage of dream bids falling into different price ranges. (Note: An actual interactive chart would require a charting library like Chart.js or Recharts.)
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="w-32 text-sm text-gray-700">Under €80K:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${bidDistribution.under80K}%` }}></div>
                    </div>
                    <span className="ml-2 text-sm font-semibold">{bidDistribution.under80K.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm text-gray-700">€80K - €160K:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div className="bg-green-600 h-4 rounded-full" style={{ width: `${bidDistribution.between80Kand160K}%` }}></div>
                    </div>
                    <span className="ml-2 text-sm font-semibold">{bidDistribution.between80Kand160K.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm text-gray-700">Above €160K:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div className="bg-amber-600 h-4 rounded-full" style={{ width: `${bidDistribution.above160K}%` }}></div>
                    </div>
                    <span className="ml-2 text-sm font-semibold">{bidDistribution.above160K.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Latest Dream Bids */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-12">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Latest Dream Bids: See Who's Dreaming Big!</h3>
              {anonymizedBids.length > 0 ? (
                <div className="space-y-4">
                  {anonymizedBids.slice(0, 5).map((bid) => (
                    <div key={bid.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-700">{bid.message}</span>
                      <span className="text-sm text-gray-500">{format(new Date(bid.created_at), 'MMM dd, HH:mm')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No recent dream bids yet. Be the first!</p>
              )}
            </div>
          </Container>
        </section>

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          title="Dream Bid Placed! 🎉"
          message="Your non-binding dream bid has been recorded. We'll notify you if a listing matches your target price!"
          style={{ zIndex: 99999, backgroundColor: 'rgba(0, 255, 0, 0.5)' }}
        />

        {isBidModalOpen && selectedPropertyForBid && (
          <DreamBidModal
            isOpen={isBidModalOpen}
            onClose={() => {
              console.log("DreamBidModal onClose called.");
              setIsBidModalOpen(false);
            }}
            property={selectedPropertyForBid}
            onBidSuccess={handleBidSuccess}
          />
        )}
      </div>
    </>
  );
};

export default DreamBidPage;

