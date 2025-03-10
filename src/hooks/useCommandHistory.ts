
import { useState, useCallback } from 'react';

export const useCommandHistory = (maxHistory = 50) => {
  const [history, setHistory] = useState<string[]>([]);
  const [currentPosition, setCurrentPosition] = useState<number | null>(null);

  const addToHistory = useCallback((command: string) => {
    setHistory(prev => {
      // Don't add duplicate commands in sequence
      if (prev.length > 0 && prev[0] === command) {
        return prev;
      }
      
      // Add to history and limit size
      const newHistory = [command, ...prev];
      if (newHistory.length > maxHistory) {
        return newHistory.slice(0, maxHistory);
      }
      return newHistory;
    });
    
    // Reset position after adding new command
    setCurrentPosition(null);
  }, [maxHistory]);

  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    if (history.length === 0) return;
    
    if (direction === 'up') {
      // Moving back in history (older commands)
      setCurrentPosition(prev => {
        if (prev === null) return 0;
        return Math.min(prev + 1, history.length - 1);
      });
    } else {
      // Moving forward in history (newer commands)
      setCurrentPosition(prev => {
        if (prev === null || prev === 0) return null;
        return prev - 1;
      });
    }
  }, [history]);

  return {
    history,
    addToHistory,
    navigateHistory,
    currentPosition
  };
};
