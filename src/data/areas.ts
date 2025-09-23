// src/data/areas.ts

const propertyTypes = [
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
  { value: 'house', label: 'House' },
  { value: 'lot', label: 'Lot' }
];

export const priceRanges = [
  { min: 50000, max: 100000, label: '€50,000 - €100,000' },
  { min: 100000, max: 200000, label: '€100,000 - €200,000' },
  { min: 200000, max: 300000, label: '€200,000 - €300,000' },
  { min: 300000, max: 400000, label: '€300,000 - €400,000' },
  { min: 400000, max: 500000, label: '€400,000 - €500,000' },
  { min: 500000, max: 600000, label: '€500,000 - €600,000' }
];

export const bedroomOptions = [
  { value: 1, label: '1 Bedroom' },
  { value: 2, label: '2 Bedrooms' },
  { value: 3, label: '3 Bedrooms' },
  { value: 4, label: '4 Bedrooms' },
  { value: 5, label: '5+ Bedrooms' }
];

const areas = [
  {
    id: 'Diniwid',
    name: 'Diniwid Beach',
    description: `A peaceful beachside community with a laid-back island vibe. Our cozy homes are perfectly situated near everything you need:
    • 4 minutes walk to Diniwid Beach
    • 6 minutes walk to Citymall
    • 10 minutes walk to Station 1
    • 10 minutes by E-trike to D'Mall
    • 4 minutes walk to Dinibeach Bar
    • 7 minutes walk to Fairways Golf`,
    coordinates: { lat: 11.9929, lng: 121.9124 }
  },
  {
    id: 'Monaco Suites',
    name: 'Monaco Suites',
    description: 'Premium location with modern amenities and convenient access to Boracay attractions.',
    coordinates: { lat: 11.9700, lng: 121.9200 }
  },
  {
    id: 'Bulabog',
    name: 'Bulabog',
    description: 'Known for water sports and windsurfing, offering a more active beachside lifestyle.',
    coordinates: { lat: 11.9600, lng: 121.9300 }
  },
  {
    id: 'Yapak',
    name: 'Yapak',
    description: 'Northern part of Boracay, home to Puka Beach and luxury resorts.',
    coordinates: { lat: 11.9850, lng: 121.9150 }
  },
  {
    id: 'Bantud',
    name: 'Bantud',
    description: 'Residential area near Yapak, offering a quieter island living experience.',
    coordinates: { lat: 11.9900, lng: 121.9100 }
  },
  {
    id: 'New Coast',
    name: 'New Coast',
    description: 'An integrated tourism estate with a golf course and private beaches.',
    coordinates: { lat: 11.9780, lng: 121.9350 }
  },
  {
    id: 'White Beach',
    name: 'White Beach',
    description: 'The iconic 4km stretch of white sand, known for its vibrant atmosphere and stunning sunsets.',
    coordinates: { lat: 11.965, lng: 121.925 }
  },
  {
    id: 'Station 1',
    name: 'Station 1',
    description: 'The northernmost and most upscale part of White Beach, known for its luxury resorts and fine dining.',
    coordinates: { lat: 11.968, lng: 121.923 }
  },
  {
    id: 'Station 2',
    name: 'Station 2',
    description: 'The central and most bustling part of White Beach, with D\'Mall, restaurants, and nightlife.',
    coordinates: { lat: 11.963, lng: 121.924 }
  },
  {
    id: 'Station 3',
    name: 'Station 3',
    description: 'The southernmost and more laid-back part of White Beach, popular for budget accommodations and water activities.',
    coordinates: { lat: 11.958, lng: 121.925 }
  }
];

export default areas;
