-- Fix the infinite recursion in profiles table RLS policy
-- Run this in your Supabase SQL Editor

-- Drop the problematic policy
DROP POLICY IF EXISTS "Allow authenticated users to view all profiles if admin" ON public.profiles;

-- Recreate a simple policy that allows users to read their own profile
-- and allows public read access (since profiles are generally viewable)
CREATE POLICY "Users can read own profile and public read access"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Alternative: If you want to restrict to authenticated users only, use this instead:
-- CREATE POLICY "Users can read own profile"
-- ON public.profiles
-- FOR SELECT
-- TO authenticated
-- USING (auth.uid() = id);

-- Note: The admin check will need to be handled differently in the application logic
-- rather than in the RLS policy to avoid recursion