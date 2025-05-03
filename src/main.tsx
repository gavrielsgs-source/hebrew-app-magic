
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// הגדרת RTL לתמיכה בעברית
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'he';

// Add support classes for RTL layout
document.body.classList.add('rtl-support', 'rtl-fix');

createRoot(document.getElementById("root")!).render(<App />);
