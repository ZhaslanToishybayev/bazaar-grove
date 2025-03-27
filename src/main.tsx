
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add type declaration for LOVABLE_BADGE on window object
declare global {
  interface Window {
    LOVABLE_BADGE: boolean;
  }
}

// Явно устанавливаем значение для Lovable badge
window.LOVABLE_BADGE = false;

createRoot(document.getElementById("root")!).render(<App />);
