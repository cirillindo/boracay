/*
  # Create package_activity_items table

  1. New Tables
    - `package_activity_items` (junction table)
      - `package_id` (uuid, foreign key to packages.id)
      - `activity_id` (uuid, foreign key to activities.id)
      - `quantity` (integer, default 1)
      - `notes` (text, optional)
      - Primary key on (package_id, activity_id)

  2. Security
    - Enable RLS on `package_activity_items` table
    - Add policy for public read access
    - Add policies for authenticated users to manage package activity items
*/

-- Create the package_activity_items table (junction table)
CREATE TABLE IF NOT EXISTS public.package_activity_items (
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1 NOT NULL,
  notes text,
  PRIMARY KEY (package_id, activity_id)
);

-- Add comments for clarity
COMMENT ON TABLE public.package_activity_items IS 'Links packages to individual activities.';
COMMENT ON COLUMN public.package_activity_items.package_id IS 'Foreign key to the packages table.';
COMMENT ON COLUMN public.package_activity_items.activity_id IS 'Foreign key to the activities table.';
COMMENT ON COLUMN public.package_activity_items.quantity IS 'Quantity of the activity within the package.';
COMMENT ON COLUMN public.package_activity_items.notes IS 'Additional notes for the activity within the package.';

-- Enable Row Level Security
ALTER TABLE public.package_activity_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access
CREATE POLICY "Allow public read access to package activity items"
  ON public.package_activity_items
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert package activity items (if applicable, or restrict to admin)
CREATE POLICY "Authenticated users can insert package activity items"
  ON public.package_activity_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update package activity items (if applicable, or restrict to admin)
CREATE POLICY "Authenticated users can update package activity items"
  ON public.package_activity_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete package activity items (if applicable, or restrict to admin)
CREATE POLICY "Authenticated users can delete package activity items"
  ON public.package_activity_items
  FOR DELETE
  TO authenticated
  USING (true);