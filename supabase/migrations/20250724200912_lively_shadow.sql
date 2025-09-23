/*
  # Add description column to orders table

  1. Schema Changes
    - Add `description` column to `orders` table
      - `description` (text, nullable) - stores the payment description/reason

  2. Notes
    - Column is nullable to support existing orders without descriptions
    - New orders will include payment descriptions for better tracking
*/

-- Add description column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'description'
  ) THEN
    ALTER TABLE orders ADD COLUMN description text;
  END IF;
END $$;