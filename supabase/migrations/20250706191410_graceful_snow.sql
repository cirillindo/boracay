/*
  # Add is_sold_out column to packages table

  1. Schema Changes
    - Add `is_sold_out` column to `packages` table
    - Boolean type with default value of false
    
  2. Data Migration
    - No data migration needed as this is a new column with a default value
    
  3. Security
    - No changes to RLS policies needed as column structure change is transparent
*/

-- Add is_sold_out column to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN DEFAULT FALSE;

-- Add comment to document the column
COMMENT ON COLUMN packages.is_sold_out IS 'Indicates whether the package is sold out and no longer available for booking';