import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminNotification {
  id: string;
  type: 'story' | 'ambassador';
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);

  const addNotification = useCallback((n: Omit<AdminNotification, 'id' | 'read' | 'timestamp'>) => {
    const newN: AdminNotification = {
      ...n,
      id: `${Date.now()}-${Math.random()}`,
      read: false,
      timestamp: new Date(),
    };
    setNotifications(prev => [newN, ...prev].slice(0, 30)); // max 30
    setUnreadCount(c => c + 1);

    // Browser notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(`سواليفهم — ${n.title}`, { body: n.body, icon: '/favicon.ico' });
    }
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    // Request browser notification permission
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    // Subscribe to new stories (status = draft/pending = needs review)
    const storyCh = supabase
      .channel('admin-stories-watch')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'stories',
        filter: 'status=eq.draft',
      }, payload => {
        const story = payload.new as Record<string, unknown>;
        addNotification({
          type: 'story',
          title: 'قصة جديدة بانتظار المراجعة',
          body: `"${(story.title as string) || 'بدون عنوان'}" — ${(story.metadata as Record<string, string> | undefined)?.['teller_name'] || ''}`,
          link: '/admin/stories',
        });
      })
      .subscribe();

    // Subscribe to new comments awaiting moderation
    const commentCh = supabase
      .channel('admin-comments-watch')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'story_comments',
        filter: 'status=eq.pending',
      }, payload => {
        const comment = payload.new as Record<string, unknown>;
        addNotification({
          type: 'story',
          title: 'تعليق جديد بانتظار المراجعة',
          body: `${(comment.commenter_name as string) || ''}: "${((comment.content as string) || '').slice(0, 60)}..."`,
          link: '/admin/comments',
        });
      })
      .subscribe();

    // Subscribe to new ambassador applications
    const ambassadorCh = supabase
      .channel('admin-ambassadors-watch')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ambassador_applications',
      }, payload => {
        const app = payload.new as Record<string, unknown>;
        addNotification({
          type: 'ambassador',
          title: 'طلب سفير جديد',
          body: `${(app.name as string) || ''} من ${(app.city as string) || ''}`,
          link: '/admin/applications',
        });
      })
      .subscribe();

    channelsRef.current = [storyCh, ambassadorCh, commentCh];

    return () => {
      channelsRef.current.forEach(ch => supabase.removeChannel(ch));
    };
  }, [addNotification]);

  return { notifications, unreadCount, markRead, markAllRead, clearAll };
}
