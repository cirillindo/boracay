import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import { TrendingUp, Home, DollarSign, BarChart3, Calculator, PieChart, Settings, ArrowRight, Check, X, Heart, Info, BarChart2 } from 'lucide-react';
import SEO from '../components/SEO';
import { playSound } from '../utils/audio';
import FloatingComparisonHint from '../components/FloatingComparisonHint'; // Import the new component

interface CalculatorResult {
  selectedProperties: PropertyWithROI[];
  combinedROI: number;
  fiveYearGain: number;
}

interface PropertyWithROI extends Property {
  netROI: number;
  annualNetIncome: number;
  selfManagedROI: number;
  selfManagedIncome: number;
  peakSeasonRate: number;
  fiveYearAppreciation: number;
  annualAppreciation: number;
  isSelected: boolean;
}

const BoracayDreamMoveCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [budget, setBudget] = useState<number>(300000);
  const [monthsLiving, setMonthsLiving] = useState<number>(0);
  const [managementType, setManagementType] = useState<'agency' | 'self'>('agency');
  const [properties, setProperties] = useState<PropertyWithROI[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [calculationComplete, setCalculationComplete] = useState<boolean>(false);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [selectedCount, setSelectedCount] = useState(0);

  // New state and ref for the floating hint
  const [showFloatingCloud, setShowFloatingCloud] = useState(false);
  const propertiesListSectionRef = useRef<HTMLDivElement>(null); // Ref for the properties list section

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setContentVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const scrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Define calculateResults using useCallback
  const calculateResults = useCallback((propertyData: Property[], currentMonthsLiving: number, currentManagementType: 'agency' | 'self'): PropertyWithROI[] => {
    return propertyData.map(property => {
      const monthlyIncome = property.monthly_income_from_rent || (property.price * 0.01);
      const grossYearlyIncome = monthlyIncome * (12 - currentMonthsLiving);
      const agencyFee = grossYearlyIncome * 0.3;
      const selfManagedCost = grossYearlyIncome * 0.05;
      const netIncomeAgency = grossYearlyIncome - agencyFee;
      const netIncomeSelf = grossYearlyIncome - selfManagedCost;
      const annualAppreciation = property.price * 0.05;
      const roiAgency = ((netIncomeAgency + annualAppreciation) / property.price) * 100;
      const roiSelf = ((netIncomeSelf + annualAppreciation) / property.price) * 100;
      const fiveYearAppreciation = property.price * 0.05 * 5;
      const peakSeasonRate = property.nightly_rate_max || (property.price * 0.0007);
      
      return {
        ...property,
        netROI: roiAgency,
        annualNetIncome: netIncomeAgency,
        selfManagedROI: roiSelf,
        selfManagedIncome: netIncomeSelf,
        peakSeasonRate: peakSeasonRate,
        fiveYearAppreciation: fiveYearAppreciation,
        annualAppreciation: annualAppreciation,
        isSelected: false
      };
    }).sort((a, b) => {
      const aROI = currentManagementType === 'agency' ? a.netROI : a.selfManagedROI;
      const bROI = currentManagementType === 'agency' ? b.netROI : b.selfManagedROI;
      return bROI - aROI;
    });
  }, []); // No dependencies needed for calculateResults as it only uses its arguments

  // Define fetchProperties using useCallback
  const fetchProperties = useCallback(async (currentBudget: number, currentMonthsLiving: number, currentManagementType: 'agency' | 'self') => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .lte('price', currentBudget * 1.2)
        .order('price', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const propertiesWithROI = calculateResults(data, currentMonthsLiving, currentManagementType);
        setProperties(propertiesWithROI);
        setResult({
          selectedProperties: [],
          combinedROI: 0,
          fiveYearGain: 0
        });
        setCalculationComplete(true);
        setSelectedCount(0);
        // Removed setTimeout(scrollToResults, 500); from here
      } else {
        setProperties([]);
        setCalculationComplete(false);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateResults]); // Removed scrollToResults from dependencies as it's not called directly here

  // Effect to read URL parameters and initialize state
  useEffect(() => {
    const urlBudget = searchParams.get('budget');
    const urlMonthsLiving = searchParams.get('monthsLiving');
    const urlManagementType = searchParams.get('managementType');

    let shouldTriggerCalculation = false;

    if (urlBudget) {
      setBudget(Number(urlBudget));
      shouldTriggerCalculation = true;
    }
    if (urlMonthsLiving) {
      setMonthsLiving(Number(urlMonthsLiving));
      shouldTriggerCalculation = true;
    }
    if (urlManagementType === 'agency' || urlManagementType === 'self') {
      setManagementType(urlManagementType);
      shouldTriggerCalculation = true;
    }

    // Trigger calculation if parameters are present
    if (shouldTriggerCalculation) {
      // Use the values directly from searchParams for the initial fetch
      fetchProperties(
        Number(urlBudget || budget),
        Number(urlMonthsLiving || monthsLiving),
        (urlManagementType || managementType) as 'agency' | 'self'
      );
      setTimeout(scrollToResults, 500); // Scroll only on initial load from URL params
    }
  }, [searchParams, fetchProperties]);

  // Effect for the floating cloud visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show the cloud if the properties list is intersecting and there are properties to select
        setShowFloatingCloud(entry.isIntersecting && properties.length > 0 && selectedCount < 5);
      },
      { threshold: 0.1 } // Trigger when 10% of the section is visible
    );

    if (propertiesListSectionRef.current) {
      observer.observe(propertiesListSectionRef.current);
    }

    return () => {
      if (propertiesListSectionRef.current) {
        observer.unobserve(propertiesListSectionRef.current);
      }
    };
  }, [properties.length, selectedCount]); // Re-run when properties or selectedCount changes

  const togglePropertySelection = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;
    
    const newSelectedCount = property.isSelected ? selectedCount - 1 : selectedCount + 1;

    if (!property.isSelected && newSelectedCount > 5) {
      alert("You can select a maximum of 5 properties for comparison.");
      return;
    }
    
    playSound('click.mp3');
    const updatedProperties = properties.map(p => 
      p.id === propertyId ? { ...p, isSelected: !p.isSelected } : p
    );
    
    setProperties(updatedProperties);
    setSelectedCount(newSelectedCount);

    const selectedProperties = updatedProperties.filter(p => p.isSelected);
    setResult({
      selectedProperties,
      combinedROI: calculateCombinedROI(selectedProperties),
      fiveYearGain: calculateFiveYearGain(selectedProperties)
    });
    
    logCalculation(selectedProperties);
  };

  const calculateCombinedROI = (selectedProperties: PropertyWithROI[]): number => {
    if (selectedProperties.length === 0) return 0;
    
    const totalInvestment = selectedProperties.reduce((sum, p) => sum + p.price, 0);
    const totalAnnualIncome = selectedProperties.reduce((sum, p) => 
      sum + (managementType === 'agency' ? p.annualNetIncome : p.selfManagedIncome), 0);
    const totalAnnualAppreciation = selectedProperties.reduce((sum, p) => 
      sum + p.annualAppreciation, 0);
    
    return ((totalAnnualIncome + totalAnnualAppreciation) / totalInvestment) * 100;
  };

  const calculateFiveYearGain = (selectedProperties: PropertyWithROI[]): number => {
    if (selectedProperties.length === 0) return 0;
    
    return selectedProperties.reduce((sum, p) => 
      sum + p.fiveYearAppreciation + 
      (managementType === 'agency' ? p.annualNetIncome * 5 : p.selfManagedIncome * 5), 0);
  };

  const logCalculation = async (selectedProperties: PropertyWithROI[]) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      const selectedPropertyIds = selectedProperties
        .filter(p => p.isSelected)
        .map(p => p.id);
      
      await supabase
        .from('calculator_queries')
        .insert({
          budget,
          selected_properties: selectedPropertyIds,
          user_id: userId || null,
          management_type: managementType,
          query_params: {
            budget,
            monthsLiving,
            managementType,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error logging calculation:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCalculateClick = () => {
    fetchProperties(budget, monthsLiving, managementType);
    setTimeout(scrollToResults, 500); // Scroll when button is clicked
  };

  const saveToFavorites = () => {
    const selectedPropertyIds = properties
      .filter(p => p.isSelected)
      .map(p => p.id);
    
    if (selectedPropertyIds.length === 0) return;
    
    // Get existing favorites
    const favoritesStr = localStorage.getItem('favorites');
    const favorites = favoritesStr ? JSON.parse(favoritesStr) : [];
    
    // Add selected properties to favorites (avoiding duplicates)
    const newFavorites = [...new Set([...favorites, ...selectedPropertyIds])];
    
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    // Trigger event for any listeners (like the heart icon in navbar)
    window.dispatchEvent(new Event('favoritesUpdated'));
    
    // Play sound and show confirmation
    playSound('click.mp3');
    alert("Successfully added to favorites, click Favourite Heart on top of the screen to email us.");
  };

  return (
    <>
      <SEO
        title="Boracay Dream Move Calculator: Buy, Rent, or Invest"
        description="Thinking about moving to Boracay or investing in a property here? Use this free tool to find out what your budget can get you — and whether it makes more sense to rent, buy to live, or invest and host guests."
        keywords="Boracay property investment calculator, Buy condo in Boracay, Should I rent or buy in Boracay, Boracay real estate ROI, Beachfront property Philippines, Digital nomad real estate tools, Retirement property Boracay, Philippines property calculator"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1749293212/05_marketing_copy_x9vspj.jpg"
        url="https://boracay.house/dream-move-calculator"
        type="website"
      />

      <div className="min-h-screen bg-white">
        <div className="h-32" />
        
        <div className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 w-full h-full animate-hero"
              style={{
                backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1750264783/DiniwidBeach_pqot5d.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                willChange: 'transform'
              }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="theater-curtain" />

          <Container className="relative z-10">
            <div 
              className="max-w-4xl mx-auto text-center"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 1s ease-out'
              }}
            >
              <h1 className="text-5xl font-bold text-white mb-6">
                Boracay Dream Move Calculator
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                Thinking about moving to Boracay or investing in a property here? Find out what your budget can get you — and whether it makes more sense to rent, buy to live, or invest and host guests.
              </p>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Perfect for digital nomads, retirees, and Filipinos looking to own a slice of island life.
              </p>
            </div>
          </Container>
        </div>

        <Container className="py-16">
          <div 
            className="max-w-4xl mx-auto"
            style={{
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 1s ease-out',
              transitionDelay: '0.3s'
            }}
          >
            <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Start Your Boracay Journey
                </h2>
                <p className="text-gray-600">
                  Enter your investment budget and see what's possible in Boracay
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Investment Budget (EUR)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-4 py-3 text-xl font-bold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="300000"
                    min="50000"
                    step="10000"
                  />
                  <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <span>Min: €50,000</span>
                    <span>Recommended: €200,000+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Months Living in the Property (per year, the goal is for the buyer to choose if they want to live in the property sometimes or not)
                  </label>
                  <input
                    type="number"
                    value={monthsLiving}
                    onChange={(e) => setMonthsLiving(Number(e.target.value))}
                    className="w-full px-4 py-3 text-xl font-bold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0"
                    min="0"
                    max="12"
                    step="1"
                  />
                  <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <span>0 = Investment only</span>
                    <span>12 = Full-time residence</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Management Preference
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={`flex items-center justify-center gap-3 p-4 rounded-lg border ${
                        managementType === 'agency'
                          ? 'bg-amber-50 border-amber-500 text-amber-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setManagementType('agency')}
                    >
                      <Settings className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">Agency Managed</div>
                        <div className="text-xs text-gray-500">30% fee, hands-off</div>
                      </div>
                      {managementType === 'agency' && (
                        <Check className="w-5 h-5 ml-auto text-amber-500" />
                      )}
                    </button>
                    
                    <button
                      type="button"
                      className={`flex items-center justify-center gap-3 p-4 rounded-lg border ${
                        managementType === 'self'
                          ? 'bg-amber-50 border-amber-500 text-amber-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setManagementType('self')}
                    >
                      <Home className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">Self-Managed</div>
                        <div className="text-xs text-gray-500">5% cost, more work</div>
                      </div>
                      {managementType === 'self' && (
                        <Check className="w-5 h-5 ml-auto text-amber-500" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleCalculateClick}
                  disabled={loading}
                  className="w-full py-4 text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Calculator className="w-5 h-5" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                      Find Top ROI Investments
                    </>
                  )}
                </Button>
              </div>
            </div>

            {calculationComplete && result && (
              <div 
                ref={resultsRef}
                className="space-y-12 mb-16"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Top ROI Investments
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                    Based on your {formatCurrency(budget)} budget, here are the best investment opportunities in Boracay.
                  </p>
                </div>

                {/* Permanent Selection Tip */}
                <div className="bg-amber-50 border-2 border-amber-400 p-6 rounded-lg mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-100 p-3 rounded-full">
                      <Info className="w-8 h-8 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-800 animate-text-pulse">Click the heart icon to select properties</h3>
                      <p className="text-lg font-bold text-amber-700">
                        Select up to 5 properties to compare their investment potential. Click the heart icon <Heart className="w-5 h-5 inline text-red-500" /> on each property card to add it to your comparison.
                      </p>
                    </div>
                  </div>
                </div>

                <div ref={propertiesListSectionRef} className="space-y-4"> {/* Attach ref here */}
                  {properties.map((property) => (
                    <div 
                      key={property.id} 
                      className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                        property.isSelected ? 'border-amber-500 shadow-amber-100' : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 relative">
                          <img
                            src={property.hero_image || property.grid_photo || 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1750264783/DiniwidBeach_pqot5d.webp'}
                            alt={property.title}
                            className="w-full h-full object-cover"
                            style={{ minHeight: '200px' }}
                          />
                          <button
                            onClick={() => togglePropertySelection(property.id)}
                            className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors select-button-pulse ${
                              property.isSelected 
                                ? 'bg-amber-500 text-white' 
                                : 'bg-white/90 text-gray-600 hover:bg-amber-100'
                            }`}
                          >
                            {property.isSelected ? (
                              <Check className="w-6 h-6" />
                            ) : (
                              <Heart className="w-6 h-6" />
                            )}
                          </button>
                        </div>
                        
                        <div className="md:w-2/3 p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2">
                            {property.title}
                          </h3>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <span className="text-gray-600 text-sm">Price:</span>
                              <div className="font-bold text-gray-900">{formatCurrency(property.price)} <span className="text-gray-500">€</span></div>
                            </div>
                            
                            <div>
                              <span className="text-gray-600 text-sm">Monthly Income:</span>
                              <div className="font-bold text-gray-900">
                                {formatCurrency(property.monthly_income_from_rent || (property.price * 0.01))} <span className="text-gray-500">€</span>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-gray-600 text-sm">Gross Yearly:</span>
                              <div className="font-bold text-gray-900">
                                {formatCurrency((property.monthly_income_from_rent || (property.price * 0.01)) * (12 - monthsLiving))} <span className="text-gray-500">€</span>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-gray-600 text-sm">Gross Yearly (%):</span>
                              <div className="font-bold text-gray-900">
                                {(((property.monthly_income_from_rent || (property.price * 0.01)) * (12 - monthsLiving)) / property.price * 100).toFixed(1)}% <span className="text-gray-500">%</span>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-gray-600 text-sm">Net Yearly Income:</span>
                              <div className="font-bold text-amber-600">
                                {formatCurrency(managementType === 'agency' 
                                  ? property.annualNetIncome 
                                  : property.selfManagedIncome)} <span className="text-amber-400">€</span>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-gray-600 text-sm">Yearly Appreciation:</span>
                              <div className="font-bold text-green-600">
                                {formatCurrency(property.annualAppreciation)} <span className="text-green-400">(5%)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-gray-600 text-sm">Expected ROI:</span>
                              <span className="ml-2 text-xl font-bold text-amber-700">
                                {managementType === 'agency' 
                                  ? property.netROI.toFixed(1) 
                                  : property.selfManagedROI.toFixed(1)}%
                              </span>
                            </div>
                            
                            <div>
                              <span className="text-gray-600 text-sm">Peak Season Rate:</span>
                              <span className="ml-2 font-bold text-gray-900">
                                {formatCurrency(property.nightly_rate_max || property.peakSeasonRate)}/night
                              </span>
                            </div>
                            
                            <Button
                              onClick={() => navigate(`/property/${property.slug}`)}
                              variant="outline"
                              size="sm"
                              className="ml-auto"
                            >
                              View Property
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCount > 0 && (
                  <div className="flex justify-center">
                    <Button
                      onClick={saveToFavorites}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Heart className="w-5 h-5" />
                      Save properties to favorites and email us
                    </Button>
                  </div>
                )}

                {result.selectedProperties.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-xl font-bold text-gray-900">Investment Comparison</h3>
                    </div>
                    
                    <div className="p-6 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Metric
                            </th>
                            {result.selectedProperties.map((property, index) => (
                              <th key={property.id} className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Property {index + 1}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Price
                            </td>
                            {result.selectedProperties.map((property) => (
                              <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(property.price)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Monthly Income
                            </td>
                            {result.selectedProperties.map((property) => (
                              <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(property.monthly_income_from_rent || (property.price * 0.01))}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Gross Yearly Income
                            </td>
                            {result.selectedProperties.map((property) => (
                              <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency((property.monthly_income_from_rent || (property.price * 0.01)) * (12 - monthsLiving))}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Gross Yearly (% of Price)
                            </td>
                            {result.selectedProperties.map((property) => (
                              <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(((property.monthly_income_from_rent || (property.price * 0.01)) * (12 - monthsLiving)) / property.price * 100).toFixed(1)}%
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {managementType === 'agency' ? 'Agency Fee' : 'Self-Managed Cost'}
                            </td>
                            {result.selectedProperties.map((property) => {
                              const grossYearlyIncome = (property.monthly_income_from_rent || (property.price * 0.01)) * (12 - monthsLiving);
                              const fee = managementType === 'agency' 
                                ? grossYearlyIncome * 0.3 
                                : grossYearlyIncome * 0.05;
                              return (
                                <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatCurrency(fee)}
                                </td>
                              );
                            })}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Net Yearly Income
                            </td>
                            {result.selectedProperties.map((property) => (
                              <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(managementType === 'agency' 
                                  ? property.annualNetIncome 
                                  : property.selfManagedIncome)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Yearly Appreciation (€)
                            </td>
                            {result.selectedProperties.map((property) => (
                              <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(property.annualAppreciation)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Yearly Appreciation (%)
                            </td>
                            {result.selectedProperties.map((property) => (
                              <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                5%
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Expected ROI
                            </td>
                            {result.selectedProperties.map((property) => (
                              <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-600">
                                {managementType === 'agency' 
                                  ? property.netROI.toFixed(1) 
                                  : property.selfManagedROI.toFixed(1)}%
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Peak Season Rate
                            </td>
                            {result.selectedProperties.map((property) => (
                              <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(property.nightly_rate_max || property.peakSeasonRate)}/night
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-amber-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              5-Year Total Gain
                            </td>
                            {result.selectedProperties.map((property) => {
                              const fiveYearIncome = managementType === 'agency' 
                                ? property.annualNetIncome * 5
                                : property.selfManagedIncome * 5;
                              return (
                                <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-700">
                                  {formatCurrency(property.fiveYearAppreciation + fiveYearIncome)}
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {result.selectedProperties.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-green-600 text-white px-6 py-3">
                      <h3 className="text-xl font-bold">Your 5-Year Outlook</h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-6 h-6 text-green-600" />
                            <h4 className="text-lg font-bold text-gray-900">Total Investment</h4>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(result.selectedProperties
                              .reduce((sum, p) => sum + p.price, 0))}
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="w-6 h-6 text-green-600" />
                            <h4 className="text-lg font-bold text-gray-900">Annual Return</h4>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(result.selectedProperties
                              .reduce((sum, p) => 
                                sum + (managementType === 'agency' ? p.annualNetIncome : p.selfManagedIncome) + p.annualAppreciation, 0))}
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                            <h4 className="text-lg font-bold text-gray-900">5-Year Gain</h4>
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(result.fiveYearGain)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-green-50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <PieChart className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Investment Strategy</h4>
                            <p className="text-gray-700">
                              This plan focuses on properties with the highest ROI potential in Boracay.
                              {monthsLiving > 0 ? 
                                ` You'll live in your property for ${monthsLiving} months per year while generating income during the remaining ${12 - monthsLiving} months.` : 
                                ' These properties are selected for maximum investment returns with no personal use.'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-center">
                        <Button
                          onClick={() => navigate('/contact')}
                          className="flex items-center gap-2"
                        >
                          <ArrowRight className="w-5 h-5" />
                          Discuss This Plan With Our Team
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  How The Calculator Works
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Our Boracay Dream Move Calculator uses real property data and market insights to show you what's possible with your budget.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="bg-amber-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                    <Calculator className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Property Matching</h3>
                  <p className="text-gray-600">
                    We analyze properties within your budget (plus a 20% stretch option) to find the best ROI investments in Boracay.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="bg-amber-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                    <BarChart3 className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">ROI Calculation Engine</h3>
                  <p className="text-gray-600">
                    Our algorithm calculates potential rental income, management costs, and property appreciation based on real Boracay market data.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="bg-amber-100 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                    <Settings className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Management Options</h3>
                  <p className="text-gray-600">
                    Compare agency-managed (30% fee, hands-off) vs. self-managed (5% cost, more work) to see which approach maximizes your returns.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    How accurate are these calculations?
                  </h3>
                  <p className="text-gray-600">
                    Our calculator uses real market data from Boracay properties, but actual returns may vary based on factors like property condition, location, and market fluctuations. We recommend using this as a starting point for discussions with our team.
                  </p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Can foreigners own property in Boracay?
                  </h3>
                  <p className="text-gray-600">
                    Foreigners can own condominium units (with individual ownership under the building's Tax Declaration) but not land directly. Many foreigners also use long-term leases (25-50 years) or form Philippine corporations. Our team can guide you through the options.
                  </p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    What's included in the management fees?
                  </h3>
                  <p className="text-gray-600">
                    Agency management (30%) typically includes listing creation and optimization, guest communication, check-ins, housekeeping, maintenance coordination, and financial reporting. Self-management (5%) accounts for basic costs like cleaning supplies and minor repairs that you'd handle yourself.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    How is the 5-year appreciation calculated?
                  </h3>
                  <p className="text-gray-600">
                    We use a conservative 5% annual appreciation rate based on historical Boracay property value increases. Some areas may appreciate faster, especially with infrastructure improvements or increasing tourism.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <FloatingComparisonHint isVisible={showFloatingCloud} onDismiss={() => setShowFloatingCloud(false)} />
    </>
  );
};

export default BoracayDreamMoveCalculator;
