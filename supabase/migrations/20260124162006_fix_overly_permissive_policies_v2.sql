/*
  # Fix overly permissive RLS policies

  1. Purpose
    - Replace policies with USING (true) or WITH CHECK (true)
    - Add proper access controls based on user roles and ownership
    - Enhance security by preventing unauthorized access

  2. Policy Changes
    - Ambassador applications: allow public submission, admin management
    - Analytics: add proper access controls
    - Content views: keep public insert for tracking
    - Story annotations: restrict to admin/moderator users
    - User sessions: add proper validation
*/

-- Ambassador applications: Allow anyone to apply, but only admins to view/manage
DROP POLICY IF EXISTS "Public access" ON ambassador_applications;
CREATE POLICY "Anyone can submit application"
  ON ambassador_applications
  FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins can view applications"
  ON ambassador_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'moderator')
    )
  );
CREATE POLICY "Admins can manage applications"
  ON ambassador_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'moderator')
    )
  );
CREATE POLICY "Admins can delete applications"
  ON ambassador_applications
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'moderator')
    )
  );

-- Analytics: Add proper access controls
DROP POLICY IF EXISTS "Public insert access" ON analytics;
DROP POLICY IF EXISTS "Public update access" ON analytics;
CREATE POLICY "Anyone can track analytics"
  ON analytics
  FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins can update analytics"
  ON analytics
  FOR UPDATE
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
CREATE POLICY "Admins can view analytics"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- Content views: Keep public insert (needed for tracking)
DROP POLICY IF EXISTS "Anyone can insert views" ON content_views;
CREATE POLICY "Anyone can track views"
  ON content_views
  FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins can view stats"
  ON content_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- Story annotations: Restrict to admins/moderators
DROP POLICY IF EXISTS "Authenticated users can create annotations" ON story_annotations;
DROP POLICY IF EXISTS "Authenticated users can update annotations" ON story_annotations;
DROP POLICY IF EXISTS "Authenticated users can delete annotations" ON story_annotations;
CREATE POLICY "Admins can create annotations"
  ON story_annotations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'moderator')
    )
  );
CREATE POLICY "Admins can view annotations"
  ON story_annotations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'moderator')
    )
  );
CREATE POLICY "Admins can update annotations"
  ON story_annotations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'moderator')
    )
  );
CREATE POLICY "Admins can delete annotations"
  ON story_annotations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'moderator')
    )
  );

-- User sessions: Add proper validation
DROP POLICY IF EXISTS "Anyone can create sessions" ON user_sessions;
CREATE POLICY "Authenticated users can create sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
