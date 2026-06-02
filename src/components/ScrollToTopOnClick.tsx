import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that scrolls to the top of the page on route changes
 * and also provides a global click handler for buttons and links
 */
export default function ScrollToTopOnClick() {
  const { pathname } = useLocation();

  // Scroll to top on route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Add global click handler for buttons and links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button, a');
      
      if (button) {
        // Don't scroll for buttons with specific roles or classes
        const skipScroll = 
          button.getAttribute('role') === 'tab' || 
          button.classList.contains('no-scroll') ||
          button.closest('.pioneer-navigation') || // Skip pioneer navigation buttons
          button.closest('.pagination') || // Skip pagination buttons
          button.closest('.gallery-controls') || // Skip gallery controls
          button.closest('.guide-navigation') || // Skip guide navigation
          button.closest('.media-player') || // Skip media player controls
          button.closest('.filter-panel') || // Skip filter controls
          button.closest('.library-categories') || // Skip library category buttons
          button.closest('audio') || // Skip audio controls
          button.closest('video'); // Skip video controls
        
        if (!skipScroll) {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}