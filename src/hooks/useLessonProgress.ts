import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useLessonProgress = (courseId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['lesson-progress', courseId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all lessons for this course
      const { data: modules } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId);

      if (!modules?.length) return [];

      const { data, error } = await supabase
        .from('lesson_progress')
        .select(`
          *,
          lessons (
            id,
            module_id,
            title
          )
        `)
        .eq('user_id', user.id)
        .in('lesson_id', 
          (await supabase
            .from('lessons')
            .select('id')
            .in('module_id', modules.map(m => m.id))
          ).data?.map(l => l.id) || []
        );

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!courseId,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({
      lessonId,
      progressSeconds,
      durationSeconds,
      isCompleted,
    }: {
      lessonId: string;
      progressSeconds: number;
      durationSeconds: number;
      isCompleted?: boolean;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          progress_seconds: progressSeconds,
          duration_seconds: durationSeconds,
          is_completed: isCompleted || false,
          completed_at: isCompleted ? new Date().toISOString() : null,
          last_watched_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', courseId] });
    },
  });

  const completedLessons = progress?.filter(p => p.is_completed) || [];
  const totalWatchTime = progress?.reduce((acc, p) => acc + (p.progress_seconds || 0), 0) || 0;

  return {
    progress: progress || [],
    completedLessons,
    totalWatchTime,
    isLoading,
    updateProgress: updateProgressMutation.mutate,
  };
};
