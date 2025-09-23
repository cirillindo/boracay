/*
  # Update Calculator Schema for Dream Move Calculator

  1. Schema Changes
    - Add `monthly_income_from_rent` column to `properties` table
    - Remove deprecated calculator columns that are no longer needed
    
  2. Data Migration
    - No data migration needed as this is a new column
    
  3. Comments
    - Add descriptive comment to the new column
*/

-- Add monthly_income_from_rent column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS monthly_income_from_rent numeric;

-- Add comment to document the column
COMMENT ON COLUMN properties.monthly_income_from_rent IS 'Monthly income from rent (in EUR) used for ROI calculations';

-- Drop deprecated columns that are no longer needed
ALTER TABLE properties 
  DROP COLUMN IF EXISTS base_low_season,
  DROP COLUMN IF EXISTS base_high_season,
  DROP COLUMN IF EXISTS long_term_rent,
  DROP COLUMN IF EXISTS occupancy_rate;

-- Note: We're keeping is_live_in_friendly as it's still useful for filtering properties
-- suitable for owner living