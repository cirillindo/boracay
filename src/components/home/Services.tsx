import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { TrendingUp, Search, PieChart, Hammer, ArrowRight } from 'lucide-react';

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  const services = [
    {
      icon: <TrendingUp className="w-12 h-12 text-amber-700" />,
      title: "Sales of Villa and Land",
      description: "Exclusive properties in prime Diniwid Beach locations, perfect for both personal use and investment opportunities."
    },
    {
      icon: <Search className="w-12 h-12 text-amber-700" />,
      title: "Personal Support",
      description: "Direct communication with property owners, ensuring transparent and straightforward transactions."
    },
    {
      icon: <Hammer className="w-12 h-12 text-amber-700" />,
      title: "Property Management",
      description: "Optional property management services to help maintain your investment and handle rentals if desired."
    }
  ];

  return (
    <section ref={sectionRef} className="relative py-20 bg-white z-10">      
      <Container>
        <div 
          className="text-center mb-16 transform transition-all duration-1000"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
          }}
        >
          <div className="relative inline-block">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comprehensive Property Services</h2>
            <div 
              className="absolute -bottom-0 left-1/2 h-1 bg-amber-500"
              style={{
                width: '200px',
                transform: `translateX(-50%) scaleX(${isVisible ? 1 : 0})`,
                transformOrigin: 'center',
                transition: 'transform 1.5s ease-out'
              }}
            />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            From property sales to full management solutions, we offer a range of services to make your Boracay real estate experience seamless and rewarding. Here's just a sample of what we provide:
          </p>
          <Button 
            onClick={() => navigate('/services')}
            className="mb-12 flex items-center gap-2"
          >
            View All Services <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                transition: `all 1000ms ${index * 200}ms ease-out`
              }}
            >
              <div className="flex justify-center mb-6">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Services;