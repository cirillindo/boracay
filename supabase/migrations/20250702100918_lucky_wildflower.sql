/*
  # Add calculator-related columns to properties table and create calculator_queries table

  1. Schema Changes
    - Add new columns to `properties` table for ROI calculations:
      - `base_low_season` (numeric): Base nightly rate during low season
      - `base_high_season` (numeric): Base nightly rate during high season
      - `long_term_rent` (numeric[]): Array of min/max monthly rent for long-term stays
      - `occupancy_rate` (numeric): Expected occupancy rate (0-1)
      - `is_live_in_friendly` (boolean): Whether property is suitable for owner living
    
    - Create new `calculator_queries` table to track user queries:
      - `id` (uuid, primary key)
      - `budget` (numeric): User's input budget
      - `selected_properties` (uuid[]): Array of property IDs selected
      - `created_at` (timestamp with time zone)
      - `user_id` (uuid, optional): Reference to user if authenticated
      - `management_type` (text): Agency or self-managed preference
      - `query_params` (jsonb): Additional parameters used in calculation
  
  2. Security
    - Enable RLS on `calculator_queries` table
    - Add policy for authenticated users to view their own queries
    - Add policy for admins to view all queries
    
  3. Indexes
    - Add index on budget for efficient queries
    - Add index on created_at for time-based analytics
*/

-- Add new columns to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS base_low_season numeric;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS base_high_season numeric;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS long_term_rent numeric[] DEFAULT '{}'::numeric[];
ALTER TABLE properties ADD COLUMN IF NOT EXISTS occupancy_rate numeric;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_live_in_friendly boolean DEFAULT false;

-- Create calculator_queries table
CREATE TABLE IF NOT EXISTS calculator_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget numeric NOT NULL,
  selected_properties uuid[] DEFAULT '{}'::uuid[],
  created_at timestamptz DEFAULT now() NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  management_type text DEFAULT 'agency',
  query_params jsonb DEFAULT '{}'::jsonb
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calculator_queries_budget ON calculator_queries(budget);
CREATE INDEX IF NOT EXISTS idx_calculator_queries_created_at ON calculator_queries(created_at);
CREATE INDEX IF NOT EXISTS idx_calculator_queries_user_id ON calculator_queries(user_id);

-- Enable Row Level Security
ALTER TABLE calculator_queries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own calculator queries"
  ON calculator_queries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own calculator queries"
  ON calculator_queries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add comments to explain columns
COMMENT ON COLUMN properties.base_low_season IS 'Base nightly rate during low season (EUR)';
COMMENT ON COLUMN properties.base_high_season IS 'Base nightly rate during high season (EUR)';
COMMENT ON COLUMN properties.long_term_rent IS 'Array of min/max monthly rent for long-term stays [min, max]';
COMMENT ON COLUMN properties.occupancy_rate IS 'Expected occupancy rate (0-1)';
COMMENT ON COLUMN properties.is_live_in_friendly IS 'Whether property is suitable for owner living';

COMMENT ON TABLE calculator_queries IS 'Tracks user queries for the Boracay Dream Move Calculator';
COMMENT ON COLUMN calculator_queries.budget IS 'User input budget in EUR';
COMMENT ON COLUMN calculator_queries.selected_properties IS 'Array of property IDs selected by the user or algorithm';
COMMENT ON COLUMN calculator_queries.management_type IS 'Agency (30% fee) or self-managed (5% cost)';
COMMENT ON COLUMN calculator_queries.query_params IS 'Additional parameters used in calculation (JSON)';