/*
  # Create things_to_note table

  1. New Tables
    - `things_to_note`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key to properties table)
      - `title` (text, required)
      - `description` (text, required)
      - `icon` (text, optional)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `things_to_note` table
    - Add policy for public read access
    - Add policy for authenticated users to manage things to note for their properties

  3. Indexes
    - Add index on property_id for better query performance

  4. Triggers
    - Add trigger to automatically update updated_at timestamp
*/

-- Create the things_to_note table
CREATE TABLE IF NOT EXISTS things_to_note (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE things_to_note 
ADD CONSTRAINT fk_things_to_note_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_things_to_note_property_id ON things_to_note(property_id);

-- Enable Row Level Security
ALTER TABLE things_to_note ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to things to note"
  ON things_to_note
  FOR SELECT
  TO public
  USING (true);

-- Create policy for authenticated users to manage things to note for their properties
CREATE POLICY "Users can manage things to note for their properties"
  ON things_to_note
  FOR ALL
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()
    )
  );

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_things_to_note_updated_at
  BEFORE UPDATE ON things_to_note
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();