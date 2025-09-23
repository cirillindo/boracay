import React, { useState, useEffect, useRef } from 'react';
import Container from '../components/ui/Container';
import SEO from '../components/SEO';
import Blog from '../components/home/Blog';
import { ArrowLeft, MapPin, Calendar, Info, AlertTriangle, Compass, Anchor, Coffee, CreditCard, ShoppingBag, Pill, DollarSign, Ship, Home, Bike, Mountain, Utensils, Lightbulb as Lighthouse, Sunset, Map, Sailboat, Droplet, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // Ensure Helmet is imported
import Button from '../components/ui/Button';

// Define sections for the page
const sections = [
  { id: 'intro', title: 'Introduction' },
  { id: 'getting-there', title: 'Getting to Tablas' },
  { id: 'caticlan-waiting', title: 'Waiting at Caticlan' },
  { id: 'accommodation', title: 'Where to Stay' },
  { id: 'day-by-day', title: 'Day by Day Guide' },
  { id: 'diving', title: 'Diving & Snorkeling' },
  { id: 'tips', title: 'Final Tips' },
  { id: 'faqs', title: 'FAQs' } // Added FAQs to sticky nav
];

const TablasIslandPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('intro');
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set(['intro']));
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [headerVisible, setHeaderVisible] = useState(false);
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => {
    // Animate header and nav on load
    setHeaderVisible(true);
    setTimeout(() => setNavVisible(true), 500);

    // Set up intersection observer for sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('id');
          if (id) {
            if (entry.isIntersecting) {
              setVisibleSections(prev => new Set([...prev, id]));
              setActiveSection(id);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    // Observe all section elements
    sections.forEach(section => { // Iterate over defined sections to ensure all are observed
      const ref = document.getElementById(section.id);
      if (ref) observer.observe(ref);
    });


    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <SEO
        title="Tablas Island Travel Guide: How to Get There, What to Do, and Where to Stay"
        description="Discover Tablas Island — remote, raw, and refreshingly real. This ultimate travel guide covers how to get there, where to stay, what to eat, and what to explore. Perfect for adventurous travelers seeking an off-the-beaten-path destination in the Philippines."
        keywords="Tablas Island, Tablas travel guide, Tablas Philippines, how to get to Tablas, Tablas resorts, things to do in Tablas, Looc Tablas, Santa Fe Tablas, Tablas beaches, Tablas diving, offbeat islands Philippines"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224616/IMG_8022_copy_cqm50c.webp"
        url="https://boracay.house/tablas-island"
        type="article"
        canonical="https://boracay.house/tablas-island"
        dynamicData={{
          og_title: "Tablas Island Travel Guide: The Raw and Real Philippines",
          og_description: "Ready to escape the crowds? This in-depth guide to Tablas Island reveals everything — ferries, food, motorbike loops, secret beaches, and more. Remote, quiet, and unforgettable.",
          og_url: "https://boracay.house/tablas-island",
          og_type: "article",
          og_image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224616/IMG_8022_copy_cqm50c.webp"
        }}
      />

      <Helmet>
        <link rel="canonical" href="https://boracay.house/blog/info/tablas-island-travel-guide-how-to-get-there-what-to-do-and-where-to-stay" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tablas Island Travel Guide 2025 – How to Get There, Things to Do & Where to Stay" />
        <meta name="twitter:description" content="Ferry from Caticlan, must‑visit spots, beaches, diving, and the best stays in 2025." />
        <meta name="twitter:image" content="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224652/how-to-get-to-tablas_kppqyj.jpg" />
        <meta property="article:published_time" content="2025-06-15" />
        <meta property="article:modified_time" content="2025-08-09" />

        <script type="application/ld+json">
          {`
            {
              "@context":"https://schema.org",
              "@type":"Article",
              "headline":"Tablas Island Travel Guide 2025: How to Get There, Things to Do & Where to Stay",
              "description":"Complete 2025 guide to Tablas Island: routes from Caticlan, boat costs, top things to do, beaches, and where to stay.",
              "image":["https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224652/how-to-get-to-tablas_kppqyj.jpg"],
              "datePublished":"2025-06-15",
              "dateModified":"2025-08-09",
              "author":{"@type":"Organization","name":"Boracay.house"},
              "publisher":{"@type":"Organization","name":"Boracay.house","logo":{"@type":"ImageObject","url":"https://boracay.house/logo.png"}},
              "mainEntityOfPage":"https://boracay.house/blog/info/tablas-island-travel-guide-how-to-get-there-what-to-do-and-where-to-stay"
            }
          `}
        </script>

        <script type="application/ld+json">
          {`
            {
              "@context":"https://schema.org",
              "@type":"BreadcrumbList",
              "itemListElement":[
                {"@type":"ListItem","position":1,"name":"Blog","item":"https://boracay.house/blog"},
                {"@type":"ListItem","position":2,"name":"Tablas Island Travel Guide"}
              ]
            }
          `}
        </script>

        <script type="application/ld+json">
          {`
            {
              "@context":"https://schema.org",
              "@type":"FAQPage",
              "mainEntity":[
                {"@type":"Question","name":"What is the boat schedule from Caticlan to Tablas?","acceptedAnswer":{"@type":"Answer","text":"Expect 2–3 departures daily to Looc or Santa Fe. Arrive at least one hour early; schedules can change with weather."}},
                {"@type":"Question","name":"How much is the boat to Tablas Island?","acceptedAnswer":{"@type":"Answer","text":"Plan ₱250–₱400 for the boat fare. If coming from the airport, add an e‑trike (₱50–₱100) to the port."}},
                {"@type":"Question","name":"What is the best month to visit Tablas?","acceptedAnswer":{"@type":"Answer","text":"December–May offers calmer seas and best visibility for diving. June–November has more rain and occasional weather delays."}},
                {"@type":"Question","name":"Is Tablas good for first‑timers?","acceptedAnswer":{"@type":"Answer","text":"Yes if you like quiet beaches, motorbike loops, and fewer crowds. It’s more rustic than Boracay—bring cash and offline maps."}},
                {"@type":"Question","name":"Where is Tablas Island located?","acceptedAnswer":{"@type":"Answer","text":"Tablas is in Romblon Province, Philippines, across the water from Caticlan (Boracay). The main entry points are Looc and Santa Fe ports."}},
                {"@type":"Question","name":"Is Tablas part of Boracay?","acceptedAnswer":{"@type":"Answer","text":"No. Tablas is a separate island in Romblon. It’s reached by ferry from Caticlan, the same gateway used for Boracay."}}
              ]
            }
          `}
        </script>

        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "HowTo",
              "name": "How to get to Tablas Island from Caticlan",
              "description": "Step-by-step directions from Caticlan Jetty Port to Tablas Island (Looc or Santa Fe) with typical travel time and costs in 2025.",
              "totalTime": "PT90M",
              "estimatedCost": {
                "@type": "MonetaryAmount",
                "currency": "PHP",
                "value": "350-500"
              },
              "step": [
                {
                  "@type": "HowToStep",
                  "name": "Reach Caticlan Jetty Port",
                  "text": "From Caticlan Airport, take an e-trike (₱50–₱100) or walk 7–10 minutes to the jetty."
                },
                {
                  "@type": "HowToStep",
                  "name": "Buy ferry ticket to Looc or Santa Fe",
                  "text": "2–3 daily departures; arrive one hour early to secure a seat. Schedules may change with weather."
                },
                {
                  "@type": "HowToStep",
                  "name": "Board the ferry",
                  "text": "Crossing takes about 60–90 minutes depending on sea conditions."
                },
                {
                  "@type": "HowToStep",
                  "name": "Disembark and continue to your stay",
                  "text": "At Looc or Santa Fe, take an e‑trike/van or rent a motorbike to reach your accommodation."
                }
              ],
              "supply": [
                {"@type": "HowToSupply","name":"Ferry ticket"},
                {"@type": "HowToSupply","name":"Cash for fares"}
              ],
              "tool": [
                {"@type": "HowToTool","name":"E‑trike or van transfer"}
              ],
              "publisher": {
                "@type": "Organization",
                "name": "Boracay.house",
                "logo": {"@type":"ImageObject","url":"https://boracay.house/logo.png"}
              }
            }
          `}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="h-32" /> {/* Spacer for fixed navbar */}

        {/* Hero Section */}
        <div className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 w-full h-full animate-hero"
              style={{
                backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224616/IMG_8022_copy_cqm50c.webp)',
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
                opacity: headerVisible ? 1 : 0,
                transform: headerVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 1s ease-out'
              }}
            >
              <h1 className="text-5xl font-bold text-white mb-6">
                Tablas Island
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                Remote, quiet, and blissfully underdeveloped. Perfect for travelers who want something more than just sunbathing—those looking to explore, move, and discover a version of the Philippines that feels real, raw, and local.
              </p>
              <Button 
                onClick={() => scrollToSection('getting-there')}
                className="text-lg"
              >
                Start Exploring
              </Button>
            </div>
          </Container>
        </div>

        <Container className="py-16 relative">
          {/* Sticky Navigation */}
          <div 
            className="sticky top-32 z-20 bg-white/80 backdrop-blur-sm rounded-lg shadow-md mb-12 transition-all duration-1000"
            style={{
              opacity: navVisible ? 1 : 0,
              transform: navVisible ? 'translateY(0)' : 'translateY(-20px)'
            }}
          >
            <div className="flex overflow-x-auto hide-scrollbar py-4 px-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`whitespace-nowrap px-4 py-2 mx-1 rounded-full transition-colors ${
                    activeSection === section.id
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Boracay
          </button>

          {/* Introduction Section */}
          <section 
            id="intro" 
            ref={el => sectionRefs.current['intro'] = el}
            className={`mb-16 transition-all duration-1000 ${
              visibleSections.has('intro') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Discover Tablas Island
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Tablas is remote, quiet, and blissfully underdeveloped. It's perfect for travelers who want something more than just sunbathing—those looking to explore, move, and discover a version of the Philippines that feels real, raw, and local.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-amber-50 p-6 rounded-lg shadow">
                  <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                    <Compass className="w-5 h-5" />
                    Why Visit Tablas?
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Escape the tourist crowds of Boracay</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Discover pristine, empty beaches</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Experience authentic island culture</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Enjoy adventure without the tourist markup</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Perfect for motorbike exploration</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg shadow">
                  <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    What to Expect
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Limited tourist infrastructure</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Spotty internet and mobile service</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Simple accommodations with friendly service</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Fresh, local food without fancy presentation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>No nightlife, no McDonald's—just nature and quiet</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Getting to Tablas Section */}
          <section 
            id="getting-there" 
            ref={el => sectionRefs.current['getting-there'] = el}
            className={`mb-16 transition-all duration-1000 ${
              visibleSections.has('getting-there') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Ship className="w-6 h-6 text-amber-600" />
                How to Get to Tablas
              </h2>
              
              <p><strong>Where is Tablas Island?</strong> Tablas is the largest island in <em>Romblon Province, Philippines</em>, just across the water from Caticlan (Boracay). It sits between Mindoro and Romblon Island, with main ports at <em>Looc</em> and <em>Santa Fe</em>.</p>

              <p><strong>How do you get to Tablas from Caticlan?</strong> Go to <em>Caticlan Jetty Port</em> → buy a ticket to <em>Looc</em> or <em>Santa Fe</em> → ride the ferry (≈60–90 mins) → take an e‑trike or van to your stay. Total DIY cost is usually <em>₱350–₱500</em> per person.</p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">From Caticlan Port:</h3>
              <ol className="list-decimal list-inside space-y-2 mb-6">
                <li><strong>Reach Caticlan Jetty Port.</strong> From the airport, take an e‑trike (₱50–₱100) or walk 7–10 minutes.</li>
                <li><strong>Buy ferry ticket to Looc or Santa Fe.</strong> 2–3 departures daily; arrive 1 hour early, weather dependent.</li>
                <li><strong>Board the ferry.</strong> Crossing takes ~60–90 minutes.</li>
                <li><strong>Disembark on Tablas.</strong> Take an e‑trike/van to your accommodation or rent a motorbike.</li>
              </ol>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Ferry Details</h3>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/2">
                        <h4 className="font-bold text-gray-900 mb-2">Morning boats to Looc</h4>
                        <p className="text-gray-700 mb-4">
                          Usually 2-3 trips per day. Below is one boat contact:
                        </p>
                        <a 
                          href="https://www.facebook.com/profile.php?id=61552177324019" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:text-amber-700 flex items-center gap-1"
                        >
                          Facebook Page <ArrowLeft className="w-4 h-4 rotate-180" />
                        </a>
                        
                        <div className="mt-4">
                          <a 
                            href="https://maps.app.goo.gl/cRocitiPx6tAHXBU7" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                          >
                            <MapPin className="w-4 h-4" />
                            <span>Looc Port Location</span>
                          </a>
                        </div>
                      </div>
                      
                      <div className="md:w-1/2">
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <img 
                            loading="lazy"
                            src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224641/schedule_to_Tablas_x5gsfw.jpg" 
                            alt="Boat schedule to Tablas" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/2">
                        <h4 className="font-bold text-gray-900 mb-2">3PM boat to Santa Fe</h4>
                        <p className="text-gray-700 mb-4">
                          Go at least one hour in advance to add your name on the list, to secure your spot on the boat.
                        </p>
                        <div className="mt-4">
                          <a 
                            href="https://maps.app.goo.gl/4t3wDSznv83y1GBy5" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                          >
                            <MapPin className="w-4 h-4" />
                            <span>Santa Fe Port Location</span>
                          </a>
                        </div>
                        
                        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-amber-800 flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>Confirm schedules in advance, especially during bad weather.</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="md:w-1/2">
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <video 
                            loading="lazy"
                            controls
                            className="w-full h-full object-cover"
                            poster="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224654/tablas-ferry-from-caticlan_sfl30s.jpg"
                            aria-label="Ferry from Caticlan to Tablas"
                          >
                            <source src="https://res.cloudinary.com/dq3fftsfa/video/upload/v1751224936/IMG_7924_v436ep.mov" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gray-50">
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224652/how-to-get-to-tablas_kppqyj.jpg" 
                      alt="How to get to Tablas" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224654/tablas-ferry-from-caticlan_sfl30s.jpg" 
                      alt="Ferry from Caticlan to Tablas" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Bike className="w-5 h-5 text-amber-600" />
                    The Riding
                  </h3>
                  
                  <p className="text-gray-700 mb-6">
                    <strong>Arrival Tip:</strong> Looc and Santa Fe ports are about an hour apart by scooter. Both offer nearby transport, but you'll want to rent a motorbike to truly explore. Prices range from PHP 800–1000/day.
                  </p>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                    <p className="text-blue-800">
                      Bring your international driving license and diving license if relevant.
                    </p>
                  </div>
                  
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <video 
                      loading="lazy"
                      controls
                      className="w-full h-full object-cover"
                      poster="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224623/tablas-motorbike-rental_ko6wfi.webp"
                      aria-label="Motorbike riding on Tablas Island road"
                    >
                      <source src="https://res.cloudinary.com/dq3fftsfa/video/upload/v1751225531/IMG_7941_kwt7nk.mov" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Arriving in Santa Fe</h3>
                  
                  <div className="aspect-video rounded-lg overflow-hidden mb-6">
                    <video 
                      loading="lazy"
                      controls
                      className="w-full h-full object-cover"
                      poster="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224628/santa-fe-tablas-arrival_fy4xzs.webp"
                      aria-label="Arriving at Santa Fe Port, Tablas Island"
                    >
                      <source src="https://res.cloudinary.com/dq3fftsfa/video/upload/v1751225643/IMG_7956_ve0fhi.mov" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224643/caticlan-jetty-port-guide_dcsysa.webp" 
                      alt="Caticlan Jetty Port Guide" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224628/santa-fe-tablas-arrival_fy4xzs.webp" 
                      alt="Santa Fe Tablas Arrival" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* What to Do in Caticlan While Waiting Section */}
          <section 
            id="caticlan-waiting" 
            ref={el => sectionRefs.current['caticlan-waiting'] = el}
            className={`mb-16 transition-all duration-1000 ${
              visibleSections.has('caticlan-waiting') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Compass className="w-6 h-6 text-amber-600" />
                What to Do in Caticlan While Waiting for the Boat
              </h2>
              
              <p className="text-lg text-gray-700 mb-8">
                If you're catching a ferry to Tablas or Boracay and have time to spare at Caticlan Jetty Port, here's how to stay comfortable, well-fed, and prepared.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Food & Snacks */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Coffee className="w-5 h-5 text-amber-600" />
                      Food & Snacks Nearby
                    </h3>
                    
                    <ul className="space-y-4">
                      <li>
                        <p className="font-bold">Mang Inasal🔥</p>
                        <p className="text-gray-700 text-sm">Local favorite for grilled chicken and unlimited rice. Budget-friendly and quick service.</p>
                      </li>
                      <li>
                        <p className="font-bold">Mister Donut🍩</p>
                        <p className="text-gray-700 text-sm">Grab a few donuts, hot dogs, or iced coffee while waiting.</p>
                      </li>
                      <li>
                        <p className="font-bold">Sotera Café☕️</p>
                        <p className="text-gray-700 text-sm">Chill café just outside the terminal. Good for coffee, light meals, and escaping the crowd.</p>
                      </li>
                      <li>
                        <p className="font-bold">Café Liberica🍝</p>
                        <p className="text-gray-700 text-sm">Serves meals, pastries, and strong coffee. Located along Jetty Port Exit Road.</p>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50">
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224634/MangInasalChickenPhilippinesLogo_lxqy9z.jpg" 
                      alt="Mang Inasal" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224646/Mister-Donut-Menu-Philippines-Prices.jpg_ojmiot.webp" 
                      alt="Mister Donut" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                </div>
                
                {/* Convenience & Essentials */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-amber-600" />
                      Convenience & Essentials
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">7-Eleven (Inside Port Area)🧃</h4>
                        <p className="text-gray-700 text-sm">Cold drinks, snacks, instant noodles, and power banks.</p>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Local Sari-Sari Stores🛍️</h4>
                        <p className="text-gray-700 text-sm">Right outside the port, handy for buying fruit, water, and affordable snacks.</p>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Pharmacy</h4>
                        <div className="flex items-start gap-2">
                          <Pill className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-bold">Watsons (Right outside the terminal)💊</p>
                            <p className="text-gray-700 text-sm">Best place to buy seasickness pills, sunblock, and toiletries.</p>
                            <a 
                              href="https://www.watsons.com.ph/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Watsons Philippines
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50">
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224656/caticlan-snacks-mang-inasal_up3kun.webp" 
                      alt="Caticlan Snacks" 
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                </div>
                
                {/* ATMs & Tips */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                      ATMs at the Port
                    </h3>
                    
                    <ul className="space-y-4 mb-6">
                      <li>
                        <p className="font-bold">BPI ATM💸</p>
                        <p className="text-gray-700 text-sm">The only ATM in the area that allows PHP 20,000 max per withdrawal.</p>
                      </li>
                      <li>
                        <p className="font-bold">Landbank, Metrobank, RCBC ATMs💰</p>
                        <p className="text-gray-700 text-sm">Available but often have lower withdrawal limits (PHP 10,000) and queues.</p>
                      </li>
                    </ul>
                    
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      Tips for Travelers:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">•</span>
                        <span className="text-gray-700 text-sm">Stock up on water, cash, and medicine before boarding. Options are limited on Tablas.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">•</span>
                        <span className="text-gray-700 text-sm">Always carry small bills — many vendors can't change large notes.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">•</span>
                        <span className="text-gray-700 text-sm">Download offline maps and travel apps in case mobile data is spotty later.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50">
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751225083/unknown-tourists-caticlan-jetty-port-terminal-nov-near-boracay-island-philippines-here-best-way-to-get-105920039.jpg_mcsy7a.webp" 
                      alt="Caticlan Jetty Port Terminal" 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751225080/caticlan-jetty-port001.jpg_wwjzqe.webp" 
                      alt="Caticlan Jetty Port" 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Where to Stay Section */}
          <section 
            id="accommodation" 
            ref={el => sectionRefs.current['accommodation'] = el}
            className={`mb-16 transition-all duration-1000 ${
              visibleSections.has('accommodation') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Home className="w-6 h-6 text-amber-600" />
                Where to Stay
              </h2>
              
              <p className="text-lg text-gray-700 mb-8">
                All options below are on or near the beach with easy access to nature.
                Continuing to Boracay? Check <a href="/airbnb" className="text-amber-600 hover:text-amber-700 underline" rel="noopener noreferrer">Where to stay in Boracay: Station 1 vs 2 vs 3 vs Bulabog</a>.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Tablas Point */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="aspect-video">
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224666/31563910_1031372953684870_4440458217935339520_n_m9sgf9.jpg" 
                      alt="Tablas Point" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">1. Tablas Point (Santa Fe)</h3>
                    <p className="text-gray-700 mb-4">
                      Quiet, beachfront, and minimalist. Great for disconnecting.
                    </p>
                    <div className="flex items-center gap-2">
                      <a 
                        href="https://www.facebook.com/tablaspoint" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Tablas Point Facebook
                      </a>
                      <span className="text-gray-400">|</span>
                      <a 
                        href="https://maps.app.goo.gl/BewLoU5fPZBdvb3h9" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Map</span>
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Tablas Seaview Resort */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="aspect-video">
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224651/tablas-seaview-resort_fpjpxy.jpg" 
                      alt="Tablas Seaview Resort" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">2. Tablas Seaview Resort (Ferrol)</h3>
                    <p className="text-gray-700 mb-4">
                      More hotel-style. Great sunsets and solid Western food.
                    </p>
                    <div className="flex items-center gap-2">
                      <a 
                        href="https://www.facebook.com/tablasseaviewresort" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Seaview Facebook
                      </a>
                      <span className="text-gray-400">|</span>
                      <a 
                        href="https://maps.app.goo.gl/FAk5PsPiXnQT77ej9" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Map</span>
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Aglicay Beach Resort */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="aspect-video">
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224658/photo0jpg_ibx48u.jpg" 
                      alt="Aglicay Beach Resort" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">3. Aglicay Beach Resort (Alcantara)</h3>
                    <p className="text-gray-700 mb-4">
                      Remote and peaceful with jungle surroundings. Good for hiking and swimming.
                    </p>
                    <div className="flex items-center gap-2">
                      <a 
                        href="https://www.facebook.com/aglicaybeachresort" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Aglicay Facebook
                      </a>
                      <span className="text-gray-400">|</span>
                      <a 
                        href="https://maps.app.goo.gl/NGQo2vP4dHBmvspi7" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Map</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <img 
                  loading="lazy"
                  src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224644/431030761_ygztmh.jpg" 
                  alt="Tablas Seaview Resort" 
                  className="w-full h-40 object-cover rounded-lg"
                />
                <img 
                  loading="lazy"
                  src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224662/632850335_eg6753.jpg" 
                  alt="Tablas Seaview Resort" 
                  className="w-full h-40 object-cover rounded-lg"
                />
                <img 
                  loading="lazy"
                  src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224634/aglicay-beach-resort-forest_g8zh5k.jpg" 
                  alt="Aglicay Beach Resort Forest" 
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
              
              <div className="mt-8 p-6 bg-amber-50 rounded-lg shadow">
                <h3 className="text-xl font-bold text-amber-800 mb-4">Motorcycle Rentals</h3>
                <p className="text-gray-700 mb-2">
                  Ask us for local contacts. Contact <a href="mailto:ilawilawvilla@gmail.com" className="text-amber-600 hover:text-amber-700">ilawilawvilla@gmail.com</a>
                </p>
                <img 
                  loading="lazy"
                  src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224639/caticlan-port-travelers_wrligl.jpg" 
                  alt="Caticlan Port Travelers" 
                  className="w-full h-48 object-cover rounded-lg mt-4"
                />
              </div>
            </div>
          </section>

          {/* Day by Day Guide Section */}
          <section 
            id="day-by-day" 
            ref={el => sectionRefs.current['day-by-day'] = el}
            className={`mb-16 transition-all duration-1000 ${
              visibleSections.has('day-by-day') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-amber-600" />
                What to Do: Day by Day
              </h2>
              
              <div className="space-y-12">
                {/* Day 1 */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Sunset className="w-5 h-5 text-amber-600" />
                      Day 1: Settle in and Relax
                    </h3>
                    
                    <p className="text-gray-700 mb-6">
                      Unplug, breathe, and enjoy the stars at night. No nightlife, no McDonald's—just nature and quiet.
                    </p>
                    
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224639/caticlan-port-travelers_wrligl.jpg" 
                      alt="Caticlan Port Travelers" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                </div>
                
                {/* Day 2 */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Map className="w-5 h-5 text-amber-600" />
                      Day 2: Full Island Loop (6–8 hours by bike)
                    </h3>
                    
                    <p className="text-gray-700 mb-6">
                      Stops & Highlights:
                    </p>
                    
                    <div className="space-y-8">
                      {/* Agmanic */}
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/2">
                          <h4 className="font-bold text-gray-900 mb-2">Agmanic: White deserted beaches</h4>
                          <a 
                            href="https://maps.app.goo.gl/1CSctTUnond1ZUqw7" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                          >
                            <MapPin className="w-4 h-4" />
                            <span>View on Map</span>
                          </a>
                          <img 
                            loading="lazy"
                            src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224674/agmanic_ceovsi.jpg" 
                            alt="Agmanic Beach" 
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                        
                        <div className="md:w-1/2">
                          <h4 className="font-bold text-gray-900 mb-2">Guintigbasan: Ride and hike to mountain viewpoint</h4>
                          <a 
                            href="https://maps.app.goo.gl/5sLAYZhphR7rn5peA" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                          >
                            <MapPin className="w-4 h-4" />
                            <span>View on Map</span>
                          </a>
                          <div className="grid grid-cols-2 gap-2">
                            <img 
                              loading="lazy"
                              src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224631/guintigbasan-mountain-view_lo1bgr.webp" 
                              alt="Guintigbasan Mountain View" 
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <img 
                              loading="lazy"
                              src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224639/tablas-point-beachfront-hut_jtepq2.webp" 
                              alt="Tablas Point Beachfront Hut" 
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* San Agustin */}
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/2">
                          <h4 className="font-bold text-gray-900 mb-2">San Agustin: Lunch stop + resupply</h4>
                          <a 
                            href="https://maps.app.goo.gl/uo9ye975QzoDdVt7A" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                          >
                            <MapPin className="w-4 h-4" />
                            <span>View on Map</span>
                          </a>
                          <img 
                            loading="lazy"
                            src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224623/tablas-motorbike-rental_ko6wfi.webp" 
                            alt="Tablas Motorbike Rental" 
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                        
                        <div className="md:w-1/2">
                          <h4 className="font-bold text-gray-900 mb-2">Gorda Point Lighthouse: Park and hike down to beach</h4>
                          <div className="flex items-center gap-4 mb-4">
                            <a 
                              href="https://maps.app.goo.gl/oWAcsz5GgwYyCTje7" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                            >
                              <MapPin className="w-4 h-4" />
                              <span>Lighthouse</span>
                            </a>
                            <a 
                              href="https://maps.app.goo.gl/UbSbzXryVqVjJpNW7" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                            >
                              <MapPin className="w-4 h-4" />
                              <span>Beach</span>
                            </a>
                          </div>
                          <p className="text-amber-700 font-medium mb-4">
                            Great workout! Bring lots of water.
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <img 
                              loading="lazy"
                              src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224663/ffsafdsfa_v5gsf9.jpg" 
                              alt="Gorda Point Lighthouse" 
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <img 
                              loading="lazy"
                              src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224638/unnamed_1_grngqw.jpg" 
                              alt="Gorda Point View" 
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* More Stops */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Mahabang Baybay: Walk to the causeway to Biaringan Island</h4>
                          <p className="text-gray-700 mb-2">Feels like Tahiti</p>
                          <a 
                            href="https://maps.app.goo.gl/FUyQvtd6Y3c8C29GA" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                          >
                            <MapPin className="w-4 h-4" />
                            <span>View on Map</span>
                          </a>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Binucot Beach: Swim and enjoy the sunset</h4>
                          <p className="text-gray-700 mb-2">Calm water, perfect for photos</p>
                          <a 
                            href="https://maps.app.goo.gl/PbXEbAAJRzEo2aVQ9" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                          >
                            <MapPin className="w-4 h-4" />
                            <span>View on Map</span>
                          </a>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <img 
                          loading="lazy"
                          src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751226344/478506_13062618300013531861_potitj.jpg" 
                          alt="Binucot Beach" 
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <img 
                          loading="lazy"
                          src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751226343/37052332192_d4028d5006_b_ox5vxb.jpg" 
                          alt="Binucot Beach" 
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <img 
                          loading="lazy"
                          src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751226342/ffdsfedf_dgvzk9.jpg" 
                          alt="Binucot Beach" 
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-blue-800 font-medium">
                          <strong>Estimated distance:</strong> 120 km round trip, about 6 to 9 hours (leave early morning)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Puro Island Mini-Adventure */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Sailboat className="w-5 h-5 text-amber-600" />
                      Puro Island Mini-Adventure
                    </h3>
                    
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <div className="md:w-1/2">
                        <h4 className="font-bold text-gray-900 mb-2">Base: Guintigbasan village</h4>
                        <a 
                          href="https://maps.app.goo.gl/t4ULsCtmFkc4g9xX7" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>View on Map</span>
                        </a>
                        <p className="text-gray-700 mb-4">
                          Ride there, then ask local fishermen for a boat to Puro Island (10 mins)
                        </p>
                        <a 
                          href="https://maps.app.goo.gl/MPcTdSr77YamVUP66" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>Puro Island on Map</span>
                        </a>
                      </div>
                      
                      <div className="md:w-1/2">
                        <h4 className="font-bold text-gray-900 mb-2">Activities:</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="text-amber-600 mr-2">•</span>
                            <span className="text-gray-700">Snorkel (bring your own snorkel) or swim</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-amber-600 mr-2">•</span>
                            <span className="text-gray-700">Hike to the viewpoint</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-amber-600 mr-2">•</span>
                            <span className="text-gray-700">Chat with locals (only ~100 people live there)</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-amber-600 mr-2">•</span>
                            <span className="text-gray-700">Buy fresh coconuts before heading back</span>
                          </li>
                        </ul>
                        <p className="text-gray-700 mt-4">
                          End your day with a quiet beach like Pili Beach or Tablas Point.
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <img 
                        loading="lazy"
                        src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224610/IMG_8046_copy_tj3f50.webp" 
                        alt="Puro Island" 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <img 
                        loading="lazy"
                        src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224616/IMG_8022_copy_cqm50c.webp" 
                        alt="Puro Island" 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <img 
                        loading="lazy"
                        src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224626/IMG_8028_copy_fpujx0.webp" 
                        alt="Puro Island" 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Diving and Snorkeling Section */}
          <section 
            id="diving" 
            ref={el => sectionRefs.current['diving'] = el}
            className={`mb-16 transition-all duration-1000 ${
              visibleSections.has('diving') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Waves className="w-6 h-6 text-amber-600" />
                Diving and Snorkeling
              </h2>
              
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Kiwi Dive Resort (San Agustin)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="text-amber-600 mr-2">•</span>
                          <span className="text-gray-700">Well-known dive center on the island</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-600 mr-2">•</span>
                          <span className="text-gray-700">Offers fun dives, intro dives, and night dives</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-600 mr-2">•</span>
                          <span className="text-gray-700">Also great snorkeling nearby</span>
                        </li>
                      </ul>
                      
                      <div className="mt-4">
                        <a 
                          href="https://www.facebook.com/kiwidivetablas" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Kiwi Dive Resort Facebook
                        </a>
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-800 mb-2">
                          <strong>Rates:</strong> PHP 1,800–2,200 per dive
                        </p>
                        <p className="text-blue-800">
                          <strong>Best Season:</strong> November to May
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Bonus Stops</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span className="text-gray-700"><strong>Looc Bay Marine Refuge:</strong> Snorkeling sanctuary</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span className="text-gray-700"><strong>Busay Falls:</strong> Great for a freshwater break</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span className="text-gray-700"><strong>Local eateries:</strong> Try anything with coconut, fish, or banana. Simple, fresh, and real.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Final Tips Section */}
          <section 
            id="tips" 
            ref={el => sectionRefs.current['tips'] = el}
            className={`mb-16 transition-all duration-1000 ${
              visibleSections.has('tips') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Lighthouse className="w-6 h-6 text-amber-600" />
                Final Tips
              </h2>
              
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2 text-xl">•</span>
                      <span className="text-gray-700">Always carry water, sun protection, and cash (few ATMs)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2 text-xl">•</span>
                      <span className="text-gray-700">Download maps offline before arriving</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2 text-xl">•</span>
                      <span className="text-gray-700">Don't expect perfect Wi-Fi or nightlife—expect raw beauty and local hospitality</span>
                    </li>
                  </ul>
                  
                  <div className="mt-8 p-6 bg-amber-50 rounded-lg">
                    <p className="text-amber-800 text-lg font-medium text-center">
                      Tablas isn't for everyone. But if you're up for the ride, it might be your favorite island yet.
                    </p>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224641/fsfdsfsdfdsfdsfsd_gjdyht.jpg" 
                      alt="Tablas Island" 
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224619/IMG_9734_copy_ysvsrz.webp" 
                      alt="Tablas Island" 
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <img 
                      loading="lazy"
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751224620/IMG_9736_copy_jywcej.webp" 
                      alt="Tablas Island" 
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tablas Island FAQs Section */}
          <section 
            id="faqs" 
            ref={el => sectionRefs.current['faqs'] = el}
            className={`mb-16 transition-all duration-1000 ${
              visibleSections.has('faqs') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-amber-600" />
                Tablas Island FAQs
              </h2>
              
              <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">What is the boat schedule from Caticlan to Tablas?</h3>
                  <p className="text-gray-700">Expect 2–3 departures daily to Looc or Santa Fe. Arrive at least one hour early; schedules can change with weather.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">How much is the boat to Tablas Island?</h3>
                  <p className="text-gray-700">Plan ₱250–₱400 for the boat fare. If coming from the airport, add an e‑trike (₱50–₱100) to the port.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">What is the best month to visit Tablas?</h3>
                  <p className="text-gray-700">December–May offers calmer seas and best visibility for diving. June–November has more rain and occasional weather delays.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Is Tablas good for first‑timers?</h3>
                  <p className="text-gray-700">Yes if you like quiet beaches, motorbike loops, and fewer crowds. It’s more rustic than Boracay—bring cash and offline maps.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Where is Tablas Island located?</h3>
                  <p className="text-gray-700">Tablas is in Romblon Province, Philippines, across the water from Caticlan (Boracay). The main entry points are Looc and Santa Fe ports.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Is Tablas part of Boracay?</h3>
                  <p className="text-gray-700">No. Tablas is a separate island in Romblon. It’s reached by ferry from Caticlan, the same gateway used for Boracay.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Exceptional Blog for Boracay section */}
          <Blog />
        </Container>
      </div>

      {/* Hidden SEO block */}
      <div className="sr-only">
        Tablas Island travel guide 2025, how to get to Tablas from Caticlan, Tablas Island tourist spots, things to do in Tablas Island, best beaches Looc Santa Fe Ferrol, where to stay in Tablas Island, Tablas Romblon itinerary.
      </div>
    </>
  );
};

export default TablasIslandPage;
