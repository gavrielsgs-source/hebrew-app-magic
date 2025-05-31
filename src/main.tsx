
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// הגדרת RTL לתמיכה בעברית
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'he';

// Add support classes for RTL layout
document.body.classList.add('rtl-support', 'rtl-fix');

// Enhanced iOS/Mobile specific improvements
const isIOSDevice = /iPad|iPhone|iPod/i.test(navigator.userAgent);
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isIOSDevice || isMobileDevice) {
  console.log('Mobile device detected, applying optimizations');
  
  // Disable zoom on double tap - Enhanced for iOS
  let lastTouchEnd = 0;
  let touchTimeout: NodeJS.Timeout;
  
  document.addEventListener('touchend', function (event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
      event.stopPropagation();
    }
    lastTouchEnd = now;
  }, { passive: false });

  // Enhanced viewport height fixes for iOS
  const setViewportHeight = () => {
    try {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      console.log('Viewport height set:', vh);
    } catch (error) {
      console.error('Error setting viewport height:', error);
    }
  };
  
  setViewportHeight();
  
  // Enhanced event listeners for iOS
  window.addEventListener('resize', () => {
    clearTimeout(touchTimeout);
    touchTimeout = setTimeout(setViewportHeight, 100);
  }, { passive: true });
  
  window.addEventListener('orientationchange', () => {
    clearTimeout(touchTimeout);
    touchTimeout = setTimeout(setViewportHeight, 200);
  }, { passive: true });

  // iOS specific - prevent bounce scrolling
  document.addEventListener('touchmove', function(e) {
    if (e.scale !== 1) {
      e.preventDefault();
    }
  }, { passive: false });
}

// Enhanced prevention of default touch behaviors
document.addEventListener('touchstart', function(e) {
  if (e.touches.length > 1) {
    e.preventDefault();
    e.stopPropagation();
  }
}, { passive: false });

// Enhanced gesture prevention for iOS
document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
  e.stopPropagation();
}, { passive: false });

console.log('Main.tsx loaded, device detection:', {
  isIOSDevice,
  isMobileDevice,
  userAgent: navigator.userAgent.substring(0, 50),
  viewportWidth: window.innerWidth,
  viewportHeight: window.innerHeight
});

createRoot(document.getElementById("root")!).render(<App />);
