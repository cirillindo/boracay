/*
  # Add min_nights and max_nights columns to packages table

  1. Schema Changes
    - Add `min_nights` column to `packages` table (integer, default 2)
    - Add `max_nights` column to `packages` table (integer, nullable)
    
  2. Data Migration
    - Set default value of 2 nights for existing packages
    
  3. Comments
    - Add descriptive comments to explain the purpose of the columns
*/

-- Add min_nights column to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS min_nights integer DEFAULT 2;

-- Add max_nights column to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS max_nights integer;

-- Add comments to document the columns
COMMENT ON COLUMN packages.min_nights IS 'Minimum number of nights required for the package';
COMMENT ON COLUMN packages.max_nights IS 'Maximum number of nights allowed for the package (optional)';