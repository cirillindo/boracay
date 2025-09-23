/*
  # Add slug column to activities table

  1. Schema Changes
    - Add `slug` column to `activities` table
    - Make it unique and not null
    - Update existing activities to generate slugs from names
    
  2. Data Migration
    - Generate slugs from existing activity names
    - Ensure uniqueness by appending a random string if needed
*/

-- Add slug column to activities table if it doesn't exist
ALTER TABLE activities ADD COLUMN IF NOT EXISTS slug text;

-- Create a function to generate a slug from a name
CREATE OR REPLACE FUNCTION generate_activity_slug(name text) RETURNS text AS $$
DECLARE
  slug text;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  slug := lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
  -- Remove leading and trailing hyphens
  slug := trim(both '-' from slug);
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing activities with slugs based on their names
DO $$
DECLARE
  act RECORD;
  new_slug text;
  counter integer;
BEGIN
  FOR act IN SELECT id, name FROM activities WHERE slug IS NULL OR slug = '' LOOP
    -- Generate initial slug
    new_slug := generate_activity_slug(act.name);
    
    -- Check if slug already exists and make it unique if needed
    counter := 1;
    WHILE EXISTS (SELECT 1 FROM activities WHERE slug = new_slug AND id != act.id) LOOP
      new_slug := generate_activity_slug(act.name) || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    -- Update the activity with the new slug
    UPDATE activities SET slug = new_slug WHERE id = act.id;
  END LOOP;
END $$;

-- Make slug column not null and unique after populating data
ALTER TABLE activities ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint if it doesn't exist
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_activities_slug ON activities(slug);