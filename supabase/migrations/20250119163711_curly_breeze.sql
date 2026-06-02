/*
  # Fix Stories RLS Policy for Public Submissions

  1. Changes
    - Update public story submission policy to not require user_id
    - Allow null user_id for public submissions
    - Keep existing policies intact

  2. Security
    - Public users can submit stories without authentication
    - Stories are always inserted with 'draft' status
    - Existing security for authenticated users remains unchanged
*/

-- First, make user_id nullable
ALTER TABLE stories ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing public submission policy if it exists
DROP POLICY IF EXISTS "Anyone can submit stories" ON stories;

-- Create new policy for public story submission
CREATE POLICY "Anyone can submit stories"
  ON stories
  FOR INSERT
  TO public
  WITH CHECK (
    status = 'draft' AND
    user_id IS NULL
  );