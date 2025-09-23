import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { Star, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase, testSupabaseConnection } from '../../lib/supabase';

interface GuestReview {
  id: string;
  reviewer_name: string;
  review_text: string;
  rating: number;
  review_period: string;
  profile_image_url?: string;
  country?: string;
}

const GuestReviews: React.FC = () => {
  const navigate = useNavigate();
  const [titleVisible, setTitleVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [reviews, setReviews] = useState<GuestReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const REVIEWS_PER_PAGE = 3;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTitleVisible(true);
          setTimeout(() => setContentVisible(true), 500);
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (!isPaused && reviews.length > REVIEWS_PER_PAGE && isVisible) {
      const interval = setInterval(() => {
        setCurrentPage(prev => {
          const nextPage = prev + 1;
          if (nextPage > Math.ceil(totalReviews / REVIEWS_PER_PAGE)) {
            setIsTransitioning(false);
            setTimeout(() => {
              setCurrentPage(1);
              setIsTransitioning(true);
            }, 500);
            return prev;
          }
          return nextPage;
        });
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isPaused, reviews.length, totalReviews, isVisible]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      setConnectionError(false);

      // Test connection first
      const connectionTest = await testSupabaseConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.error}`);
      }

      const { data, error } = await supabase
        .from('guest_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      const originalReviews = data || [];
      setTotalReviews(originalReviews.length);
      setReviews(originalReviews);
      
      if (originalReviews.length === 0) {
        setError('No reviews found');
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('NetworkError') || err.message.includes('fetch')) {
          setConnectionError(true);
          setError('Unable to connect to the database. Please check your internet connection and try again.');
        } else if (err.message.includes('Connection failed')) {
          setConnectionError(true);
          setError('Database connection failed. Please check your configuration.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred while loading reviews');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleReview = (id: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => {
      if (prev === 1) {
        return Math.ceil(totalReviews / REVIEWS_PER_PAGE);
      }
      return prev - 1;
    });
  };

  const handleNextPage = () => {
    setCurrentPage(prev => {
      if (prev >= Math.ceil(totalReviews / REVIEWS_PER_PAGE)) {
        return 1;
      }
      return prev + 1;
    });
  };

  const getPaginationRange = () => {
    const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);
    const range: (number | string)[] = [];
    
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      range.push(1, 2, 3, 4, '...', totalPages - 1, totalPages);
    } else if (currentPage >= totalPages - 2) {
      range.push(1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      range.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return range;
  };

  const getCurrentReviews = () => {
    const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
    return reviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);
  };

  const getReviewRange = () => {
    const start = (currentPage - 1) * REVIEWS_PER_PAGE + 1;
    const end = Math.min(currentPage * REVIEWS_PER_PAGE, totalReviews);
    return `${start}-${end}`;
  };

  const handleRetry = () => {
    loadReviews();
  };

  return (
    <section 
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dq3fftsfa/image/upload/v1748373995/properties/qjkkbr7dmxpl1bmfx4bv.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <Container className="relative z-10">
        <div 
          className="text-center mb-16 relative z-20"
          style={{
            opacity: titleVisible ? 1 : 0,
            transform: `translateY(${titleVisible ? '0' : '20px'})`,
            transition: 'all 1s ease-out'
          }}
        >
          <h2 className="text-5xl font-bold text-white mb-4">
            What Our Guests Say
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Real experiences from real guests. Discover why our properties consistently receive exceptional reviews and create unforgettable memories.
          </p>
          <Button 
            onClick={() => navigate('/airbnb')}
            className="text-lg"
          >
            Rent for Airbnb →
          </Button>
          <div 
            className="w-24 h-1 bg-amber-500 mx-auto mt-8"
            style={{
              transform: `scaleX(${titleVisible ? 1 : 0})`,
              transition: 'transform 1.5s ease-out',
              transitionDelay: '0.5s'
            }}
          />
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                {connectionError ? 'Connection Error' : 'Error Loading Reviews'}
              </h3>
              <p className="text-red-300 mb-4">{error}</p>
              <Button 
                onClick={handleRetry}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-white">
            <p className="text-xl">No reviews available at the moment.</p>
          </div>
        ) : (
          <>
            <div 
              className="relative px-12"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <button
                onClick={handlePrevPage}
                className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNextPage}
                className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div 
                className="overflow-hidden"
                style={{
                  opacity: contentVisible ? 1 : 0,
                  transform: `translateY(${contentVisible ? '0' : '40px'})`,
                  transition: 'all 1s ease-out',
                  transitionDelay: '0.3s'
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {getCurrentReviews().map((review, index) => (
                    <div 
                      key={`${review.id}-${index}`}
                      className="bg-white rounded-lg p-6 shadow-lg transform transition-all duration-1000"
                      style={{
                        opacity: contentVisible ? 1 : 0,
                        transform: contentVisible 
                          ? 'translateY(0) rotateZ(0deg) scale(1)' 
                          : 'translateY(40px) rotateZ(5deg) scale(0.9)',
                        transition: 'opacity 1s cubic-bezier(0.34, 1.56, 0.64, 1), transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transitionDelay: `${index * 0.1}s`
                      }}
                    >
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${
                              i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        {review.profile_image_url ? (
                          <img
                            src={review.profile_image_url}
                            alt={review.reviewer_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <span className="text-amber-800 text-xl font-semibold">
                              {review.reviewer_name[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{review.reviewer_name}</h3>
                          {review.country && (
                            <p className="text-sm text-amber-600">{review.country}</p>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-600 italic leading-relaxed">
                          {expandedReviews.has(review.id) 
                            ? review.review_text
                            : review.review_text.slice(0, 150) + (review.review_text.length > 150 ? '...' : '')}
                        </p>
                        {review.review_text.length > 150 && (
                          <button
                            onClick={() => toggleReview(review.id)}
                            className="text-amber-600 hover:text-amber-700 text-xs font-medium mt-2"
                          >
                            {expandedReviews.has(review.id) ? 'Read Less' : 'Read More'}
                          </button>
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        {review.review_period}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 mt-8">
              <p className="text-white text-sm">
                Showing {getReviewRange()} of {totalReviews} reviews
              </p>
              <div className="flex items-center gap-2">
                {getPaginationRange().map((page, index) => (
                  <React.Fragment key={index}>
                    {typeof page === 'string' ? (
                      <span className="text-white">...</span>
                    ) : (
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          currentPage === page
                            ? 'bg-amber-500 text-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </>
        )}
      </Container>
    </section>
  );
};

export default GuestReviews;