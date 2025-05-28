
import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onViewModeChange?: (mode: "calendar" | "agenda" | "week") => void;
  onNavigateTime?: (direction: 'prev' | 'next') => void;
  onGoToToday?: () => void;
  onToggleHelp?: () => void;
}

export function useKeyboardShortcuts({
  onViewModeChange,
  onNavigateTime,
  onGoToToday,
  onToggleHelp
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when user is typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // View mode shortcuts
      if (event.key === '1' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onViewModeChange?.('week');
      } else if (event.key === '2' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onViewModeChange?.('calendar');
      } else if (event.key === '3' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onViewModeChange?.('agenda');
      }
      
      // Navigation shortcuts
      else if (event.key === 'ArrowLeft' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onNavigateTime?.('prev');
      } else if (event.key === 'ArrowRight' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onNavigateTime?.('next');
      }
      
      // Go to today
      else if (event.key === 't' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onGoToToday?.();
      }
      
      // Show help
      else if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onToggleHelp?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onViewModeChange, onNavigateTime, onGoToToday, onToggleHelp]);
}
