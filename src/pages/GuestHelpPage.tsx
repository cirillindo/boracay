import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Blog from '../components/home/Blog';
import { MessageCircle, Phone, Mail, MapPin, Clock, Globe, Facebook, ExternalLink, Home, Wrench, Calendar, Shirt, UtensilsCrossed, HelpCircle, PhoneCall } from 'lucide-react';
import SEO from '../components/SEO';

const GuestHelpPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [sectionsVisible, setSectionsVisible] = useState<Record<string, boolean>>({});
  const [weDoBetterVisible, setWeDoBetterVisible] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const weDoBetterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-section-id');
          if (id) {
            // Once visible, keep it visible (no fade out)
            if (entry.isIntersecting) {
              setSectionsVisible(prev => ({
                ...prev,
                [id]: true
              }));
            }
          }
          if (entry.target === weDoBetterRef.current) {
            // Once visible, keep it visible (no fade out)
            if (entry.isIntersecting) {
              setWeDoBetterVisible(true);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    if (weDoBetterRef.current) {
      observer.observe(weDoBetterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getLanguageFlags = (languages: string[]) => {
    const flagMap: Record<string, string> = {
      'English': '🇺🇸',
      'Tagalog': '🇵🇭',
      'Italian': '🇮🇹',
      'French': '🇫🇷',
      'Spanish': '🇪🇸',
      'German': '🇩🇪',
      'Chinese': '🇨🇳',
      'Russian': '🇷🇺'
    };
    
    return languages.map(lang => flagMap[lang] || '🌐').join(' ');
  };

  return (
    <>
      <SEO
        title="Boracay House Help & Guest Support"
        description="Questions about your stay? Find local tips, check-in info, and assistance here. We're just a click away whenever you need us."
        keywords="boracay guest help, boracay house support, boracay accommodation help, boracay stay assistance, boracay travel support"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751196882/Boracay_House_Help_adn_Assistance_uzi6cg.webp"
        url="https://boracay.house/guest-help"
        type="profile"
      />

      <div className="min-h-screen bg-white">
        <div className="h-32" />
        
        <div className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 w-full h-full animate-hero"
              style={{
                backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1749289431/Helppage_se161f.jpg)',
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
                Welcome to Boracay.house — Guest Help & Contact
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Your all-in-one support page for a smooth, safe, and easy stay. From housekeeping and linen service to emergency numbers, transport, and island tips — it's all here.
              </p>
            </div>
          </Container>
        </div>

        {/* Important Contacts */}
        <section 
          ref={el => sectionRefs.current['contacts'] = el}
          data-section-id="contacts"
          className="py-24 bg-white"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['contacts'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['contacts'] ? '0' : '40px'})`,
                transition: 'all 0.8s ease-out'
              }}
            >
              <h2 className="text-4xl font-bold text-center mb-16">Important Contacts</h2>
              
              {/* Management & Housekeeping Section */}
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Management & Housekeeping</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* On-Site Guest Manager */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dayqsxlnt/image/upload/v1755358645/Screenshot_2025-08-16_at_5.17.50_PM_t5e4rg.png"
                      alt="Dexter - On-Site Guest Manager"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">On-Site Guest Manager (Housekeeping & Support)</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium">WhatsApp: ++63 916 292 3618 – Dexter</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span className="text-gray-600">Available 8 AM – Midnight</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-600">Speaks: {getLanguageFlags(['English', 'Tagalog'])} English, Tagalog</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        For housekeeping, repairs, cleaning, lost keys, or urgent help
                      </p>
                      <a
                        href="https://wa.me/639162923618"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 mt-4"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact Dexter
                      </a>
                    </div>
                  </div>
                </div>

                {/* Janifa - Housekeeping & Support */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dayqsxlnt/image/upload/v1755358640/2B87BF67-F629-4706-8504-D22278380CD4_piwdld.png"
                      alt="Janifa - Housekeeping & Support"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">Housekeeping & Support (Janifa)</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium">WhatsApp: +63 909 288 4588 – Janifa</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span className="text-gray-600">Available 8 AM – Midnight</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-600">Speaks: {getLanguageFlags(['English', 'Tagalog'])} English, Tagalog</span>
                      </div>
                      <p className="text-sm text-red-600 font-semibold">
                        Important Note: Janifa is Deaf and communicates via chat or video only.
                      </p>
                      <p className="text-sm text-gray-600 mt-3">
                        For housekeeping, repairs, cleaning, lost keys, or urgent help
                      </p>
                      <a
                        href="https://wa.me/639092884588"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 mt-4"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact Janifa
                      </a>
                    </div>
                  </div>
                </div>

                {/* Chicky - Housekeeping & Support */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dayqsxlnt/image/upload/v1755358644/Screenshot_2025-08-16_at_5.22.51_PM_n3hlns.png"
                      alt="Chicky - Housekeeping & Support"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">Housekeeping & Support (Chicky)</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium">WhatsApp: +63 992 621 7061 – Chicky</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span className="text-gray-600">Available 8 AM – Midnight</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-600">Speaks: {getLanguageFlags(['English', 'Tagalog'])} English, Tagalog</span>
                      </div>
                      <p className="text-sm text-red-600 font-semibold">
                        Important Note: Chicky is Deaf and communicates via chat or video only.
                      </p>
                      <p className="text-sm text-gray-600 mt-3">
                        For housekeeping, repairs, cleaning, lost keys, or urgent help
                      </p>
                      <a
                        href="https://wa.me/639926217061"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 mt-4"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact Chicky
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* OWNER SUPPORT Section */}
              <h3 className="text-2xl font-bold text-gray-900 mb-8 mt-16">OWNER SUPPORT</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Owner Support */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1747378378/Boracay_Island_Life_-_Life_in_Boracay_Ilaw_Ilaw_Villas_for_sale_or_for_rent_obe8gg.jpg"
                      alt="Owner Support Team"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">Owner Support</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium">WhatsApp: +63 961 792 8834</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span className="text-gray-600">Available 24/7</span>
                      </div>
                      <p className="text-xs text-gray-500">Please note: we may be in Europe time zone (–7 hrs)</p>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-600">Speaks: {getLanguageFlags(['English', 'Italian', 'French', 'Spanish', 'German', 'Chinese'])} English, Italian, French, Spanish, German, Chinese</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Use for extended stays, late checkouts, or urgent booking concerns
                      </p>
                      <a
                        href="https://wa.me/639617928834"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 mt-4"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact Owner
                      </a>
                    </div>
                  </div>
                </div>

                {/* Russian Language Assistance */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1749250587/anna_qkmfsk.jpg"
                      alt="Anna - Russian Language Assistance"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">Помощь с русским языком</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium">WhatsApp: +7 909 655 6608</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span className="text-gray-600">Available 24/7</span>
                      </div>
                      <p className="text-xs text-gray-500">May be in European time zone</p>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-600">Speaks: {getLanguageFlags(['Russian'])} Russian</span>
                      </div>
                      <a
                        href="https://wa.me/79096556608"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 mt-4"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact Anna
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Emergency Services */}
        <section 
          ref={el => sectionRefs.current['emergency'] = el}
          data-section-id="emergency"
          className="py-24 bg-red-50"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['emergency'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['emergency'] ? '0' : '40px'})`,
                transition: 'all 0.8s ease-out'
              }}
            >
              <h2 className="text-4xl font-bold text-center mb-16 text-red-900">Emergency Services</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Boracay Police */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1749249769/malay-police-station-696x522_izuqir.jpg"
                      alt="Boracay Police Station"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-red-900">Boracay Police</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-red-600" />
                        <a href="tel:+63362883066" className="font-medium hover:text-red-600">+63 36 288 3066</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <a 
                          href="https://www.facebook.com/MalayBoracayPNP/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          MalayBoracayPNP <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fire Department */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1749249872/imagesdsds_bdbazj.jpg"
                      alt="Fire Department"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-red-900">Fire Department</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-red-600" />
                        <div>
                          <a href="tel:+63362884198" className="font-medium hover:text-red-600">+63 36 288 4198</a>
                          <span className="mx-2">|</span>
                          <a href="tel:+639308493001" className="font-medium hover:text-red-600">+63 930 849 3001</a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <a href="mailto:malayfirestationaklan@gmail.com" className="text-gray-600 hover:text-gray-800">malayfirestationaklan@gmail.com</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <a 
                          href="https://www.facebook.com/bfpr6boracayfss/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          bfpr6boracayfss <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                        <span className="text-gray-600">Sitio Bantud, Brgy. Manoc-manoc</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Medical Clinics */}
        <section 
          ref={el => sectionRefs.current['medical'] = el}
          data-section-id="medical"
          className="py-24 bg-blue-50"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['medical'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['medical'] ? '0' : '40px'})`,
                transition: 'all 0.8s ease-out'
              }}
            >
              <h2 className="text-4xl font-bold text-center mb-16 text-blue-900">Medical Clinics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Metropolitan Doctors Clinic */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1749249590/463961237_27082656641382205_2801442944109830485_n_jnu6dz.jpg"
                      alt="Metropolitan Doctors Clinic"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-blue-900">Metropolitan Doctors Clinic – Boracay</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600">D'Mall Area</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <div>
                          <a href="tel:+63362886357" className="font-medium hover:text-blue-600">+63 36 288 6357</a>
                          <span className="mx-2">|</span>
                          <a href="tel:+639189263112" className="font-medium hover:text-blue-600">+63 918 926 3112</a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <a href="mailto:boracaymd@gmail.com" className="text-gray-600 hover:text-gray-800">boracaymd@gmail.com</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-600" />
                        <a 
                          href="http://metropolitandoctorsclinic.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                        >
                          Website <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <a 
                          href="https://www.facebook.com/MDMCBORACAY/about" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          MDMCBORACAY <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scandi Clinic */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1749249683/485782894_1105519621593727_725485900327887146_n_myoxmc.jpg"
                      alt="Scandi Clinic"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-blue-900">Scandi Clinic</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <a href="tel:+639289863237" className="font-medium hover:text-blue-600">+63 928 986 3237</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <a href="mailto:office_bohol@scandiclinic.com" className="text-gray-600 hover:text-gray-800">office_bohol@scandiclinic.com</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-600" />
                        <a 
                          href="https://scandiclinic.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                        >
                          Website <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <a 
                          href="https://www.facebook.com/scandiclinicbohol" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          scandiclinicbohol <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* In-House Services */}
        <section 
          ref={el => sectionRefs.current['services'] = el}
          data-section-id="services"
          className="py-24 bg-white"
        >
          <Container>
            <div 
              className="max-w-6xl mx-auto"
              style={{
                opacity: sectionsVisible['services'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['services'] ? '0' : '40px'})`,
                transition: 'all 0.8s ease-out'
              }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-8">In-House Services</h2>
                <img
                  src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1749248949/Nonnas_house_front_q1nk4t.jpg"
                  alt="In-House Services"
                  className="w-full max-w-2xl mx-auto rounded-xl shadow-lg"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Maintenance & Emergencies */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Wrench className="w-8 h-8 text-amber-600" />
                    <h3 className="text-xl font-bold">Maintenance & Emergencies</h3>
                  </div>
                  <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1749287269/Florida-Home-Maintenance-Tips_wrwkz3.jpg"
                      alt="Maintenance Services"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">WhatsApp: +63 916 292 3618 (Dexter)</span>
                    </div>
                    <p className="text-gray-600">For AC issues, water, power, lockouts, or any maintenance concerns</p>
                    <p className="text-gray-600">Available daily from 8:00 AM to Midnight</p>
                    <p className="text-sm text-gray-500">Keywords: Airbnb Boracay support, vacation rental maintenance, Boracay property help</p>
                    <a
                      href="https://wa.me/639693316725?text=Hello%20Norland%2C%20I%20need%20assistance%20with%20maintenance."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 mt-4"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Dexter
                    </a>
                  </div>
                </div>

                {/* Check-In / Check-Out */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-8 h-8 text-amber-600" />
                    <h3 className="text-xl font-bold">Check-In / Check-Out</h3>
                  </div>
                  <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1749287109/487754004_1151320650339946_3890764939045049325_n_yu5hqd.jpg"
                      alt="Check-In Check-Out"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-600"><strong>Check-In:</strong> from 2:00 PM</p>
                    <p className="text-gray-600"><strong>Check-Out:</strong> by 10:00 AM</p>
                    <p className="text-gray-600">Please leave the key on the table when you leave</p>
                    <p className="text-gray-600">Luggage storage is available before check-in and after check-out — please coordinate in advance with Dexter via WhatsApp: +63 916 292 3618</p>
                    <a
                      href="https://wa.me/639693316725?text=Hello%20Norland%2C%20I%20need%20assistance%20with%20luggage%20storage."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 mt-4"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Dexter
                    </a>
                  </div>
                </div>

                {/* Housekeeping & Linen */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Home className="w-8 h-8 text-amber-600" />
                    <h3 className="text-xl font-bold">Housekeeping & Linen</h3>
                  </div>
                  <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1749286866/488709208_1151320927006585_8987911285693911753_n_u8z6jm.jpg"
                      alt="Housekeeping Services"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">WhatsApp: +63 916 292 3618 (Dexter)</span>
                    </div>
                    <p className="text-gray-600">Available daily from 8:00 AM to Midnight</p>
                    <p className="text-gray-600">Sheets and towels are changed every 4 days</p>
                    <p className="text-gray-600">Request early changes for PHP 500</p>
                    <p className="text-gray-600">Daily housekeeping on request — please message before 10 AM</p>
                    <p className="text-gray-600">All cleaning services conclude by 4 PM</p>
                    <a
                      href="https://wa.me/639693316725?text=Hello%20Norland%2C%20I%20have%20a%20question%20about%20housekeeping%20or%20linen."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 mt-4"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Dexter
                    </a>
                  </div>
                </div>

                {/* Refill & Amenities */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <UtensilsCrossed className="w-8 h-8 text-amber-600" />
                    <h3 className="text-xl font-bold">Refill & Amenities</h3>
                  </div>
                  <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1749287720/1da96194-be03-448c-8981-d8a956518aba_tltc9h.avif"
                      alt="Amenities"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-600"><strong>Items:</strong> soap, shampoo, drinking water, toilet paper</p>
                    <p className="text-gray-600">PHP 500 for full refill (optional)</p>
                    <p className="text-gray-600">Charges apply for missing or damaged items</p>
                    <a
                      href="https://wa.me/639693316725?text=Hello%20Norland%2C%20I%20need%20assistance%20with%20refill%20and%20amenities."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 mt-4"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Dexter
                    </a>
                  </div>
                </div>

                {/* Lost Keys */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <HelpCircle className="w-8 h-8 text-amber-600" />
                    <h3 className="text-xl font-bold">Lost Keys</h3>
                  </div>
                  <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1749287809/schluessel-verloren_iStock-1265248003_kqbfjb_iwb1um.jpg_irbuot.avif"
                      alt="Lost Keys"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">WhatsApp: +63 916 292 3618 (Dexter)</span>
                    </div>
                    <p className="text-gray-600"><strong>Replacement Fee:</strong> PHP 1,500</p>
                    <a
                      href="https://wa.me/639693316725?text=Hello%20Norland%2C%20I%20have%20lost%20my%20keys."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 mt-4"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Dexter
                    </a>
                  </div>
                </div>

                {/* Getting Around & Tips */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-8 h-8 text-amber-600" />
                    <h3 className="text-xl font-bold">Getting Around & Tips</h3>
                  </div>
                  <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                    <img
                      src="https://res.cloudinary.com/dq3fftsfa/image/upload/v1749285358/e37696_8470c18bc21541349545f71e354f7e11_mv2_drrgjq.avif"
                      alt="Getting Around Boracay"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-800">From Diniwid Beach</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• 4-min walk to Diniwid Beach</li>
                      <li>• 6-min walk to CityMall</li>
                      <li>• 10-min walk to Station 1</li>
                      <li>• 10-min e-trike to D'Mall</li>
                      <li>• 20-min walk to Station 2</li>
                      <li>• 4-min walk to Dinibeach Bar</li>
                      <li>• 7-min walk to Fairways Golf</li>
                    </ul>
                    <a
                      href="https://wa.me/639693316725?text=Hello%20Norland%2C%20I%20need%20help%20with%20getting%20around%20Boracay."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 mt-4"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Dexter
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Questions or Problems */}
        <section 
          ref={el => sectionRefs.current['questions'] = el}
          data-section-id="questions"
          className="py-24 bg-amber-50"
        >
          <Container>
            <div 
              className="max-w-4xl mx-auto text-center"
              style={{
                opacity: sectionsVisible['questions'] ? 1 : 0,
                transform: `translateY(${sectionsVisible['questions'] ? '0' : '40px'})`,
                transition: 'all 0.8s ease-out'
              }}
            >
              <h2 className="text-4xl font-bold mb-8">Questions or Problems?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Use the WhatsApp numbers above or visit the Contact Page for additional support.
              </p>
              <Button 
                onClick={() => window.location.href = '/contact'}
                className="text-lg"
              >
                Visit Contact Page
              </Button>
            </div>
          </Container>
        </section>

        {/* We Do Better Section */}
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
              transition: 'opacity 0.8s ease-out'
            }}
          />
          <Container className="relative h-full">
            <div 
              className="flex flex-col items-center justify-center min-h-[600px] text-center text-white"
              style={{
                opacity: weDoBetterVisible ? 1 : 0,
                transform: `translateY(${weDoBetterVisible ? '0' : '30px'})`,
                transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
              }}
            >
              <div 
                className="mb-12"
                style={{
                  opacity: weDoBetterVisible ? 1 : 0,
                  transform: `translateY(${weDoBetterVisible ? '0' : '30px'})`,
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
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
                  transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
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
                onClick={() => navigate('/we-do-better')}
              >
                HOW WE WORK
              </Button>
            </div>
          </Container>
        </section>

        {/* Blog Section */}
        <Blog />
      </div>
    </>
  );
};

export default GuestHelpPage;
