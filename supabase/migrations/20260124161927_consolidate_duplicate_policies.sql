/*
  # Consolidate duplicate RLS policies

  1. Purpose
    - Remove overlapping and duplicate RLS policies
    - Keep only the most specific and secure policy for each action
    - Improves query planning and performance

  2. Tables Updated
    - blog_posts: consolidate to single policies per action
    - books, categories, events: remove duplicates
    - gallery_items, glossary_terms: consolidate public access
    - pioneers, stories: remove overlapping policies
    - story_media, storytellers: consolidate access
    - training_courses, user_roles, user_sessions: remove duplicates
*/

-- Blog posts: Keep only specific policies, remove generic ones
DROP POLICY IF EXISTS "blog_posts_admin_access" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_manage_authenticated_v1" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_read_published_v1" ON blog_posts;

-- Books: Remove generic policy, keep specific ones
DROP POLICY IF EXISTS "Authenticated users can manage books" ON books;

-- Categories: Remove generic policy
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;

-- Events: Remove generic policy
DROP POLICY IF EXISTS "Authenticated users can CRUD events" ON events;

-- Gallery items: Keep single public access policy
DROP POLICY IF EXISTS "Gallery items public access" ON gallery_items;

-- Glossary terms: Remove generic policy
DROP POLICY IF EXISTS "Authenticated users can CRUD glossary terms" ON glossary_terms;

-- Pioneers: Remove generic policy
DROP POLICY IF EXISTS "Authenticated users can manage pioneers" ON pioneers;

-- Stories: Remove overly broad policies
DROP POLICY IF EXISTS "Admin full access" ON stories;
DROP POLICY IF EXISTS "Authenticated full access" ON stories;
DROP POLICY IF EXISTS "Public access" ON stories;
DROP POLICY IF EXISTS "Public insert access" ON stories;

-- Story media: Remove generic policy
DROP POLICY IF EXISTS "Authenticated full access" ON story_media;

-- Storytellers: Remove duplicate policies
DROP POLICY IF EXISTS "Public insert access" ON storytellers;

-- Training courses: Remove generic policy
DROP POLICY IF EXISTS "Authenticated users can CRUD training courses" ON training_courses;

-- User sessions: Remove overly permissive update policy
DROP POLICY IF EXISTS "Users can update own sessions" ON user_sessions;
