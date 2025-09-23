/*
  # Create packages table

  1. New Tables
    - `packages`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text)
      - `hero_image` (text)
      - `base_price_php` (numeric, required)
      - `is_top_product` (boolean, default false)
      - `is_most_sold` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `packages` table
    - Add policy for public read access
    - Add policies for authenticated users to manage packages

  3. Triggers
    - Add trigger to automatically update updated_at timestamp
*/

-- Create the packages table
CREATE TABLE IF NOT EXISTS public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  hero_image text,
  base_price_php numeric NOT NULL,
  is_top_product boolean DEFAULT false,
  is_most_sold boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add comments for clarity
COMMENT ON TABLE public.packages IS 'Stores pre-defined bundles of activities.';
COMMENT ON COLUMN public.packages.name IS 'Name of the package.';
COMMENT ON COLUMN public.packages.description IS 'Detailed description of the package.';
COMMENT ON COLUMN public.packages.hero_image IS 'URL for the main image of the package.';
COMMENT ON COLUMN public.packages.base_price_php IS 'Base price of the package in PHP.';
COMMENT ON COLUMN public.packages.is_top_product IS 'Flag to mark if the package is a top product.';
COMMENT ON COLUMN public.packages.is_most_sold IS 'Flag to mark if the package is a most sold product.';

-- Enable Row Level Security
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access
CREATE POLICY "Allow public read access to packages"
  ON public.packages
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert packages (if applicable, or restrict to admin)
CREATE POLICY "Authenticated users can insert packages"
  ON public.packages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update packages (if applicable, or restrict to admin)
CREATE POLICY "Authenticated users can update packages"
  ON public.packages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete packages (if applicable, or restrict to admin)
CREATE POLICY "Authenticated users can delete packages"
  ON public.packages
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();