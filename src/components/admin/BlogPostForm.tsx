import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { uploadImage } from '../../lib/cloudinary';
import { ImageIcon, X } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { getCategorySlug } from '../../utils/slugify';

interface BlogPost {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  categories?: string[];
  image_url: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  published: boolean;
  featured_posts?: string[];
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_url?: string;
  og_type?: string;
  og_locale?: string;
  author?: string;
  published_date?: string;
}

interface AvailablePost {
  id: string;
  title: string;
  image_url: string;
}

const CATEGORIES = [
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

const OG_TYPES = [
  { value: 'website', label: 'Website' },
  { value: 'article', label: 'Article' },
  { value: 'blog', label: 'Blog' }
];

const OG_LOCALES = [
  { value: 'en_PH', label: 'English (Philippines)' },
  { value: 'en_US', label: 'English (US)' },
  { value: 'ru_RU', label: 'Russian' },
  { value: 'zh_CN', label: 'Chinese (Simplified)' }
];

const BlogPostForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [publishingToInstagram, setPublishingToInstagram] = useState(false);
  const [instagramError, setInstagramError] = useState<string | null>(null);
  const [availablePosts, setAvailablePosts] = useState<AvailablePost[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const { register, handleSubmit, setValue, watch, reset } = useForm<BlogPost>();

  // Generate a URL-friendly slug from the title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace special chars with hyphens
      .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens
  };

  // Generate the full blog URL
  const generateBlogUrl = (slug: string) => {
    const categorySlug = selectedCategories.length > 0 
      ? getCategorySlug(selectedCategories[0]) 
      : 'uncategorized';
    return `https://boracay.house/blog/${categorySlug}/${slug}`;
  };

  // Load post data when editing
  const loadPost = useCallback(async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        reset(data);
        setImageUrl(data.image_url || '');
        setContent(data.content || '');
        setSelectedPosts(data.featured_posts || []);
        setSelectedCategories(data.categories || [data.category] || []);
        if (data.published_date) {
          setValue('published_date', new Date(data.published_date).toISOString().slice(0, 16));
        }
      }
    } catch (err) {
      setError('Error loading post');
      console.error(err);
    }
  }, [id, reset, setValue]);

  useEffect(() => {
    loadPost();
    loadAvailablePosts();
  }, [loadPost]);

  // Load available posts for featured posts selection
  const loadAvailablePosts = async () => {
    try {
      let query = supabase
        .from('blog_posts')
        .select('id, title, image_url')
        .eq('published', true);
      
      if (id) {
        query = query.neq('id', id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAvailablePosts(data || []);
    } catch (err) {
      console.error('Error loading available posts:', err);
    }
  };

  // Handle image upload
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setLoading(true);
    try {
      const uploadedUrl = await uploadImage(acceptedFiles[0]);
      setImageUrl(uploadedUrl);
      setValue('image_url', uploadedUrl);
      setValue('og_image', uploadedUrl);
    } catch (err) {
      setError('Error uploading image');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  // Remove uploaded image
  const removeImage = () => {
    setImageUrl('');
    setValue('image_url', '');
    setValue('og_image', '');
  };

  // Handle featured post selection
  const handleFeaturedPostChange = (postId: string) => {
    setSelectedPosts(prev => {
      if (prev.includes(postId)) {
        return prev.filter(id => id !== postId);
      }
      if (prev.length < 5) {
        return [...prev, postId];
      }
      return prev;
    });
  };

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  };

  // Generate URL-friendly title from the main title
  const generateUrlTitle = () => {
    const title = watch('title');
    if (!title) return;
    
    setIsGeneratingUrl(true);
    const generatedUrl = generateSlug(title);
    setValue('slug', generatedUrl);
    
    // Update URLs if this is a new post
    if (!id) {
      const blogUrl = generateBlogUrl(generatedUrl);
      setValue('canonical_url', blogUrl);
      setValue('og_url', blogUrl);
    }
    
    setIsGeneratingUrl(false);
  };

  // Publish to Instagram
  const publishToInstagram = async (postData: BlogPost) => {
    try {
      setPublishingToInstagram(true);
      setInstagramError(null);
      
      if (!imageUrl) {
        console.log('No image available for Instagram publishing');
        return;
      }
      
      const response = await axios.post('/.netlify/functions/publish-to-instagram', {
        imageUrl: imageUrl,
        title: postData.title,
        caption: `New blog post: ${postData.title}\n\n${postData.excerpt}\n\nRead more at ${generateBlogUrl(postData.slug || postData.title_url)}`
      });
      
      console.log('Instagram publishing response:', response.data);
      
      if (response.data.success) {
        console.log('Successfully published to Instagram!');
      } else {
        throw new Error(response.data.error || 'Unknown error publishing to Instagram');
      }
    } catch (err: any) {
      console.error('Error publishing to Instagram:', err);
      setInstagramError(err.message || 'Failed to publish to Instagram');
    } finally {
      setPublishingToInstagram(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: BlogPost) => {
    setLoading(true);
    setError('');

    try {
      const slug = data.slug || generateSlug(data.title);
      const categorySlug = selectedCategories.length > 0 
        ? getCategorySlug(selectedCategories[0]) 
        : 'uncategorized';
      const blogUrl = generateBlogUrl(slug);

      const postData = {
        ...data,
        content,
        slug,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        image_url: imageUrl,
        featured_posts: selectedPosts,
        category: selectedCategories[0] || 'UNCATEGORIZED',
        categories: selectedCategories,
        seo_keywords: data.seo_keywords 
          ? (typeof data.seo_keywords === 'string' 
              ? data.seo_keywords.split(',').map(k => k.trim())
              : data.seo_keywords)
          : [],
        og_type: data.og_type || 'website',
        og_locale: data.og_locale || 'en_PH',
        og_url: blogUrl,
        canonical_url: blogUrl,
        og_image: data.og_image || imageUrl,
        author: data.author,
        published_date: data.published_date ? new Date(data.published_date).toISOString() : null,
      };

      const { error: saveError } = id
        ? await supabase
            .from('blog_posts')
            .update(postData)
            .eq('id', id)
        : await supabase
            .from('blog_posts')
            .insert([postData]);

      if (saveError) throw saveError;
      
      if (postData.published && imageUrl) {
        await publishToInstagram({...postData, title_url: slug});
      }
      
      navigate('/admin/blog');
    } catch (err: any) {
      setError(`Error saving blog post: ${err.message}`);
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Watch values for previews
  const title = watch('title');
  const slug = watch('slug');
  const blogUrl = slug ? generateBlogUrl(slug) : '';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-7xl mx-auto">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (can include special characters)
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL-friendly Title
              <button
                type="button"
                onClick={generateUrlTitle}
                disabled={!title || isGeneratingUrl}
                className="ml-2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                {isGeneratingUrl ? 'Generating...' : 'Generate from Title'}
              </button>
            </label>
            <input
              type="text"
              {...register('slug', { required: 'URL-friendly title is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              placeholder="e.g., boracay-travel-guide"
            />
            <p className="mt-1 text-sm text-gray-500">
              This will be used in the URL. Only use letters, numbers, and hyphens.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              {...register('author')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              placeholder="e.g., John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Published Date
            </label>
            <input
              type="datetime-local"
              {...register('published_date')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            
            {imageUrl ? (
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={imageUrl}
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`aspect-video border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ${
                  isDragActive
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-300 hover:border-amber-500 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-gray-600">
                    {isDragActive
                      ? 'Drop the image here...'
                      : 'Drag & drop an image here, or click to select'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories (Select multiple)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((category) => (
                <label
                  key={category}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCategories.includes(category)
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="sr-only"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              {...register('excerpt', { required: 'Excerpt is required' })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Posts (Select up to 5)
            </label>
            <div className="grid grid-cols-2 gap-4">
              {availablePosts.map(post => (
                <div
                  key={post.id}
                  className={`border rounded-lg p-2 cursor-pointer transition-colors ${
                    selectedPosts.includes(post.id)
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                  onClick={() => handleFeaturedPostChange(post.id)}
                >
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  <p className="text-sm font-medium line-clamp-2">{post.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <a href="https://wordtohtml.net/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-600">wordtohtml.net</a>
            </label>
            <RichTextEditor 
              content={content} 
              onChange={setContent}
            />
          </div>

          <div className="bg-amber-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-amber-900 mb-4">SEO Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title (SEO)
                </label>
                <input
                  type="text"
                  {...register('seo_title')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Enter SEO title"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recommended length: 50-60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  {...register('seo_description')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Enter a compelling description for search results"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recommended length: 150-160 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  {...register('seo_keywords')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="e.g., Boracay, travel tips, island life"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Add your main keywords, separated by commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canonical URL
                </label>
                <input
                  type="url"
                  {...register('canonical_url')}
                  autoComplete="off"
                  value={blogUrl}
                  onChange={(e) => setValue('canonical_url', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Set the canonical URL to prevent duplicate content issues
                </p>
              </div>

              <div className="border-t border-amber-100 pt-6">
                <h4 className="text-base font-medium text-amber-900 mb-4">Open Graph Tags (Social Sharing)</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Title
                    </label>
                    <input
                      type="text"
                      {...register('og_title')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      placeholder="Title for social media sharing"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Description
                    </label>
                    <textarea
                      {...register('og_description')}
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      placeholder="Brief, compelling description for social media"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Image URL
                    </label>
                    <input
                      type="url"
                      {...register('og_image')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      placeholder="https://www.boracay.house/images/your-post-og.jpg"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Recommended size: 1200x630px
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG URL
                    </label>
                    <input
                      type="url"
                      {...register('og_url')}
                      autoComplete="off"
                      value={blogUrl}
                      onChange={(e) => setValue('og_url', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OG Type
                      </label>
                      <select
                        {...register('og_type')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      >
                        {OG_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OG Locale
                      </label>
                      <select
                        {...register('og_locale')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      >
                        {OG_LOCALES.map(locale => (
                          <option key={locale.value} value={locale.value}>
                            {locale.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Google Search Preview</h4>
                <div className="space-y-1">
                  <div className="text-[#1a0dab] text-xl hover:underline cursor-pointer overflow-hidden text-ellipsis">
                    {watch('seo_title') || watch('title') || 'Blog Post Title'}
                  </div>
                  <div className="text-[#006621] text-sm">
                    {blogUrl || `${window.location.origin}/blog/post-url`}
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {watch('seo_description') || watch('excerpt') || 'Add a meta description to see how your post will appear in search results.'}
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Social Media Preview</h4>
                <div className="border rounded-lg overflow-hidden">
                  {imageUrl ? (
                    <img 
                      src={watch('og_image') || imageUrl} 
                      alt="Social media preview" 
                      className="w-full aspect-[1.91/1] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[1.91/1] bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-400 text-sm">Add a Featured Image</p>
                    </div>
                  )}
                  <div className="p-3 space-y-1">
                    <div className="text-sm text-gray-500 uppercase">boracay.house</div>
                    <div className="font-medium line-clamp-1">
                      {watch('og_title') || watch('seo_title') || watch('title') || 'Blog Post Title'}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {watch('og_description') || watch('seo_description') || watch('excerpt') || 'Add a meta description to see how your post will appear when shared.'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">SEO Image</h4>
                <p className="text-sm text-blue-700">
                  The Featured Image will automatically be used for SEO and social sharing. Recommended size: 1200x630px (1.91:1 ratio)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width sections */}
      <div className="space-y-6">
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              {...register('published')}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Publish this post
            </span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="publishToInstagram"
            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Also publish to Instagram when saving (requires image)
          </span>
        </div>

        {/* Instagram Publishing Status */}
        {publishingToInstagram && (
          <div className="mt-4 bg-blue-50 text-blue-700 px-4 py-3 rounded-md flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-2"></div>
            <span>Publishing to Instagram...</span>
          </div>
        )}
        
        {instagramError && (
          <div className="mt-4 bg-red-50 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">Instagram publishing failed:</p>
            <p>{instagramError}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/blog')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Post'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default BlogPostForm;