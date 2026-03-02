import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Trophy, TrendingUp, Users, Target, Award, BookOpen } from 'lucide-react';

interface ScoreAnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  total_score: number;
  quizzes_taken: number;
  avg_score: number;
}

interface ProgressPoint {
  date: string;
  avg_score: number;
  attempts: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--secondary))', '#f59e0b', '#ef4444'];

const ScoreAnalyticsDashboard = ({ isOpen, onClose, courseId, courseTitle }: ScoreAnalyticsDashboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [progressData, setProgressData] = useState<ProgressPoint[]>([]);
  const [completionData, setCompletionData] = useState<{ name: string; value: number }[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, avgScore: 0, completionRate: 0, totalAttempts: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && courseId) fetchAllData();
  }, [isOpen, courseId]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Get quiz IDs for this course
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('id, lesson_id, lessons!inner(module_id, modules!inner(course_id))')
        .eq('lessons.modules.course_id', courseId);

      const quizIds = (quizzes || []).map(q => q.id);

      // Get all attempts for these quizzes
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .in('quiz_id', quizIds.length ? quizIds : ['none']);

      // Get enrollments
      const { count: enrollCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId);

      // Get completed enrollments
      const { count: completedCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)
        .not('completed_at', 'is', null);

      const allAttempts = attempts || [];
      const totalStudents = enrollCount || 0;
      const avgScore = allAttempts.length
        ? Math.round(allAttempts.reduce((s, a) => s + a.score, 0) / allAttempts.length)
        : 0;

      setStats({
        totalStudents,
        avgScore,
        completionRate: totalStudents > 0 ? Math.round(((completedCount || 0) / totalStudents) * 100) : 0,
        totalAttempts: allAttempts.length,
      });

      // Build leaderboard
      const userScores: Record<string, { total: number; count: number }> = {};
      allAttempts.forEach(a => {
        if (!userScores[a.user_id]) userScores[a.user_id] = { total: 0, count: 0 };
        userScores[a.user_id].total += a.score;
        userScores[a.user_id].count++;
      });

      const userIds = Object.keys(userScores);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds.length ? userIds : ['none']);

      const profileMap: Record<string, string> = {};
      (profiles || []).forEach(p => { profileMap[p.user_id] = p.full_name || 'Student'; });

      const lb: LeaderboardEntry[] = userIds.map(uid => ({
        user_id: uid,
        full_name: profileMap[uid] || 'Student',
        total_score: userScores[uid].total,
        quizzes_taken: userScores[uid].count,
        avg_score: Math.round(userScores[uid].total / userScores[uid].count),
      })).sort((a, b) => b.avg_score - a.avg_score);

      setLeaderboard(lb);

      // Build progress over time (group by month)
      const monthlyData: Record<string, { total: number; count: number }> = {};
      allAttempts.forEach(a => {
        const month = new Date(a.completed_at).toLocaleDateString('en-US', { year: '2-digit', month: 'short' });
        if (!monthlyData[month]) monthlyData[month] = { total: 0, count: 0 };
        monthlyData[month].total += a.score;
        monthlyData[month].count++;
      });

      setProgressData(
        Object.entries(monthlyData).map(([date, d]) => ({
          date,
          avg_score: Math.round(d.total / d.count),
          attempts: d.count,
        }))
      );

      // Completion funnel
      const passedStudents = new Set(allAttempts.filter(a => a.passed).map(a => a.user_id)).size;
      setCompletionData([
        { name: 'Enrolled', value: totalStudents },
        { name: 'Attempted Quiz', value: userIds.length },
        { name: 'Passed', value: passedStudents },
        { name: 'Completed Course', value: completedCount || 0 },
      ]);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Score Analytics: {courseTitle}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="completion">Completion</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Users, label: 'Total Students', value: stats.totalStudents },
                  { icon: Target, label: 'Avg Score', value: `${stats.avgScore}%` },
                  { icon: Award, label: 'Completion Rate', value: `${stats.completionRate}%` },
                  { icon: BookOpen, label: 'Total Attempts', value: stats.totalAttempts },
                ].map(s => (
                  <div key={s.label} className="border border-border p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{s.label}</span>
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Score distribution bar chart */}
              <div className="border border-border p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Score Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { range: '90-100', count: leaderboard.filter(s => s.avg_score >= 90).length },
                    { range: '80-89', count: leaderboard.filter(s => s.avg_score >= 80 && s.avg_score < 90).length },
                    { range: '70-79', count: leaderboard.filter(s => s.avg_score >= 70 && s.avg_score < 80).length },
                    { range: '60-69', count: leaderboard.filter(s => s.avg_score >= 60 && s.avg_score < 70).length },
                    { range: '<60', count: leaderboard.filter(s => s.avg_score < 60).length },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-4">
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Student</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Avg Score</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Quizzes</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No quiz attempts yet</td></tr>
                    ) : (
                      leaderboard.map((entry, i) => (
                        <tr key={entry.user_id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {i < 3 ? (
                                <Trophy className={`w-5 h-5 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                              ) : (
                                <span className="text-muted-foreground w-5 text-center">{i + 1}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium">{entry.full_name}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${entry.avg_score >= 80 ? 'text-green-500' : entry.avg_score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {entry.avg_score}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{entry.quizzes_taken}</td>
                          <td className="px-4 py-3 font-medium">{entry.total_score}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="mt-4">
              <div className="border border-border p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Average Score Over Time</h3>
                {progressData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Legend />
                      <Line type="monotone" dataKey="avg_score" stroke="hsl(var(--primary))" strokeWidth={2} name="Avg Score" />
                      <Line type="monotone" dataKey="attempts" stroke="hsl(var(--accent))" strokeWidth={2} name="Attempts" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completion" className="mt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-border p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">Student Funnel</h3>
                  <div className="space-y-3">
                    {completionData.map((stage, i) => {
                      const maxVal = completionData[0]?.value || 1;
                      const pct = maxVal > 0 ? (stage.value / maxVal) * 100 : 0;
                      return (
                        <div key={stage.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{stage.name}</span>
                            <span className="font-semibold">{stage.value}</span>
                          </div>
                          <div className="h-6 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border border-border p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={completionData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name }) => name}>
                        {completionData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScoreAnalyticsDashboard;
