import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HelpCircle, Target, TrendingUp, Award, ListChecks, Download, ChevronRight } from 'lucide-react';
import QuizDrilldown from './QuizDrilldown';

interface QuizAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

type QuizSummary = {
  quizId: string;
  title: string;
  attempts: number;
  passRate: number;
  avgScore: number;
};

type QuestionStat = {
  quizTitle: string;
  question: string;
  attempts: number;
  correctRate: number;
};

type AttemptRow = {
  quiz_id: string;
  score: number;
  passed: boolean;
  answers: unknown;
  completed_at: string;
  user_id: string;
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))', 'hsl(var(--accent))'];

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function QuizAnalytics({ isOpen, onClose, courseId, courseTitle }: QuizAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quizSummary, setQuizSummary] = useState<QuizSummary[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStat[]>([]);
  const [totals, setTotals] = useState({ attempts: 0, passRate: 0, avgScore: 0 });
  const [rawAttempts, setRawAttempts] = useState<AttemptRow[]>([]);
  const [drilldownQuiz, setDrilldownQuiz] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!isOpen || !courseId) return;
    void fetchAnalytics();
  }, [isOpen, courseId]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const { data: modules } = await supabase.from('modules').select('id').eq('course_id', courseId);
      const moduleIds = (modules || []).map(m => m.id);
      if (!moduleIds.length) { setQuizSummary([]); setQuestionStats([]); setTotals({ attempts: 0, passRate: 0, avgScore: 0 }); return; }

      const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', moduleIds);
      const lessonIds = (lessons || []).map(l => l.id);
      if (!lessonIds.length) { setQuizSummary([]); setQuestionStats([]); setTotals({ attempts: 0, passRate: 0, avgScore: 0 }); return; }

      const { data: quizzes } = await supabase.from('quizzes').select('id, title, lesson_id').in('lesson_id', lessonIds);
      const quizIds = (quizzes || []).map(q => q.id);
      if (!quizIds.length) { setQuizSummary([]); setQuestionStats([]); setTotals({ attempts: 0, passRate: 0, avgScore: 0 }); return; }

      const [{ data: questions }, { data: attempts }] = await Promise.all([
        supabase.from('quiz_questions').select('quiz_id, question, correct_answer, order_index').in('quiz_id', quizIds),
        supabase.from('quiz_attempts').select('quiz_id, score, passed, answers, completed_at, user_id').in('quiz_id', quizIds),
      ]);

      setRawAttempts((attempts || []) as AttemptRow[]);
      const quizTitleById = new Map((quizzes || []).map(q => [q.id, q.title] as const));

      const attemptsByQuiz = new Map<string, { total: number; passed: number; scoreSum: number }>();
      (attempts || []).forEach(a => {
        const entry = attemptsByQuiz.get(a.quiz_id) || { total: 0, passed: 0, scoreSum: 0 };
        entry.total++;
        entry.passed += a.passed ? 1 : 0;
        entry.scoreSum += a.score || 0;
        attemptsByQuiz.set(a.quiz_id, entry);
      });

      const summary: QuizSummary[] = (quizzes || []).map(q => {
        const agg = attemptsByQuiz.get(q.id) || { total: 0, passed: 0, scoreSum: 0 };
        return {
          quizId: q.id,
          title: q.title,
          attempts: agg.total,
          passRate: agg.total ? Math.round((agg.passed / agg.total) * 100) : 0,
          avgScore: agg.total ? Math.round(agg.scoreSum / agg.total) : 0,
        };
      });

      const totalAttempts = summary.reduce((acc, s) => acc + s.attempts, 0);
      const weightedPass = totalAttempts ? Math.round(summary.reduce((acc, s) => acc + s.passRate * s.attempts, 0) / totalAttempts) : 0;
      const weightedAvg = totalAttempts ? Math.round(summary.reduce((acc, s) => acc + s.avgScore * s.attempts, 0) / totalAttempts) : 0;

      setQuizSummary(summary.sort((a, b) => a.title.localeCompare(b.title)));
      setTotals({ attempts: totalAttempts, passRate: weightedPass, avgScore: weightedAvg });

      // Question stats
      const questionsByQuiz = new Map<string, Array<{ question: string; correct_answer: number; order_index: number }>>();
      (questions || []).forEach((q: any) => {
        const list = questionsByQuiz.get(q.quiz_id) || [];
        list.push({ question: q.question, correct_answer: q.correct_answer, order_index: q.order_index || 0 });
        questionsByQuiz.set(q.quiz_id, list);
      });

      const qAgg = new Map<string, { quizTitle: string; question: string; total: number; correct: number }>();
      (attempts || []).forEach((a: any) => {
        const qList = (questionsByQuiz.get(a.quiz_id) || []).sort((x, y) => x.order_index - y.order_index);
        const arr = Array.isArray(a.answers) ? a.answers : [];
        qList.forEach((qItem, idx) => {
          const key = `${a.quiz_id}::${idx}`;
          const entry = qAgg.get(key) || { quizTitle: quizTitleById.get(a.quiz_id) || 'Quiz', question: qItem.question, total: 0, correct: 0 };
          const selected = typeof arr[idx] === 'number' ? arr[idx] : Number(arr[idx]);
          qAgg.set(key, { ...entry, total: entry.total + 1, correct: entry.correct + (Number.isFinite(selected) && selected === qItem.correct_answer ? 1 : 0) });
        });
      });

      setQuestionStats(
        Array.from(qAgg.values())
          .map(r => ({ quizTitle: r.quizTitle, question: r.question, attempts: r.total, correctRate: r.total ? Math.round((r.correct / r.total) * 100) : 0 }))
          .sort((a, b) => a.correctRate - b.correctRate)
          .slice(0, 20)
      );
    } catch (e) {
      console.error('Quiz analytics error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const exportAttempts = () => {
    const quizTitleById = new Map(quizSummary.map(q => [q.quizId, q.title]));
    const headers = ['Quiz', 'User ID', 'Score', 'Passed', 'Completed At'];
    const rows = rawAttempts.map(a => [
      quizTitleById.get(a.quiz_id) || a.quiz_id,
      a.user_id,
      String(a.score),
      a.passed ? 'Yes' : 'No',
      a.completed_at,
    ]);
    downloadCSV(`quiz-attempts-${courseTitle}.csv`, headers, rows);
  };

  const exportQuestionStats = () => {
    const headers = ['Quiz', 'Question', 'Attempts', 'Correct Rate'];
    const rows = questionStats.map(q => [q.quizTitle, q.question, String(q.attempts), `${q.correctRate}%`]);
    downloadCSV(`question-stats-${courseTitle}.csv`, headers, rows);
  };

  const passFail = useMemo(
    () => [
      { name: 'Passed', value: Math.round((totals.passRate / 100) * totals.attempts) },
      { name: 'Failed', value: totals.attempts - Math.round((totals.passRate / 100) * totals.attempts) },
    ],
    [totals]
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Quiz Analytics: {courseTitle}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {/* KPI grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2"><ListChecks className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Attempts</span></div>
                  <p className="text-2xl font-bold">{totals.attempts}</p>
                </div>
                <div className="border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2"><Award className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Pass Rate</span></div>
                  <p className="text-2xl font-bold">{totals.passRate}%</p>
                </div>
                <div className="border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Avg Score</span></div>
                  <p className="text-2xl font-bold">{totals.avgScore}%</p>
                </div>
                <div className="border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Quizzes</span></div>
                  <p className="text-2xl font-bold">{quizSummary.length}</p>
                </div>
              </div>

              {/* CSV Export */}
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={exportAttempts} disabled={rawAttempts.length === 0} className="gap-1">
                  <Download className="w-4 h-4" /> Export Attempts CSV
                </Button>
                <Button size="sm" variant="outline" onClick={exportQuestionStats} disabled={questionStats.length === 0} className="gap-1">
                  <Download className="w-4 h-4" /> Export Question Stats CSV
                </Button>
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-border bg-card p-4">
                  <h3 className="font-semibold mb-4">Average Score by Quiz</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={quizSummary}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="title" stroke="hsl(var(--muted-foreground))" hide />
                      <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} labelFormatter={(_, payload) => payload?.[0]?.payload?.title || ''} formatter={(value: any) => [`${value}%`, 'Avg Score']} />
                      <Bar dataKey="avgScore" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="border border-border bg-card p-4">
                  <h3 className="font-semibold mb-4">Pass / Fail</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={passFail} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90}>
                        {passFail.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quiz list with drilldown */}
              <div className="border border-border bg-card">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Quizzes (click for drilldown)</h3>
                </div>
                <div className="divide-y divide-border">
                  {quizSummary.map(q => (
                    <button
                      key={q.quizId}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => setDrilldownQuiz({ id: q.quizId, title: q.title })}
                    >
                      <div>
                        <p className="font-medium text-sm">{q.title}</p>
                        <p className="text-xs text-muted-foreground">{q.attempts} attempts · {q.passRate}% pass · {q.avgScore}% avg</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                  {quizSummary.length === 0 && <p className="p-4 text-sm text-muted-foreground">No quizzes yet.</p>}
                </div>
              </div>

              {/* Hardest questions */}
              <div className="border border-border bg-card">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Hardest Questions</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Quiz</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Question</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Correct</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questionStats.length === 0 ? (
                        <tr><td className="px-4 py-6 text-sm text-muted-foreground" colSpan={3}>No data yet.</td></tr>
                      ) : questionStats.map((row, idx) => (
                        <tr key={idx} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 text-sm text-muted-foreground">{row.quizTitle}</td>
                          <td className="px-4 py-3 text-sm">{row.question}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">{row.correctRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {drilldownQuiz && (
        <QuizDrilldown
          isOpen={!!drilldownQuiz}
          onClose={() => setDrilldownQuiz(null)}
          quizId={drilldownQuiz.id}
          quizTitle={drilldownQuiz.title}
        />
      )}
    </>
  );
}
