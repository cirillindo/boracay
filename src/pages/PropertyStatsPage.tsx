// src/pages/PropertyStatsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Container from '../components/ui/Container';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import { DollarSign, Home, MapPin, Square, TrendingUp, BarChart2, Calculator, Clock, Building, Trophy, Info, Ruler, LandPlot, Globe, Check } from 'lucide-react';
import { format, subHours } from 'date-fns';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, BarChart, Bar } from 'recharts';
import MiniInvestmentCalculatorForm from '../components/shared/MiniInvestmentCalculatorForm'; // Import the MiniInvestmentCalculatorForm

// Helper function to format currency (copied from PropertyCard for consistency)
const formatPrice = (price: number, currency = 'EUR'): string => {
  const symbols: { [key: string]: string } = {
    EUR: '€',
    USD: '$',
    PHP: '₱',
    AUD: 'A$',
    RUB: '₽',
    KRW: '₩',
    CNY: '¥'
  };

  const rates: { [key: string]: number } = {
    EUR: 1,
    USD: 1.08,
    PHP: 60.50,
    AUD: 1.65,
    RUB: 98.50,
    KRW: 1450.25,
    CNY: 7.85
  };

  const convertedPrice = price * (rates[currency] || 1);
  return `${symbols[currency] || '€'}${convertedPrice.toLocaleString('en-US', {
    maximumFractionDigits: 0
  })}`;
};

// Helper function to calculate price per SQM
const calculatePricePerSqm = (price: number, area: number | null | undefined, currency: string): string => {
  if (!area || area <= 0) return 'N/A';
  return formatPrice(price / area, currency);
};

interface Bid {
  id: string;
  property_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  bid_amount: number; // This is now in EUR
  created_at: string;
  properties?: { title: string; price?: number }; // Added price to properties sub-object
}

interface TopBidComparison {
  bidAmount: number;
  marketValue: number;
  percentage: number;
}

// Extended Property interface for display in the list
interface PropertyWithCalculatedStats extends Property {
  pricePerBuiltSqm?: string; // Implied Building Value / Built Area
  pricePerBuiltSqmValue?: number; // Numeric value for charting
  pricePerLandSqm?: string; // Implied Land Value / Land Area
  impliedBuildingValuePerBuiltSqm?: string; // (Total Property Price - Estimated Land Value) / Built Area
  netROI?: number; // Added netROI for display
}

// Mock Historical Data for Property and Land Values
interface HistoricalDataPoint {
  year: number;
  avgPropertyValue: number; // in EUR
  avgLandValuePerSqm: number;    // in EUR per sqm
}

const historicalData: HistoricalDataPoint[] = [
  { year: 2020, avgPropertyValue: 250000, avgLandValuePerSqm: 300 },
  { year: 2021, avgPropertyValue: 265000, avgLandValuePerSqm: 320 },
  { year: 2022, avgPropertyValue: 280000, avgLandValuePerSqm: 345 },
  { year: 2023, avgPropertyValue: 300000, avgLandValuePerSqm: 370 },
  { year: 2024, avgPropertyValue: 320000, avgLandValuePerSqm: 400 },
  { year: 2025, avgPropertyValue: 345000, avgLandValuePerSqm: 430 },
];

// Mock Comparison Data for Boracay, Bali, Phuket (all in EUR for consistency)
const COMPARISON_DATA = [
  {
    island: 'Boracay',
    avgPricePerBuiltSqm: 2500, // €/sqm
    avgPricePerLandSqm: 400, // €/sqm
    avgRentalYield: 8, // %
    avgAppreciation: 5 // %
  },
  {
    island: 'Bali',
    avgPricePerBuiltSqm: 3500, // €/sqm
    avgPricePerLandSqm: 600, // €/sqm
    avgRentalYield: 6, // %
    avgAppreciation: 7 // %
  },
  {
    island: 'Phuket',
    avgPricePerBuiltSqm: 3000, // €/sqm
    avgPricePerLandSqm: 500, // €/sqm
    avgRentalYield: 7, // %
    avgAppreciation: 6 // %
  }
];


const TYPICAL_LAND_VALUE_PHP_PER_SQM = 35000; // PHP
const TYPICAL_BUILDING_COST_PHP_PER_SQM = 30000; // PHP
const PHP_TO_EUR_RATE = 1 / 60.50; // Conversion rate from PHP to EUR (1 EUR = 60.50 PHP)

