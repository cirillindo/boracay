/*
  # Add payment slip URL column to orders table

  1. New Columns
    - `payment_slip_url` (text, nullable) - URL of uploaded payment slip for manual payments

  2. Purpose
    - Store payment confirmation slips for manual payment methods (PayPal, GCash, Revolut, etc.)
    - Allow customers to upload proof of payment for order verification
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_slip_url'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_slip_url text;
  END IF;
END $$;