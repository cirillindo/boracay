/*
  # Create bookings table

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key to properties.id)
      - `check_in_date` (date, required)
      - `check_out_date` (date, required)
      - `number_of_guests` (integer, required)
      - `base_property_price_php` (numeric, required)
      - `user_id` (uuid, foreign key to auth.users.id, optional)
      - `status` (text, default 'pending')
      - `total_amount_php` (numeric, required)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `bookings` table
    - Add policies for authenticated users to manage their own bookings

  3. Triggers
    - Add trigger to automatically update updated_at timestamp
*/

-- Create the bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  number_of_guests integer NOT NULL,
  base_property_price_php numeric NOT NULL,
  user_id uuid REFERENCES auth.users(id), -- Optional, if booking is tied to a logged-in user
  status text DEFAULT 'pending' NOT NULL, -- 'pending', 'confirmed', 'cancelled'
  total_amount_php numeric NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add comments for clarity
COMMENT ON TABLE public.bookings IS 'Stores customer bookings for properties.';
COMMENT ON COLUMN public.bookings.property_id IS 'Foreign key to the properties table.';
COMMENT ON COLUMN public.bookings.check_in_date IS 'Check-in date for the booking.';
COMMENT ON COLUMN public.bookings.check_out_date IS 'Check-out date for the booking.';
COMMENT ON COLUMN public.bookings.number_of_guests IS 'Number of guests for the booking.';
COMMENT ON COLUMN public.bookings.base_property_price_php IS 'Calculated base price of the property for the booking duration.';
COMMENT ON COLUMN public.bookings.user_id IS 'Foreign key to the auth.users table, if the booking is made by a logged-in user.';
COMMENT ON COLUMN public.bookings.status IS 'Current status of the booking (pending, confirmed, cancelled).';
COMMENT ON COLUMN public.bookings.total_amount_php IS 'Final calculated price including all add-ons and fees.';

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to view their own bookings
CREATE POLICY "Users can view their own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert bookings for themselves
CREATE POLICY "Users can insert their own bookings"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own bookings
CREATE POLICY "Users can update their own bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own bookings
CREATE POLICY "Users can delete their own bookings"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();