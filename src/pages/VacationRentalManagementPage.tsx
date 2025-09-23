import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Accordion from '../components/ui/Accordion';
import InquireNowForm from '../components/forms/InquireNowForm';
import { Camera, MessageSquare, Settings, Calendar, Home, PenTool as Tool, TrendingUp, Headphones, Users, CheckCircle2, ListChecks, BarChart3, HeadphonesIcon, CreditCard, UserCircle2, PhoneCall, Globe } from 'lucide-react';
import SEO from '../components/SEO';

const VacationRentalManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      const offset = 100;
      const elementPosition = featuresSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const features = [
    {
      icon: <Camera />,
      title: "Tailored Property Listings",
      content: "We don't just upload and pray. We craft listings that highlight your home's strengths — whether it's a private villa in Diniwid or a studio steps from White Beach. Every listing includes keyword-rich descriptions, clear headlines, and optimized details that help travelers find, click, and book. Great Airbnb bookings start with a great listing."
    },
    {
      icon: <BarChart3 />,
      title: "Strategic Marketing & Optimization",
      content: "We monitor your performance on Airbnb, Booking.com, and our own website — constantly adapting to demand trends, local events, calendar timing, and platform algorithms. Whether you're aiming for steady Airbnb income or high-season occupancy, we run your rental like a business — not a hobby."
    },
    {
      icon: <Users />,
      title: "Guest & Owner Assistance",
      content: "From check-in questions to Wi-Fi help, we're the human contact your guests need — and the quiet operator you rely on. Fast replies, warm communication, and issue resolution make guests happy and owners worry-free. You'll also get updates and access to our on-island support team."
    },
    {
      icon: <TrendingUp />,
      title: "Revenue Growth Strategy",
      content: "We don't guess. We A/B test, adjust stay lengths, manage reviews, and add extras to maximize your Boracay rental income. Whether it's boosting short-term rental ROI or maintaining high occupancy, our strategy works because we've lived it — and scaled it."
    },
    {
      icon: <CreditCard />,
      title: "Booking & Payout Management",
      content: "We handle reservations, cancellations, taxes, guest messaging, and secure payments. Your guests get instant confirmation. You get payouts — on time, every time. No more juggling Airbnb calendars and payment follow-ups."
    },
    {
      icon: <UserCircle2 />,
      title: "Dedicated Client Manager",
      content: "You'll work with one person who knows your home inside and out. No bots. No call centers. Just a real contact who manages your Airbnb in Boracay like it's their own — and gives you honest, ongoing feedback."
    },
    {
      icon: <Tool />,
      title: "Maintenance & On-Island Support",
      content: "Broken lightbulb? Late-night lockout? Laundry issue? Our team is based in Boracay and solves problems fast — before guests ever complain. That's the difference between 4 stars and 5."
    },
    {
      icon: <Globe />,
      title: "Maximized Listing Visibility",
      content: "We promote your property through SEO (via boracay.house), direct bookings, return guest offers, and Airbnb co-hosting tools. You won't just appear — you'll stand out. Our goal: a full calendar, great reviews, and repeat bookings."
    }
  ];

  const services = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Tailored Listings & Photos",
      description: "We create compelling listings with great copy, professional photos, and smart positioning to attract the right guests."
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Guest Communication & Check-ins",
      description: "We handle messaging, reviews, guest screening, and check-ins with local staff."
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: "Housekeeping & Laundry",
      description: "Trusted local teams clean and reset your unit after every stay. Laundry? Handled."
    },
    {
      icon: <Tool className="w-8 h-8" />,
      title: "Maintenance & Inspections",
      description: "Light repairs, regular checkups, local contractors on speed dial. We fix issues before they become problems."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Marketing & Occupancy Strategy",
      description: "We track trends, adjust pricing, and run promotions to keep bookings high and seasonal dips minimal."
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Owner Support & Transparency",
      description: "We send regular reports and are always one message away. This is your property — we just make it perform."
    }
  ];

  const targetAudience = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Owners who don't live on the island",
      description: "Perfect for international property owners"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Busy investors who want hands-off income",
      description: "Let us handle the day-to-day operations"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Hosts tired of chasing cleaners",
      description: "We manage all service providers"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "New buyers looking to rent out",
      description: "Start earning from day one"
    }
  ];

  return (
    <>
      <SEO
        title="Boracay Vacation Rental Management – Stress-Free Hosting"
        description="Own property in Boracay? Let us handle your rentals. We manage guest communication, bookings, and maintenance so you earn without the hassle."
        keywords="boracay property management, airbnb management boracay, vacation rental management, boracay rental income, property manager boracay, airbnb hosting boracay"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751197149/Boracay_Rental_Management_lq8msm.webp"
        url="https://boracay.house/vacation-rental-management"
        type="profile"
      />

      <div className="min-h-screen bg-white">
        <div className="h-32" />
        
        <div className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 w-full h-full animate-hero"
              style={{
                backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1748371472/Screenshot_2025-05-27_at_12.14.17_PM_efoue1_copy_cjtu8h.jpg)',
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
                Rent Your Home, Relax From Anywhere
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                We handle the work, you get the income. Simple as that.
              </p>
              <Button 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-colors duration-300"
                onClick={scrollToFeatures}
              >
                Get started today
              </Button>
            </div>
          </Container>
        </div>

        <section 
          id="features-section"
          ref={el => sectionRefs.current['features'] = el}
          data-section-id="features"
          className="py-24 bg-white"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['features'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['features'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <h2 className="text-4xl font-bold text-center mb-8">
                Features in the Package
              </h2>
              <p className="text-lg text-gray-600 text-center max-w-4xl mx-auto mb-16 leading-relaxed">
                Want to rent out your Boracay home without the stress? We offer full Airbnb and vacation rental management — listings, cleaning, guest support, marketing, and more. You focus on ownership. We handle the rest.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      style={{
                        opacity: sectionsVisible['features'] ? 1 : 0,
                        transform: `translateY(${sectionsVisible['features'] ? '0' : '20px'})`,
                        transition: `all 1s ease-out ${index * 0.1}s`
                      }}
                    >
                      <Accordion 
                        title={feature.title} 
                        icon={feature.icon}
                        defaultOpen={index === 0}
                      >
                        {feature.content}
                      </Accordion>
                    </div>
                  ))}
                </div>
                <div className="lg:col-span-1">
                  <InquireNowForm 
                    defaultSubject="property-management"
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section 
          ref={el => sectionRefs.current['services'] = el}
          data-section-id="services"
          className="py-24 bg-gray-50"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['services'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['services'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <h2 className="text-4xl font-bold text-center mb-8">
                360° Property Management — Built for Boracay
              </h2>
              
              <div className="text-center mb-12">
                <p className="text-xl text-gray-600 mb-6">
                  Let's make your property work for you.<br />
                  Whether you're abroad or on the island, we manage your home like it's ours.
                </p>
                <Button 
                  onClick={() => navigate('/contact')}
                  className="text-lg"
                >
                  👉 Contact us to get started today.
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    style={{
                      opacity: sectionsVisible['services'] ? 1 : 0,
                      transform: `translateY(${sectionsVisible['services'] ? '0' : '40px'})`,
                      transition: `all 1s ease-out ${index * 0.2}s`
                    }}
                  >
                    <div className="bg-amber-50 p-4 rounded-xl inline-block mb-6">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section 
          ref={el => sectionRefs.current['audience'] = el}
          data-section-id="audience"
          className="py-24 bg-white"
        >
          <Container>
            <div 
              className="max-w-4xl mx-auto"
              style={{
                opacity: sectionsVisible['audience'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['audience'] ? '0' : '40px'})`,
                transition: 'all 1s ease-out'
              }}
            >
              <h2 className="text-4xl font-bold text-center mb-16">
                Who Is It For?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {targetAudience.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-6 p-6 bg-gray-50 rounded-xl"
                    style={{
                      opacity: sectionsVisible['audience'] ? 1 : 0,
                      transform: `translateY(${sectionsVisible['audience'] ? '0' : '40px'})`,
                      transition: `all 1s ease-out ${index * 0.2}s`
                    }}
                  >
                    <div className="bg-amber-100 p-4 rounded-xl">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section 
          ref={el => sectionRefs.current['cta'] = el}
          data-section-id="cta"
          className="py-24 bg-gray-50"
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
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-600 mb-12">
                Let's discuss how we can help maximize your property's potential.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/contact')}
              >
                Contact Us Today
              </Button>
            </div>
          </Container>
        </section>

        {/* Hidden SEO text */}
        <div className="sr-only">
          Expert vacation rental management in Boracay. Full-service property management including Airbnb management, housekeeping, maintenance, and guest support. Professional property caretaker services for your Boracay investment.
        </div>
      </div>
    </>
  );
};

export default VacationRentalManagementPage;