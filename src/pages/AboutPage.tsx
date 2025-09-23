import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { Check, X, ChevronRight, TrendingUp, Home, Users, Briefcase, Plane, Handshake as HandShake, Star, Award } from 'lucide-react';
import SEO from '../components/SEO';
import * as THREE from 'three';
import BIRDS from 'vanta/dist/vanta.birds.min';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  // Initialize Vanta effect with your specified configuration
  useEffect(() => {
    if (!vantaEffect.current && vantaRef.current) {
      const initVanta = async () => {
        const THREE_LIB = await import('three');
        const BIRDS_LIB = await import('vanta/dist/vanta.birds.min');
        
        vantaEffect.current = BIRDS_LIB.default({
          el: vantaRef.current,
          THREE: THREE_LIB.default, // Pass the default export of THREE
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          backgroundColor: 0xffffff, // White background
          color1: 0x87ff, // Blue color for birds
          speedLimit: 4.00,
          quantity: 4.00
        });
      };

      initVanta().catch(console.error);
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-section-id');
          if (id) {
            setSectionsVisible(prev => ({
              ...prev,
              [id]: entry.isIntersecting
            }));
          }
        });
      },
      { threshold: 0.2 }
    );

    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <SEO
        title="About Boracay.House – Your Trusted Local Property Experts"
        description="Discover the story behind Boracay.House. We're a family-run team living and working in Boracay, offering transparent real estate, reliable rentals, and expert property management. Learn about our mission, values, and commitment to the island."
        keywords="about boracay house, boracay real estate experts, boracay property management, local boracay team, boracay vacation rentals, boracay investment, trusted property services"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677412/13_marketing_copy_xemnmh.jpg"
        url="https://boracay.house/about"
        type="profile"
      />

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
                About Boracay.House
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                We're not just another real estate agency. We're property owners who understand what works in Boracay, dedicated to transparent and reliable service.
              </p>
            </div>
          </Container>
        </div>

        <section 
          ref={el => sectionRefs.current['island-life'] = el}
          data-section-id="island-life"
          className="py-24 relative overflow-hidden min-h-[600px]"
        >
          <div 
            ref={vantaRef}
            className="absolute inset-0 z-0 w-full h-full"
          />
          <div className="absolute inset-0 bg-white/80 z-0" />
          
          <Container>
            <div 
              className="max-w-6xl mx-auto relative z-10"
              style={{
                opacity: sectionsVisible['island-life'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['island-life'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl font-bold mb-8">
                    Our Story: From Island Dream to Boracay Property Experts
                  </h2>
                  <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p>
                      Boracay.House began almost a decade ago, born from our own journey as a European family seeking a life by the sea. What started as a passion for kitesurfing quickly evolved into building our dream home in this tropical paradise. This personal project organically grew into a thriving family-run <Link to="/airbnb" className="text-amber-600 hover:underline">Airbnb business</Link>, managing fully renovated villas that eventually became part of a new, vibrant condo-style community.
                    </p>
                    <p>
                      We are not traditional real estate agents. Our path was forged out of necessity: we experienced firsthand the frustrations of working with slow, vague, and often unreliable local agencies. This led us to create Boracay.House – initially just for our own listings, but soon expanding to help others navigate the complexities of <Link to="/airbnb" className="text-amber-600 hover:underline">renting</Link>, <Link to="/for-sale" className="text-amber-600 hover:underline">selling</Link>, or <Link to="/for-sale" className="text-amber-600 hover:underline">buying homes, condos, and land</Link> across the island.
                    </p>
                    <p>
                      Our deep, on-the-ground experience means we understand every facet of the <Link to="/boracay-real-estate" className="text-amber-600 hover:underline">Boracay property market</Link> – from optimal property design and navigating local permits to securing glowing guest reviews and handling intricate legal paperwork. We operate with unwavering honesty: you won't find fake listings, inflated beachfront prices, or hidden commissions here.
                    </p>
                    <p>
                      If you're looking to make a sound investment in Boracay, secure a hassle-free rental, or list your property with complete peace of mind, you've found your trusted partner.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-100 rounded-[60px] rotate-6 transform-gpu"></div>
                  <img 
                    src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1748367634/482324584_1130259389112739_6638706798572273322_n_hihhyf.jpg"
                    alt="Island Life in Boracay"
                    className="relative rounded-[40px] shadow-xl transform-gpu transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section 
          ref={el => sectionRefs.current['different'] = el}
          data-section-id="different"
          className="py-24 bg-gray-50"
        >
          <Container>
            <div 
              className="max-w-5xl mx-auto"
              style={{
                opacity: sectionsVisible['different'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['different'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">How We're Different: Experience the Boracay.House Advantage</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our approach was born from frustration with traditional methods. We built a better way to connect people with their Boracay dreams.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-red-50 p-8 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                  <h3 className="text-2xl font-bold mb-6 text-red-900">Traditional Agents: The Old Way</h3>
                  <div className="space-y-4">
                    {[
                      'Broad focus across many locations, diluting expertise',
                      'Often push overpriced or unsuitable listings',
                      'Slow response times, generic photos, and vague details',
                      "Lack deep understanding of the unique rental market dynamics"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-lg">
                        <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-red-900">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary-50 p-8 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                  <h3 className="text-2xl font-bold mb-6 text-primary-900">Boracay.House: Our Unique Approach</h3>
                  <div className="space-y-4">
                    {[
                      'Hyper-focused: 100% dedicated to Boracay properties',
                      'Curated listings: filtered for genuine value and potential',
                      'Direct, fast, and honest communication with authentic media',
                      'Proven success: we operate high-performing Airbnbs ourselves'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-lg">
                        <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <span className="text-primary-900">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section 
          ref={el => sectionRefs.current['why-exist'] = el}
          data-section-id="why-exist"
          className="py-24 bg-white"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['why-exist'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['why-exist'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-100 rounded-[60px] -rotate-6 transform-gpu"></div>
                  <img 
                    src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750260129/properties/pqadieeprcvucwh2yz11.webp"
                    alt="Why We Exist"
                    className="relative rounded-[40px] shadow-xl transform-gpu transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div>
                  <h2 className="text-4xl font-bold mb-8">Our Purpose: Connecting You to Authentic Boracay Property</h2>
                  <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p>
                      We created Boracay.House because we couldn't find a single, reliable platform solely focused on <Link to="/boracay-real-estate" className="text-amber-600 hover:underline">Boracay properties</Link> – a place free from overwhelming noise and irrelevant listings. Our goal was to build a resource that cuts through the clutter and provides clear, actionable information.
                    </p>
                    <p>
                      We don't just operate from afar; we live here, on the ground. We actively manage Airbnb rentals, giving us unparalleled insight into what truly works in this market. This direct experience means we know which deals offer genuine value and which pitfalls to avoid, from property acquisition to daily operations.
                    </p>
                    <p>
                      This site is designed for individuals who seek to <Link to="/for-sale" className="text-amber-600 hover:underline">own</Link>, <Link to="/airbnb" className="text-amber-600 hover:underline">rent</Link>, or <Link to="/dream-move-calculator" className="text-amber-600 hover:underline">invest in Boracay</Link> with complete transparency. We provide clear facts, showcase genuinely clean and well-maintained properties, and eliminate unnecessary middlemen, ensuring a straightforward and trustworthy experience for everyone involved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section 
          ref={el => sectionRefs.current['local-advantage'] = el}
          data-section-id="local-advantage"
          className="py-24 bg-gray-50"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['local-advantage'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['local-advantage'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-12">
                  <div>
                    <h2 className="text-3xl font-bold mb-4">The Boracay.House Local Advantage: Unmatched Expertise</h2>
                    <p className="text-gray-600 leading-relaxed">
                      Unlike agencies based off-island, we are deeply embedded in the <Link to="/beaches" className="text-amber-600 hover:underline">Boracay community</Link>. We walk these streets every day, observing market trends, understanding local nuances, and building relationships. This intimate knowledge allows us to identify emerging neighborhoods, navigate complex permit processes, and ensure your investment is both legal and profitable.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold mb-4">Proven Airbnb Operations: Your Rental Success Partner</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      We don't just advise on rentals – we are active hosts ourselves. With a track record of over 85% occupancy rates and hundreds of five-star reviews, we possess firsthand knowledge of what drives success in the <Link to="/vacation-rental-management" className="text-amber-600 hover:underline">Boracay vacation rental market</Link>. Our full-service property management expertise means we understand every detail, from guest satisfaction to maintenance, and we're eager to share these insights with you.
                    </p>

                    <h3 className="text-xl font-bold mb-4">Who Benefits from Boracay.House: Our Community</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-primary-600" />
                        <span className="text-gray-700"><Link to="/dream-move-calculator" className="text-amber-600 hover:underline">Investors</Link> seeking reliable rental income and growth</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Home className="w-5 h-5 text-primary-600" />
                        <span className="text-gray-700"><Link to="/blog/info/relocating-to-boracay-visa-investment-lifestyle-guide" className="text-amber-600 hover:underline">Families and individuals relocating to Boracay</Link> for a new life</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary-600" />
                        <span className="text-gray-700">Property owners frustrated with ineffective management</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Plane className="w-5 h-5 text-primary-600" />
                        <span className="text-gray-700"><Link to="/direct" className="text-amber-600 hover:underline">Travelers desiring direct, trustworthy vacation rentals</Link></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <HandShake className="w-5 h-5 text-primary-600" />
                        <span className="text-gray-700">Local property owners looking to <Link to="/services" className="text-amber-600 hover:underline">list and sell transparently</Link></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-primary-100 rounded-[60px] rotate-3 transform-gpu"></div>
                  <img 
                    src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1748368416/download_ggl7m4.jpg"
                    alt="Local Advantage"
                    className="relative rounded-[40px] shadow-xl transform-gpu transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section 
          ref={el => sectionRefs.current['cta'] = el}
          data-section-id="cta"
          className="py-24 bg-white"
        >
          <Container>
            <div 
              className="max-w-4xl mx-auto text-center"
              style={{
                opacity: sectionsVisible['cta'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['cta'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <h2 className="text-4xl font-bold mb-8">
                Ready to Connect with Boracay.House?
              </h2>
              <p className="text-xl text-gray-600 mb-12">
                Whether you're looking to buy, sell, rent, or simply explore your options in Boracay, our team is here to provide expert guidance and support.
              </p>
              <Button 
                onClick={() => navigate('/contact')}
                className="text-lg flex items-center gap-2"
              >
                Get in Touch
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </Container>
        </section>

        <div className="sr-only">
          Expert real estate services in Boracay. Local property knowledge, direct owner listings, and transparent transactions. Find your perfect home or investment property in Boracay with us. Learn about our family story, mission, and values. We offer property management, vacation rentals, and investment advice.
        </div>
      </div>
    </>
  );
};

export default AboutPage;

