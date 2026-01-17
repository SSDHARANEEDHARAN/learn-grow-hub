import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useRewardPoints = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: points, isLoading } = useQuery({
    queryKey: ['reward-points', user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, history: [] };

      const { data, error } = await supabase
        .from('reward_points')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      const total = data?.reduce((acc, p) => acc + p.points, 0) || 0;
      return { total, history: data || [] };
    },
    enabled: !!user,
  });

  // Real-time subscription for live updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('reward-points-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reward_points',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['reward-points', user.id] });
          toast.success(`+${payload.new.points} points earned!`, {
            description: payload.new.description,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const addPointsMutation = useMutation({
    mutationFn: async ({
      points,
      source,
      sourceId,
      description,
    }: {
      points: number;
      source: string;
      sourceId?: string;
      description?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('reward_points')
        .insert({
          user_id: user.id,
          points,
          source,
          source_id: sourceId,
          description,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-points', user?.id] });
    },
  });

  return {
    totalPoints: points?.total || 0,
    pointsHistory: points?.history || [],
    isLoading,
    addPoints: addPointsMutation.mutate,
  };
};
