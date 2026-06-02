/*
  # Optimize RLS auth function calls

  1. Purpose
    - Replace auth.uid() with (select auth.uid()) for better performance
    - Prevents re-evaluation of auth functions for each row
    - Improves query performance at scale

  2. Tables Updated
    - storytellers: optimize profile management policies
    - stories: optimize storyteller access policies
    - notifications: optimize user notification policies
    - user_roles: optimize role management policies
    - user_sessions: optimize session policies
*/

-- Storytellers policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON storytellers;
CREATE POLICY "Users can manage their own profile"
  ON storytellers
  FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can update own profile" ON storytellers;
CREATE POLICY "Authenticated users can update own profile"
  ON storytellers
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can delete own profile" ON storytellers;
CREATE POLICY "Authenticated users can delete own profile"
  ON storytellers
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Stories policies
DROP POLICY IF EXISTS "Storytellers can create stories" ON stories;
CREATE POLICY "Storytellers can create stories"
  ON stories
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Storytellers can read their own stories" ON stories;
CREATE POLICY "Storytellers can read their own stories"
  ON stories
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Storytellers can update their own stories" ON stories;
CREATE POLICY "Storytellers can update their own stories"
  ON stories
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Storytellers can delete their own stories" ON stories;
CREATE POLICY "Storytellers can delete their own stories"
  ON stories
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Notifications policies
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
CREATE POLICY "Admins can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- User roles policies
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
CREATE POLICY "Users can view own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = (select auth.uid())
      AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles"
  ON user_roles
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

-- User sessions policies
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
CREATE POLICY "Users can view own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));
