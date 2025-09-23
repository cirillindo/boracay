import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import SuccessModal from '../components/ui/SuccessModal';
import { 
  MessageCircle, Phone, Mail, MapPin
} from 'lucide-react';
import InquireNowForm from '../components/forms/InquireNowForm';
import SEO from '../components/SEO';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [titleVisible, setTitleVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [weDoBetterVisible, setWeDoBetterVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const weDoBetterRef = useRef<HTMLDivElement>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleVisible(true);
    const timer = setTimeout(() => setFormVisible(true), 500);
    const timer2 = setTimeout(() => setSidebarVisible(true), 800);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.target === weDoBetterRef.current) {
          setWeDoBetterVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.2 }
    );

    if (weDoBetterRef.current) {
      observer.observe(weDoBetterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load Vanta.js effect
  useEffect(() => {
    let vantaEffect: any;
    const loadVanta = async () => {
      if (vantaRef.current) {
        // Dynamically import required libraries
        const [THREE, BIRDS] = await Promise.all([
          import('three'),
          import('vanta/dist/vanta.birds.min')
        ]);

        vantaEffect = BIRDS.default({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          backgroundColor: 0xffffff,
          color1: 0x74c0f5,
          speedLimit: 4.00,
          quantity: 4.00
        });
      }
    };

    loadVanta();

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      <SEO
        title="Contact Boracay House – Get in Touch with Local Experts"
        description="Have questions about properties in Boracay? Contact our local team for personalized assistance and expert advice."
        keywords="contact boracay house, boracay property inquiry, boracay real estate contact, boracay investment consultation"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677412/13_marketing_copy_xemnmh.jpg"
        url="https://boracay.house/contact"
      />

      <div className="min-h-screen bg-white">
        <div className="h-32" />
        
        <div className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 w-full h-full animate-hero"
              style={{
                backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1748531905/DSC_0182_dyn89h_copy_xrxhfw.jpg)',
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
              className={`w-full max-w-4xl mx-auto text-center transition-all duration-1000 transform ${
                titleVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
              }`}
            >
              <h1 className="text-5xl font-bold text-white mb-6">
                WE'D LOVE TO HEAR FROM YOU
              </h1>
              <p className="text-xl text-gray-200">
                Feel free to reach out to us! Our exceptional Real Estate Agents is here to help you with any inquiries you may have.
              </p>
            </div>
          </Container>
        </div>

        {/* Section with Vanta.js background */}
        <section 
          ref={vantaRef} 
          className="relative py-24 min-h-[500px] flex items-center"
        >
          <Container>
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Got a question?
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                Need help with a listing? Want to know how to buy or rent in Boracay?<br />
                We're a local family team — not agents — and we're happy to help in English, Tagalog, Russian, or Italian.<br />
                Send us a message and we'll get back quickly.
              </p>
            </div>
          </Container>
        </section>

        <Container className="py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div 
                className="lg:col-span-2 transform transition-all duration-1000"
                style={{
                  opacity: formVisible ? 1 : 0,
                  transform: formVisible ? 'translateX(0)' : 'translateX(-40px)'
                }}
              >
                <InquireNowForm 
                  defaultSubject="" 
                  onSuccess={() => setShowSuccessModal(true)}
                />
              </div>

              <div 
                className="lg:col-span-1 transform transition-all duration-1000"
                style={{
                  opacity: sidebarVisible ? 1 : 0,
                  transform: sidebarVisible ? 'translateX(0)' : 'translateX(40px)'
                }}
              >
                <div className="bg-gray-50 p-6 rounded-lg space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-amber-600" />
                      WhatsApp us
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-600">For any inquiries about Villas investment:</p>
                      <a 
                        href="https://wa.me/639617928834"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-amber-600 hover:text-amber-700 flex items-center gap-2"
                      >
                        +63 9617928834
                      </a>
                      <p className="text-gray-600">For Russian speakers:</p>
                      <a 
                        href="https://wa.me/79096556608"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-amber-600 hover:text-amber-700 flex items-center gap-2"
                      >
                        +7 909 655 6608
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-amber-600" />
                      Email us
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-600">For all general inquiries:</p>
                      <a 
                        href="mailto:ilawilawvilla@gmail.com"
                        className="font-medium text-amber-600 hover:text-amber-700"
                      >
                        ilawilawvilla@gmail.com
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-amber-600" />
                      Visit us
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-600">Our location:</p>
                      <p className="font-medium">
                        Ilaw ilaw Villa - Diniwid Road<br />
                        Boracay Malay Aklan
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>

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
              <h2 className="text-5xl font-light mb-8 tracking-wider">
                WE DO BETTER
              </h2>
              <Button 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-colors duration-300"
                onClick={() => navigate('/we-do-better')}
              >
                SHOW ME
              </Button>
            </div>
          </Container>
        </section>

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          title="Message Sent Successfully! 🎉"
          message="Thank you for reaching out! We've received your message and will get back to you within 24 hours. We're excited to help you with your Boracay property needs!"
        />
      </div>
    </>
  );
};

export default ContactPage;