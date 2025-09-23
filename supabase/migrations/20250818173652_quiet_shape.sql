/*
  # Fix orders table INSERT policy for anonymous users

  1. Policy Updates
    - Drop existing INSERT policy for orders table
    - Create new INSERT policy that properly handles both authenticated and anonymous users
    - Allow authenticated users to insert orders with their user_id
    - Allow anonymous users to insert orders with NULL user_id

  2. Security
    - Maintains security by ensuring users can only set their own user_id or NULL
    - Prevents privilege escalation where anonymous users could set arbitrary user_ids
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Create a new INSERT policy that properly handles both authenticated and anonymous users
CREATE POLICY "Allow order creation for authenticated and anonymous users"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (
    -- Allow authenticated users to create orders with their own user_id
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    -- Allow anonymous users to create orders with NULL user_id
    (auth.uid() IS NULL AND user_id IS NULL)
  );