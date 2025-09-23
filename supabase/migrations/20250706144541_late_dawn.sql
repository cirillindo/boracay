/*
  # Create activities table

  1. New Tables
    - `activities`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text)
      - `hero_image` (text)
      - `price_php` (numeric, required)
      - `price_type` (text, required)
      - `min_pax` (integer, default 1)
      - `max_pax` (integer)
      - `duration_minutes` (integer)
      - `is_top_product` (boolean, default false)
      - `is_most_sold` (boolean, default false)
      - `category` (text, required)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `activities` table
    - Add policy for public read access
    - Add policies for authenticated users to manage activities

  3. Triggers
    - Add trigger to automatically update updated_at timestamp
*/

-- Create the activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  hero_image text,
  price_php numeric NOT NULL,
  price_type text NOT NULL, -- 'per_pax', 'fixed_price', 'per_duration', 'per_item'
  min_pax integer DEFAULT 1,
  max_pax integer,
  duration_minutes integer,
  is_top_product boolean DEFAULT false,
  is_most_sold boolean DEFAULT false,
  category text NOT NULL, -- 'water_sports', 'wellness', 'food_drink', 'transfer', 'rental', 'cake', 'drinks'
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add comments for clarity
COMMENT ON TABLE public.activities IS 'Stores individual activities and transfer options available for booking.';
COMMENT ON COLUMN public.activities.name IS 'Name of the activity.';
COMMENT ON COLUMN public.activities.description IS 'Detailed description of the activity.';
COMMENT ON COLUMN public.activities.hero_image IS 'URL for the main image of the activity.';
COMMENT ON COLUMN public.activities.price_php IS 'Price of the activity in PHP.';
COMMENT ON COLUMN public.activities.price_type IS 'Type of pricing: per_pax, fixed_price, per_duration, per_item.';
COMMENT ON COLUMN public.activities.min_pax IS 'Minimum number of participants required for the activity.';
COMMENT ON COLUMN public.activities.max_pax IS 'Maximum number of participants allowed for the activity.';
COMMENT ON COLUMN public.activities.duration_minutes IS 'Duration of the activity in minutes.';
COMMENT ON COLUMN public.activities.is_top_product IS 'Flag to mark if the activity is a top product.';
COMMENT ON COLUMN public.activities.is_most_sold IS 'Flag to mark if the activity is a most sold product.';
COMMENT ON COLUMN public.activities.category IS 'Category of the activity (e.g., water_sports, wellness).';

-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access
CREATE POLICY "Allow public read access to activities"
  ON public.activities
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert their own activities (if applicable, or restrict to admin)
CREATE POLICY "Authenticated users can insert activities"
  ON public.activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL); -- Adjust this check if only specific users/roles can insert

-- Allow authenticated users to update their own activities (if applicable, or restrict to admin)
CREATE POLICY "Authenticated users can update activities"
  ON public.activities
  FOR UPDATE
  TO authenticated
  USING (true) -- Adjust this check if only specific users/roles can update
  WITH CHECK (true);

-- Allow authenticated users to delete their own activities (if applicable, or restrict to admin)
CREATE POLICY "Authenticated users can delete activities"
  ON public.activities
  FOR DELETE
  TO authenticated
  USING (true); -- Adjust this check if only specific users/roles can delete

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();