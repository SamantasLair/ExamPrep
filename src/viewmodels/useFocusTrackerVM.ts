import { useState, useEffect, useCallback } from 'react';

const MAX_VIOLATIONS = 3;

export function useFocusTrackerVM(examId: string, onMaxViolations?: () => void) {
  const [isFocused, setIsFocused] = useState(true);
  const [violationCount, setViolationCount] = useState(0);

  // Restore violations from local storage to prevent refresh cheating
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`exaprep_violations_${examId}`);
      if (saved) {
        setViolationCount(parseInt(saved, 10));
      }
    } catch { /* ignore */ }
  }, [examId]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      setIsFocused(false);
      setViolationCount(prev => {
        const newCount = prev + 1;
        try {
          localStorage.setItem(`exaprep_violations_${examId}`, newCount.toString());
        } catch { /* ignore */ }
        
        if (newCount >= MAX_VIOLATIONS && onMaxViolations) {
          onMaxViolations();
        }
        return newCount;
      });
    } else {
      setIsFocused(true);
    }
  }, [examId, onMaxViolations]);

  useEffect(() => {
    // Only track if we haven't hit the max limit (optional, but good practice)
    if (violationCount < MAX_VIOLATIONS) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange, violationCount]);

  const acknowledgeWarning = useCallback(() => {
    setIsFocused(true);
  }, []);

  return {
    isFocused,
    violationCount,
    maxViolations: MAX_VIOLATIONS,
    acknowledgeWarning
  };
}
