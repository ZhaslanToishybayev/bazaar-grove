
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add type declaration for LOVABLE_BADGE on window object
declare global {
  interface Window {
    LOVABLE_BADGE: boolean;
  }
}

// Explicitly set Lovable badge to false
window.LOVABLE_BADGE = false;

// Additional attempt to disable badge (belt and suspenders approach)
if (typeof window !== 'undefined') {
  // @ts-ignore - force disable badge with additional method
  window.__LOVABLE_DISABLE_BADGE = true;
}

createRoot(document.getElementById("root")!).render(<App />);
