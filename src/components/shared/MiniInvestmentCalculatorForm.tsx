import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { Calculator, Settings, Home, Check } from 'lucide-react';

const MiniInvestmentCalculatorForm: React.FC = () => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState<number>(300000);
  const [monthsLiving, setMonthsLiving] = useState<number>(0);
  const [managementType, setManagementType] = useState<'agency' | 'self'>('agency');

  const handleCalculate = () => {
    const params = new URLSearchParams();
    params.append('budget', budget.toString());
    params.append('monthsLiving', monthsLiving.toString());
    params.append('managementType', managementType);
    navigate(`/dream-move-calculator?${params.toString()}`);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
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
              onClick={handleCalculate}
              className="w-full py-4 text-lg flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Find Top ROI Investments
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiniInvestmentCalculatorForm;