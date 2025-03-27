
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Явно устанавливаем значение для Lovable badge
window.LOVABLE_BADGE = false;

createRoot(document.getElementById("root")!).render(<App />);
