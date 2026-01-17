import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useEnrollment = (courseId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: enrollment, isLoading } = useQuery({
    queryKey: ['enrollment', courseId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!courseId,
  });

  const { data: payment } = useQuery({
    queryKey: ['payment', courseId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!courseId,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          course_id: courseId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', courseId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Successfully enrolled in course!');
    },
    onError: (error) => {
      toast.error('Failed to enroll: ' + error.message);
    },
  });

  return {
    enrollment,
    payment,
    isEnrolled: !!enrollment,
    hasPaid: !!payment,
    isLoading,
    enroll: enrollMutation.mutate,
    isEnrolling: enrollMutation.isPending,
  };
};

export const useUserEnrollments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            *,
            profiles:instructor_id (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};
