/*
  # Add slug column to activities table

  1. Changes
    - Add `slug` column to `activities` table
    - Set it as unique and not null
    - Generate slugs for existing activities based on their names
    - Add index for better performance

  2. Security
    - No RLS changes needed as existing policies will apply
*/

-- Add the slug column as nullable first
ALTER TABLE activities ADD COLUMN IF NOT EXISTS slug text;

-- Update existing activities with generated slugs based on their names
UPDATE activities 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Make the column not null and unique
ALTER TABLE activities 
ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'activities_slug_key' 
    AND table_name = 'activities'
  ) THEN
    ALTER TABLE activities ADD CONSTRAINT activities_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_activities_slug ON activities (slug);