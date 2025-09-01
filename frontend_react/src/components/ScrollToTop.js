import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function ScrollToTop() {
  /** Scrolls to top on route changes */
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}
