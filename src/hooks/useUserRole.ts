import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'instructor' | 'student';

export function useUserRole() {
  const { user } = useAuth();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data || []).map((r) => r.role as AppRole);
    },
    enabled: !!user,
  });

  const isInstructor = roles?.includes('instructor') || roles?.includes('admin') || false;
  const isStudent = roles?.includes('student') || false;
  const isAdmin = roles?.includes('admin') || false;

  return { roles: roles || [], isInstructor, isStudent, isAdmin, isLoading };
}
