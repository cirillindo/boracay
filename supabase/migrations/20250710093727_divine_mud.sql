/*
  # Add is_online column to activities table

  1. Schema Changes
    - Add `is_online` column to `activities` table
    - Boolean type with default value of true
    - Controls whether the activity is displayed on the website
    
  2. Data Migration
    - Set default value of true for existing activities
    
  3. Comments
    - Add descriptive comment to explain the purpose of the column
*/

-- Add is_online column to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT true;

-- Add comment to document the column
COMMENT ON COLUMN activities.is_online IS 'Controls whether the activity is displayed on the website. When false, the activity is stored in the database but not shown to users.';