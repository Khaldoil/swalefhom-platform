export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      analytics: {
        Row: {
          id: string
          type: string
          item_id: string | null
          count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          item_id?: string | null
          count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          item_id?: string | null
          count?: number
          created_at?: string
          updated_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string | null
          region: string
          date: string
          category: string
          image_url: string | null
          status: string
          created_at: string
          updated_at: string
          user_id: string
          metadata: Json
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt?: string | null
          region: string
          date: string
          category: string
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          user_id: string
          metadata?: Json
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string | null
          region?: string
          date?: string
          category?: string
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          metadata?: Json
        }
      }
      gallery_items: {
        Row: {
          id: string
          title: string
          description: string | null
          media_url: string
          media_type: 'image' | 'video' | 'audio'
          status: 'draft' | 'published'
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          media_url: string
          media_type: 'image' | 'video' | 'audio'
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          media_url?: string
          media_type?: 'image' | 'video' | 'audio'
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
    }
  }
}