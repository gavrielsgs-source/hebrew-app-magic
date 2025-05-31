
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// הגדרת RTL לתמיכה בעברית
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'he';

// Add support classes for RTL layout
document.body.classList.add('rtl-support', 'rtl-fix');

// iOS specific improvements
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
  // Disable zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Fix viewport height issues on iOS
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100);
  });
}

// Prevent default touch behaviors that can interfere with the app
document.addEventListener('touchstart', function(e) {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

createRoot(document.getElementById("root")!).render(<App />);
