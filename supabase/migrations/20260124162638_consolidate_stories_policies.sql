/*
  # Consolidate stories and related tables policies

  1. Purpose
    - Remove duplicate overlapping policies for stories, story_annotations, story_media, storytellers
    - Keep only necessary policies

  2. Tables Updated
    - stories: Consolidate duplicate SELECT, INSERT, UPDATE, DELETE policies
    - story_annotations: Remove duplicate SELECT policies
    - story_media: Remove duplicate policies
    - storytellers: Consolidate duplicate policies
*/

-- Stories: Remove duplicate policies, keep the most comprehensive ones
DROP POLICY IF EXISTS "Public can view published stories" ON stories;
DROP POLICY IF EXISTS "Storytellers can read their own stories" ON stories;
DROP POLICY IF EXISTS "Storytellers can create stories" ON stories;

-- Story Annotations: Remove duplicate SELECT
DROP POLICY IF EXISTS "Admins can view annotations" ON story_annotations;

-- Story Media: Already correct with separate policies
-- No changes needed

-- Storytellers: Remove duplicate policies
DROP POLICY IF EXISTS "Authenticated users can delete own profile" ON storytellers;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON storytellers;
