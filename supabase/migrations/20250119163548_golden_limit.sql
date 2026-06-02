/*
  # Fix Stories RLS Policy

  1. Changes
    - Add new policy to allow public users to insert stories
    - Keep existing policies for authenticated users and public read access

  2. Security
    - Public users can only insert stories (no update/delete)
    - Stories are inserted with 'draft' status by default
    - Authenticated users retain full CRUD access to their own stories
    - Public users can still only read published stories
*/

-- Add policy for public story submission
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stories' 
    AND policyname = 'Anyone can submit stories'
  ) THEN
    CREATE POLICY "Anyone can submit stories"
      ON stories
      FOR INSERT
      TO public
      WITH CHECK (status = 'draft');
  END IF;
END $$;