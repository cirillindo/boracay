import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from '../components/ui/Container';
import { Search, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCategoryFromSlug, getCategorySlug } from '../utils/slugify';

interface BlogPost {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  created_at: string;
  image_url: string;
  slug: string;
  published: boolean;
}

const POSTS_PER_PAGE = 12;

const BlogCategoryPage: React.FC = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [visiblePosts, setVisiblePosts] = useState<Set<number>>(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);

  // Default SEO values for the Blog Category Page
  const defaultSeoTitle = `${categoryName} | Boracay.house Blog`;
  const defaultSeoDescription = getCategoryDescription(categoryName);
  const defaultSeoKeywords = "boracay blog, boracay travel tips, boracay culture, boracay real estate news, boracay events guide"; // Generic fallback
  const defaultOgImage = "https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677314/20_marketing_copy_evoyjn.jpg"; // Generic blog image
  const categoryName = categorySlug ? getCategoryFromSlug(categorySlug) : '';

  useEffect(() => {
    setHeaderVisible(true);
    if (categorySlug) {
      loadPosts();
    }
  }, [categorySlug, currentPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisiblePosts((prev) => new Set([...prev, index]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    document.querySelectorAll('.blog-post-item').forEach((post) => {
      observer.observe(post);
    });

    return () => observer.disconnect();
  }, [posts]);

  const loadPosts = async () => {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .eq('published', true)
        .eq('category', categoryName);

      const { count } = await query;
      setTotalPosts(count || 0);

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE - 1);

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      setError('Error loading blog posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const getCategoryDescription = (category: string) => {
    const descriptions: Record<string, string> = {
      "BORACAY'S GUIDE": "Complete guides to living, visiting, and investing in Boracay Island",
      'TIPS': "Practical tips and advice for Boracay property owners and visitors",
      'INFO': "Essential information about Boracay real estate and island life",
      'NEWS': "Latest news and updates from Boracay's real estate market",
      'TOP PICKS': "Our curated selection of the best properties and opportunities",
      'FOR BUYER': "Everything you need to know about buying property in Boracay",
      'PLACES TO VISIT': "Discover the best spots and hidden gems around Boracay",
      'LIVING IN BORACAY': "Insights into daily life and living as an expat in Boracay",
      'OPPORTUNITIES': "Investment opportunities and business prospects in Boracay",
      'TRANSPORTATION': "Getting around Boracay and travel information",
      'ETRIKE': "E-trike transportation guide and tips for Boracay",
      'CATICLAN AIRPORT': "Travel information and tips for Caticlan Airport",
      'SPORTS IN BORACAY': "Sports activities and recreational opportunities",
      'ACTIVITIES IN BORACAY': "Things to do and activities to enjoy in Boracay"
    };
    return descriptions[category] || `Articles about ${category.toLowerCase()}`;
  };

  if (!categorySlug) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-32" />
        <Container>
          <div className="py-16 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600">The category you're looking for doesn't exist.</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={defaultSeoTitle}
        description={defaultSeoDescription}
        keywords={defaultSeoKeywords}
        ogImage={defaultOgImage}
        url={`https://www.boracay.house/blog/${categorySlug}`}
        type="blog"
      />
      <div className="min-h-screen bg-white">
        <div className="h-32" />
        
        <Container className="py-16">
          <div 
            className="text-center mb-16 transform transition-all duration-1000"
            style={{
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
            <div className="flex items-center justify-center mb-6">
              <Link 
                to="/blog"
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Blog
              </Link>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {categoryName}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {getCategoryDescription(categoryName)}
            </p>
            
            <div className="mt-4">
              <span className="inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                {totalPosts} {totalPosts === 1 ? 'Article' : 'Articles'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                  <article 
                    key={post.id} 
                    className="blog-post-item group"
                    data-index={index}
                    style={{
                      opacity: visiblePosts.has(index) ? 1 : 0,
                      transform: `translateY(${visiblePosts.has(index) ? '0' : '40px'})`,
                      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      transitionDelay: `${index * 100}ms`
                    }}
                  >
                    <Link to={`/blog/${categorySlug}/${post.slug}`} className="block">
                      <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-amber-600 text-xs font-medium">
                              {post.category}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {formatDate(post.created_at)}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2 mb-3">
                            {post.title}
                          </h2>
                          <p className="text-gray-600 line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-12">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Articles Found</h2>
              <p className="text-gray-600 mb-8">
                There are no published articles in this category yet.
              </p>
              <Button onClick={() => navigate('/blog')}>
                Browse All Articles
              </Button>
            </div>
          )}
        </Container>
      </div>
    </>
  );
};

export default BlogCategoryPage;