const slugify = (text: string): string => {
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

const categorySlugMap: Record<string, string> = {
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

export const getCategorySlug = (category: string): string => {
  return categorySlugMap[category] || slugify(category);
};

export const getCategoryFromSlug = (slug: string): string => {
  const entry = Object.entries(categorySlugMap).find(([_, value]) => value === slug);
  return entry ? entry[0] : slug;
};

export const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};