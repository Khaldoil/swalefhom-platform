/*
  # Consolidate and secure RLS policies - Part 3 (Fixed)

  1. Purpose
    - Consolidate and secure stories, storytellers, and story_media policies
    - Remove overlapping and overly permissive policies

  2. Tables Updated
    - stories: Consolidate multiple overlapping policies
    - storytellers: Consolidate and secure policies
    - story_media: Consolidate and secure policies
*/

-- Stories: Drop all old overlapping policies
DROP POLICY IF EXISTS "Admin full access" ON stories;
DROP POLICY IF EXISTS "Authenticated full access" ON stories;
DROP POLICY IF EXISTS "Public access" ON stories;
DROP POLICY IF EXISTS "Public insert access" ON stories;
DROP POLICY IF EXISTS "Stories submit access" ON stories;
DROP POLICY IF EXISTS "Stories read access" ON stories;

-- Create clean, secure policies for stories
CREATE POLICY "Anyone can view published stories"
  ON stories
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Anyone can submit stories"
  ON stories
  FOR INSERT
  WITH CHECK (status = 'pending');

CREATE POLICY "Storytellers can view their own stories"
  ON stories
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Admins can manage all stories"
  ON stories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- Storytellers: Drop old overlapping policies
DROP POLICY IF EXISTS "Public insert access" ON storytellers;
DROP POLICY IF EXISTS "Public can view storytellers" ON storytellers;
DROP POLICY IF EXISTS "Public read access" ON storytellers;

-- Create clean policies for storytellers
CREATE POLICY "Anyone can view storytellers"
  ON storytellers
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create storyteller profile"
  ON storytellers
  FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

-- Story Media: Drop old overlapping policies
DROP POLICY IF EXISTS "Authenticated full access" ON story_media;
DROP POLICY IF EXISTS "Public submit access" ON story_media;
DROP POLICY IF EXISTS "Public read access" ON story_media;

-- Create clean policies for story_media
CREATE POLICY "Anyone can view published story media"
  ON story_media
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_media.story_id
      AND stories.status = 'published'
    )
  );

CREATE POLICY "Authenticated users can upload media for their story"
  ON story_media
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (select auth.uid())
  );

CREATE POLICY "Admins can manage all story media"
  ON story_media
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role = 'admin'
    )
  );
