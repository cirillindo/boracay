import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import SEO from '../components/SEO';
import { MapPin, Waves, Sun, Shell, Wind, Umbrella, Users } from 'lucide-react';

const beaches = [
  {
    name: "White Beach",
    slug: 'white-beach',
    image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1748367206/489425930_1137085028431955_6025728311014440020_n_lkk5xd.jpg",
    description: "The iconic 4km stretch of powdery white sand and crystal-clear waters. Boracay's most famous beach with vibrant nightlife, restaurants, and water activities.",
    highlights: ["Station 1, 2 & 3", "Nightlife & Dining", "Water Sports", "Beach Bars"],
    icon: <Sun className="w-6 h-6" />
  },
  {
    name: "Diniwid Beach",
    slug: 'diniwid-beach',
    image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1748367634/482324584_1130259389112739_6638706798572273322_n_hihhyf.jpg",
    description: "A secluded paradise just north of White Beach, perfect for a peaceful retreat. Small, intimate, and ideal for romantic getaways.",
    highlights: ["Quiet & Private", "Sunset Views", "Boutique Resorts", "Walking Distance to White Beach"],
    icon: <Umbrella className="w-6 h-6" />
  },
  {
    name: "Puka Shell Beach",
    slug: 'puka-shell-beach',
    image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1748368416/download_ggl7m4.jpg",
    description: "Known for its natural beauty and unique shells scattered along the shore. A quieter alternative with crushed shell sand and turquoise waters.",
    highlights: ["Natural Beauty", "Shell Collecting", "Less Crowded", "Raw Coastline"],
    icon: <Shell className="w-6 h-6" />
  },
  {
    name: "Bulabog Beach",
    slug: 'bulabog-beach',
    image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218597/Bulabog_Beach_bxqjmh.jpg",
    description: "The water sports capital, perfect for kitesurfing and windsurfing. East-side beach with consistent winds from November to April.",
    highlights: ["Kitesurfing Hub", "Windsurfing", "Water Sports Schools", "Adventure Activities"],
    icon: <Wind className="w-6 h-6" />
  },
  {
    name: "Ilig-Iligan Beach",
    slug: 'ilig-iligan-beach',
    image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1748368472/ilig-iligan-beach-in-boracay_ksdubm.avif",
    description: "A serene beach surrounded by lush greenery and rock formations. Hidden gem perfect for snorkeling and swimming in calm waters.",
    highlights: ["Snorkeling Spot", "Hidden Gem", "Calm Waters", "Natural Setting"],
    icon: <Waves className="w-6 h-6" />
  },
  {
    name: "Tambisaan Beach",
    slug: 'tambisaan-beach',
    image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1748368538/Boracay-Beaches-Tambisaan_Beach-02-1024x576_adlr7k.webp",
    description: "Famous for its rich marine life and excellent snorkeling spots. Close to the port with authentic local atmosphere and reef access.",
    highlights: ["Marine Sanctuary", "Snorkeling", "Local Atmosphere", "Port Access"],
    icon: <Users className="w-6 h-6" />
  }
];

const BeachesDashboardPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [beachesVisible, setBeachesVisible] = useState<Set<number>>(new Set());
  const beachRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setBeachesVisible((prev) => new Set([...prev, index]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    beachRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <SEO
        title="Boracay Beaches Guide – Best Beachfront Spots in Boracay"
        description="Explore the best beaches in Boracay — from Puka to White Beach. Find out where to swim, relax, and invest in beachfront property or rentals."
        keywords="boracay beaches, boracay beach guide, best beaches in boracay, puka beach, diniwid beach, iligan beach, white beach boracay, boracay beach map, boracay beachfront rentals, beachfront villas boracay, boracay house for sale, boracay vacation, boracay travel tips, boracay local beaches, boracay house beachfront, invest in boracay, stay in boracay"
        ogImage="https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218661/puka-beach_sxnpwl.webp"
        url="https://boracay.house/beaches"
        type="website"
        canonical="https://boracay.house/beaches"
      />

      <div className="min-h-screen bg-white">
        <div className="h-32" /> {/* Spacer for fixed navbar */}

        {/* Hero Section */}
        <div className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 w-full h-full animate-hero"
              style={{
                backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218661/puka-beach_sxnpwl.webp)',
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
                Your Ultimate Boracay Beach Guide
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                From quiet coves to popular strips, this dashboard helps you explore every beach in Boracay — Puka, Iligan, Diniwid, White Beach, and more. Whether you're planning your holiday or looking to buy a beachfront property, this is your starting point to discover the real Boracay.
              </p>
            </div>
          </Container>
        </div>

        {/* Beaches Grid */}
        <Container className="py-16">
          <div 
            className="text-center mb-12"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 1s ease-out',
              transitionDelay: '0.3s'
            }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Boracay's Beaches
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Each beach in Boracay offers a unique experience. Click on any beach below to explore detailed guides, photos, and nearby property opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beaches.map((beach, index) => (
              <div
                key={beach.slug}
                ref={el => beachRefs.current[index] = el}
                data-index={index}
                className={`transition-all duration-1000 ease-out ${
                  beachesVisible.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Link
                  to={`/beaches/${beach.slug}`}
                  className="block group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Beach Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={beach.image}
                      alt={`${beach.name} - Boracay Beach`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full">
                        {beach.icon}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-2">{beach.name}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Beach Info */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {beach.description}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Highlights:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {beach.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0"></div>
                            <span className="text-sm text-gray-600">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Learn more</span>
                        <div className="flex items-center gap-2 text-amber-600 group-hover:text-amber-700 transition-colors">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-medium">Explore Beach →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Additional Info Section */}
          <div 
            className="mt-16 bg-gray-50 rounded-xl p-8"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 1s ease-out',
              transitionDelay: '0.6s'
            }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Planning Your Boracay Beach Experience
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Whether you're visiting for vacation or considering property investment, understanding each beach's unique character helps you make the right choice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Waves className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">For Travelers</h3>
                <p className="text-gray-600">
                  Discover the perfect beach for your vacation style — from party vibes at White Beach to peaceful retreats at Puka Shell Beach.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">For Property Buyers</h3>
                <p className="text-gray-600">
                  Find properties near your preferred beach. Each area offers different investment opportunities and lifestyle benefits.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Sun className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Local Insights</h3>
                <p className="text-gray-600">
                  Get insider tips on the best times to visit, hidden spots, and what makes each beach special from our local team.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default BeachesDashboardPage;
