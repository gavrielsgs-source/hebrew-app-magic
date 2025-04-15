
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// הוספת rtl לתמיכה בעברית - שימו לב שזה מופיע גם בקוד של ה-Index.tsx
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'he';

createRoot(document.getElementById("root")!).render(<App />);
