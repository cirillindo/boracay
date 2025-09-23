-- Add min_nights column to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS min_nights integer DEFAULT 2;

-- Add max_nights column to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS max_nights integer;

-- Add comments to document the columns
COMMENT ON COLUMN packages.min_nights IS 'Minimum number of nights required for the package';
COMMENT ON COLUMN packages.max_nights IS 'Maximum number of nights allowed for the package (optional)';