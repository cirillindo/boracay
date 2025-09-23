/*
  # Add customer WhatsApp to orders table

  1. Schema Changes
    - Add `customer_whatsapp` column to `orders` table to store customer WhatsApp number

  2. Security
    - No changes to existing RLS policies needed
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