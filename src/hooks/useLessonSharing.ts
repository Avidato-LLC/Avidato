// src/hooks/useLesonSharing.ts
import { useState, useCallback } from 'react';
import { shareLesson } from '@/app/actions/ai-generation';

/**
 * Modular Hook for Lesson Sharing
 * 
 * Handles the functionality of marking lessons as shared with students.
 * Provides:
 * - Sharing state management
 * - Loading states during API calls
 * - Error handling
 * - Success callbacks
 * 
 * Usage:
 * const { isSharing, shareLesson: handleShare, error } = useLessonSharing();
 * await handleShare(lessonId, studentId);
 */

interface UseLessonSharingResult {
  isSharing: boolean;
  shareLesson: (lessonId: string, studentId: string) => Promise<boolean>;
  error: string | null;
  clearError: () => void;
}

export function useLessonSharing(): UseLessonSharingResult {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShareLesson = useCallback(
    async (lessonId: string, studentId: string): Promise<boolean> => {
      setIsSharing(true);
      setError(null);

      try {
        const result = await shareLesson(lessonId, studentId);
        if (result.success) {
          return true;
        } else {
          setError(result.error || 'Failed to share lesson');
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        return false;
      } finally {
        setIsSharing(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSharing,
    shareLesson: handleShareLesson,
    error,
    clearError,
  };
}
