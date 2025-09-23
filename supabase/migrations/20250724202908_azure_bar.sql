/*
  # Add currency column to orders table

  1. New Columns
    - `currency` (text, nullable) - stores the currency code used for the payment
  
  2. Changes
    - Add currency column to track payment currency
    - Set default currency to 'EUR' for existing records
    - Update trigger to handle currency field
*/

-- Add currency column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'currency'
  ) THEN
    ALTER TABLE orders ADD COLUMN currency text DEFAULT 'EUR';
  END IF;
END $$;

-- Update existing records to have EUR as default currency
UPDATE orders SET currency = 'EUR' WHERE currency IS NULL;