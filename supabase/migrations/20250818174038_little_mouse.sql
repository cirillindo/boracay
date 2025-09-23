/*
  # Fix orders table RLS policy for anonymous users

  1. Security Changes
    - Drop existing problematic INSERT policy on orders table
    - Create new INSERT policy that properly handles both authenticated and anonymous users
    - Grant necessary permissions to anon role
    - Ensure RLS is enabled on orders table

  2. Policy Logic
    - Authenticated users can insert orders where user_id matches their auth.uid()
    - Anonymous users can insert orders where user_id is NULL
    - Both scenarios are explicitly allowed in the WITH CHECK clause
*/

-- First, ensure RLS is enabled on the orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.orders TO anon;
GRANT SELECT ON public.orders TO anon;

-- Drop all existing INSERT policies on orders table to avoid conflicts
DROP POLICY IF EXISTS "Allow order creation for authenticated and anonymous users" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;

-- Create a comprehensive INSERT policy that handles both authenticated and anonymous users
CREATE POLICY "Enable order creation for all users"
ON public.orders
FOR INSERT
TO public
WITH CHECK (
  -- Allow authenticated users to create orders with their user_id
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  -- Allow anonymous users to create orders with NULL user_id
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Ensure the existing SELECT policy allows users to view their own orders
-- (This should already exist but let's make sure it's correct)
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Ensure the existing UPDATE policy allows users to update their own orders
-- (This should already exist but let's make sure it's correct)
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
CREATE POLICY "Users can update their own orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);