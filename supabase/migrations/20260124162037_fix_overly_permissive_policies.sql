/*
  # Fix overly permissive RLS policies

  1. Purpose
    - Remove policies that allow unrestricted access
    - Ensure proper security controls are in place

  2. Changes
    - analytics: Remove public read access policy
    - story_annotations: Remove unrestricted view policy, add proper read policy
    - content_views: Consolidate admin view policies
*/

-- Analytics: Remove public read access
DROP POLICY IF EXISTS "Public read access" ON analytics;

-- Story Annotations: Remove unrestricted view, add proper policy
DROP POLICY IF EXISTS "Anyone can view annotations" ON story_annotations;

CREATE POLICY "Users can view annotations on published stories"
  ON story_annotations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_annotations.story_id
      AND stories.status = 'published'
    )
  );

-- Content Views: Remove one duplicate admin policy
DROP POLICY IF EXISTS "Admins can view all analytics" ON content_views;
