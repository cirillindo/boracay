import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { Calculator, BarChart3, TrendingUp } from 'lucide-react';

interface InvestmentCalculatorPromoProps {
  className?: string;
}

const InvestmentCalculatorPromo: React.FC<InvestmentCalculatorPromoProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [calculatorSectionVisible, setCalculatorSectionVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCalculatorSectionVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className={`py-20 bg-gradient-to-b from-amber-50 to-white ${className}`}
    >
      <Container>
        <div 
          className="max-w-5xl mx-auto text-center"
          style={{
            opacity: calculatorSectionVisible ? 1 : 0,
            transform: `translateY(${calculatorSectionVisible ? '0' : '30px'})`,
            transition: 'all 1.2s ease-out'
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Unlock Your Boracay Investment Potential
          </h2>
          
          <h3 className="text-xl md:text-2xl font-bold uppercase text-amber-600 mb-4 animate-text-pulse">
            NOT SURE WHAT TO CHOOSE OR HOW TO INVEST?
          </h3>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
            Our interactive calculator provides data-driven insights and personalized ROI projections to help you make informed decisions about buying or investing in Boracay properties.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Personalized Analysis</h3>
              <p className="text-gray-600">
                Enter your budget and preferences to get tailored property recommendations with detailed ROI projections.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Compare Investments</h3>
              <p className="text-gray-600">
                Select multiple properties to compare potential returns, rental income, and appreciation over time.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">5-Year Projections</h3>
              <p className="text-gray-600">
                See the long-term potential of your investment with detailed 5-year financial forecasts and growth estimates.
              </p>
            </div>
          </div>

          <Button 
            onClick={() => navigate('/dream-move-calculator')}
            className="text-lg px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Calculate Your Dream Investment
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default InvestmentCalculatorPromo;