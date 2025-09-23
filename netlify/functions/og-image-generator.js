const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with fast timeout
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false },
    global: {
      fetch: (url, options) => {
        const controller = new AbortController();
        // MODIFIED: Increased timeout from 5000ms to 60000ms
        const timeout = setTimeout(() => controller.abort(), 60000); 
        return fetch(url, { ...options, signal: controller.signal })
          .finally(() => clearTimeout(timeout));
      }
    }
  }
);

// List of social media crawlers
const CRAWLERS = [
  'facebookexternalhit',
  'WhatsApp',
  'Twitterbot',
  'LinkedInBot',
  'TelegramBot',
  'Discordbot',
  'Slackbot',
  'Googlebot',
  'bingbot',
  'Applebot',
  'prerender'
];

// Default OG configuration
const DEFAULT_CONFIG = {
  title: "Boracay.House – Property in Boracay, Made Simple",
  description: "Your source for Boracay Properties for sale, trusted local rentals, and insider travel tips.",
  image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1749293212/05_marketing_copy_xqzpsf.jpg",
  type: "website"
};

// Special page configurations
const SPECIAL_PAGES = {
  '/airbnb': {
    title: "Airbnb Rentals in Boracay – Villas & Homes",
    description: "Find verified Airbnb-style rentals in Boracay with local support.",
    image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677155/31_marketing_copy_ydbeuh.jpg"
  },
  '/for-sale': {
    title: "Boracay Properties for Sale – Villas & Land",
    description: "Smart property listings in Boracay with clean titles and legal clarity.",
    image: "https://res.cloudinary.com/dq3fftsfa/image/upload/v1750677233/38_marketing_copy_j9vspj.jpg"
  }
  // Add other special pages as needed
};

exports.handler = async (event, context) => {
  // Critical: Prevent function from hanging
  context.callbackWaitsForEmptyEventLoop = false;

  const { path } = event;
  const userAgent = event.headers['user-agent'] || '';
  const host = event.headers.host;
  const fullUrl = `https://${host}${path}`;
  const now = Date.now();

  // Check if request is from a known crawler
  const isCrawler = CRAWLERS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );

  // If not a crawler, redirect to the actual page WITHOUT any HTML
  if (!isCrawler) {
    try {
      // Fetch the main index.html file for SPA routing
      const baseUrl = `https://${host}`;
      const indexResponse = await fetch(`${baseUrl}/`, {
        headers: {
          'User-Agent': 'Netlify-Function-Internal'
        }
      });
      
      if (!indexResponse.ok) {
        throw new Error(`Failed to fetch index.html: ${indexResponse.status}`);
      }
      
      const indexHtml = await indexResponse.text();
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=0, must-revalidate'
        },
        body: indexHtml
      };
    } catch (error) {
      console.error('Error fetching index.html:', error);
      // Fallback to a simple redirect if we can't read the file
      return {
        statusCode: 302,
        headers: { 
          'Location': '/',
          'Cache-Control': 'no-cache'
        },
        body: ''
      };
    }
  }

  // Start with default values
  let ogData = { ...DEFAULT_CONFIG, url: fullUrl };

  // Check for special page configuration
  if (SPECIAL_PAGES[path]) {
    ogData = { ...ogData, ...SPECIAL_PAGES[path] };
  } 
  // Handle blog post pages
  else if (path.startsWith('/blog/')) {
    try {
      // Extract slug from blog URL path
      // Blog URLs are in format: /blog/category-slug/post-slug
      const pathSegments = path.split('/').filter(Boolean);
      if (pathSegments.length >= 3 && pathSegments[0] === 'blog') {
        const postSlug = pathSegments[2]; // Get the post slug
        
        console.log(`[OG Function] Blog: Extracted slug: ${postSlug}`); // ADDED LOG
        const { data, error } = await supabase
          .from('blog_posts')
          .select('title, excerpt, image_url, og_title, og_description, og_image, og_url, og_type, seo_title, seo_description')
          .eq('slug', postSlug)
          .eq('published', true)
          .maybeSingle();

        if (error) {
          console.error(`[OG Function] Blog: Supabase query error for slug ${postSlug}:`, error); // ADDED LOG
        } else if (data) {
          console.log(`[OG Function] Blog: Supabase data for slug ${postSlug}:`, data); // ADDED LOG
          ogData = {
            title: data.og_title || data.seo_title || data.title || ogData.title,
            description: data.og_description || data.seo_description || data.excerpt || ogData.description,
            image: data.og_image || data.image_url || ogData.image,
            url: data.og_url || fullUrl,
            type: data.og_type || 'article'
          };
        } else {
          console.log(`[OG Function] Blog: No data found for slug ${postSlug}`); // ADDED LOG
        }
      }
    } catch (error) {
      console.error('[OG Function] Blog: Unexpected error during blog post fetch:', error); // ADDED LOG
    }
  }
  // Handle property pages
  else {
    const slug = path.split('/').filter(Boolean).pop();
    // Only treat as property if it's a single segment path (not a multi-segment blog path)
    if (slug && !path.includes('/blog/')) {
      try {
        console.log(`[OG Function] Property: Extracted slug: ${slug}`); // ADDED LOG
        const { data, error } = await supabase
          .from('properties')
          .select('title, description, hero_image, grid_photo, og_title, og_description, og_image, og_url, og_type')
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.error(`[OG Function] Property: Supabase query error for slug ${slug}:`, error); // ADDED LOG
        } else if (data) {
          console.log(`[OG Function] Property: Supabase data for slug ${slug}:`, data); // ADDED LOG
          ogData = {
            title: data.og_title || data.title || ogData.title,
            description: data.og_description || 
              (data.description ? data.description.substring(0, 160).replace(/<[^>]*>/g, '') : ogData.description),
            image: data.og_image || data.hero_image || data.grid_photo || ogData.image,
            url: fullUrl,
            type: data.og_type || 'article'
          };
        } else {
          console.log(`[OG Function] Property: No data found for slug ${slug}`); // ADDED LOG
        }
      } catch (error) {
        console.error('[OG Function] Property: Unexpected error during property fetch:', error); // ADDED LOG
      }
    }
  }

  console.log(`[OG Function] ogData.image BEFORE final processing: ${ogData.image}`); // ADDED LOG
  // Process image URL
  ogData.image = ogData.image.startsWith('http') 
    ? ogData.image.includes('?') 
      ? ogData.image.split('?')[0] + `?t=${now}`
      : ogData.image + `?t=${now}`
    : `https://${host}${ogData.image.startsWith('/') ? '' : '/'}${ogData.image}?t=${now}`;

  console.log(`[OG Function] Final ogData.image: ${ogData.image}`); // ADDED LOG

  // Generate HTML response ONLY for crawlers
  return {
    statusCode: 200,
    headers: { 
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600'
    },
    body: `<!DOCTYPE html>
<html prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <title>${ogData.title}</title>
  <meta name="description" content="${ogData.description}">
  <meta property="og:title" content="${ogData.title}">
  <meta property="og:description" content="${ogData.description}">
  <meta property="og:image" content="${ogData.image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${ogData.url}">
  <meta property="og:type" content="${ogData.type}">
  <meta property="og:site_name" content="Boracay.House">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${ogData.title}">
  <meta name="twitter:description" content="${ogData.description}">
  <meta name="twitter:image" content="${ogData.image}">
</head>
<body>
  <div style="display:none">
    <h1>${ogData.title}</h1>
    <p>${ogData.description}</p>
    <img src="${ogData.image}" alt="${ogData.title}">
  </div>
</body>
</html>`
  };
};
