import RSS from 'rss';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Dynamically import JSDOM to handle potential missing dependency gracefully
let JSDOM;
try {
  const jsdomModule = await import('jsdom');
  JSDOM = jsdomModule.JSDOM;
} catch (error) {
  console.warn('JSDOM not available. HTML content will not be cleaned for RSS feed.');
  JSDOM = null;
}

// --- Embedded slugify functions from src/utils/slugify.ts ---
const slugify = (text) => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

const categorySlugMap = {
  "BORACAY'S GUIDE": 'boracay-guide',
  'TIPS': 'tips',
  'INFO': 'info',
  'NEWS': 'news',
  'TOP PICKS': 'top-picks',
  'FOR BUYER': 'buying',
  'PLACES TO VISIT': 'places-to-visit',
  'LIVING IN BORACAY': 'island-life',
  'OPPORTUNITIES': 'opportunities',
  'TRANSPORTATION': 'transportation',
  'ETRIKE': 'etrike',
  'CATICLAN AIRPORT': 'caticlan-airport',
  'SPORTS IN BORACAY': 'sports',
  'ACTIVITIES IN BORACAY': 'activities'
};

const getCategorySlug = (category) => {
  return categorySlugMap[category] || slugify(category);
};
// --- End embedded slugify functions ---

dotenv.config(); // Load environment variables

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Skipping RSS generation.');
  console.log('To enable RSS generation, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your build environment.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Cleans HTML content for RSS feed consumption.
 * - Removes <style>, <script>, <iframe>, and <svg> tags.
 * - Converts relative URLs to absolute URLs.
 * - Ensures HTML entities are properly escaped.
 * @param {string} htmlString The raw HTML content.
 * @param {string} baseUrl The base URL for converting relative paths.
 * @returns {string} The cleaned HTML string.
 */
function cleanHtmlForRss(htmlString, baseUrl) {
  // If JSDOM is not available, return the original content
  if (!JSDOM) {
    console.warn('Skipping HTML cleaning due to missing JSDOM dependency');
    return htmlString;
  }

  const dom = new JSDOM(htmlString);
  const document = dom.window.document;

  // 1. Remove problematic tags
  ['style', 'script', 'iframe', 'svg'].forEach(tagName => {
    const elements = document.querySelectorAll(tagName);
    elements.forEach(el => el.remove());
  });

  // 2. Convert relative URLs to absolute
  const elementsWithSrc = document.querySelectorAll('[src]');
  elementsWithSrc.forEach(el => {
    const src = el.getAttribute('src');
    if (src && !src.startsWith('http://') && !src.startsWith('https://')) {
      el.setAttribute('src', new URL(src, baseUrl).href);
    }
  });

  const elementsWithHref = document.querySelectorAll('[href]');
  elementsWithHref.forEach(el => {
    const href = el.getAttribute('href');
    if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('#')) {
      el.setAttribute('href', new URL(href, baseUrl).href);
    }
  });

  // 3. Get the cleaned HTML. JSDOM's serialize handles HTML entity escaping.
  return document.body.innerHTML;
}


async function generateRssFeed() {
  try {
    console.log('Starting RSS feed generation...');
    
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('title, excerpt, content, created_at, slug, category, image_url')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log(`Found ${posts?.length || 0} published posts`);

    const siteUrl = 'https://boracay.house';

    const feed = new RSS({
      title: 'Boracay.House Blog',
      description: 'Your guide to Boracay: transfers, ideas, tips, weather, events, rental, real estate deals and lifestyle articles.',
      feed_url: `${siteUrl}/rss.xml`,
      site_url: siteUrl,
      image_url: 'https://res.cloudinary.com/dq3fftsfa/image/upload/v1747138852/logo_Ilaw_ilaw_on7nwc.avif', // Your blog logo
      managingEditor: 'ilawilawvilla@gmail.com (Boracay.House)',
      webMaster: 'ilawilawvilla@gmail.com (Boracay.House)',
      copyright: `${new Date().getFullYear()} Boracay.House`,
      language: 'en',
      pubDate: new Date().toUTCString(),
      ttl: '60', // Cache for 60 minutes
      custom_namespaces: {
        'media': 'http://search.yahoo.com/mrss/',
        'atom': 'http://www.w3.org/2005/Atom',
        'dc': 'http://purl.org/dc/elements/1.1/'
      }
    });

    posts.forEach(post => {
      const postUrl = `${siteUrl}/blog/${getCategorySlug(post.category)}/${post.slug}`;
      const cleanedContent = cleanHtmlForRss(post.content, siteUrl);

      feed.item({
        title: post.title,
        description: post.excerpt,
        url: postUrl,
        guid: post.slug, // Unique identifier for the item
        author: 'Boracay.House',
        date: post.created_at,
        custom_elements: [
          { 'content:encoded': { _cdata: cleanedContent } },
          { 'media:content': {
              _attr: {
                url: post.image_url,
                type: 'image/jpeg', // Adjust type based on your image format
                medium: 'image'
              }
            }
          }
        ]
      });
    });

    const rssXml = feed.xml({ indent: true });
    
    // Ensure the dist directory exists
    const fs = await import('fs');
    const path = await import('path');
    const distPath = path.resolve(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath);
    }

    fs.writeFileSync(path.resolve(distPath, 'rss.xml'), rssXml);
    console.log('RSS feed generated successfully at dist/rss.xml');
  } catch (err) {
    console.error('Error generating RSS feed:', err);
    // Don't exit with error code to prevent build failure
    console.warn('RSS feed generation failed, but continuing build process');
  }
}

generateRssFeed();
