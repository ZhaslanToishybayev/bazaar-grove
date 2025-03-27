
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add type declaration for LOVABLE_BADGE on window object
declare global {
  interface Window {
    LOVABLE_BADGE: boolean;
    __LOVABLE_DISABLE_BADGE?: boolean;
    HIDE_LOVABLE_EDIT_BANNER?: boolean;
  }
}

// Use all known methods to disable the Lovable badge
window.LOVABLE_BADGE = false;
window.HIDE_LOVABLE_EDIT_BANNER = true;

if (typeof window !== 'undefined') {
  // Disable badge with multiple approaches
  window.__LOVABLE_DISABLE_BADGE = true;
  
  // Try to remove any existing badge element
  setTimeout(() => {
    const badge = document.querySelector('[data-lovable-badge]');
    if (badge) {
      badge.remove();
    }
    
    // Also try to remove by class names that might be used
    const possibleBadges = document.querySelectorAll('.lovable-badge, .lovable-edit-badge');
    possibleBadges.forEach(element => element.remove());
  }, 100);
}

createRoot(document.getElementById("root")!).render(<App />);
