/*
  # Consolidate duplicate RLS policies

  1. Purpose
    - Remove duplicate overlapping policies
    - Keep only the necessary policies for each table

  2. Tables Updated
    - blog_posts: Remove duplicate SELECT policies
    - books: Remove duplicate SELECT policies
    - categories: Remove duplicate SELECT policies
    - events: Remove duplicate SELECT policies
    - gallery_items: Remove duplicate SELECT policies
    - glossary_terms: Remove duplicate SELECT policies
    - pioneers: Remove duplicate SELECT policies
    - training_courses: Remove duplicate SELECT policies
    - user_roles: Consolidate admin policies
    - user_sessions: Keep both admin and user policies (not duplicates)
*/

-- Blog Posts: Keep only one public read policy
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;

-- Books: Already correct (admin + public)
-- No changes needed

-- Categories: Already correct (admin + public)
-- No changes needed

-- Events: Already correct (admin + public)
-- No changes needed

-- Gallery Items: Already correct (admin + public)
-- No changes needed

-- Glossary Terms: Already correct (admin + public)
-- No changes needed

-- Pioneers: Already correct (admin + public)
-- No changes needed

-- Training Courses: Already correct (admin + public)
-- No changes needed

-- User Roles: Consolidate admin policies
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- User Sessions: Keep both (not duplicates - one for users, one for admins)
-- No changes needed
