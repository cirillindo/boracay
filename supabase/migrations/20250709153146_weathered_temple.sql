-- Add custom_price column to package_activity_items table
ALTER TABLE package_activity_items ADD COLUMN IF NOT EXISTS custom_price numeric;

-- Add comment to document the column
COMMENT ON COLUMN package_activity_items.custom_price IS 'Custom price override for this activity within the package. If null, the activity default price is used.';