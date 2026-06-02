/*
  # Consolidate and secure RLS policies - Part 2

  1. Purpose
    - Remove duplicate overlapping policies
    - Fix overly permissive policies that bypass security

  2. Tables Updated
    - pioneers: Fix authenticated user policies with admin checks
    - training_courses: Fix authenticated user policies with admin checks
    - gallery_items: Consolidate and secure policies
    - daily_stats: Consolidate admin policies
*/

-- Pioneers: Fix overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage pioneers" ON pioneers;

CREATE POLICY "Admins can manage pioneers"
  ON pioneers
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

-- Training Courses: Fix overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can CRUD training courses" ON training_courses;

CREATE POLICY "Admins can manage training courses"
  ON training_courses
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

-- Gallery Items: Consolidate and secure
DROP POLICY IF EXISTS "Gallery items public access" ON gallery_items;
DROP POLICY IF EXISTS "Public can view published items" ON gallery_items;

CREATE POLICY "Public can view published gallery items"
  ON gallery_items
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage gallery items"
  ON gallery_items
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

-- Daily Stats: Keep system and admin policies
DROP POLICY IF EXISTS "Admins can view daily stats" ON daily_stats;
DROP POLICY IF EXISTS "System can manage daily stats" ON daily_stats;

CREATE POLICY "Admins can view daily stats"
  ON daily_stats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role = 'admin'
    )
  );

CREATE POLICY "System can insert daily stats"
  ON daily_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'system')
    )
  );

CREATE POLICY "System can update daily stats"
  ON daily_stats
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'system')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role IN ('admin', 'system')
    )
  );
