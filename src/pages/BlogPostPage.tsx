// src/pages/BlogPostPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Container from '../components/ui/Container';
import { supabase } from '../lib/supabase';
import { Calendar, Tag, ArrowLeft, Clock, Star, Heart, Share2, Facebook, Instagram, MessageCircle, Eye } from 'lucide-react';
import Button from '../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { getCategorySlug } from '../utils/slugify';
import RestaurantList from '../components/blog/RestaurantList';
import DynamicBlogContent from '../components/blog/DynamicBlogContent';
import { boracayActivitiesContent } from '../data/boracayActivitiesContent';
import SEO from '../components/SEO';
import { useShoppingCart } from '../context/ShoppingCartContext';
import ProductCarousel from '../components/shared/ProductCarousel';
import { Product } from '../types';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string;
  created_at: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  views?: number;
  likes?: number;
  rating?: number;
  rating_count?: number;
  excerpt?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_url?: string;
  og_type?: string;
  og_locale?: string;
  slug?: string;
}

const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

const BlogPostPage: React.FC = () => {
  const { categorySlug, slug } = useParams();
  const location = useLocation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showRestaurants, setShowRestaurants] = useState(false);
  // Removed: const [showBoracayActivities, setShowBoracayActivities] = useState(false);
  const [interestingProducts, setInterestingProducts] = useState<Product[]>([]);
  const [loadingInterestingProducts, setLoadingInterestingProducts] = useState(false);
  const { addToCart } = useShoppingCart();
  const selectedCurrency = 'PHP'; // Default currency

  // Default SEO values for the Blog Post Page (used as fallbacks)
  const defaultSeoTitle = "Boracay Blog – Travel Tips, Culture & Real Estate";
  const defaultSeoDescription = "Your guide to Boracay: transfers, ideas, tips, weather, events, rental, real estate deals and lifestyle articles.";
  const defaultSeoKeywords = "boracay blog, boracay travel tips, boracay culture, boracay real estate news, boracay events guide";
  const defaultOgImage = "https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677314/20_marketing_copy_evoyjn.jpg"; // Generic blog image
  useEffect(() => {
    loadPost();
    loadFeaturedPosts();
    loadInterestingProducts();
  }, [slug]);

  useEffect(() => {
    // Check if this is the food spots blog post
    if (post?.title.includes('food spots') || post?.title.includes('Food Spots') || 
        post?.title.includes('restaurant') || post?.title.includes('Restaurant') ||
        post?.category === 'Food & Dining') {
      setShowRestaurants(true);
    } else {
      setShowRestaurants(false);
    }

    // Removed: Logic for showBoracayActivities
    // // Check if this is the Boracay activities blog post
    // if (post?.title.includes('Best Things to Do in Boracay') || 
    //     post?.title.includes('activities') || post?.title.includes('Activities') ||
    //     post?.title.includes('Insider Tips')) {
    //   setShowBoracayActivities(true);
    // } else {
    //   setShowBoracayActivities(false);
    // }
  }, [post]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;
      setPost(data);

      // Update view count
      if (data) {
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', data.id);

        if (updateError) console.error('Error updating view count:', updateError);
      }

      // Check if post is liked by current user
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      setIsLiked(likedPosts.includes(data?.id));
    } catch (err) {
      setError('Error loading blog post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .neq('slug', slug)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setFeaturedPosts(data || []);
    } catch (err) {
      console.error('Error loading featured posts:', err);
    }
  };

  const loadInterestingProducts = async () => {
    try {
      setLoadingInterestingProducts(true);
      
      // Load top activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('id, name, hero_image, price_php, is_most_sold, is_top_product, category, min_pax')
        .eq('is_online', true)
        .eq('is_top_product', true);

      if (activitiesError) throw activitiesError;

      // Load top packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('id, name, hero_image, base_price_php, is_most_sold, is_top_product, min_pax')
        .eq('is_top_product', true);

      if (packagesError) throw packagesError;

      // Combine and format the data
      const combinedProducts: Product[] = [
        ...(activitiesData || []).map(activity => ({
          ...activity,
          type: 'activity' as const,
          price_php: activity.price_php
        })),
        ...(packagesData || []).map(pkg => ({
          ...pkg,
          type: 'package' as const,
          base_price_php: pkg.base_price_php
        }))
      ];

      setInterestingProducts(combinedProducts);
    } catch (error) {
      console.error('Error loading interesting products:', error);
    } finally {
      setLoadingInterestingProducts(false);
    }
  };

  const handleAddToCartFromCarousel = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price_php || product.base_price_php || 0,
      selectedDate: new Date(),
      hero_image: product.hero_image,
      min_pax: product.min_pax,
      type: product.type
    }, product.min_pax || 1);
  };

  const handleViewPackage = (packageId: string) => {
    window.open('/promos', '_blank');
  };

  const handleLike = async () => {
    if (!post) return;

    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    const newIsLiked = !isLiked;
    
    if (newIsLiked) {
      likedPosts.push(post.id);
    } else {
      const index = likedPosts.indexOf(post.id);
      if (index > -1) likedPosts.splice(index, 1);
    }
    
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    setIsLiked(newIsLiked);

    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ likes: (post.likes || 0) + (newIsLiked ? 1 : -1) })
        .eq('id', post.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating likes:', err);
    }
  };

  const handleRating = async (rating: number) => {
    if (!post) return;
    setUserRating(rating);

    try {
      const newRatingCount = (post.rating_count || 0) + 1;
      const newRating = ((post.rating || 0) * (post.rating_count || 0) + rating) / newRatingCount;

      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          rating: newRating,
          rating_count: newRatingCount
        })
        .eq('id', post.id);

      if (error) throw error;
      
      // Update the local post state to reflect the new rating
      setPost(prevPost => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          rating: newRating,
          rating_count: newRatingCount
        };
      });
    } catch (err) {
      console.error('Error updating rating:', err);
    }
  };

  const handleShare = async (platform?: string) => {
    // Add cache-busting parameter to URL
    const shareUrl = `${window.location.href}?v=${Date.now()}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'instagram':
        // Instagram doesn't have a direct share URL, open app instead
        window.open('instagram://');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
      default:
        if (navigator.share) {
          try {
            await navigator.share({
              title: post?.title,
              text: post?.seo_description,
              url: shareUrl
            });
          } catch (err) {
            console.error('Error sharing:', err);
          }
        } else {
          setShowShareMenu(!showShareMenu);
        }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-32" />
        <Container>
          <div className="py-16 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Blog Post Not Found
            </h1>
            <p className="text-gray-600">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </Container>
      </div>
    );
  }

  const readTime = calculateReadTime(post.content);

  return (
    <>
      <SEO
        title={post.seo_title || post.title || defaultSeoTitle}
        description={post.seo_description || post.excerpt || defaultSeoDescription}
        keywords={post.seo_keywords?.join(', ') || defaultSeoKeywords}
        ogImage={post.og_image || post.image_url || defaultOgImage}
        url={`https://www.boracay.house${location.pathname}`}
        type={post.og_type || "article"}
        canonical={post.canonical_url || `https://www.boracay.house${location.pathname}`}
        dynamicData={post}
      />

      <div className="min-h-screen bg-white">
        <div className="h-32" />
        
        <div className="relative h-[60vh] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <Container className="relative h-full">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 text-white/80 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  <span>{post.category}</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {post.title}
              </h1>
            </div>
          </Container>
        </div>

        <Container className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-8">
                <div className="flex gap-4">
                  <Link to={`/blog/${getCategorySlug(post.category)}`}>
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to {post.category}
                    </Button>
                  </Link>
                  <Link to="/blog">
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Blog
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 py-2 border-b border-gray-100 mb-8">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{readTime} min read</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{post.views || 0} views</span>
                </div>
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors text-sm"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-amber-600 text-amber-600' : ''}`} />
                  <span>{post.likes || 0}</span>
                </button>

                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (post.rating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">
                    {post.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-gray-500">
                    ({post.rating_count || 0})
                  </span>
                </div>
                
                <div className="relative ml-auto">
                  <button
                    onClick={() => handleShare()}
                    className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  
                  {showShareMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-2 z-50">
                      <button
                        onClick={() => handleShare('facebook')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded w-full text-sm"
                      >
                        <Facebook className="w-4 h-4" />
                        <span>Facebook</span>
                      </button>
                      <button
                        onClick={() => handleShare('instagram')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded w-full text-sm"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>Instagram</span>
                      </button>
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded w-full text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded w-full text-sm"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Copy Link</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Dynamic Content Sections */}
              {/* Render RestaurantList if showRestaurants is true */}
              {showRestaurants ? (
                <section className="my-12">
                  <RestaurantList />
                </section>
              ) : (
                /* Otherwise, render post.content. Use DynamicBlogContent if it contains custom markdown, else dangerouslySetInnerHTML */
                post.content && post.content.includes('##') ? ( // Simple heuristic: if it contains markdown-like headings, use DynamicBlogContent
                  <DynamicBlogContent rawContent={post.content} />
                ) : (
                  <div
                    className="prose max-w-none mb-12"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                )
              )}

              {/* Google Maps section - only for specific blog post */}
              {slug === 'how-to-stay-in-the-philippines-for-3-years-without-leaving' && (
                <section className="mt-12 mb-12">
                  <h2 className="text-2xl font-bold mb-6">Immigration Office Location in Boracay Island</h2>
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12939.676242761416!2d121.91190237083464!3d11.978351312155995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a53d1934f606cd%3A0xf7a2c68edacc6e67!2sRobinsons%20Supermarket%20Station%20B%20Mall%2C%20Boracay!5e0!3m2!1sen!2sat!4v1750583202437!5m2!1sen!2sat" 
                      width="100%" 
                      height="450" 
                      style={{border: 0}} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </section>
              )}

              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Rate this article</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (post.rating || 0)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">
                      {post.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-gray-500">
                      ({post.rating_count || 0})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onMouseEnter={() => setHoverRating(rating)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRating(rating)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= (hoverRating || userRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <Link to="/blog">
                <Button 
                  variant="outline"
                  className="mt-12 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back to Blog Page
                </Button>
              </Link>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-40">
                {/* Interesting Products Section */}
                {!loadingInterestingProducts && interestingProducts.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
                    <ProductCarousel
                      products={interestingProducts}
                      onAddToCart={handleAddToCartFromCarousel}
                      onViewPackage={handleViewPackage}
                      selectedCurrency={selectedCurrency}
                    />
                  </div>
                )}
                
                {loadingInterestingProducts && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                    </div>
                  </div>
                )}

                <h2 className="text-2xl font-bold mb-6">Featured Posts</h2>
                <div className="space-y-6">
                  {featuredPosts.map((featuredPost) => (
                    <Link 
                      key={featuredPost.id} 
                      to={`/blog/${getCategorySlug(featuredPost.category)}/${featuredPost.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-4">
                        <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={featuredPost.image_url}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-amber-600 mb-1">
                            {featuredPost.category}
                          </p>
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                            {featuredPost.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(featuredPost.created_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default BlogPostPage;
