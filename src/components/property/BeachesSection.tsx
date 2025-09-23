import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Container from '../ui/Container';
import Button from '../ui/Button';

// Define beaches array as a constant at the module level
const beaches = [
  {
    name: "WHITE BEACH",
    image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1748367206/489425930_1137085028431955_6025728311014440020_n_lkk5xd.jpg",
    description: "The iconic 4km stretch of powdery white sand and crystal-clear waters",
    slug: 'white-beach'
  },
  {
    name: "DINIWID BEACH",
    image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1748367634/482324584_1130259389112739_6638706798572273322_n_hihhyf.jpg",
    description: "A secluded paradise just north of White Beach, perfect for a peaceful retreat",
    slug: 'diniwid-beach'
  },
  {
    name: "PUKA SHELL",
    image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1748368416/download_ggl7m4.jpg",
    description: "Known for its natural beauty and unique shells scattered along the shore",
    slug: 'puka-shell-beach'
  },
  {
    name: "BULABOG BEACH",
    image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1751218597/Bulabog_Beach_bxqjmh.jpg",
    description: "The water sports capital, perfect for kitesurfing and windsurfing",
    slug: 'bulabog-beach'
  },
  {
    name: "ILIG ILIGAN",
    image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1748368472/ilig-iligan-beach-in-boracay_ksdubm.avif",
    description: "A serene beach surrounded by lush greenery and rock formations",
    slug: 'ilig-iligan-beach'
  },
  {
    name: "TAMBISAAN",
    image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1748368538/Boracay-Beaches-Tambisaan_Beach-02-1024x576_adlr7k.webp",
    description: "Famous for its rich marine life and excellent snorkeling spots",
    slug: 'tambisaan-beach'
  }
] as const;

const BeachesSection: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [titleVisible, setTitleVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const observerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLSpanElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTitleVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAboutVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
        rootMargin: '50px'
      }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems(prev => new Set([...prev, index]));
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '50px'
      }
    );

    observerRefs.current.forEach((ref, index) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="mb-4">
              <span className="text-4xl font-bold">BORACAY'S BEST </span>
              <span 
                ref={titleRef}
                className="font-['Fuggles'] text-[5rem] text-navy-900 inline-block opacity-0 transition-all duration-2000"
                style={{ 
                  color: '#000080',
                  transformOrigin: 'center bottom',
                  verticalAlign: 'middle',
                  marginLeft: '0.5rem',
                  opacity: titleVisible ? 1 : 0,
                  transform: titleVisible 
                    ? 'scale(1) rotate(-6deg) translateY(0)' 
                    : 'scale(0.3) rotate(-12deg) translateY(20px)'
                }}
              >
                Beaches
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              LIVE & WORK WHERE THE WORLD VACATIONS
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beaches.map((beach, index) => (
              <Link
                key={beach.name}
                to={`/beaches/${beach.slug}`}
                ref={el => observerRefs.current[index] = el}
                data-index={index}
                className={`relative overflow-hidden group cursor-pointer transform transition-all duration-1000 ${
                  index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
                style={{
                  opacity: visibleItems.has(index) ? 1 : 0,
                  transform: `translateY(${visibleItems.has(index) ? '0' : '50px'})`,
                  transition: 'opacity 2s ease-out, transform 2s ease-out'
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <img
                    src={beach.image}
                    alt={beach.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">{beach.name}</h3>
                      <p className="text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                        {beach.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* About Us Section */}
      <section 
        ref={aboutRef}
        className="relative min-h-[600px] bg-cover bg-center bg-fixed overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg)'
        }}
      >
        <div 
          className="absolute inset-0 bg-black/50"
          style={{
            opacity: aboutVisible ? 1 : 0,
            transition: 'opacity 2s ease-out'
          }}
        />
        <Container className="relative h-full">
          <div 
            className="flex flex-col items-center justify-center min-h-[600px] text-center text-white"
            style={{
              opacity: aboutVisible ? 1 : 0,
              transform: `translateY(${aboutVisible ? '0' : '30px'})`,
              transition: 'opacity 2s ease-out, transform 2s ease-out'
            }}
          >
            <div className="mb-8">
              <Link 
                to="/direct"
                className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
                data-cta="cta_click" 
                data-label="beaches_book_direct" 
                data-page="beaches"
              >
                Book Direct for Best Rate
              </Link>
            </div>
            <h2 className="text-5xl font-light mb-8 tracking-wider">
              WE DO BETTER
            </h2>
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
    </>
  );
};

export default BeachesSection;