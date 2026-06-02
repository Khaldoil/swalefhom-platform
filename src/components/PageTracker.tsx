import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSession } from '../hooks/useAnalytics';

export default function PageTracker() {
  const location = useLocation();

  // Track user session
  useSession();

  // Track page views
  useEffect(() => {
    // Update pages_visited counter
    const updateSession = async () => {
      const sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) return;

      try {
        const { supabase } = await import('../lib/supabase');
        const { data: session } = await supabase
          .from('user_sessions')
          .select('pages_visited')
          .eq('session_id', sessionId)
          .eq('is_active', true)
          .maybeSingle();

        if (session) {
          await supabase
            .from('user_sessions')
            .update({
              pages_visited: (session.pages_visited || 0) + 1
            })
            .eq('session_id', sessionId)
            .eq('is_active', true);
        }
      } catch (error) {
        console.error('Error updating session:', error);
      }
    };

    updateSession();
  }, [location.pathname]);

  return null;
}
