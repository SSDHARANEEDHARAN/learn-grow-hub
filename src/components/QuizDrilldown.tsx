import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizDrilldownProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  quizTitle: string;
}

interface QuestionDetail {
  question: string;
  options: string[];
  correct_answer: number;
  totalAttempts: number;
  correctCount: number;
  correctRate: number;
  optionCounts: number[];
}

export default function QuizDrilldown({ isOpen, onClose, quizId, quizTitle }: QuizDrilldownProps) {
  const [details, setDetails] = useState<QuestionDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !quizId) return;
    void fetchDetails();
  }, [isOpen, quizId]);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const [{ data: questions }, { data: attempts }] = await Promise.all([
        supabase.from('quiz_questions').select('*').eq('quiz_id', quizId).order('order_index'),
        supabase.from('quiz_attempts').select('answers').eq('quiz_id', quizId),
      ]);

      if (!questions?.length) { setDetails([]); return; }

      const sorted = questions.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));

      const result: QuestionDetail[] = sorted.map((q: any, idx: number) => {
        const opts = Array.isArray(q.options) ? q.options as string[] : [];
        const optionCounts = Array.from({ length: opts.length }, () => 0);
        let correctCount = 0;
        let totalAttempts = 0;

        (attempts || []).forEach((a: any) => {
          const ans = Array.isArray(a.answers) ? a.answers : [];
          const selected = ans[idx];
          if (typeof selected === 'number' && selected >= 0 && selected < opts.length) {
            totalAttempts++;
            optionCounts[selected]++;
            if (selected === q.correct_answer) correctCount++;
          }
        });

        return {
          question: q.question,
          options: opts,
          correct_answer: q.correct_answer,
          totalAttempts,
          correctCount,
          correctRate: totalAttempts ? Math.round((correctCount / totalAttempts) * 100) : 0,
          optionCounts,
        };
      });

      setDetails(result);
    } catch (e) {
      console.error('Drilldown error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getHeatColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500/20 text-green-700 dark:text-green-400';
    if (rate >= 60) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    if (rate >= 40) return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
    return 'bg-red-500/20 text-red-700 dark:text-red-400';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-4 h-4" /></Button>
            Quiz Drilldown: {quizTitle}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : details.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No question data available.</p>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Heatmap overview */}
            <div>
              <h3 className="font-semibold mb-2">Correct Rate Heatmap</h3>
              <div className="flex flex-wrap gap-2">
                {details.map((d, i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold ${getHeatColor(d.correctRate)}`}
                    title={`Q${i + 1}: ${d.correctRate}% correct`}
                  >
                    Q{i + 1}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/20" /> ≥80%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/20" /> ≥60%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500/20" /> ≥40%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/20" /> &lt;40%</span>
              </div>
            </div>

            {/* Per-question detail */}
            <div className="space-y-3">
              {details.map((d, i) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm"><span className="text-muted-foreground">Q{i + 1}:</span> {d.question}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${getHeatColor(d.correctRate)}`}>
                      {d.correctRate}%
                    </span>
                  </div>

                  {/* Option breakdown */}
                  <div className="space-y-1.5">
                    {d.options.map((opt, oi) => {
                      const pct = d.totalAttempts ? Math.round((d.optionCounts[oi] / d.totalAttempts) * 100) : 0;
                      const isCorrect = oi === d.correct_answer;
                      return (
                        <div key={oi} className="flex items-center gap-2 text-sm">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                            isCorrect ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className="flex-1 truncate">{opt}</span>
                          <div className="w-24 h-4 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isCorrect ? 'bg-primary' : 'bg-muted-foreground/40'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">{pct}% ({d.optionCounts[oi]})</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">{d.totalAttempts} total responses</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
