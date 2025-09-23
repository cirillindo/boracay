import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCategorySlug } from '../utils/slugify';
import SEO from '../components/SEO';
import { playSound } from '../utils/audio';

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

interface GuidePost {
  title: string;
  image_url: string;
  created_at: string;
  slug: string;
  category: string;
}

const categories = [
  "BORACAY'S GUIDE",
  'TIPS',
  'INFO',
  'NEWS',
  'TOP PICKS',
  'FOR BUYER',
  'PLACES TO VISIT',
  'LIVING IN BORACAY',
  'OPPORTUNITIES',
  'TRANSPORTATION',
  'ETRIKE',
  'CATICLAN AIRPORT',
  'SPORTS IN BORACAY',
  'ACTIVITIES IN BORACAY'
];

const POSTS_PER_PAGE = 8;

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [guidePosts, setGuidePosts] = useState<GuidePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [visiblePosts, setVisiblePosts] = useState<Set<number>>(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const categoryFilter = searchParams.get('category');

  // Default SEO values for the Blog Page
  const defaultSeoTitle = "Boracay Blog – Travel Tips, Culture & Real Estate";
  const defaultSeoDescription = "Your guide to Boracay: transfers, ideas, tips, weather, events, rental, real estate deals and lifestyle articles.";
  const defaultSeoKeywords = "boracay blog, boracay travel tips, boracay culture, boracay real estate news, boracay events guide";
  const defaultOgImage = "https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677314/20_marketing_copy_evoyjn.jpg";

  useEffect(() => {
    setHeaderVisible(true);
    loadPosts();
    loadGuidePosts();
  }, [currentPage, searchQuery, categoryFilter]);

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
        .ilike('title', `%${searchQuery}%`);

      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }

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

  const loadGuidePosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('title, image_url, created_at, slug, category')
        .eq('published', true)
        .eq('category', "BORACAY'S GUIDE")
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuidePosts(data || []);
    } catch (err) {
      console.error('Error loading guide posts:', err);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscribing email:', email);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const handleSearch = () => {
    setCurrentPage(1);
    loadPosts();
  };

  const handleCategoryClick = (category: string) => {
    setCurrentPage(1);
    navigate(`/blog?category=${encodeURIComponent(category)}`);
  };

  const handleShareLink = (post: BlogPost, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `https://boracay.house/blog/${getCategorySlug(post.category)}/${post.slug}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        playSound('click.mp3');
        setCopiedPostId(post.id);
        setTimeout(() => setCopiedPostId(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };
  return (
    <>
      <SEO
        title={defaultSeoTitle}
        description={defaultSeoDescription}
        keywords={defaultSeoKeywords}
        ogImage={defaultOgImage}
        url="https://www.boracay.house/blog"
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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              EXCEPTIONAL BLOG
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Explore Boracay's vibrant real estate market through our insightful blog.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Our Boracay blog covers everything from real estate trends and Airbnb hosting tips to island life insights and expat stories. Whether you're buying, selling, renting — or just curious — you'll find real stories and practical advice here.
            </p>
            {categoryFilter && (
              <div className="mt-4">
                <span className="inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                  Category: {categoryFilter}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
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
                  <div className="grid grid-cols-2 gap-6">
                    {posts.map((post, index) => (
                      <article 
                        key={post.id} 
                        className="blog-post-item group"
                        data-index={index}
                        style={{
                          opacity: visiblePosts.has(index) ? 1 : 0,
                          transform: `translateY(${visiblePosts.has(index) ? '0' : '40px'})`,
                          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                          transitionDelay: `${index * 150}ms`
                        }}
                      >
                        <Link to={`/blog/${getCategorySlug(post.category)}/${post.slug}`} className="block">
                          <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4 group">
                            <img
                              src={post.image_url}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <button
                              onClick={(e) => handleShareLink(post, e)}
                              className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                              title="Copy link"
                            >
                              {copiedPostId === post.id ? (
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                </svg>
                              )}
                            </button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <span className="text-amber-600 text-xs font-medium">
                                {post.category}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {formatDate(post.created_at)}
                              </span>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                              {post.title}
                            </h2>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {post.excerpt}
                            </p>
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
                  <p className="text-gray-600">No blog posts found.</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="space-y-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <Button type="submit" className="w-full">
                      SUBSCRIBE
                    </Button>
                    <p className="text-sm text-gray-600">
                      We care about your data in our privacy policy.
                    </p>
                  </form>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-4">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category, index) => (
                      <button
                        key={index}
                        onClick={() => handleCategoryClick(category)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                          categoryFilter === category 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-gray-100 hover:bg-amber-100 text-gray-800 hover:text-amber-800'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-4">Boracay's Guide</h3>
                  <div className="space-y-4">
                    {guidePosts.map((post, index) => (
                      <div key={index} className="flex gap-4 group">
                        <Link 
                          to={`/blog/${getCategorySlug(post.category)}/${post.slug}`}
                          className="flex gap-4 group cursor-pointer flex-1"
                        >
                        <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden">
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium group-hover:text-amber-600 transition-colors line-clamp-2 mb-1">
                            {post.title}
                          </h4>
                          <span className="text-xs text-gray-500">{formatDate(post.created_at)}</span>
                        </div>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const shareUrl = `https://boracay.house/promos`;
                            navigator.clipboard.writeText(shareUrl)
                              .then(() => {
                                setCopiedPostId(post.slug);
                                setTimeout(() => setCopiedPostId(null), 2000);
                              })
                              .catch(err => console.error('Failed to copy link: ', err));
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Copy link"
                        >
                          {copiedPostId === post.slug ? (
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default BlogPage;
