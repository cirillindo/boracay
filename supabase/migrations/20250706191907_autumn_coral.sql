/*
  # Add is_sold_out column to packages table

  1. Schema Changes
    - Add `is_sold_out` column to `packages` table
    - Boolean type with default value of false
    - Indicates whether the package is sold out and no longer available for booking
    
  2. Data Migration
    - Set default value of false for existing packages
    
  3. Comments
    - Add descriptive comment to explain the purpose of the column
*/

-- Add is_sold_out column to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS is_sold_out boolean DEFAULT false;

-- Add comment to document the column
COMMENT ON COLUMN packages.is_sold_out IS 'Indicates whether the package is sold out and no longer available for booking';