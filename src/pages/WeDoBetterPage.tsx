import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { Star, CheckCircle2, TrendingUp, Users, Heart } from 'lucide-react';
import * as THREE from 'three';
import BIRDS from 'vanta/dist/vanta.birds.min';
import GuestReviews from '../components/home/GuestReviews';

const WeDoBetterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [contentVisible, setContentVisible] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const [trackRecordVisible, setTrackRecordVisible] = useState(false);
  const [realEstateVisible, setRealEstateVisible] = useState(false);
  const [weDoBetterVisible, setWeDoBetterVisible] = useState(true);
  const vantaRef = useRef<any>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const trackRecordRef = useRef<HTMLDivElement>(null);
  const realEstateRef = useRef<HTMLDivElement>(null);
  const weDoBetterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    setContentVisible(true);
    setWeDoBetterVisible(true);
  }, []);

  useEffect(() => {
    if (!vantaRef.current && statsRef.current) {
      vantaRef.current = BIRDS({
        el: statsRef.current,
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.target === statsRef.current) {
          setStatsVisible(entry.isIntersecting);
        } else if (entry.target === trackRecordRef.current) {
          setTrackRecordVisible(entry.isIntersecting);
        } else if (entry.target === realEstateRef.current) {
          setRealEstateVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    if (trackRecordRef.current) observer.observe(trackRecordRef.current);
    if (realEstateRef.current) observer.observe(realEstateRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="h-32" />
      
      <div className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 w-full h-full animate-hero"
            style={{
              backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1748371020/Screenshot_2025-05-27_at_12.14.17_PM_efoue1_copy_cjtu8h.jpg)',
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
              Why We're Different — and Why It Works
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              We don't just manage Airbnbs in Boracay. We run them like a business — and the results speak for themselves.
            </p>
          </div>
        </Container>
      </div>

      <div ref={statsRef} className="relative min-h-screen">
        <Container className="py-24">
          <div 
            className="max-w-5xl mx-auto"
            style={{
              opacity: statsVisible ? 1 : 0,
              transform: `translateY(${statsVisible ? '0' : '20px'})`,
              transition: 'all 1s ease-out'
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              {[
                {
                  icon: <Star className="w-8 h-8 md:w-12 md:h-12 text-amber-500" />,
                  title: "100+ five-star reviews",
                  description: "Consistently exceeding guest expectations"
                },
                {
                  icon: <TrendingUp className="w-8 h-8 md:w-12 md:h-12 text-amber-500" />,
                  title: "85%+ year-round occupancy",
                  description: "High demand throughout all seasons"
                },
                {
                  icon: <CheckCircle2 className="w-8 h-8 md:w-12 md:h-12 text-amber-500" />,
                  title: "Zero maintenance issues left unresolved",
                  description: "Proactive maintenance and quick response times"
                },
                {
                  icon: <Users className="w-8 h-8 md:w-12 md:h-12 text-amber-500" />,
                  title: "Happy guests, loyal staff",
                  description: "Clear systems and excellent communication"
                }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-50 p-3 rounded-xl">
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2">{stat.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600">{stat.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-xl text-gray-600">
                Whether you're staying with us or buying one of our properties, you're getting into something that already works.
              </p>
            </div>
          </div>
        </Container>
      </div>

      <GuestReviews />

      <div ref={trackRecordRef} className="bg-gray-50 py-24">
        <Container>
          <div 
            className="max-w-5xl mx-auto"
            style={{
              opacity: trackRecordVisible ? 1 : 0,
              transform: `translateY(${trackRecordVisible ? '0' : '20px'})`,
              transition: 'all 1s ease-out'
            }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Our Track Record</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We've built a reputation by managing top-performing Airbnbs across Boracay. Our approach combines hands-on operations with data-driven pricing, local partnerships, and excellent guest support.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold mb-4">We know what matters:</h3>
                <ul className="space-y-4">
                  {[
                    "Quick response to problems",
                    "Clean, reliable spaces",
                    "Happy staff who care",
                    "Guests who come back (or buy!)"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-lg text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <img 
                  src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1748367634/482324584_1130259389112739_6638706798572273322_n_hihhyf.jpg"
                  alt="Track Record"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </Container>
      </div>

      <div ref={realEstateRef} className="py-24">
        <Container>
          <div 
            className="max-w-5xl mx-auto"
            style={{
              opacity: realEstateVisible ? 1 : 0,
              transform: `translateY(${realEstateVisible ? '0' : '20px'})`,
              transition: 'all 1s ease-out'
            }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Real Estate — The Smarter Way</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We've tried working with traditional real estate agencies. Results were slow and service was lacking. So we built our own direct network. And it's working.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-xl shadow-lg">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                If you're looking for Boracay property for sale, a house for sale in Boracay, or want access to real estate in Boracay Island — we're already ranking on Google's first page.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Why? Because we've built trust with buyers and visibility with travelers.
              </p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium">
                  Visit <a href="https://boracay.house" className="text-amber-600 hover:text-amber-700">boracay.house</a> — our original site — where we share listings and insider advice on Boracay real estate.
                </p>
                <Heart className="w-8 h-8 text-amber-500" />
              </div>
            </div>
          </div>
        </Container>
      </div>

      <section 
        ref={weDoBetterRef}
        className="relative min-h-[600px] bg-cover bg-center bg-fixed overflow-hidden"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1747242259/properties/yrv0yeq7w93mvuxvzltp.jpg)'
        }}
      >
        <div 
          className="absolute inset-0 bg-black/50"
          style={{
            opacity: weDoBetterVisible ? 1 : 0,
            transition: 'opacity 2s ease-out'
          }}
        />
        <Container className="relative h-full">
          <div 
            className="flex flex-col items-center justify-center min-h-[600px] text-center text-white"
            style={{
              opacity: weDoBetterVisible ? 1 : 0,
              transform: `translateY(${weDoBetterVisible ? '0' : '30px'})`,
              transition: 'opacity 2s ease-out, transform 2s ease-out'
            }}
          >
            <div 
              className="mb-12"
              style={{
                opacity: weDoBetterVisible ? 1 : 0,
                transform: `translateY(${weDoBetterVisible ? '0' : '30px'})`,
                transition: 'opacity 1s ease-out, transform 1s ease-out',
                transitionDelay: '0.3s'
              }}
            >
              <h3 className="text-3xl font-light mb-4">Airbnb-Ready Rentals</h3>
              <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                All managed homes maintain 85%+ booking rates and 5-star reviews. We handle listings, guests, staff, and support.
              </p>
            </div>

            <h2 className="text-5xl font-light mb-8 tracking-wider">
              WE DO BETTER
            </h2>

            <div 
              className="mb-12"
              style={{
                opacity: weDoBetterVisible ? 1 : 0,
                transform: `translateY(${weDoBetterVisible ? '0' : '30px'})`,
                transition: 'opacity 1s ease-out, transform 1s ease-out',
                transitionDelay: '0.6s'
              }}
            >
              <h3 className="text-3xl font-light mb-4">Trusted by Guests & Owners</h3>
              <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                We manage properties, solve problems, clean, repair, host, and even market your place. That's why both guests and owners stick with us.
              </p>
            </div>

            <Button 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-colors duration-300"
              onClick={() => navigate('/contact')}
            >
              CONTACT US
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default WeDoBetterPage;