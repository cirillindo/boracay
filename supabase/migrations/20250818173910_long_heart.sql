/*
  # Fix orders table permissions for anonymous users

  1. Permissions
    - Grant USAGE on public schema to anon role
    - Grant INSERT permission on orders table to anon role
  
  2. Security
    - Drop and recreate RLS policy for INSERT on orders table
    - Allow authenticated users to insert their own orders
    - Allow unauthenticated users to insert orders with NULL user_id
*/

-- Grant USAGE on public schema to anon role
GRANT USAGE ON SCHEMA public TO anon;

-- Grant INSERT permission on the orders table to anon role
GRANT INSERT ON public.orders TO anon;

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Allow order creation for authenticated and anonymous users" ON public.orders;

-- Create new RLS policy for INSERT on orders table
CREATE POLICY "Allow order creation for authenticated and anonymous users"
ON public.orders FOR INSERT TO public
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND user_id IS NULL)
);