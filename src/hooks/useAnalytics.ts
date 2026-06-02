import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

// Generate or get session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Track content view
export const trackContentView = async (
  contentType: 'story' | 'pioneer' | 'gallery' | 'blog' | 'training' | 'event',
  contentId: string,
  interactionType: 'view' | 'read' | 'listen' | 'watch' | 'download' = 'view'
) => {
  try {
    const sessionId = getSessionId();

    await supabase.rpc('track_content_view', {
      p_content_type: contentType,
      p_content_id: contentId,
      p_interaction_type: interactionType,
      p_session_id: sessionId,
      p_duration_seconds: 0,
      p_completed: false
    });
  } catch (error) {
    console.error('Error tracking view:', error);
  }
};

// Hook for tracking page views
export const usePageView = (contentType?: string, contentId?: string) => {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current && contentType && contentId) {
      trackContentView(
        contentType as any,
        contentId,
        'view'
      );
      tracked.current = true;
    }
  }, [contentType, contentId]);
};

// Hook for tracking read/listen/watch with duration
export const useContentTracking = (
  contentType: 'story' | 'pioneer' | 'gallery' | 'blog' | 'training' | 'event',
  contentId: string,
  interactionType: 'read' | 'listen' | 'watch' = 'read'
) => {
  const [startTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    // Track initial view
    if (!tracked.current) {
      trackContentView(contentType, contentId, interactionType);
      tracked.current = true;
    }

    // Track duration on unmount
    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);

      if (duration > 5) { // Only track if user spent more than 5 seconds
        const sessionId = getSessionId();

        supabase.from('content_views').insert({
          content_type: contentType,
          content_id: contentId,
          interaction_type: interactionType,
          session_id: sessionId,
          duration_seconds: duration,
          completed: isCompleted
        }).then(() => {
          console.log(`Tracked ${interactionType}: ${duration}s`);
        }).catch(error => {
          console.error('Error tracking duration:', error);
        });
      }
    };
  }, [contentType, contentId, interactionType, startTime, isCompleted]);

  return { setIsCompleted };
};

// Hook for tracking user session
export const useSession = () => {
  useEffect(() => {
    const sessionId = getSessionId();
    const startTime = Date.now();

    // Create or update session
    const initSession = async () => {
      try {
        const { data: existingSession } = await supabase
          .from('user_sessions')
          .select('id')
          .eq('session_id', sessionId)
          .eq('is_active', true)
          .maybeSingle();

        if (!existingSession) {
          await supabase.from('user_sessions').insert({
            session_id: sessionId,
            device_type: getDeviceType(),
            browser: getBrowser()
          });
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    };

    initSession();

    // Update session on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const duration = Math.floor((Date.now() - startTime) / 1000);

        supabase.from('user_sessions')
          .update({
            duration_seconds: duration,
            is_active: false,
            ended_at: new Date().toISOString()
          })
          .eq('session_id', sessionId)
          .eq('is_active', true)
          .then(() => {
            console.log('Session ended:', duration, 's');
          });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};

// Helper functions
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
};
