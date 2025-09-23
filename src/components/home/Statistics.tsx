import React, { useState, useEffect } from 'react';
import Container from '../ui/Container';

interface AnimatedStatProps {
  value: string;
  isVisible: boolean;
  delay: number;
}

const AnimatedStat: React.FC<AnimatedStatProps> = ({ value, isVisible, delay }) => {
  const [currentValue, setCurrentValue] = useState("0");
  
  useEffect(() => {
    if (!isVisible) return;

    // Extract numeric value and suffix
    const numericMatch = value.match(/(\d+\.?\d*)([^0-9.]*)/);
    if (!numericMatch) return;

    const targetNum = parseFloat(numericMatch[1]);
    const suffix = numericMatch[2] || '';
    
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetNum / steps;
    let current = 0;

    // Add delay before starting animation
    const timeout = setTimeout(() => {
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetNum) {
          current = targetNum;
          clearInterval(timer);
        }
        setCurrentValue(current.toFixed(1) + suffix);
      }, duration / steps);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isVisible, value, delay]);

  return <span className="text-amber-400">{currentValue}</span>;
};

const Statistics: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const investmentStats = [
    {
      id: 'roi',
      title: 'ROI',
      figure: '10%+',
      description: 'Average annual returns from cozy vacation rentals in our friendly neighborhood'
    },
    {
      id: 'growth',
      title: 'Value Growth',
      figure: '15%+',
      description: 'Natural appreciation of island properties as Boracay continues to develop'
    },
    {
      id: 'tourism',
      title: 'Island Visitors',
      figure: '2.4M+',
      description: 'Happy travelers choosing Boracay as their tropical getaway each year'
    },
    {
      id: 'occupancy',
      title: 'Booking Rate',
      figure: '85%',
      description: 'Average occupancy of our well-maintained island homes during the year'
    }
  ];

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

    const element = document.getElementById('statistics-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="statistics-section" 
      className="py-20 bg-white relative z-10"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1747143041/Boracay_sunset_afw4zm.jpg)',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 backdrop-blur-[2px]"></div>
      
      <Container className="relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {investmentStats.map((stat, index) => (
            <div 
              key={stat.id} 
              className={`text-center transform transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2 drop-shadow-lg">
                <AnimatedStat 
                  value={stat.figure} 
                  isVisible={isVisible}
                  delay={index * 200}
                />
              </div>
              <div className="text-white text-sm md:text-base font-medium">
                {stat.title}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Statistics;