const PropertyStatsPage: React.FC = () => {
  const [properties, setProperties] = useState<PropertyWithCalculatedStats[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [isMobile, setIsMobile] = useState(false); // State for mobile view

  // Dream Bid Stats
  const [totalBids, setTotalBids] = useState(0);
  const [bidsLast24h, setBidsLast24h] = useState(0);
  const [propertiesWithBids, setPropertiesWithBids] = useState(0);
  const [averageBid, setAverageBid] = useState(0);
  const [medianBid, setMedianBid] = useState(0);
  const [mostFrequentBidRange, setMostFrequentBidRange] = useState('');
  const [topBidsComparison, setTopBidsComparison] = useState<TopBidComparison[]>([]);
  const [bidDistribution, setBidDistribution] = useState({
    under80K: 0,
    between80Kand160K: 0,
    above160K: 0,
    total: 0
  });

  const currencies = [
    { value: 'EUR', label: 'EUR', symbol: '€', rate: 1 },
    { value: 'USD', label: 'USD', symbol: '$', rate: 1.08 },
    { value: 'PHP', label: 'PHP', symbol: '₱', rate: 60.50 },
    { value: 'AUD', label: 'AUD', symbol: 'A$', rate: 1.65 },
    { value: 'RUB', label: 'RUB', symbol: '₽', rate: 98.50 },
    { value: 'KRW', label: '₩', rate: 24 },
    { value: 'CNY', label: 'CNY', symbol: '¥', rate: 0.13 }
  ];

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's 'md' breakpoint
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [
        { data: propertiesData, error: propertiesError },
        { data: bidsData, error: bidsError }
      ] = await Promise.all([
        supabase.from('properties').select('*').eq('is_for_sale', true), // Fetch area, land_size, lot_size
        supabase.from('bids').select(`*, properties (title, price)`)
      ]);

      if (propertiesError) throw propertiesError;
      if (bidsError) throw bidsError;

      // Process properties to add calculated SQM prices and ROI
      const processedProperties: PropertyWithCalculatedStats[] = (propertiesData || []).map(p => {
        const landArea = p.land_size || p.lot_size;
        const builtArea = p.area;
        const propertyPriceEUR = p.price; // Property price is already in EUR

        // Convert property price to PHP for calculations with PHP/SQM assumptions
        const propertyPricePHP = propertyPriceEUR / PHP_TO_EUR_RATE;

        // 1. Calculate Implied Land Value per SQM (for "Price/Land M²" column)
        let impliedLandValuePerSqm = 'N/A';
        if (landArea && landArea > 0) {
          const estimatedBuildingValuePHP = (builtArea || 0) * TYPICAL_BUILDING_COST_PHP_PER_SQM;
          let impliedLandValuePHP = propertyPricePHP - estimatedBuildingValuePHP;
          
          // Cap implied land value at a minimum (e.g., 0) if it becomes negative
          if (impliedLandValuePHP < 0) impliedLandValuePHP = 0; 

          const calculatedImpliedLandValuePerSqmPHP = impliedLandValuePHP / landArea;
          impliedLandValuePerSqm = formatPrice(calculatedImpliedLandValuePerSqmPHP * PHP_TO_EUR_RATE, selectedCurrency);
        }

        // 2. Calculate Implied Building Value per Built SQM (for "Price/Built M²" column)
        let impliedBuildingValuePerBuiltSqm = 'N/A';
        let pricePerBuiltSqmValue = 0; // Initialize numeric value
        if (builtArea && builtArea > 0) {
          const estimatedLandValuePHP = (landArea || 0) * TYPICAL_LAND_VALUE_PHP_PER_SQM;
          let impliedBuildingValuePHP = propertyPricePHP - estimatedLandValuePHP;

          // Cap implied building value at a minimum (e.g., 0) if it becomes negative
          if (impliedBuildingValuePHP < 0) impliedBuildingValuePHP = 0;

          // Calculate the value first
          const calculatedValuePHP = impliedBuildingValuePHP / builtArea;

          // Then assign the formatted string
          impliedBuildingValuePerBuiltSqm = formatPrice(calculatedValuePHP * PHP_TO_EUR_RATE, selectedCurrency);

          // Then assign the numeric value for charting
          pricePerBuiltSqmValue = calculatedValuePHP * PHP_TO_EUR_RATE;
        }

        // Calculate a simple expected ROI for display (e.g., based on a fixed rental yield assumption)
        // This is a simplified calculation for display purposes in the table.
        const assumedAppreciation = 0.05; // 5% annual appreciation
        const estimatedAnnualAppreciationValue = propertyPriceEUR * assumedAppreciation;
        
        // Use actual monthly_income_from_rent from the database for income calculation
        const actualMonthlyIncome = p.monthly_income_from_rent || 0; // Default to 0 if null
        const estimatedAnnualGrossIncome = actualMonthlyIncome * 12; // Assuming 12 months of rental
        const estimatedAnnualNetIncome = estimatedAnnualGrossIncome * 0.7; // Assuming 30% for agency fees/expenses

        // Ensure propertyPriceEUR is not zero to avoid division by zero
        const calculatedROI = propertyPriceEUR > 0 
          ? ((estimatedAnnualNetIncome + estimatedAnnualAppreciationValue) / propertyPriceEUR) * 100
          : 0; // If price is 0, ROI is 0


        return {
          ...p,
          pricePerBuiltSqm: impliedBuildingValuePerBuiltSqm,
          pricePerBuiltSqmValue: pricePerBuiltSqmValue, // Store numeric value for charting
          pricePerLandSqm: impliedLandValuePerSqm,
          netROI: calculatedROI // Add calculated ROI
        };
      });
      setProperties(processedProperties);
      setBids(bidsData || []);

      // Calculate Dream Bid Stats
      if (bidsData) {
        setTotalBids(bidsData.length);

        const twentyFourHoursAgo = subHours(new Date(), 24);
        const recentBids = bidsData.filter(bid => new Date(bid.created_at) > twentyFourHoursAgo);
        setBidsLast24h(recentBids.length);

        const uniquePropertyIds = new Set(bidsData.map(bid => bid.property_id));
        setPropertiesWithBids(uniquePropertyIds.size);

        const bidAmounts = bidsData.map(bid => bid.bid_amount).sort((a, b) => a - b);
        if (bidAmounts.length > 0) {
          const sumBids = bidAmounts.reduce((sum, amount) => sum + amount, 0);
          setAverageBid(sumBids / bidAmounts.length);

          const mid = Math.floor(bidAmounts.length / 2);
          const median = bidAmounts.length % 2 === 0 ? (bidAmounts[mid - 1] + bidAmounts[mid]) / 2 : bidAmounts[mid];
          setMedianBid(median);

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

          setBidDistribution({
            under80K: bidsData.length > 0 ? (countUnder80K / bidsData.length) * 100 : 0,
            between80Kand160K: bidsData.length > 0 ? (countBetween80Kand160K / bidsData.length) * 100 : 0,
            above160K: bidsData.length > 0 ? (countAbove160K / bidsData.length) * 100 : 0,
            total: bidsData.length
          });
        }

        if (bidsData && bidsData.length > 0 && propertiesData && propertiesData.length > 0) {
            const bidsWithMarketValue = bidsData
                .filter(bid => bid.properties && bid.properties.price && bid.properties.price > 0)
                .map(bid => ({
                    bidAmount: bid.bid_amount,
                    marketValue: bid.properties!.price as number // Cast to number as we filtered for it
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
      setError(err.message || 'Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCurrency]); // Recalculate when currency changes

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Calculate overall averages for properties
  const totalBuiltArea = properties.reduce((sum, p) => sum + (p.area || 0), 0);
  const totalLandArea = properties.reduce((sum, p) => sum + (p.land_size || p.lot_size || 0), 0);
  const totalBuiltPrice = properties.reduce((sum, p) => sum + (p.area && p.area > 0 ? p.price : 0), 0);
  const totalLandPrice = properties.reduce((sum, p) => sum + ((p.land_size || p.lot_size) && (p.land_size || p.lot_size) > 0 ? p.price : 0), 0);

  const averagePricePerBuiltSqm = totalBuiltArea > 0 ? totalBuiltPrice / totalBuiltArea : 0;
  const averagePricePerLandSqm = totalLandArea > 0 ? totalLandPrice / totalLandArea : 0;

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

  // Custom Tooltip for Scatter Chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; // This contains the full property object
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 text-sm">
          <h4 className="font-bold text-gray-900 mb-2">{data.title}</h4>
          {data.hero_image || data.grid_photo ? (
            <img 
              src={data.hero_image || data.grid_photo} 
              alt={data.title} 
              className="w-full h-24 object-cover rounded-md mb-2"
            />
          ) : (
            <div className="w-full h-24 bg-gray-100 rounded-md mb-2 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          <p className="text-gray-700">Built Area: {data.area} m²</p>
          <p className="text-gray-700">Value per Built m²: {formatPrice(data.pricePerBuiltSqmValue, selectedCurrency)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <SEO
        title="Boracay Property Statistics & Market Insights"
        description="Comprehensive statistics on Boracay real estate, including average price per SQM, dream bid analysis, and market trends."
        keywords="boracay property statistics, boracay real estate market, price per sqm, dream bid stats, property value analysis"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677233/38_marketing_copy_j9vspj.jpg"
        url="https://boracay.house/property-stats"
        type="website"
      />

      <div className="min-h-screen bg-white">
        <div className="h-32" />
        
        <Container className="py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Boracay Property Statistics
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Dive into the data: understand market trends, property values, and dream bid insights.
            </p>
          </div>

          {/* Property Value Analysis */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6"> {/* Modified: Added flex container */}
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4 md:mb-0">
                <Home className="w-6 h-6 text-amber-600" /> Property Value Analysis
              </h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
                <Square className="w-10 h-10 text-blue-600" />
                <div>
                  <p className="text-gray-600 text-sm">Average Price per Built m²:</p>
                  <p className="text-xl font-bold text-gray-900">
                    {averagePricePerBuiltSqm > 0 ? formatPrice(averagePricePerBuiltSqm, selectedCurrency) : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
                <LandPlot className="w-10 h-10 text-green-600" />
                <div>
                  <p className="text-gray-600 text-sm">Average Price per Land m²:</p>
                  <p className="text-xl font-bold text-gray-900">
                    {averagePricePerLandSqm > 0 ? formatPrice(averagePricePerLandSqm, selectedCurrency) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dream Bid Insights */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-purple-600" /> Dream Bid Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center text-center">
                <BarChart2 className="w-10 h-10 text-amber-600 mb-2" />
                <span className="text-2xl font-bold text-gray-900">{totalBids}</span>
                <span className="text-sm text-gray-600">Total Dream Bids</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center text-center">
                <Clock className="w-10 h-10 text-blue-600 mb-2" />
                <span className="text-2xl font-bold text-gray-900">{bidsLast24h}</span>
                <span className="text-sm text-gray-600">Bids in Last 24h</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center text-center">
                <Building className="w-10 h-10 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{propertiesWithBids}</span>
                <span className="text-sm text-gray-600">Properties with Bids</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center text-center">
                <DollarSign className="w-10 h-10 text-purple-600 mb-2" />
                <span className="text-2xl font-bold text-gray-900">€{medianBid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className="text-sm text-gray-600">Average Dream Bid</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center text-center">
                <Trophy className="w-10 h-10 text-pink-600 mb-2" />
                <span className="text-2xl font-bold text-gray-900">€{medianBid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className="text-sm text-gray-600">Median Dream Bid</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center text-center">
                <Info className="w-10 h-10 text-teal-600 mb-2" />
                <span className="text-xl font-bold text-gray-900">{mostFrequentBidRange}</span>
                <span className="text-sm text-gray-600">Most Frequent Bid Range</span>
              </div>
            </div>

            {/* Top 3 Bids Comparison */}
            {topBidsComparison.length > 0 && (
              <div className="bg-purple-50 p-6 rounded-lg shadow-md mb-8">
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
              <div className="bg-teal-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-teal-800 mb-4 flex items-center gap-2">
                  <BarChart2 className="w-6 h-6" /> Bid Distribution by Amount
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  This chart shows the percentage of dream bids falling into different price ranges.
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
          </div>

          {/* All Properties List */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Home className="w-6 h-6 text-amber-600" /> All Listed Properties
            </h2>
            {properties.length === 0 ? (
              <p className="text-gray-600">No properties found.</p>
            ) : (
              isMobile ? (
                <div className="space-y-4">
                  {properties.map(p => (
                    <a key={p.id} href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">Price: {formatPrice(p.price, selectedCurrency)}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                          <div>
                            <p className="font-medium">Built Area:</p>
                            <p>{p.area || 'N/A'} m²</p>
                          </div>
                          <div>
                            <p className="font-medium">Price/Built m²:</p>
                            <p>{p.pricePerBuiltSqm}</p>
                          </div>
                          <div>
                            <p className="font-medium">Land Area:</p>
                            <p>{(p.land_size || p.lot_size) || 'N/A'} m²</p>
                          </div>
                          <div>
                            <p className="font-medium">Price/Land m²:</p>
                            <p>{p.pricePerLandSqm}</p>
                          </div>
                          <div>
                            <p className="font-medium">Expected ROI:</p>
                            <p className="font-bold text-green-600">{p.netROI ? `${p.netROI.toFixed(1)}%` : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-100 text-blue-800">
                          <div className="flex items-center gap-1">
                            Built Area (m²) <Ruler className="w-4 h-4" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-100 text-blue-800">Value per Built m²</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-100 text-green-800">
                          <div className="flex items-center gap-1">
                            Land Area (m²) <LandPlot className="w-4 h-4" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-100 text-green-800">Price/Land m²</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected ROI</th> {/* New column header */}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 odd:bg-gray-50">
                      {properties.map((p) => (
                        <tr
                          key={p.id}
                          className={`cursor-pointer ${
                            p.title === 'Villa In Bulabog 2 bedrooms' ? 'bg-red-50' : 'hover:bg-gray-100'
                          }`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {p.title}
                            </a>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatPrice(p.price, selectedCurrency)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-700">{p.area || <span className="text-gray-400 italic">N/A</span>}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm bg-blue-50 font-bold text-gray-900">
                            {p.pricePerBuiltSqm}
                            {p.title === 'Villa In Bulabog 2 bedrooms' && <span className="font-bold text-red-600 ml-2">SOLD</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700">{(p.land_size || p.lot_size) || <span className="text-gray-400 italic">N/A</span>}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm bg-green-50 font-bold text-gray-900">{p.pricePerLandSqm}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-600"> {/* New ROI column data */}
                            {p.netROI ? `${p.netROI.toFixed(1)}%` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>

          {/* Start Your Boracay Journey Section */}
          <MiniInvestmentCalculatorForm />

          {/* Property Size vs. Price per Built m² Graph */}
          <div className="bg-white shadow-md rounded-lg p-6 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-blue-600" /> How Property Size Affects Value per Square Meter
            </h2>
            <p className="text-gray-600 mb-4">
              This chart shows that **smaller properties often have a higher value per square meter** than larger ones. Think of it like buying in bulk: a small bag of chips costs more per chip than a family-sized bag.
            </p>
            <div className="w-full h-80"> {/* Set a fixed height for the chart */}
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                  }}
                >
                  <CartesianGrid />
                  <XAxis type="number" dataKey="area" name="Built Area" unit="m²" />
                  <YAxis type="number" dataKey="pricePerBuiltSqmValue" name="Value per Built m²" unit={selectedCurrency === 'PHP' ? '₱' : '€'} />
                  <Tooltip content={<CustomTooltip />} /> {/* Use the custom tooltip */}
                  <Scatter name="Properties" data={properties.filter(p => p.area && p.pricePerBuiltSqmValue)} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-700 mt-4">
              **Why smaller properties often have a higher value per m²:**
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>**Easier to Afford:** Smaller properties have a lower total price, making them accessible to more buyers. This higher demand drives up the price per square meter.</li>
                <li>**Efficiency Premium:** Every square meter in a small property is often used very efficiently, making it feel more valuable.</li>
                <li>**Scarcity in Prime Spots:** In popular areas, there are fewer small, well-located properties available, increasing their per-square-meter value.</li>
                <li>**Fixed Costs:** Some costs (like legal fees or basic amenities) are similar for both small and large properties. When these costs are spread over fewer square meters, the per-square-meter price goes up.</li>
              </ul>
            </p>
          </div>

          {/* NEW SECTION: Historical Property & Land Value Growth */}
          <div className="bg-white shadow-md rounded-lg p-6 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" /> Historical Property & Land Value Growth
            </h2>
            <p className="text-gray-600 mb-6">
              Boracay's real estate market has shown consistent growth over the years. Below are the average property values and land values per square meter, illustrating the upward trend.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Average Property Value Chart */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Average Property Value (EUR)</h3>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={historicalData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => formatPrice(value, 'EUR')} />
                      <Tooltip formatter={(value) => formatPrice(value, 'EUR')} />
                      <Legend />
                      <Line type="monotone" dataKey="avgPropertyValue" stroke="#8884d8" activeDot={{ r: 8 }} name="Avg. Property Value" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Average Land Value per SQM Chart */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Average Land Value per SQM (EUR)</h3>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={historicalData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => formatPrice(value, 'EUR') + '/m²'} />
                      <Tooltip formatter={(value) => formatPrice(value, 'EUR') + '/m²'} />
                      <Legend />
                      <Line type="monotone" dataKey="avgLandValuePerSqm" stroke="#82ca9d" activeDot={{ r: 8 }} name="Avg. Land Value/m²" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Summary Table */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Summary of Historical Data</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Property Value</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Land Value/m²</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historicalData.map((dataPoint) => (
                      <tr key={dataPoint.year}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{dataPoint.year}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{formatPrice(dataPoint.avgPropertyValue, 'EUR')}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{formatPrice(dataPoint.avgLandValuePerSqm, 'EUR')}/m²</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* NEW SECTION: Boracay vs. Bali vs. Phuket Comparison */}
          <div className="bg-white shadow-md rounded-lg p-6 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600" /> Boracay vs. Bali vs. Phuket: Where to Invest?
            </h2>
            <p className="text-gray-600 mb-6">
              Choosing the right island for real estate investment is crucial. Here's a comparison of key metrics for Boracay, Bali, and Phuket, all popular Southeast Asian destinations.
            </p>

            {/* Comparison Bar Chart */}
            <div className="w-full h-96 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={COMPARISON_DATA}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="island" />
                  <YAxis yAxisId="price" orientation="left" stroke="#8884d8" /> {/* Primary Y-axis for prices */}
                  <YAxis yAxisId="percentage" orientation="right" stroke="#82ca9d" tickFormatter={(value) => `${value}%`} /> {/* Secondary Y-axis for percentages */}
                  <Tooltip formatter={(value: number, name: string) => {
                    if (name.includes('Price')) return `${formatPrice(value, 'EUR')}/m²`;
                    if (name.includes('Yield') || name.includes('Appreciation')) return `${value}%`;
                    return value;
                  }} />
                  <Legend />
                  <Bar yAxisId="price" dataKey="avgPricePerBuiltSqm" name="Avg. Price/Built m²" fill="#8884d8" />
                  <Bar yAxisId="price" dataKey="avgPricePerLandSqm" name="Avg. Price/Land m²" fill="#82ca9d" />
                  <Bar yAxisId="percentage" dataKey="avgRentalYield" name="Avg. Rental Yield (%)" fill="#ffc658" /> {/* Use secondary Y-axis */}
                  <Bar yAxisId="percentage" dataKey="avgAppreciation" name="Avg. Appreciation (%)" fill="#ff7300" /> {/* Use secondary Y-axis */}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Investment Considerations - Refactored */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COMPARISON_DATA.map((data) => (
                <div
                  key={data.island}
                  className={`p-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 ${
                    data.island === 'Boracay' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${data.island === 'Boracay' ? 'text-blue-800' : 'text-gray-900'}`}>
                    {data.island === 'Boracay' && <Check className="w-5 h-5 text-blue-600" />}
                    {data.island}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <span className="font-semibold">Entry Price:</span> {formatPrice(data.avgPricePerBuiltSqm, 'EUR')}/m² (Built), {formatPrice(data.avgPricePerLandSqm, 'EUR')}/m² (Land)
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Home className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <div>
                        <span className="font-semibold">Rental Yield:</span> {data.avgRentalYield}%
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <div>
                        <span className="font-semibold">Appreciation:</span> {data.avgAppreciation}%
                      </div>
                    </li>
                    {data.island === 'Boracay' && (
                      <li className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">Key Advantage:</span> Lower entry price, higher rental yield potential.
                        </div>
                      </li>
                    )}
                    {data.island === 'Bali' && (
                      <li className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                                <div>
                          <span className="font-semibold">Key Advantage:</span> Higher property values, strong luxury tourism.
                        </div>
                      </li>
                    )}
                    {data.island === 'Phuket' && (
                      <li className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">Key Advantage:</span> Established market, consistent tourism.
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>

            <p className="text-gray-600 leading-relaxed mt-8">
              Based on this mock data, Boracay appears to offer a **lower entry price** for both built property and land compared to Bali and Phuket, potentially allowing for a higher **average rental yield**. While Bali and Phuket show slightly higher appreciation rates in this simulation, Boracay's more accessible pricing combined with strong tourism recovery could make it an attractive option for investors seeking a balance of affordability and return.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              **Investment Considerations:**
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>**Boracay:** Offers competitive pricing and strong rental demand, especially for those looking for a more hands-on approach or local management.</li>
                <li>**Bali:** Generally higher property values, often attracting luxury tourism and offering potential for higher capital gains, but with a larger initial investment.</li>
                <li>**Phuket:** A well-established market with good infrastructure and consistent tourism, providing a stable investment environment with moderate returns.</li>
              </ul>
              It's crucial to conduct thorough due diligence and consider local regulations, market liquidity, and personal investment goals before making a decision.
            </p>
          </div>
        </Container>
      </div>
    </>
  );
};

export default PropertyStatsPage;
