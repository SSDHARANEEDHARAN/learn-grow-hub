import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UseVideoProgressProps {
  lessonId: string;
  onProgressUpdate?: (progress: number, isCompleted: boolean) => void;
}

export function useVideoProgress({ lessonId, onProgressUpdate }: UseVideoProgressProps) {
  const { user } = useAuth();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedProgressRef = useRef<number>(0);

  const saveProgress = useCallback(async (
    currentTime: number, 
    duration: number, 
    forceComplete = false
  ) => {
    if (!user || !lessonId) return;

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const isCompleted = forceComplete || progressPercent >= 90;

    // Only save if progress changed significantly (every 5%)
    if (Math.abs(progressPercent - lastSavedProgressRef.current) < 5 && !forceComplete) {
      return;
    }

    lastSavedProgressRef.current = progressPercent;

    // For now, just update local state since we're using mock data
    onProgressUpdate?.(progressPercent, isCompleted);
  }, [user, lessonId, onProgressUpdate]);

  const debouncedSaveProgress = useCallback((currentTime: number, duration: number) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress(currentTime, duration);
    }, 2000);
  }, [saveProgress]);

  const markAsComplete = useCallback(async () => {
    if (!user || !lessonId) return;
    
    onProgressUpdate?.(100, true);
  }, [user, lessonId, onProgressUpdate]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveProgress,
    debouncedSaveProgress,
    markAsComplete,
  };
}
