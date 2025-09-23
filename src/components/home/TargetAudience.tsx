import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { Globe, Heart, Sunset, Briefcase, Waves, Home } from 'lucide-react';
import * as THREE from 'three';
import BIRDS from 'vanta/dist/vanta.birds.min';

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const TargetAudience: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [airbnbTextVisible, setAirbnbTextVisible] = useState(true);
  const [trustedTextVisible, setTrustedTextVisible] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const vantaRef = useRef<any>(null);

  useEffect(() => {
    if (!vantaRef.current && sectionRef.current) {
      vantaRef.current = BIRDS({
        el: sectionRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        backgroundColor: 0xffffff,
        color1: 0x68786f,
        color2: 0x74bfab,
        colorMode: "lerp",
        birdSize: 1.20,
        wingSpan: 40.00,
        speedLimit: 5.00,
        separation: 30.00,
        alignment: 40.00,
        cohesion: 40.00,
        quantity: 4.00,
        backgroundAlpha: 0.32
      });
    }

    return () => {
      if (vantaRef.current) {
        vantaRef.current.destroy();
        vantaRef.current = null;
      }
    };
  }, []);

  const audiences = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Digital Nomads",
      description: "Fast Wi-Fi, relaxed living, island charm. Work where others vacation."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Young Couples",
      description: "Build your life together in paradise. Affordable, romantic, full of opportunity."
    },
    {
      icon: <Sunset className="w-6 h-6" />,
      title: "Retirees",
      description: "Peaceful beaches, low cost of living, supportive community."
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Investors",
      description: "10% ROI, high tourist demand, full management options."
    },
    {
      icon: <Waves className="w-6 h-6" />,
      title: "Adventurers",
      description: "Kitesurfing, diving, island hopping — adventure at your doorstep."
    },
    {
      icon: <Home className="w-6 h-6" />,
      title: "Families",
      description: "Safe, natural, community-focused living for your loved ones."
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="h-screen relative overflow-hidden isolate"
      style={{ zIndex: 1 }}
    >
      <div className="absolute inset-0 bg-white z-0" />
      
      <Container className="relative z-20 h-full flex items-center">
        <div 
          className="max-w-5xl mx-auto w-full"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 1000ms ease-out'
          }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#74bfab' }}>
              Find Your Place in Paradise
            </h2>
            <div className="w-20 h-1 bg-white mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {audiences.map((audience, index) => (
              <div 
                key={index}
                className="relative cursor-pointer group"
                onMouseEnter={() => setActiveIndex(index)}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 800ms ${index * 100}ms ease-out`
                }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 h-full shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-[#74bfab] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out"
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-primary group-hover:text-white transition-colors">
                        {audience.icon}
                      </div>
                      <h3 className="text-lg font-bold group-hover:text-white transition-colors">
                        {audience.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">
                      {audience.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div 
            className="text-center mt-16"
            style={{
              opacity: airbnbTextVisible ? 1 : 0,
              transform: `translateY(${airbnbTextVisible ? '0' : '30px'})`,
              transition: 'all 1s ease-out',
              transitionDelay: '0.3s'
            }}
          >
            <h3 className="text-3xl font-light mb-4">Airbnb-Ready Rentals</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              All managed homes maintain 85%+ booking rates and 5-star reviews. We handle listings, guests, staff, and support.
            </p>
          </div>

          <div 
            className="text-center mt-12"
            style={{
              opacity: trustedTextVisible ? 1 : 0,
              transform: `translateY(${trustedTextVisible ? '0' : '30px'})`,
              transition: 'all 1s ease-out',
              transitionDelay: '0.6s'
            }}
          >
            <h3 className="text-3xl font-light mb-4">👥 Trusted by Guests & Owners</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We manage properties, solve problems, clean, repair, host, and even market your place. That's why both guests and owners stick with us.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TargetAudience;