
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import React from 'react';

// הגדרת RTL לתמיכה בעברית
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'he';

// Add support classes for RTL layout
document.body.classList.add('rtl-support', 'rtl-fix');

// Simplified iOS/Mobile specific improvements
const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(navigator.userAgent);

if (isIOSDevice || isMobileDevice) {
  console.log('Mobile device detected - applying simplified optimizations');
  
  // Simple viewport height fix
  const setViewportHeight = () => {
    try {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    } catch (error) {
      console.error('Error setting viewport height:', error);
    }
  };
  
  setViewportHeight();
  
  // Simple event listeners
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', setViewportHeight);

  // Prevent double-tap zoom - simplified
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function (event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}

console.log('Main.tsx loaded - simplified version:', {
  isIOSDevice,
  isMobileDevice,
  userAgent: navigator.userAgent.substring(0, 50)
});

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
