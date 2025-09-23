/*
  # Add slug column to properties table

  1. Schema Changes
    - Add `slug` column to `properties` table
    - Make it unique and not null with default values
    - Update existing properties to generate slugs from titles
    - Update canonical_url for all properties to use the new slug-based URL
    
  2. Data Migration
    - Generate slugs from existing property titles
    - Ensure uniqueness by appending a random string if needed
    - Update canonical_url to use the new slug format
*/

-- Add slug column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS slug text;

-- Create a function to generate a slug from a title
CREATE OR REPLACE FUNCTION generate_slug(title text) RETURNS text AS $$
DECLARE
  slug text;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  slug := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Remove leading and trailing hyphens
  slug := trim(both '-' from slug);
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing properties with slugs based on their titles
DO $$
DECLARE
  prop RECORD;
  new_slug text;
  counter integer;
BEGIN
  FOR prop IN SELECT id, title FROM properties WHERE slug IS NULL OR slug = '' LOOP
    -- Generate initial slug
    new_slug := generate_slug(prop.title);
    
    -- Check if slug already exists and make it unique if needed
    counter := 1;
    WHILE EXISTS (SELECT 1 FROM properties WHERE slug = new_slug AND id != prop.id) LOOP
      new_slug := generate_slug(prop.title) || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    -- Update the property with the new slug
    UPDATE properties SET slug = new_slug WHERE id = prop.id;
  END LOOP;
END $$;

-- Make slug column not null and unique after populating data
ALTER TABLE properties ALTER COLUMN slug SET NOT NULL;
ALTER TABLE properties ADD CONSTRAINT properties_slug_key UNIQUE (slug);

-- Update canonical_url for all properties to use the new slug-based URL
UPDATE properties 
SET canonical_url = 'https://www.boracay.house/property/' || slug
WHERE canonical_url IS NULL OR canonical_url = '';