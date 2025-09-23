/*
  # Update orders table for currency support

  1. Changes Made
    - Add currency column to store the payment currency
    - Rename total_amount_php to total_amount for multi-currency support
    - Update existing data to set default currency as PHP for backward compatibility

  2. Security
    - No RLS changes needed as existing policies remain valid
*/

-- Add currency column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'currency'
  ) THEN
    ALTER TABLE orders ADD COLUMN currency text DEFAULT 'PHP';
  END IF;
END $$;

-- Rename total_amount_php to total_amount if the old column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'total_amount_php'
  ) THEN
    -- Add new column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'total_amount'
    ) THEN
      ALTER TABLE orders ADD COLUMN total_amount numeric;
    END IF;
    
    -- Copy data from old column to new column
    UPDATE orders SET total_amount = total_amount_php WHERE total_amount IS NULL;
    
    -- Drop the old column
    ALTER TABLE orders DROP COLUMN IF EXISTS total_amount_php;
  END IF;
END $$;

-- Ensure total_amount column exists and is not null
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN total_amount numeric NOT NULL DEFAULT 0;
  END IF;
END $$;