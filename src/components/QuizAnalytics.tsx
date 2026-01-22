import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HelpCircle, Target, TrendingUp, Award, ListChecks } from 'lucide-react';

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
  passRate: number; // 0-100
  avgScore: number; // 0-100
};

type QuestionStat = {
  quizTitle: string;
  question: string;
  attempts: number;
  correctRate: number; // 0-100
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))', 'hsl(var(--accent))'];

export default function QuizAnalytics({ isOpen, onClose, courseId, courseTitle }: QuizAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quizSummary, setQuizSummary] = useState<QuizSummary[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStat[]>([]);
  const [totals, setTotals] = useState({ attempts: 0, passRate: 0, avgScore: 0 });

  useEffect(() => {
    if (!isOpen || !courseId) return;
    void fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, courseId]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // 1) Resolve course -> modules -> lessons -> quizzes
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId);
      if (modulesError) throw modulesError;

      const moduleIds = (modules || []).map((m) => m.id);
      if (!moduleIds.length) {
        setQuizSummary([]);
        setQuestionStats([]);
        setTotals({ attempts: 0, passRate: 0, avgScore: 0 });
        return;
      }

      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, is_weekly_test')
        .in('module_id', moduleIds);
      if (lessonsError) throw lessonsError;

      const lessonIds = (lessons || []).map((l) => l.id);
      if (!lessonIds.length) {
        setQuizSummary([]);
        setQuestionStats([]);
        setTotals({ attempts: 0, passRate: 0, avgScore: 0 });
        return;
      }

      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id, title, lesson_id')
        .in('lesson_id', lessonIds);
      if (quizzesError) throw quizzesError;

      const quizIds = (quizzes || []).map((q) => q.id);
      if (!quizIds.length) {
        setQuizSummary([]);
        setQuestionStats([]);
        setTotals({ attempts: 0, passRate: 0, avgScore: 0 });
        return;
      }

      // 2) Fetch questions + attempts for those quizzes
      const [{ data: questions, error: questionsError }, { data: attempts, error: attemptsError }] = await Promise.all([
        supabase
          .from('quiz_questions')
          .select('quiz_id, question, correct_answer, order_index')
          .in('quiz_id', quizIds),
        supabase
          .from('quiz_attempts')
          .select('quiz_id, score, passed, answers')
          .in('quiz_id', quizIds),
      ]);
      if (questionsError) throw questionsError;
      if (attemptsError) throw attemptsError;

      const quizTitleById = new Map((quizzes || []).map((q) => [q.id, q.title] as const));

      // Quiz summary
      const attemptsByQuiz = new Map<string, { total: number; passed: number; scoreSum: number }>();
      (attempts || []).forEach((a) => {
        const entry = attemptsByQuiz.get(a.quiz_id) || { total: 0, passed: 0, scoreSum: 0 };
        entry.total += 1;
        entry.passed += a.passed ? 1 : 0;
        entry.scoreSum += a.score || 0;
        attemptsByQuiz.set(a.quiz_id, entry);
      });

      const summary: QuizSummary[] = (quizzes || []).map((q) => {
        const agg = attemptsByQuiz.get(q.id) || { total: 0, passed: 0, scoreSum: 0 };
        const avg = agg.total ? Math.round(agg.scoreSum / agg.total) : 0;
        const passRate = agg.total ? Math.round((agg.passed / agg.total) * 100) : 0;
        return {
          quizId: q.id,
          title: q.title,
          attempts: agg.total,
          passRate,
          avgScore: avg,
        };
      });

      const totalAttempts = summary.reduce((acc, s) => acc + s.attempts, 0);
      const weightedPass = totalAttempts
        ? Math.round(summary.reduce((acc, s) => acc + s.passRate * s.attempts, 0) / totalAttempts)
        : 0;
      const weightedAvgScore = totalAttempts
        ? Math.round(summary.reduce((acc, s) => acc + s.avgScore * s.attempts, 0) / totalAttempts)
        : 0;

      setQuizSummary(summary.sort((a, b) => a.title.localeCompare(b.title)));
      setTotals({ attempts: totalAttempts, passRate: weightedPass, avgScore: weightedAvgScore });

      // Question-level statistics
      // We compute correctness per question index using answers[] from attempts.
      // answers is stored as jsonb; we treat it as number[] when possible.
      const questionsByQuiz = new Map<string, Array<{ question: string; correct_answer: number; order_index: number }>>();
      (questions || []).forEach((q: any) => {
        const list = questionsByQuiz.get(q.quiz_id) || [];
        list.push({ question: q.question, correct_answer: q.correct_answer, order_index: q.order_index || 0 });
        questionsByQuiz.set(q.quiz_id, list);
      });

      // Build per question aggregations.
      const qAgg = new Map<string, { quizId: string; quizTitle: string; question: string; total: number; correct: number }>();
      (attempts || []).forEach((a: any) => {
        const qList = (questionsByQuiz.get(a.quiz_id) || []).sort((x, y) => x.order_index - y.order_index);
        const answers: unknown = a.answers;
        const arr = Array.isArray(answers) ? (answers as unknown[]) : [];

        qList.forEach((qItem, idx) => {
          const key = `${a.quiz_id}::${idx}`;
          const entry =
            qAgg.get(key) ||
            ({
              quizId: a.quiz_id,
              quizTitle: quizTitleById.get(a.quiz_id) || 'Quiz',
              question: qItem.question,
              total: 0,
              correct: 0,
            } as const);

          const selected = typeof arr[idx] === 'number' ? (arr[idx] as number) : Number(arr[idx]);
          const isCorrect = Number.isFinite(selected) && selected === qItem.correct_answer;

          qAgg.set(key, {
            ...entry,
            total: entry.total + 1,
            correct: entry.correct + (isCorrect ? 1 : 0),
          });
        });
      });

      const questionRows: QuestionStat[] = Array.from(qAgg.values())
        .map((row) => ({
          quizTitle: row.quizTitle,
          question: row.question,
          attempts: row.total,
          correctRate: row.total ? Math.round((row.correct / row.total) * 100) : 0,
        }))
        .sort((a, b) => a.correctRate - b.correctRate)
        .slice(0, 20);

      setQuestionStats(questionRows);
    } catch (e) {
      console.error('Quiz analytics error:', e);
      setQuizSummary([]);
      setQuestionStats([]);
      setTotals({ attempts: 0, passRate: 0, avgScore: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const passFail = useMemo(
    () => [
      { name: 'Passed', value: Math.round((totals.passRate / 100) * totals.attempts) },
      { name: 'Failed', value: totals.attempts - Math.round((totals.passRate / 100) * totals.attempts) },
    ],
    [totals]
  );

  return (
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
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Attempts</span>
                </div>
                <p className="text-2xl font-bold">{totals.attempts}</p>
              </div>
              <div className="border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Pass Rate</span>
                </div>
                <p className="text-2xl font-bold">{totals.passRate}%</p>
              </div>
              <div className="border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Avg Score</span>
                </div>
                <p className="text-2xl font-bold">{totals.avgScore}%</p>
              </div>
              <div className="border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Quizzes</span>
                </div>
                <p className="text-2xl font-bold">{quizSummary.length}</p>
              </div>
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                      }}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.title || ''}
                      formatter={(value: any) => [`${value}%`, 'Avg Score']}
                    />
                    <Bar dataKey="avgScore" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">Hover bars to see quiz titles.</p>
              </div>

              <div className="border border-border bg-card p-4">
                <h3 className="font-semibold mb-4">Pass / Fail (All Attempts)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={passFail} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90}>
                      {passFail.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Question stats */}
            <div className="border border-border bg-card">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Hardest Questions (Lowest Correct Rate)</h3>
                <p className="text-sm text-muted-foreground">Top 20 by lowest correctness across attempts.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Quiz</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Question</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Attempts</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Correct</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionStats.length === 0 ? (
                      <tr>
                        <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={4}>
                          No attempt data yet.
                        </td>
                      </tr>
                    ) : (
                      questionStats.map((row, idx) => (
                        <tr key={idx} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 text-sm text-muted-foreground">{row.quizTitle}</td>
                          <td className="px-4 py-3 text-sm">{row.question}</td>
                          <td className="px-4 py-3 text-sm text-right text-muted-foreground">{row.attempts}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">{row.correctRate}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
