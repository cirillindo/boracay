import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import SEO from '../components/SEO';
import { ExternalLink, Check, Info, Camera, MessageSquare, Settings, Calendar, Home, PenTool as Tool, TrendingUp, Headphones, Users, CheckCircle2, ListChecks, BarChart3, HeadphonesIcon, CreditCard, UserCircle2, PhoneCall, Globe, Smartphone } from 'lucide-react';
import PaymentSelectionModal from '../components/modals/PaymentSelectionModal';
import clsx from 'clsx';
import JsonManagementSlideshow from '../components/JsonManagementSlideshow';

interface ServiceAddon {
  id: string;
  title: string;
  price: string;
  priceUSD: string;
  description: string;
  selected: boolean;
}

interface ServiceCard {
  id: string;
  title: string;
  price: string;
  priceUSD: string;
  description: string;
  fullDescription: string;
  image: string;
  isRecurring: boolean;
  frequency?: string;
  addOns?: ServiceAddon[];
  keyFeatures?: string[];
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const PropertyServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('listing');
  
  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceCard | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedAddonsList, setSelectedAddonsList] = useState<string[]>([]);

  // Images for the Json Management Slideshow
  const jsonSlideshowImages = [
    'https://res.cloudinary.com/dayqsxlnt/image/upload/v1756061893/Screenshot_2025-08-24_at_8.58.06_PM_qsgsvx.png',
    'https://res.cloudinary.com/dayqsxlnt/image/upload/v1756061761/Screenshot_2025-08-24_at_8.55.58_PM_pmejec.png',
    'https://res.cloudinary.com/dayqsxlnt/image/upload/v1756061707/Screenshot_2025-08-24_at_8.55.03_PM_eqtgq9.png',
    'https://res.cloudinary.com/dayqsxlnt/image/upload/v1756061673/Screenshot_2025-08-24_at_8.54.30_PM_bw4gkk.png',
    'https://res.cloudinary.com/dayqsxlnt/image/upload/v1756061651/Screenshot_2025-08-24_at_8.54.07_PM_py7jvn.png'
  ];

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
            
            // Update active tab based on which section is most visible
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              setActiveTab(id);
            }
          }
        });
      },
      { threshold: [0.2, 0.5] }
    );

    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = 120; // Account for fixed header
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveTab(sectionId);
    }
  };

  const handleAddonToggle = (serviceId: string, addonId: string) => {
    const key = `${serviceId}-${addonId}`;
    setSelectedAddons(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleBuyNow = (service: ServiceCard) => {
    // Calculate total price including selected add-ons
    let totalPrice = parseFloat(service.price.replace(/[^\d.]/g, ''));
    const selectedAddonTitles: string[] = [];
    
    // Add prices of selected add-ons
    if (service.addOns) {
      service.addOns.forEach(addon => {
        const key = `${service.id}-${addon.id}`;
        if (selectedAddons[key]) {
          totalPrice += parseFloat(addon.price.replace(/[^\d.]/g, ''));
          selectedAddonTitles.push(addon.title);
        }
      });
    }
    
    // Set state for payment modal
    setSelectedService(service);
    setTotalAmount(totalPrice);
    setSelectedAddonsList(selectedAddonTitles);
    setIsPaymentModalOpen(true);
  };

  const handleInquire = (service: ServiceCard) => {
    navigate('/contact');
  };

  const tabs: TabItem[] = [
    { id: 'listing', label: 'List Your Property', icon: <Home className="w-5 h-5" /> },
    { id: 'online', label: 'Visual & Online', icon: <Camera className="w-5 h-5" /> },
    { id: 'legal', label: 'Legal & Business', icon: <CheckCircle2 className="w-5 h-5" /> },
    { id: 'json-management', label: 'JSON MANAGEMENT', icon: <Smartphone className="w-5 h-5" /> } // New Tab
  ];

  const listingServices: ServiceCard[] = [
    {
      id: 'basic-exposure',
      title: 'Basic Exposure Plan',
      price: '₱2,000',
      priceUSD: '$35',
      description: 'per month (recurrent payment)',
      fullDescription: 'Get your property featured on Boracay.house with a dedicated listing page, images, and contact options. Includes professional listing creation, optimization, and ongoing visibility.',
      image: 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1751548967/list_your_property_Boracay_n3jnrv.jpg',
      isRecurring: true,
      frequency: 'monthly',
      addOns: [
        {
          id: 'photoshoot-addon',
          title: 'Professional Photoshoot',
          price: '₱7,000',
          priceUSD: '$125',
          description: 'one-time add-on',
          selected: false
        }
      ]
    },
    {
      id: 'photoshoot',
      title: 'Photoshoot Professional',
      price: '₱7,000',
      priceUSD: '$125',
      description: 'one-time',
      fullDescription: 'Hire a professional photographer to capture your property in its best light. The standard package covers 3–4 bedrooms, a living room, kitchen, and bathroom. Includes a 2-hour shoot and 20–30 edited images.',
      image: 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1751548769/Boracay_professional_interior_photographer_rsnu1g.jpg',
      isRecurring: false
    }
  ];

  const onlinePresenceServices: ServiceCard[] = [
    {
      id: 'airbnb-optimization',
      title: 'Airbnb Optimization',
      price: '₱5,000',
      priceUSD: '$85',
      description: 'one-time',
      fullDescription: 'We rewrite your Airbnb listing: title, description, pricing strategy, rules, photos, and more. Get more bookings with the same space. Includes keyword optimization and competitor analysis.',
      image: 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1751548559/Boracay_airbnb_SEO_i3f1mm.webp',
      isRecurring: false
    },
    {
      id: 'custom-website',
      title: 'Custom Property/Airbnb Website (4 rooms)',
      price: '₱20,000',
      priceUSD: '$350',
      description: 'one-time + Domain',
      fullDescription: 'We build a fast, mobile-friendly site with booking links, property showcase, contact form, and optional blog. Includes SEO optimization, responsive design, and 1 year of hosting.',
      image: 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1751548635/webdesign_boracay_c4iicr.jpg',
      isRecurring: false
    }
  ];

  const legalServices: ServiceCard[] = [
    {
      id: 'legal-inspection',
      title: 'Legal Property Inspection for Buyers',
      price: '₱88,000',
      priceUSD: '$1,500',
      description: 'one-time',
      fullDescription: 'Full legal check of the property you want to buy. We verify title, encumbrances, claims, and potential red flags. Includes document review, local registry checks, and comprehensive report with recommendations.',
      image: 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1751548701/Boracay_Property_inspection_bnohfc.jpg',
      isRecurring: false
    },
    {
      id: 'corporation-creation',
      title: 'Corporation Creation (PH)',
      price: '₱129,000',
      priceUSD: '$2,200',
      description: 'one-time',
      fullDescription: 'Start a Philippine corporation to manage or own real estate. We handle all documents and guide you through the process. Includes business name registration, SEC filing, tax registration, and initial compliance setup. IMPORTANT: This fee covers our professional services only; all official registration fees and payments to government agencies are NOT included and will be charged separately based on actual costs.',
      image: 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1751548891/corporation_Boracay_z03iik.jpg',
      isRecurring: false
    },
    {
      id: 'rental-permits',
      title: 'Short-Term Rental Permits / Renewals',
      price: '₱20,000',
      priceUSD: '$350',
      description: 'per year',
      fullDescription: 'We process your permit or renewal for Airbnb-style rentals. Includes form preparation, submission, and tracking. Our fee covers the processing work and bureaucracy management only. IMPORTANT: Government fees from each department (Barangay, Sanitary Department, Fire Department, etc.) are NOT included and will be charged separately based on actual costs. This service ensures your rental operation remains compliant with local regulations and avoids potential fines.',
      image: 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1751549137/apply_for_permits_iwvxzb.jpg',
      isRecurring: true,
      frequency: 'yearly'
    }
  ];

  // New service data for Json Management Software
  const jsonManagementServices: ServiceCard[] = [
    {
      id: 'json-management-software',
      title: 'Json Management Software',
      price: '₱20,000',
      priceUSD: '$350',
      description: 'starting for standard app',
      fullDescription: 'Revolutionize your resort operations with Json, the intuitive management app designed for efficiency and staff motivation. Json streamlines daily tasks like staff scheduling, room cleaning tracking, and to-do lists, all accessible via mobile. Empower your team to implement data seamlessly, while managers gain real-time insights into operations and track salaries effortlessly, directly from their phones. Json transforms complex management into a simple, engaging experience, fostering a productive environment where every task is tracked and every team member is motivated.',
      image: 'https://res.cloudinary.com/dayqsxlnt/image/upload/v1756061566/Screenshot_2025-08-24_at_8.39.35_PM_kp5brd.png',
      isRecurring: false,
      keyFeatures: [
        'Staff Working Schedule',
        'Checklist Management',
        'To-Do List Tracking',
        'Salaries Tracking',
        'Room Cleaning Tracking',
        'Check-ins/Check-outs',
        'Mobile Access for Staff & Managers',
        'Data Implementation Motivation',
        'Real-time Tracking',
        'Up to 8 Customizable Tabs (Standard App)'
      ]
    }
  ];

  const ServiceCard: React.FC<{ service: ServiceCard; index: number; isVisible: boolean }> = ({ service, index, isVisible }) => {
    // Fixed heights for card elements to ensure alignment
    const cardHeight = "100%";
    const imageHeight = "250px";
    const contentHeight = "auto";
    const descriptionHeight = "auto";
    const addonsHeight = "auto";
    const buttonContainerHeight = "60px";
    
    return (
      <div 
        className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 transform hover:shadow-xl flex flex-col ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
        style={{ 
          transitionDelay: `${index * 100}ms`,
          height: cardHeight
        }}
      >
        {/* Image Section */}
        <div className="relative" style={{ height: imageHeight }}>
          <img 
            src={service.image} 
            alt={service.title}
            className="w-full h-full object-cover"
          />
          {service.isRecurring && (
            <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              Recurring
            </div>
          )}
        </div>
        
        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow" style={{ height: contentHeight }}>
          <h3 className="text-xl font-bold mb-2">{service.title}</h3>
          
          <div className="flex items-baseline mb-4">
            <span className="text-2xl font-bold text-amber-600">{service.price}</span>
            <span className="text-gray-500 ml-2 text-sm">/ {service.priceUSD}</span>
            <span className="text-gray-600 ml-2 text-sm">{service.description}</span>
          </div>
          
          {/* Full Description with auto height */}
          <div style={{ height: descriptionHeight }} className="mb-4">
            <p className="text-gray-600">
              {service.fullDescription}
            </p>
            {/* Add this block to display keyFeatures */}
            {service.keyFeatures && service.keyFeatures.length > 0 && (
              <ul className="list-disc list-inside text-gray-700 mt-4 space-y-1">
                {service.keyFeatures.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Add-ons Section with auto height */}
          <div style={{ height: addonsHeight, marginBottom: "16px" }}>
            {service.addOns && service.addOns.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Available Add-ons:</p>
                {service.addOns.map((addon) => {
                  const addonKey = `${service.id}-${addon.id}`;
                  return (
                    <div key={addon.id} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg mb-2">
                      <input
                        type="checkbox"
                        id={addonKey}
                        checked={selectedAddons[addonKey] || false}
                        onChange={() => handleAddonToggle(service.id, addon.id)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <label htmlFor={addonKey} className="flex-1 cursor-pointer">
                        <p className="text-sm font-medium">{addon.title}</p>
                        <div className="flex items-center">
                          <span className="text-amber-600 font-bold">{addon.price}</span>
                          <span className="text-gray-500 ml-1 text-xs">/ {addon.priceUSD}</span>
                          <span className="text-gray-600 ml-1 text-xs">({addon.description})</span>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Action Buttons with fixed height */}
          <div className="flex gap-2 mt-auto" style={{ height: buttonContainerHeight }}>
            <Button 
              onClick={() => handleBuyNow(service)}
              className="flex-1"
            >
              Buy Now
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleInquire(service)}
              className="flex-1"
            >
              Inquire
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <SEO
        title="Real Estate Services in Boracay | Photos, Permits & Listings"
        description="List your property, get a legal check, build a custom site, or request a professional photoshoot — all payable online in PHP or USD."
        keywords="Boracay property services, Airbnb listing support Boracay, Boracay real estate legal check, Vacation rental permits Philippines, Real estate photographer Boracay, Philippine corporation setup for foreigners, Airbnb optimization service Boracay, Boracay listing website creation"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751535515/REAL_ESTATE_SERVICES_BORACAY_iy3jga.webp"
        url="https://boracay.house/services"
        type="website"
      />

      <div className="min-h-screen bg-white">
        <div className="h-32" />
        
        <div className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 w-full h-full animate-hero"
              style={{
                backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1751535747/Boracay_Real_etate_and_properties_xq8o83.webp)',
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
                Sell or Manage Property in Boracay with Confidence
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Want to rent out, sell, or legalize your property in Boracay? We offer reliable services for owners, investors, and Airbnb hosts — all bookable online.
              </p>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto mt-4">
                From listing your home to creating a professional website, we take care of the technical, legal, and visual work so you can focus on bookings and income. Prices available in PHP and USD. Pay via Stripe, GCash, PayPal, or Revolut.
              </p>
            </div>
          </Container>
        </div>

        {/* Tab Navigation - UPDATED: Bigger and centered */}
        <div className="sticky top-32 bg-white shadow-md z-30">
          <Container>
            <div className="flex justify-center py-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)} // Use scrollToSection here
                  className={clsx(
                    'flex-1 py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold transition-colors duration-300 relative overflow-hidden whitespace-nowrap min-w-0',
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-900 tab-pulse'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  )}
                >
                  <span className="truncate">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary animate-tab-slide" />
                  )}
                </button>
              ))}
            </div>
          </Container>
        </div>

        <section 
          id="listing"
          ref={el => sectionRefs.current['listing'] = el}
          data-section-id="listing"
          className="py-24 bg-white"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['listing'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['listing'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">🏠 LIST YOUR PROPERTY</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Get your property in front of the right audience with our listing services
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {listingServices.map((service, index) => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    index={index}
                    isVisible={sectionsVisible['listing'] || false}
                  />
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section 
          id="online"
          ref={el => sectionRefs.current['online'] = el}
          data-section-id="online"
          className="py-24 bg-gray-50"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['online'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['online'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">🌐 VISUAL & ONLINE PRESENCE</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Boost your property's online visibility and appeal with professional services
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {onlinePresenceServices.map((service, index) => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    index={index}
                    isVisible={sectionsVisible['online'] || false}
                  />
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section 
          id="legal"
          ref={el => sectionRefs.current['legal'] = el}
          data-section-id="legal"
          className="py-24 bg-white"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['legal'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['legal'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">📄 LEGAL & BUSINESS SERVICES</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Ensure your property investment is legally sound and properly managed
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {legalServices.map((service, index) => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    index={index}
                    isVisible={sectionsVisible['legal'] || false}
                  />
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* New Json Management Section */}
        <section 
          id="json-management"
          ref={el => sectionRefs.current['json-management'] = el}
          data-section-id="json-management"
          className="py-24 bg-gray-50"
        >
          <Container className="max-w-6xl"> {/* Added max-w-6xl to Container */}
            <div 
              // Removed max-w-6xl mx-auto from here to allow full width
              style={{
                opacity: sectionsVisible['json-management'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['json-management'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">📱 JSON MANAGEMENT</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Streamline your resort operations with our intuitive mobile management software.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                {jsonManagementServices.map((service, index) => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    index={index}
                    isVisible={sectionsVisible['json-management'] || false}
                  />
                ))}
              </div>
              {/* Add the slideshow here */}
              <JsonManagementSlideshow images={jsonSlideshowImages} />
            </div>
          </Container>
        </section>

        <section 
          id="payment"
          ref={el => sectionRefs.current['payment'] = el}
          data-section-id="payment"
          className="py-24 bg-gray-50"
        >
          <Container>
            <div 
              className="max-w-4xl mx-auto"
              style={{
                opacity: sectionsVisible['payment'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['payment'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">⚪ Payment Methods</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Flexible payment options to suit your needs
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 p-3 rounded-full">
                      <Check className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Currency Options</h3>
                      <p className="text-gray-600">PHP or USD (auto-converted)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 p-3 rounded-full">
                      <Check className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Payment Methods</h3>
                      <p className="text-gray-600">Stripe, PayPal, GCash, Revolut accepted</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 p-3 rounded-full">
                      <Check className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Tax Information</h3>
                      <p className="text-gray-600">All prices VAT-inclusive (12% Philippines VAT included)</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-amber-50 p-6 rounded-lg flex items-start gap-4">
                  <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-amber-800 mb-2">Need a Custom Quote?</h3>
                    <p className="text-amber-700 mb-4">
                      If you need a service that's not listed here or want to discuss a custom package, please get in touch with our team.
                    </p>
                    <Button 
                      onClick={() => navigate('/contact')}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Contact Us
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Payment Selection Modal */}
        {selectedService && (
          <PaymentSelectionModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            service={selectedService}
            totalAmount={totalAmount}
            selectedAddons={selectedAddonsList}
          />
        )}
      </div>
    </>
  );
};

export default PropertyServicesPage;
