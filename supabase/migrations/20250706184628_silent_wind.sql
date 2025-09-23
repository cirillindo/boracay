/*
  # Add slug column to packages table

  1. Schema Changes
    - Add `slug` column to `packages` table
    - Column type: TEXT
    - Unique constraint to ensure no duplicate slugs
    - Not null constraint since slugs are required for URL generation

  2. Data Migration
    - Generate slugs for existing packages based on their names
    - Use a simple slug generation approach for existing data

  3. Security
    - No RLS changes needed as existing policies will apply to the new column
*/

-- Add slug column to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS slug text;

-- Generate slugs for existing packages (if any)
UPDATE packages 
SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Make slug column required and unique
ALTER TABLE packages ALTER COLUMN slug SET NOT NULL;
ALTER TABLE packages ADD CONSTRAINT packages_slug_key UNIQUE (slug);

-- Create index for better performance on slug lookups
CREATE INDEX IF NOT EXISTS idx_packages_slug ON packages USING btree (slug);