// src/components/property/ROICalculator.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Percent, Clock, TrendingUp } from 'lucide-react';
import Button from '../ui/Button'; // Import the Button component
import { Property } from '../../types'; // Import Property type

interface ROICalculatorProps {
  property: Property; // Now accepts the full property object
}

// Helper function to format numbers for display in input fields (e.g., 100.000)
const formatNumberInput = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(/,/g, '.')) : value; // Handle both dot and comma as decimal, remove dot thousands
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('de-DE').format(num); // Use de-DE for dot thousands separator
};

// Helper function to parse formatted input strings back to numbers
const parseNumberInput = (value: string) => {
  // Remove thousands separators (dots) and replace decimal comma with dot
  return parseFloat(value.replace(/\./g, '').replace(/,/g, '.'));
};

const ROICalculator: React.FC<ROICalculatorProps> = ({ property }) => {
  // Initialize states based on the provided property data and Dream Move Calculator logic
  const initialPropertyPrice = property.price || 0;
  // Dream Move Calculator's base monthly income estimate: property.monthly_income_from_rent || (property.price * 0.01)
  const initialMonthlyRentalIncomeBase = property.monthly_income_from_rent || (property.price ? property.price * 0.01 : 0);
  
  const [propertyPrice, setPropertyPrice] = useState<number>(initialPropertyPrice);
  const [monthlyRentalIncomeBase, setMonthlyRentalIncomeBase] = useState<number>(initialMonthlyRentalIncomeBase);
  const [monthsLiving, setMonthsLiving] = useState<number>(0); // Default to 0 months living
  const [managementType, setManagementType] = useState<'agency' | 'self'>('agency'); // Default to agency
  
  // Display states for formatted inputs
  const [propertyPriceDisplay, setPropertyPriceDisplay] = useState<string>(formatNumberInput(initialPropertyPrice));
  const [monthlyRentalIncomeBaseDisplay, setMonthlyRentalIncomeBaseDisplay] = useState<string>(formatNumberInput(initialMonthlyRentalIncomeBase));

  const [netRentalYield, setNetRentalYield] = useState<number>(0);
  const [paybackPeriod, setPaybackPeriod] = useState<number>(0);
  const [cashFlowPerMonth, setCashFlowPerMonth] = useState<number>(0);

  // Effect to update display values when underlying numeric values change
  useEffect(() => {
    setPropertyPriceDisplay(formatNumberInput(propertyPrice));
    setMonthlyRentalIncomeBaseDisplay(formatNumberInput(monthlyRentalIncomeBase));
  }, [propertyPrice, monthlyRentalIncomeBase]);

  // Core calculation logic, mirroring Dream Move Calculator
  useEffect(() => {
    const annualAppreciationRate = 0.05; // Fixed 5% annual appreciation from Dream Move Calculator

    // Calculate gross yearly income adjusted for months living in property
    const grossYearlyIncome = monthlyRentalIncomeBase * (12 - monthsLiving);

    // Calculate management fees based on management type
    const agencyFee = grossYearlyIncome * 0.3; // 30% for agency
    const selfManagedCost = grossYearlyIncome * 0.05; // 5% for self-managed

    // Calculate net income based on management type
    const netIncome = managementType === 'agency' ? (grossYearlyIncome - agencyFee) : (grossYearlyIncome - selfManagedCost);

    // Calculate annual appreciation value
    const annualAppreciationValue = propertyPrice * annualAppreciationRate;

    // Calculate Net Rental Yield (%)
    let calculatedNetRentalYield = 0;
    if (propertyPrice > 0) {
      calculatedNetRentalYield = ((netIncome + annualAppreciationValue) / propertyPrice) * 100;
    }
    setNetRentalYield(calculatedNetRentalYield);

    // Calculate Payback Period (years)
    let calculatedPaybackPeriod = 0;
    if (netIncome > 0) {
      calculatedPaybackPeriod = propertyPrice / netIncome;
    } else if (propertyPrice > 0) {
      calculatedPaybackPeriod = Infinity; // If no net income, payback is infinite
    }
    setPaybackPeriod(calculatedPaybackPeriod);

    // Calculate Cashflow per Month
    setCashFlowPerMonth(netIncome / 12);

  }, [propertyPrice, monthlyRentalIncomeBase, managementType, monthsLiving]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">ROI / Yield Calculator for this property</h3>
      <p className="text-sm text-gray-600 mb-4">
        Estimate your potential returns. Adjust the values to see how they
        impact your investment.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="propertyPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Property Price (€)
          </label>
          <input
            type="text"
            id="propertyPrice"
            value={propertyPriceDisplay}
            onChange={(e) => {
              const rawValue = e.target.value;
              setPropertyPriceDisplay(rawValue);
              setPropertyPrice(parseNumberInput(rawValue));
            }}
            onFocus={(e) => {
              setPropertyPriceDisplay(propertyPrice === 0 ? '' : propertyPrice.toString());
            }}
            onBlur={(e) => {
              const value = parseNumberInput(e.target.value);
              if (!isNaN(value)) {
                setPropertyPrice(value);
                setPropertyPriceDisplay(formatNumberInput(value));
              } else {
                setPropertyPrice(0);
                setPropertyPriceDisplay('0');
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="monthlyRentalIncomeBase" className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Rental Income (Base €)
          </label>
          <input
            type="text"
            id="monthlyRentalIncomeBase"
            value={monthlyRentalIncomeBaseDisplay}
            onChange={(e) => {
              const rawValue = e.target.value;
              setMonthlyRentalIncomeBaseDisplay(rawValue);
              setMonthlyRentalIncomeBase(parseNumberInput(rawValue));
            }}
            onFocus={(e) => {
              setMonthlyRentalIncomeBaseDisplay(monthlyRentalIncomeBase === 0 ? '' : monthlyRentalIncomeBase.toString());
            }}
            onBlur={(e) => {
              const value = parseNumberInput(e.target.value);
              if (!isNaN(value)) {
                setMonthlyRentalIncomeBase(value);
                setMonthlyRentalIncomeBaseDisplay(formatNumberInput(value));
              } else {
                setMonthlyRentalIncomeBase(0);
                setMonthlyRentalIncomeBaseDisplay('0');
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="monthsLiving" className="block text-sm font-medium text-gray-700 mb-1">
            Months Living in Property (per year)
          </label>
          <input
            type="number"
            id="monthsLiving"
            value={monthsLiving}
            onChange={(e) => setMonthsLiving(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            min="0"
            max="12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Management Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${
                managementType === 'agency'
                  ? 'bg-amber-50 border-amber-500 text-amber-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setManagementType('agency')}
            >
              Agency (30%)
            </button>
            <button
              type="button"
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${
                managementType === 'self'
                  ? 'bg-amber-50 border-amber-500 text-amber-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setManagementType('self')}
            >
              Self (5%)
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" /> Net Rental Yield:
          </span>
          <span className="font-bold text-lg text-green-600">
            {netRentalYield.toFixed(1)}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" /> Payback Period:
          </span>
          <span className="font-bold text-lg text-blue-600">
            {paybackPeriod === Infinity ? 'Infinite' : `${paybackPeriod.toFixed(1)} years`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" /> Cashflow per Month:
          </span>
          <span className="font-bold text-lg text-purple-600">
            {formatCurrency(cashFlowPerMonth)}
          </span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/dream-move-calculator">
          <Button variant="outline" className="w-full">
            Go to Full Dream Move Calculator
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ROICalculator;
