/*
  # Update images column to support alt text

  1. Schema Changes
    - Change `images` column from `text[]` to `jsonb[]` to store objects with url and alt text
    - Migrate existing data to preserve image URLs with empty alt text
    
  2. Data Migration
    - Convert existing string URLs to objects with `{url: string, alt: string}` format
    - Preserve all existing image data
    
  3. Security
    - No changes to RLS policies needed as column structure change is transparent
*/

-- First, create a backup of existing data and add a temporary column
ALTER TABLE properties ADD COLUMN images_new jsonb[];

-- Migrate existing data: convert text[] to jsonb[] with empty alt text
UPDATE properties 
SET images_new = (
  SELECT array_agg(
    jsonb_build_object('url', image_url, 'alt', '')
  )
  FROM unnest(images) AS image_url
)
WHERE images IS NOT NULL AND array_length(images, 1) > 0;

-- Handle cases where images is null or empty
UPDATE properties 
SET images_new = ARRAY[]::jsonb[]
WHERE images IS NULL OR array_length(images, 1) IS NULL;

-- Drop the old column and rename the new one
ALTER TABLE properties DROP COLUMN images;
ALTER TABLE properties RENAME COLUMN images_new TO images;

-- Update the default value for the new column
ALTER TABLE properties ALTER COLUMN images SET DEFAULT ARRAY[]::jsonb[];