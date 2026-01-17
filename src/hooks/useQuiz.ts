import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRewardPoints } from './useRewardPoints';
import { toast } from 'sonner';

export const useQuiz = (lessonId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addPoints } = useRewardPoints();

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          quiz_questions (
            *
          )
        `)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });

  const { data: attempts } = useQuery({
    queryKey: ['quiz-attempts', quiz?.id, user?.id],
    queryFn: async () => {
      if (!user || !quiz) return [];

      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quiz.id)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!quiz?.id,
  });

  const submitQuizMutation = useMutation({
    mutationFn: async ({
      answers,
      score,
      passed,
    }: {
      answers: number[];
      score: number;
      passed: boolean;
    }) => {
      if (!user || !quiz) throw new Error('Quiz not available');

      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quiz.id,
          score,
          passed,
          answers,
        })
        .select()
        .single();

      if (error) throw error;

      // Award points if passed
      if (passed && quiz.points_reward) {
        addPoints({
          points: quiz.points_reward,
          source: 'quiz',
          sourceId: quiz.id,
          description: `Passed quiz: ${quiz.title}`,
        });
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts', quiz?.id] });
      if (data.passed) {
        toast.success('Quiz passed! Points earned!');
      }
    },
  });

  const bestAttempt = attempts?.reduce((best, current) => 
    !best || current.score > best.score ? current : best
  , null as typeof attempts[0] | null);

  return {
    quiz,
    questions: quiz?.quiz_questions || [],
    attempts: attempts || [],
    bestAttempt,
    hasPassed: attempts?.some(a => a.passed) || false,
    isLoading,
    submitQuiz: submitQuizMutation.mutate,
    isSubmitting: submitQuizMutation.isPending,
  };
};

export const useWeeklyTests = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['weekly-tests', courseId, user?.id],
    queryFn: async () => {
      // Get all lessons marked as weekly tests for this course
      const { data: modules } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId);

      if (!modules?.length) return [];

      const { data: lessons, error } = await supabase
        .from('lessons')
        .select(`
          *,
          quizzes (
            *,
            quiz_attempts (
              *
            )
          )
        `)
        .in('module_id', modules.map(m => m.id))
        .eq('is_weekly_test', true)
        .order('week_number', { ascending: true });

      if (error) throw error;
      return lessons || [];
    },
    enabled: !!courseId,
  });
};
