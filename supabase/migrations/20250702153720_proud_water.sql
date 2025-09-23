/*
  # Add long-term rent columns to properties table

  1. New Columns
    - `long_term_rent_min` (numeric) - Minimum monthly rent for long-term stays
    - `long_term_rent_max` (numeric) - Maximum monthly rent for long-term stays

  2. Changes
    - Add two new columns to the properties table to support long-term rental pricing
    - Both columns are nullable to allow properties that don't offer long-term rentals
    - Use numeric type to store monetary values with precision
*/

-- Add long-term rent columns to properties table
DO $$
BEGIN
  -- Add long_term_rent_min column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'long_term_rent_min'
  ) THEN
    ALTER TABLE properties ADD COLUMN long_term_rent_min numeric;
  END IF;

  -- Add long_term_rent_max column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'long_term_rent_max'
  ) THEN
    ALTER TABLE properties ADD COLUMN long_term_rent_max numeric;
  END IF;
END $$;

-- Add comments to document the columns
COMMENT ON COLUMN properties.long_term_rent_min IS 'Minimum monthly rent for long-term stays (in local currency)';
COMMENT ON COLUMN properties.long_term_rent_max IS 'Maximum monthly rent for long-term stays (in local currency)';