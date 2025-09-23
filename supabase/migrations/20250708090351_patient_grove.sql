/*
  # Add min_pax, max_pax, and whatsapp_number columns to packages table

  1. Schema Changes
    - Add `min_pax` column to `packages` table (integer, default 2)
    - Add `max_pax` column to `packages` table (integer, nullable)
    - Add `whatsapp_number` column to `packages` table (text, default '+639617928834')
    
  2. Data Migration
    - Set default values for existing packages
    
  3. Comments
    - Add descriptive comments to explain the purpose of each column
*/

-- Add min_pax column to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS min_pax integer DEFAULT 2;

-- Add max_pax column to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS max_pax integer;

-- Add whatsapp_number column to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS whatsapp_number text DEFAULT '+639617928834';

-- Add comments to document the columns
COMMENT ON COLUMN packages.min_pax IS 'Minimum number of participants required for the package';
COMMENT ON COLUMN packages.max_pax IS 'Maximum number of participants allowed for the package (optional)';
COMMENT ON COLUMN packages.whatsapp_number IS 'WhatsApp contact number for package inquiries';