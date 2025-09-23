// src/components/layout/Footer.tsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, CreditCard, DollarSign } from 'lucide-react';
import Container from '../ui/Container';

interface FooterProps {
  onHeightChange: (height: number) => void;
}

// Import beaches data from BeachesSection
const beaches = [
  {
    name: "WHITE BEACH",
    slug: 'white-beach'
  },
  {
    name: "DINIWID BEACH",
    slug: 'diniwid-beach'
  },
  {
    name: "PUKA SHELL",
    slug: 'puka-shell-beach'
  },
  {
    name: "BULABOG BEACH",
    slug: 'bulabog-beach'
  },
  {
    name: "ILIG ILIGAN",
    slug: 'ilig-iligan-beach'
  },
  {
    name: "TAMBISAAN",
    slug: 'tambisaan-beach'
  }
];

const Footer: React.FC<FooterProps> = ({ onHeightChange }) => {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footerElement = footerRef.current;
    if (!footerElement) return;

    // Create ResizeObserver to watch for footer height changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height } = entry.contentRect;
        onHeightChange(height);
      }
    });

    // Start observing the footer element
    resizeObserver.observe(footerElement);

    // Initial height measurement
    const initialHeight = footerElement.offsetHeight;
    onHeightChange(initialHeight);

    // Cleanup function
    return () => {
      resizeObserver.disconnect();
      onHeightChange(0);
    };
  }, [onHeightChange]);

  return (
    <footer 
      ref={footerRef}
      className="fixed bottom-0 left-0 right-0 w-full bg-gray-900 text-gray-300 z-[5]"
      style={{ pointerEvents: 'auto' }}
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-4">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">
              Boracay<span className="text-amber-500">.House</span>
            </h3>
            <p className="mb-4 text-gray-400 max-w-md">
              We're not just another real estate agency. We're property owners who understand what works in Boracay.
            </p>
            
            {/* Moved links from Quick Links */}
            <div className="mt-6 space-y-2">
              <Link to="/for-sale" className="block text-gray-400 hover:text-white transition-colors">Featured Villas</Link>
              <Link to="/direct" className="block text-gray-400 hover:text-white transition-colors">Book Direct</Link>
              <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">About Us</Link>
              <Link to="/blog" className="block text-gray-400 hover:text-white transition-colors">Blog</Link>
              <Link to="/dream-move-calculator" className="block text-gray-400 hover:text-white transition-colors">Dream Move Calculator</Link>
              <Link to="/privacy-policy" className="block text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/guest-help" className="block text-gray-400 hover:text-white transition-colors">Help</Link>
              <Link to="/payment" className="block text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment
              </Link>
              <Link to="/dream-bid" className="block text-gray-400 hover:text-white transition-colors flex items-center gap-2"> {/* MODIFIED: Removed :slug */}
                <DollarSign className="w-4 h-4" />
                Dream Bid
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/airbnb" className="text-gray-400 hover:text-white transition-colors">Rental</Link></li>
              <li><Link to="/vacation-rental-management" className="text-gray-400 hover:text-white transition-colors">Vacation Rental Management</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors">Property Services</Link></li>
              <li><Link to="/promos" className="text-gray-400 hover:text-white transition-colors">Promos</Link></li>
              <li><Link to="/activities" className="text-gray-400 hover:text-white transition-colors">Activities</Link></li>
              <li><Link to="/property-stats" className="text-gray-400 hover:text-white transition-colors">Property Stats</Link></li> {/* NEW: Property Stats Link */}
              <li><Link to="/boracay-real-estate" className="text-gray-400 hover:text-white transition-colors">
                Boracay Real Estate
              </Link></li>
              <li><Link to="/house-for-sale-boracay" className="text-gray-400 hover:text-white transition-colors">
                Houses for Sale Boracay
              </Link></li>
              <li><Link to="/property-for-sale-boracay" className="text-gray-400 hover:text-white transition-colors">
                Property for Sale Boracay
              </Link></li>
              <li><Link to="/boracay-homes-for-sale" className="text-gray-400 hover:text-white transition-colors">
                Boracay Homes for Sale
              </Link></li>
              <li><Link to="/cheap-houses-boracay" className="text-gray-400 hover:text-white transition-colors">
                Cheap Houses Boracay
              </Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Boracay Beaches</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/beaches" 
                  className="text-gray-400 hover:text-white transition-colors font-medium"
                >
                  🏖️ ALL BEACHES GUIDE
                </Link>
              </li>
              {beaches.map((beach) => (
                <li key={beach.slug}>
                  <Link 
                    to={`/beaches/${beach.slug}`} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {beach.name}
                  </Link>
                </li>
              ))}
              <li>
                {/* MODIFIED: Changed <a> to Link and updated href to to */}
                <Link to="/tablas-island" className="text-gray-400 hover:text-white transition-colors">
                  TABLAS ISLAND
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 mt-1 text-amber-500" />
                <div>
                  <div>Diniwid Ilaw Ilaw Villa</div>
                  <div>Boracay Island</div>
                  <div>Malay Aklan</div>
                  <div>Philippines</div>
                </div>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-amber-500" />
                <span>ilawilawvilla@gmail.com</span>
              </li>
              <li className="flex items-center mt-4">
                <div className="flex space-x-4">
                  <a 
                    href="https://www.facebook.com/boracaybedandbreakfast" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a 
                    href="https://www.instagram.com/ilawilawvillas/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 py-2 text-center text-gray-500">
          <p>© {currentYear} Boracay.House. All rights reserved. Webmaster: cirillindo@hotmail.com.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
