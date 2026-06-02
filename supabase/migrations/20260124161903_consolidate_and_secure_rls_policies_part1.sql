/*
  # Consolidate and secure RLS policies - Part 1

  1. Purpose
    - Remove duplicate overlapping policies
    - Fix overly permissive policies that bypass security
    - Implement proper admin role checks

  2. Tables Updated
    - blog_posts: Consolidate admin and public policies
    - books: Fix authenticated user policies with admin checks
    - categories: Fix authenticated user policies with admin checks
    - events: Fix authenticated user policies with admin checks
    - glossary_terms: Fix authenticated user policies with admin checks
*/

-- Blog Posts: Drop old policies and create consolidated ones
DROP POLICY IF EXISTS "blog_posts_admin_access" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_manage_authenticated_v1" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_public_read" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_read_published_v1" ON blog_posts;

CREATE POLICY "Public can view published blog posts"
  ON blog_posts
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage blog posts"
  ON blog_posts
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

-- Books: Fix overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage books" ON books;

CREATE POLICY "Admins can manage books"
  ON books
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

-- Categories: Fix overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;

CREATE POLICY "Admins can manage categories"
  ON categories
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

-- Events: Fix overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can CRUD events" ON events;

CREATE POLICY "Admins can manage events"
  ON events
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

-- Glossary Terms: Fix overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can CRUD glossary terms" ON glossary_terms;
DROP POLICY IF EXISTS "Users can read all glossary terms" ON glossary_terms;

CREATE POLICY "Admins can manage glossary terms"
  ON glossary_terms
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
