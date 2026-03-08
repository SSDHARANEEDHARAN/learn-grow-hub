import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ChevronRight, ChevronLeft, CheckCircle, XCircle, RotateCcw, Loader2, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AIQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface AIQuizComponentProps {
  courseTitle: string;
  courseDescription: string | null;
  courseLevel: string | null;
}

const AIQuizComponent = ({ courseTitle, courseDescription, courseLevel }: AIQuizComponentProps) => {
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const { toast } = useToast();

  const generateQuiz = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-quiz', {
        body: {
          courseTitle,
          courseDescription,
          courseLevel: courseLevel || 'beginner',
          questionCount: 5,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setQuestions(data.questions);
      setSelectedAnswers({});
      setCurrentIndex(0);
      setShowResults(false);
      setQuizStarted(true);
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Quiz Generation Failed',
        description: e.message || 'Could not generate quiz. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectAnswer = (optionIndex: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const score = questions.reduce(
    (acc, q, i) => acc + (selectedAnswers[i] === q.correct_answer ? 1 : 0),
    0
  );

  const allAnswered = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;

  if (!quizStarted) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-2xl font-bold">AI-Powered Quiz</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Test your knowledge with AI-generated questions tailored to this course's content and difficulty level.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary">5 Questions</Badge>
            <Badge variant="secondary" className="capitalize">{courseLevel || 'Beginner'} Level</Badge>
            <Badge variant="secondary">AI Generated</Badge>
          </div>
          <Button onClick={generateQuiz} disabled={isGenerating} size="lg" className="gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate AI Quiz
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <div className="space-y-6">
        <Card className="border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="font-display text-2xl font-bold">Quiz Results</h3>
            <div className="text-5xl font-bold text-primary">{percent}%</div>
            <p className="text-muted-foreground">
              You got {score} out of {questions.length} correct
            </p>
            <Progress value={percent} className="h-3 max-w-xs mx-auto" />
            <Button onClick={generateQuiz} disabled={isGenerating} variant="outline" className="gap-2 mt-4">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Generate New Quiz
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {questions.map((q, i) => {
            const isCorrect = selectedAnswers[i] === q.correct_answer;
            return (
              <Card key={i} className={cn('border', isCorrect ? 'border-green-500/30' : 'border-destructive/30')}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    )}
                    <p className="font-medium">{q.question}</p>
                  </div>
                  <div className="grid gap-2 pl-7">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={cn(
                          'px-3 py-2 rounded text-sm border',
                          oi === q.correct_answer && 'bg-green-500/10 border-green-500/30 text-green-400',
                          oi === selectedAnswers[i] && oi !== q.correct_answer && 'bg-destructive/10 border-destructive/30 text-destructive'
                        )}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground pl-7 italic">{q.explanation}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="w-3 h-3" />
          AI Quiz
        </Badge>
        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{current.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {current.options.map((opt, oi) => (
            <button
              key={oi}
              onClick={() => selectAnswer(oi)}
              className={cn(
                'w-full text-left px-4 py-3 border rounded transition-colors',
                selectedAnswers[currentIndex] === oi
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="font-mono text-sm mr-3 text-muted-foreground">
                {String.fromCharCode(65 + oi)}.
              </span>
              {opt}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(i => i - 1)}
          disabled={currentIndex === 0}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentIndex(i => i + 1)}
            disabled={selectedAnswers[currentIndex] === undefined}
            className="gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setShowResults(true)}
            disabled={!allAnswered}
            className="gap-1"
          >
            Submit Quiz <CheckCircle className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AIQuizComponent;
