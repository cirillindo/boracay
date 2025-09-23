import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { TrendingUp, Search, PieChart, Hammer } from 'lucide-react';

const InvestmentGuarantee: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <Container>
        <div 
          ref={sectionRef}
          className="max-w-6xl mx-auto relative"
        >
          <div 
            className="text-center mb-16 transform transition-all duration-1000"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
            <h2 className="text-4xl font-bold mb-4">
              INVESTMENT OPPORTUNITIES
            </h2>
            <div 
              className="absolute -bottom-2 left-0 h-1 bg-amber-500"
              style={{
                width: '200px',
                transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 1.5s ease-out'
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Portfolio Diversification */}
            <div 
              className="group relative"
              onMouseEnter={() => setHoveredCard(0)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: `translateY(${isVisible ? '0' : '40px'})`,
                transition: 'all 1000ms ease-out'
              }}
            >
              <div className="bg-white rounded-xl p-8 shadow-lg transition-all duration-500 hover:shadow-xl relative z-10 overflow-hidden group">
                <div className="absolute inset-0 bg-[#74bfab] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 group-hover:text-white transition-colors">
                    Balance with Something Real — Home, Sun, and Sea
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 group-hover:text-white/90 transition-colors">
                    Not every investment needs to sit in stocks or crypto. Starting at $70,000, you can own a rental-ready studio or villa in one of Asia's most visited beach destinations.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-white/90 transition-colors">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                      Entry from $70,000
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-white/90 transition-colors">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                      Rental income: 8–12% annually
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-white/90 transition-colors">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                      Capital appreciation: historically 5–7%/year
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-white/90 transition-colors">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                      Co-investment starting at $250,000+
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Exit Timeline */}
            <div 
              className="group relative"
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: `translateY(${isVisible ? '0' : '40px'})`,
                transition: 'all 1000ms 200ms ease-out'
              }}
            >
              <div className="bg-white rounded-xl p-8 shadow-lg transition-all duration-500 hover:shadow-xl relative z-10 overflow-hidden group">
                <div className="absolute inset-0 bg-[#74bfab] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 group-hover:text-white transition-colors">
                    Short Horizon or Long View — It's Your Strategy
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 group-hover:text-white/90 transition-colors">
                    We work with both active investors and hands-off owners to match their timeline and risk appetite.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-base font-semibold mb-2 text-gray-800 group-hover:text-white transition-colors">For active buyers:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-white/90 transition-colors">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                          Renovate → rent → sell in 2–3 years
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-white/90 transition-colors">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                          ROI potential: 10–15% net
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-white/90 transition-colors">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                          Transparent renovation costs and income projections
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold mb-2 text-gray-800 group-hover:text-white transition-colors">For passive buyers:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-white/90 transition-colors">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                          Stable short-term rental income
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-white/90 transition-colors">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                          Option to sell after 5–7 years
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-white/90 transition-colors">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                          We support you with market timing and resale
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Residency & Legal Options */}
            <div 
              className="group relative"
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: `translateY(${isVisible ? '0' : '40px'})`,
                transition: 'all 1000ms 400ms ease-out'
              }}
            >
              <div className={`bg-white rounded-xl p-8 shadow-lg transition-all duration-500 hover:shadow-xl relative z-10 overflow-hidden group elegant-pulse ${isVisible ? 'elegant-pulse' : ''}`}>
                <div className="absolute inset-0 bg-[#74bfab] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                <div className="square-radar absolute inset-0"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 group-hover:text-white transition-colors">
                    Property Ownership & Residency in the Philippines
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 group-hover:text-white/90 transition-colors">
                    Real estate in Boracay won't give you a passport — but it can open the door.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-white/90 transition-colors">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                      SRRV visa (age 35+): long-term stay rights with reduced deposit when buying property
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-white/90 transition-colors">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                      Investor visa options: for large-scale tourism or development projects
                    </li>
                  </ul>
                  <p className="text-sm italic text-gray-600 group-hover:text-white/90 transition-colors">
                    We're not a visa agency — but we know who to connect you with.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="text-center mt-16"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 1000ms 600ms ease-out'
            }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              No Beachfront? No Problem.
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-8">
              We don't deal with beachfront properties — they're legally complex and overpriced.<br />
              Our listings are 1–5 minutes to the beach, with better value and fewer risks.
            </p>
            <Button onClick={() => navigate('/for-sale')}>
              Buy property
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default InvestmentGuarantee;