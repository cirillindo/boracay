// src/types/index.ts
// This file contains all your existing interfaces plus the new ones for Checkin and CheckinRoomDetail.

export interface Property {
  id: string;
  title: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  land_size?: number;
  lot_size?: number;
  location: string;
  location_name?: string;
  status: string;
  property_type: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  user_id?: string;
  grid_photo?: string;
  grid_photo_overlay?: string;
  map_url?: string;
  map_coordinates?: any;
  hero_image?: string;
  photo_dimensions?: any;
  furnish_status?: string;
  label?: string;
  description?: string;
  is_for_sale?: boolean;
  is_for_rent?: boolean;
  airbnb_url?: string;
  nightly_rate_min?: number;
  nightly_rate_max?: number;
  max_occupancy?: number;
  rating?: number;
  seo_title?: string;
  seo_keywords?: string[];
  seo_description?: string;
  seo_image?: string;
  property_category?: string;
  features?: any;
  policy?: any;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_url?: string;
  og_type?: string;
  og_locale?: string;
  images?: any[];
  earnings_info?: string;
  legal_info?: string;
  pdf_url?: string;
  pdf_name?: string;
  selectedCurrency?: string;
  slug?: string;
  display_order?: number;
}

export interface Room {
  id: string;
  room_name: string;
  property_id: string;
  number_of_beds: number;
  bed_type?: string;
  has_cabinet: boolean;
  has_sofas: boolean;
  has_balcony: boolean;
  has_stairs: boolean;
  created_at: string;
  updated_at: string;
}

export interface ThingToNote {
  id: string;
  property_id: string;
  title: string;
  description: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  hero_image?: string;
  price_php?: number;
  base_price_php?: number;
  is_most_sold?: boolean;
  is_top_product?: boolean;
  category?: string;
  min_pax?: number;
  type: 'activity' | 'package';
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  hero_image: string;
  slug?: string;
  price_php: number;
  price_type: string;
  min_pax: number;
  max_pax: number | null;
  duration_minutes: number | null;
  is_top_product: boolean;
  is_most_sold: boolean;
  category: string;
  created_at: string;
  updated_at: string;
  is_online?: boolean;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  hero_image: string;
  slug?: string;
  base_price_php: number;
  is_top_product: boolean;
  is_most_sold: boolean;
  is_sold_out?: boolean;
  min_pax?: number;
  min_nights?: number;
  max_nights?: number;
  whatsapp_number?: string;
  created_at: string;
  updated_at: string;
  is_sold_out?: boolean;
  promo_code?: string;
  promo_discount_percentage?: number;
}

export interface PackageActivityItem {
  package_id: string;
  activity_id: string;
  quantity: number;
  notes?: string;
  custom_price?: number;
}

export interface Booking {
  custom_price?: number;
  id: string;
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  base_property_price_php: number;
  user_id?: string;
  status: string;
  total_amount_php: number;
  created_at: string;
  updated_at: string;
}

export interface BookingAddon {
  id: string;
  booking_id: string;
  addon_type: string;
  addon_id: string;
  quantity: number;
  selected_date?: string;
  price_at_booking_php: number;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  id_document_url?: string;
  phone_number?: string;
  whatsapp_number?: string;
  facebook_profile_url?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  users?: { email: string };
}

export interface TodoItem { // New interface for TodoItem
  id: string;
  assigned_to_staff_id: string;
  assigned_by_user_id: string;
  task_description: string;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  admin_remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  excerpt: string;
  image_url: string;
  location: string;
  price_range: string;
  price_level: number;
  rating: number;
  rating_count: number;
  cuisine_type: string;
  features: string[];
  specialties: string[];
  atmosphere: string;
  instagram?: string;
  facebook?: string;
  menu_url?: string;
  phone?: string;
  hours?: string;
  created_at: string;
}

export interface BlogSection {
  id: string;
  title: string;
  content: string;
  images: string[];
  youtubeUrls: string[];
  icon: React.ReactNode;
}

// NEW INTERFACES FOR CHECK-IN FEATURE
export interface Checkin {
  id: string;
  check_in_date: string; // ISO date string
  check_out_date: string; // ISO date string
  arrival_time?: string; // e.g., "14:00"
  notes?: string;
  status: 'pending' | 'checked_in' | 'checked_out' | 'cancelled';
  created_at: string;
  updated_at: string;
  user_id?: string;
  user_profile?: { username: string }; // Corrected: This is the correct type for the joined data
  checkin_room_details?: CheckinRoomDetail[]; // Nested details for display
  total_amount_eur?: number; // NEW: Total amount for the check-in in EUR
}

export interface CheckinRoomDetail {
  id: string;
  checkin_id: string;
  room_id: string;
  pax_count: number;
  created_at: string;
  updated_at: string;
  price_per_night_eur?: number; // NEW: Price per night for this room in EUR
  // Optional: for display purposes, if joined with rooms
  rooms?: { room_name: string };
}

