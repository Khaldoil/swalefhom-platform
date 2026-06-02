/*
  # Fix Stories RLS Policy for Public Submissions

  1. Changes
    - Update RLS policies to properly handle public story submissions
    - Ensure metadata is properly handled
    - Keep existing policies intact

  2. Security
    - Public users can submit stories without authentication
    - Stories are always inserted with 'draft' status
    - Metadata is required for public submissions
*/

-- Drop existing public submission policy
DROP POLICY IF EXISTS "Anyone can submit stories" ON stories;

-- Create new policy for public story submission
CREATE POLICY "Anyone can submit stories"
  ON stories
  FOR INSERT
  TO public
  WITH CHECK (
    status = 'draft' AND
    metadata IS NOT NULL AND
    metadata ? 'teller_name' AND
    metadata ? 'teller_mobile' AND
    metadata ? 'teller_email'
  );

-- Update existing policies to handle public submissions
DO $$ BEGIN
  -- Update the select policy to allow viewing published stories
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stories' 
    AND policyname = 'Users can read all published stories'
  ) THEN
    DROP POLICY "Users can read all published stories" ON stories;
  END IF;

  CREATE POLICY "Users can read all published stories"
    ON stories
    FOR SELECT
    USING (status = 'published');

  -- Update the authenticated users policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stories' 
    AND policyname = 'Authenticated users can CRUD their own stories'
  ) THEN
    DROP POLICY "Authenticated users can CRUD their own stories" ON stories;
  END IF;

  CREATE POLICY "Authenticated users can CRUD their own stories"
    ON stories
    FOR ALL
    TO authenticated
    USING (
      CASE
        WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
        ELSE false
      END
    )
    WITH CHECK (
      CASE
        WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
        ELSE false
      END
    );
END $$;