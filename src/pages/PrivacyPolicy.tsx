import React, { useState, useEffect } from 'react';
import Container from '../components/ui/Container';
import { Mail, Globe, ChevronRight } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('collect');
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [titleVisible, setTitleVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    setTitleVisible(true);
    const timer = setTimeout(() => setContentVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('id');
          if (id) {
            if (entry.isIntersecting) {
              setVisibleSections((prev) => new Set([...prev, id]));
              setActiveSection(id);
            }
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px'
      }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const sections = [
    { id: 'collect', title: 'Information We Collect', emoji: '🔍' },
    { id: 'use', title: 'How We Use Your Information', emoji: '📌' },
    { id: 'protect', title: 'How We Protect Your Information', emoji: '🔒' },
    { id: 'share', title: 'Sharing of Information', emoji: '🤝' },
    { id: 'rights', title: 'Your Rights and Choices', emoji: '⚙️' },
    { id: 'changes', title: 'Changes to This Policy', emoji: '🔄' },
    { id: 'contact', title: 'Contact Us', emoji: '📬' }
  ];

  const SectionTitle: React.FC<{ visible: boolean; emoji: string; children: React.ReactNode }> = ({ 
    visible, 
    emoji, 
    children 
  }) => (
    <div className="relative">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-3">
        <span className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-amber-100 text-amber-900 rounded-xl text-xl md:text-2xl">
          {emoji}
        </span>
        {children}
      </h2>
      <div 
        className="absolute -bottom-2 left-12 md:left-16 h-0.5 bg-[#74bfab] transition-all duration-1000 ease-out"
        style={{
          width: visible ? 'calc(100% - 3rem)' : '0%',
          opacity: visible ? 1 : 0,
          transitionDelay: '0.5s'
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-32" />
      
      <div 
        className="relative bg-gradient-to-b from-amber-50 to-white py-12 md:py-16 mb-8 md:mb-16 overflow-hidden"
        style={{
          opacity: titleVisible ? 1 : 0,
          transform: `translateY(${titleVisible ? '0' : '-20px'})`,
          transition: 'opacity 1s ease-out, transform 1s ease-out'
        }}
      >
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dq3fftsfa/image/upload/v1747242259/properties/yrv0yeq7w93mvuxvzltp.jpg')] opacity-5 bg-cover bg-center bg-fixed" />
        <Container>
          <div className="relative text-center max-w-3xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg md:text-xl text-gray-600">
              Your privacy is our priority. Learn how we protect and handle your information.
            </p>
            <div 
              className="w-24 h-1 bg-[#74bfab] mx-auto mt-6 md:mt-8"
              style={{
                transform: `scaleX(${titleVisible ? 1 : 0})`,
                transition: 'transform 1.5s ease-out',
                transitionDelay: '0.5s'
              }}
            />
          </div>
        </Container>
      </div>
      
      <Container className="py-4 md:py-8">
        <div 
          className="max-w-7xl mx-auto"
          style={{
            opacity: contentVisible ? 1 : 0,
            transform: `translateY(${contentVisible ? '0' : '20px'})`,
            transition: 'opacity 1s ease-out, transform 1s ease-out',
            transitionDelay: '0.7s'
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3">
              <div className="sticky top-32">
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                  <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Quick Navigation</h2>
                  <nav className="space-y-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 text-left rounded-lg transition-all ${
                          activeSection === section.id
                            ? 'bg-amber-50 text-amber-900'
                            : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <span className="text-lg md:text-xl">{section.emoji}</span>
                        <span className="text-xs md:text-sm font-medium flex-1">{section.title}</span>
                        <ChevronRight className={`w-3 h-3 md:w-4 md:h-4 ml-auto transition-transform ${
                          activeSection === section.id ? 'rotate-90' : ''
                        }`} />
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 mb-6 md:mb-8">
                <div className="max-w-none">
                  <div className="relative">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                    <div 
                      className="absolute -bottom-2 left-0 h-0.5 bg-[#74bfab] transition-all duration-1000 ease-out"
                      style={{
                        width: titleVisible ? '100%' : '0%',
                        opacity: titleVisible ? 1 : 0,
                        transitionDelay: '0.5s'
                      }}
                    />
                  </div>
                  <p className="text-gray-600 mb-6 md:mb-8">Effective Date: January 1, 2024</p>

                  <div className="prose max-w-none">
                    <p className="text-base md:text-lg text-gray-600 mb-8 md:mb-12 leading-relaxed">
                      At Ilaw Ilaw Villas, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and share your information when you visit our website: www.boracay.house.
                    </p>

                    <section 
                      id="collect" 
                      className={`mb-12 md:mb-16 transform transition-all duration-1000 ${
                        visibleSections.has('collect') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                      }`}
                    >
                      <SectionTitle visible={visibleSections.has('collect')} emoji="🔍">
                        Information We Collect
                      </SectionTitle>
                      <div className="pl-12 md:pl-15">
                        <p className="mb-4 text-gray-600">We may collect the following types of information:</p>
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 md:p-6 rounded-xl">
                            <h3 className="font-bold text-gray-900 mb-2">Personal Information</h3>
                            <p className="text-gray-600">Name, email address, phone number, and other contact details you voluntarily provide through forms, bookings, or direct inquiries.</p>
                          </div>
                          <div className="bg-gray-50 p-4 md:p-6 rounded-xl">
                            <h3 className="font-bold text-gray-900 mb-2">Usage Data</h3>
                            <p className="text-gray-600">Information about how you interact with our website, including pages visited, links clicked, time spent, and referring websites.</p>
                          </div>
                          <div className="bg-gray-50 p-4 md:p-6 rounded-xl">
                            <h3 className="font-bold text-gray-900 mb-2">Device & Location Data</h3>
                            <p className="text-gray-600">IP address, browser type, operating system, and device identifiers. We may also collect approximate location data to help show relevant listings or content.</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section 
                      id="use"
                      className={`mb-12 md:mb-16 transform transition-all duration-1000 ${
                        visibleSections.has('use') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                      }`}
                    >
                      <SectionTitle visible={visibleSections.has('use')} emoji="📌">
                        How We Use Your Information
                      </SectionTitle>
                      <div className="pl-12 md:pl-15">
                        <p className="mb-6 text-gray-600">We use your information to:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            'Provide and improve our services and website experience',
                            'Communicate with you regarding your inquiries, bookings, or services',
                            'Send you updates, promotional materials, and special offers',
                            'Understand website usage trends through analytics',
                            'Ensure the security and integrity of our website'
                          ].map((item, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-xl flex items-center">
                              <div className="w-2 h-2 bg-amber-400 rounded-full mr-3 flex-shrink-0"></div>
                              <p className="text-gray-600 text-sm md:text-base">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section 
                      id="protect"
                      className={`mb-12 md:mb-16 transform transition-all duration-1000 ${
                        visibleSections.has('protect') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                      }`}
                    >
                      <SectionTitle visible={visibleSections.has('protect')} emoji="🔒">
                        How We Protect Your Information
                      </SectionTitle>
                      <div className="pl-12 md:pl-15">
                        <div className="bg-gradient-to-br from-amber-50 to-white p-4 md:p-6 rounded-xl border border-amber-100">
                          <p className="text-gray-600 leading-relaxed">
                            We implement appropriate technical and organizational measures to safeguard your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is completely secure, so we cannot guarantee absolute security.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section 
                      id="share"
                      className={`mb-12 md:mb-16 transform transition-all duration-1000 ${
                        visibleSections.has('share') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                      }`}
                    >
                      <SectionTitle visible={visibleSections.has('share')} emoji="🤝">
                        Sharing of Information
                      </SectionTitle>
                      <div className="pl-12 md:pl-15">
                        <div className="bg-red-50 text-red-900 p-4 rounded-xl mb-6">
                          We do not sell or rent your personal information.
                        </div>
                        <p className="mb-6 text-gray-600">We may share your information only with:</p>
                        <div className="space-y-4">
                          {[
                            'Trusted third-party service providers to help operate our website',
                            'Business affiliates and partners—with your permission',
                            'Government or legal authorities as required by law'
                          ].map((item, index) => (
                            <div key={index} className="bg-gray-50 p-4 md:p-6 rounded-xl flex items-start gap-4">
                              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-amber-800">{index + 1}</span>
                              </div>
                              <p className="text-gray-600">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section 
                      id="rights"
                      className={`mb-12 md:mb-16 transform transition-all duration-1000 ${
                        visibleSections.has('rights') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                      }`}
                    >
                      <SectionTitle visible={visibleSections.has('rights')} emoji="⚙️">
                        Your Rights and Choices
                      </SectionTitle>
                      <div className="pl-12 md:pl-15">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          {[
                            { title: 'Access', desc: 'View your personal data' },
                            { title: 'Correct', desc: 'Update incorrect information' },
                            { title: 'Delete', desc: 'Remove your data' },
                            { title: 'Opt Out', desc: 'Stop marketing emails' },
                            { title: 'Request Info', desc: 'Ask how data is used' },
                            { title: 'Object', desc: 'Oppose data processing' }
                          ].map((right, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-xl">
                              <h3 className="font-bold text-gray-900 mb-1">{right.title}</h3>
                              <p className="text-sm text-gray-600">{right.desc}</p>
                            </div>
                          ))}
                        </div>
                        <p className="text-gray-600">
                          To exercise any of these rights, please contact us using the information below.
                        </p>
                      </div>
                    </section>

                    <section 
                      id="changes"
                      className={`mb-12 md:mb-16 transform transition-all duration-1000 ${
                        visibleSections.has('changes') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                      }`}
                    >
                      <SectionTitle visible={visibleSections.has('changes')} emoji="🔄">
                        Changes to This Policy
                      </SectionTitle>
                      <div className="pl-12 md:pl-15">
                        <div className="bg-blue-50 p-4 md:p-6 rounded-xl">
                          <p className="text-gray-600 leading-relaxed">
                            We may update this Privacy Policy from time to time to reflect legal, technical, or business changes. Any updates will be posted on this page with the new effective date.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section 
                      id="contact"
                      className={`mb-12 md:mb-16 transform transition-all duration-1000 ${
                        visibleSections.has('contact') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                      }`}
                    >
                      <SectionTitle visible={visibleSections.has('contact')} emoji="📬">
                        Contact Us
                      </SectionTitle>
                      <div className="pl-12 md:pl-15">
                        <p className="mb-6 text-gray-600">
                          If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:
                        </p>
                        <div className="bg-gradient-to-br from-amber-50 to-white p-6 md:p-8 rounded-xl border border-amber-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Ilaw Ilaw Villas</h3>
                          <div className="space-y-4">
                            <a 
                              href="mailto:ilawilawvilla@gmail.com"
                              className="flex items-center gap-3 text-gray-600 hover:text-amber-600 transition-colors"
                            >
                              <Mail className="w-5 h-5" />
                              ilawilawvilla@gmail.com
                            </a>
                            <a 
                              href="https://boracay.house"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 text-gray-600 hover:text-amber-600 transition-colors"
                            >
                              <Globe className="w-5 h-5" />
                              boracay.house
                            </a>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PrivacyPolicy;