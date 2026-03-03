import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserEnrollments } from '@/hooks/useEnrollment';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Clock, TrendingUp, Target, Calendar, Zap, BookOpen, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const StudentProgressDashboard = () => {
  const { user } = useAuth();

  // Fetch quiz attempts for score trends
  const { data: quizAttempts } = useQuery({
    queryKey: ['student-quiz-attempts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('quiz_attempts')
        .select('score, passed, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: true });
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch lesson progress for watch time & streaks
  const { data: lessonProgress } = useQuery({
    queryKey: ['student-lesson-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('lesson_progress')
        .select('is_completed, progress_seconds, last_watched_at, completed_at')
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: true });
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch reward points
  const { data: rewardPoints } = useQuery({
    queryKey: ['student-reward-points', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('reward_points')
        .select('points, earned_at, source')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: true });
      return data || [];
    },
    enabled: !!user,
  });

  // Calculate streak
  const streak = useMemo(() => {
    if (!lessonProgress?.length) return 0;
    const dates = [...new Set(
      lessonProgress
        .filter(p => p.last_watched_at)
        .map(p => new Date(p.last_watched_at!).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let count = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (new Date(dates[i]).toDateString() === expected.toDateString()) {
        count++;
      } else break;
    }
    return count;
  }, [lessonProgress]);

  // Weekly study time (last 7 days by day)
  const weeklyStudyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const mins = (lessonProgress || [])
        .filter(p => p.last_watched_at && new Date(p.last_watched_at).toDateString() === dateStr)
        .reduce((sum, p) => sum + (p.progress_seconds || 0), 0) / 60;
      result.push({ day: days[d.getDay()], minutes: Math.round(mins) });
    }
    return result;
  }, [lessonProgress]);

  const totalStudyMinutes = weeklyStudyData.reduce((s, d) => s + d.minutes, 0);

  // Score improvement trend
  const scoreTrend = useMemo(() => {
    if (!quizAttempts?.length) return [];
    return quizAttempts.slice(-10).map((a, i) => ({
      attempt: `#${i + 1}`,
      score: a.score,
    }));
  }, [quizAttempts]);

  const avgScore = quizAttempts?.length 
    ? Math.round(quizAttempts.reduce((s, a) => s + a.score, 0) / quizAttempts.length) 
    : 0;

  const totalPoints = rewardPoints?.reduce((s, p) => s + p.points, 0) || 0;
  const completedLessons = lessonProgress?.filter(p => p.is_completed).length || 0;

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Flame, label: 'Day Streak', value: streak, accent: true },
          { icon: Clock, label: 'Study (7d)', value: `${totalStudyMinutes}m` },
          { icon: TrendingUp, label: 'Avg Score', value: `${avgScore}%` },
          { icon: Zap, label: 'Total Points', value: totalPoints },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                kpi.accent ? 'bg-primary/10' : 'bg-secondary'
              }`}>
                <kpi.icon className={`w-5 h-5 ${kpi.accent ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Study Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Weekly Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyStudyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                  formatter={(v: number) => [`${v} min`, 'Study Time']}
                />
                <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Improvement */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scoreTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="attempt" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(v: number) => [`${v}%`, 'Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
                <Target className="w-8 h-8 mb-2" />
                <p className="text-sm">Take quizzes to see your progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{completedLessons}</p>
              <p className="text-xs text-muted-foreground">Lessons Done</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{quizAttempts?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Quizzes Taken</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{quizAttempts?.filter(a => a.passed).length || 0}</p>
              <p className="text-xs text-muted-foreground">Quizzes Passed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProgressDashboard;
