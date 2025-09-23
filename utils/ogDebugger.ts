export const logOGTags = () => {
  console.group('===== OG TAG DEBUGGER =====');
  console.log('Page Title:', document.title);
  
  const tags = [
    'description',
    'keywords',
    'og:title',
    'og:description',
    'og:image',
    'og:url',
    'og:type',
    'twitter:image',
    'og:image:width',
    'og:image:height'
  ];
  
  tags.forEach(name => {
    const element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    const content = element?.getAttribute('content') || 'NOT FOUND';
    console.log(`${name}: ${content}`);
  });
  
  // Check for cache busting parameter in og:image
  const ogImageElement = document.querySelector('meta[property="og:image"]');
  if (ogImageElement) {
    const ogImageUrl = ogImageElement.getAttribute('content') || '';
    const hasCacheBuster = ogImageUrl.includes('?t=') || ogImageUrl.includes('&t=');
    console.log(`Cache busting parameter present: ${hasCacheBuster ? 'YES' : 'NO'}`);
  }
  
  console.groupEnd();
};