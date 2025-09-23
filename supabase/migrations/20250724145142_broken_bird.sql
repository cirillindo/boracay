/*
  # Add customer WhatsApp column to orders table

  1. Changes
    - Add `customer_whatsapp` column to `orders` table to store customer WhatsApp number
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_whatsapp'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_whatsapp text;
  END IF;
END $$;