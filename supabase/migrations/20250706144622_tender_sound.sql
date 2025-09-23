/*
  # Create booking_addons table

  1. New Tables
    - `booking_addons`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key to bookings.id)
      - `addon_type` (text, required)
      - `addon_id` (uuid, required)
      - `quantity` (integer, required)
      - `selected_date` (date, optional)
      - `price_at_booking_php` (numeric, required)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `booking_addons` table
    - Add policies for authenticated users to manage their own booking add-ons

  3. Triggers
    - Add trigger to automatically update updated_at timestamp
*/

-- Create the booking_addons table
CREATE TABLE IF NOT EXISTS public.booking_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  addon_type text NOT NULL, -- 'activity', 'package'
  addon_id uuid NOT NULL, -- References either activities.id or packages.id
  quantity integer NOT NULL,
  selected_date date, -- For activities that require a specific date
  price_at_booking_php numeric NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add comments for clarity
COMMENT ON TABLE public.booking_addons IS 'Stores activities and packages added to a specific booking.';
COMMENT ON COLUMN public.booking_addons.booking_id IS 'Foreign key to the bookings table.';
COMMENT ON COLUMN public.booking_addons.addon_type IS 'Type of add-on: activity or package.';
COMMENT ON COLUMN public.booking_addons.addon_id IS 'ID of the activity or package.';
COMMENT ON COLUMN public.booking_addons.quantity IS 'Quantity of the add-on (e.g., number of pax).';
COMMENT ON COLUMN public.booking_addons.selected_date IS 'Date for the activity, if applicable.';
COMMENT ON COLUMN public.booking_addons.price_at_booking_php IS 'Price of the add-on at the time it was added to the booking.';

-- Enable Row Level Security
ALTER TABLE public.booking_addons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to view their own booking add-ons
CREATE POLICY "Users can view their own booking addons"
  ON public.booking_addons
  FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()
    )
  );

-- Allow authenticated users to insert booking add-ons for their own bookings
CREATE POLICY "Users can insert their own booking addons"
  ON public.booking_addons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()
    )
  );

-- Allow authenticated users to update their own booking add-ons
CREATE POLICY "Users can update their own booking addons"
  ON public.booking_addons
  FOR UPDATE
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()
    )
  );

-- Allow authenticated users to delete their own booking add-ons
CREATE POLICY "Users can delete their own booking addons"
  ON public.booking_addons
  FOR DELETE
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()
    )
  );

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_booking_addons_updated_at
  BEFORE UPDATE ON public.booking_addons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();