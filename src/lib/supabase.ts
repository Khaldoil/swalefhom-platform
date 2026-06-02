import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'swalefhom@1.0.0'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Retry function for database operations
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

// Analytics functions
export async function incrementAnalytics(type: string, itemId?: string) {
  try {
    await withRetry(async () => {
      const { data, error } = await supabase
        .from('analytics')
        .upsert(
          { 
            type,
            item_id: itemId || '',
            count: 1
          },
          { 
            onConflict: 'type,item_id',
            ignoreDuplicates: false
          }
        )
        .select('id, count')
        .single();

      if (error) throw error;

      if (data && data.count > 1) {
        const { error: updateError } = await supabase
          .from('analytics')
          .update({ 
            count: data.count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);

        if (updateError) throw updateError;
      }
    });
  } catch (error) {
    console.error('Error updating analytics:', error);
    // Don't throw the error for analytics - fail silently
  }
}

export async function getAnalytics() {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  });
}

// Gallery functions
export async function getGalleryItems() {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });
}

export async function createGalleryItem(item: any) {
  const { data: { user } } = await supabase.auth.getUser();
  
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('gallery_items')
      .insert([{ ...item, user_id: user?.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function updateGalleryItem(id: string, item: any) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('gallery_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function deleteGalleryItem(id: string) {
  return withRetry(async () => {
    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  });
}

// Stories functions
export async function getStories() {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*, categories(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });
}

export async function getStoryById(id: string) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*, categories(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  });
}

export async function createStory(story: any) {
  const { data: { user } } = await supabase.auth.getUser();
  
  return withRetry(async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .insert([{ ...story, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      // Call the Edge Function to send email notification
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/notify-story`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({ record: data }),
        });

        if (!response.ok) {
          console.error('Failed to send notification');
        }
      } catch (notifyError) {
        // Log but don't fail if notification fails
        console.error('Notification error:', notifyError);
      }

      return data;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  });
}

export async function updateStory(id: string, story: any) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  return withRetry(async () => {
    const { data, error } = await supabase
      .from('stories')
      .update({ ...story, user_id: user.id })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function deleteStory(id: string) {
  return withRetry(async () => {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  });
}

// Blog functions
export async function getBlogPosts() {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, categories(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });
}

export async function getBlogPostById(id: string) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, categories(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  });
}

export async function getRelatedPosts(id: string, categoryId: string | null) {
  return withRetry(async () => {
    let query = supabase
      .from('blog_posts')
      .select('*, categories(*)')
      .eq('status', 'published')
      .neq('id', id)
      .limit(3);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  });
}

export async function createBlogPost(post: any) {
  const { data: { user } } = await supabase.auth.getUser();

  return withRetry(async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{ ...post, user_id: user?.id }])
      .select()
      .single();

    if (error) throw error;

    try {
      await fetch(`${supabaseUrl}/functions/v1/notify-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          type: 'new_blog',
          title: `تدوينة جديدة: ${data.title}`,
          data: {
            title: data.title,
            category: data.category,
            excerpt: data.excerpt
          },
          priority: 'medium'
        }),
      });
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
    }

    return data;
  });
}

export async function updateBlogPost(id: string, post: any) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(post)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function deleteBlogPost(id: string) {
  return withRetry(async () => {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  });
}

// Books functions
export async function getBooks() {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*, categories(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });
}

export async function getBookById(id: string) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*, categories(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  });
}

export async function createBook(book: any) {
  const { data: { user } } = await supabase.auth.getUser();

  return withRetry(async () => {
    const { data, error } = await supabase
      .from('books')
      .insert([{ ...book, user_id: user?.id }])
      .select()
      .single();

    if (error) throw error;

    try {
      await fetch(`${supabaseUrl}/functions/v1/notify-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          type: 'new_gallery',
          title: `كتاب جديد: ${data.title}`,
          data: {
            title: data.title,
            author: data.author,
            description: data.description
          },
          priority: 'low'
        }),
      });
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
    }

    return data;
  });
}

export async function updateBook(id: string, book: any) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('books')
      .update(book)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function deleteBook(id: string) {
  return withRetry(async () => {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) throw error;
  });
}

// Categories functions
export async function getCategories(contentType?: string) {
  return withRetry(async () => {
    let query = supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  });
}

export async function createCategory(category: any) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function updateCategory(id: string, category: any) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function deleteCategory(id: string) {
  return withRetry(async () => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  });
}

// Events
export async function getEvents() {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  });
}

export async function createEvent(event: any) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();

    if (error) throw error;

    try {
      await fetch(`${supabaseUrl}/functions/v1/notify-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          type: 'new_event',
          title: `فعالية جديدة: ${data.title}`,
          data: {
            title: data.title,
            date: data.date,
            location: data.location,
            description: data.description
          },
          priority: 'medium'
        }),
      });
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
    }

    return data;
  });
}

export async function updateEvent(id: string, event: any) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('events')
      .update(event)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function deleteEvent(id: string) {
  return withRetry(async () => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  });
}

// Training Courses
export async function getTrainingCourses() {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('training_courses')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data;
  });
}

export async function createTrainingCourse(course: any) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('training_courses')
      .insert([course])
      .select()
      .single();

    if (error) throw error;

    try {
      await fetch(`${supabaseUrl}/functions/v1/notify-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          type: 'new_training',
          title: `دورة تدريبية جديدة: ${data.title}`,
          data: {
            title: data.title,
            duration: data.duration,
            level: data.level,
            description: data.description
          },
          priority: 'medium'
        }),
      });
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
    }

    return data;
  });
}

export async function updateTrainingCourse(id: string, course: any) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('training_courses')
      .update(course)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function deleteTrainingCourse(id: string) {
  return withRetry(async () => {
    const { error } = await supabase
      .from('training_courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  });
}

// Glossary Terms
export async function getGlossaryTerms() {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('glossary_terms')
      .select('*')
      .order('word', { ascending: true });

    if (error) throw error;
    return data;
  });
}

export async function createGlossaryTerm(term: {
  word: string;
  definition: string;
  category: string;
  example?: string;
}) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('glossary_terms')
      .insert([term])
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function updateGlossaryTerm(id: string, term: any) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('glossary_terms')
      .update(term)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function deleteGlossaryTerm(id: string) {
  return withRetry(async () => {
    const { error } = await supabase
      .from('glossary_terms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  });
}