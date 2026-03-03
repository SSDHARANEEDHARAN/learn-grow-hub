import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Award, ArrowRight, ArrowLeft, RotateCcw, AlertTriangle, Zap, Target, BookOpen } from 'lucide-react';
import { useQuiz } from '@/hooks/useQuiz';
import { Skeleton } from '@/components/ui/skeleton';

interface QuizComponentProps {
  lessonId: string;
}

const QuizComponent = ({ lessonId }: QuizComponentProps) => {
  const { quiz, questions, hasPassed, bestAttempt, submitQuiz, isSubmitting, isLoading } = useQuiz(lessonId);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submittedPassed, setSubmittedPassed] = useState<boolean | null>(null);

  const question = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const answeredCount = selectedAnswers.filter(a => a !== undefined).length;

  const calculateScore = useCallback(() => {
    if (!questions.length) return 0;
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct_answer) correct++;
    });
    return Math.round((correct / questions.length) * 100);
  }, [questions, selectedAnswers]);

  const handleSubmitQuiz = useCallback(() => {
    if (!quiz) return;
    const score = calculateScore();
    const passed = score >= (quiz.passing_score || 70);
    setSubmittedScore(score);
    setSubmittedPassed(passed);
    setShowResults(true);
    setTimeRemaining(null);
    submitQuiz({ answers: selectedAnswers, score, passed });
  }, [quiz, calculateScore, selectedAnswers, submitQuiz]);

  useEffect(() => {
    if (!quizStarted || !quiz?.time_limit || showResults) return;
    if (timeRemaining === null) {
      setTimeRemaining(quiz.time_limit * 60);
      return;
    }
    if (timeRemaining <= 0) {
      handleSubmitQuiz();
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [quizStarted, quiz?.time_limit, timeRemaining, showResults, handleSubmitQuiz]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!timeRemaining) return 'text-muted-foreground';
    if (timeRemaining <= 60) return 'text-destructive';
    if (timeRemaining <= 180) return 'text-[hsl(var(--warning))]';
    return 'text-primary';
  };

  const handleSelectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizStarted(false);
    setTimeRemaining(null);
    setSubmittedScore(null);
    setSubmittedPassed(null);
  };

  const startQuiz = () => {
    setQuizStarted(true);
    if (quiz?.time_limit) setTimeRemaining(quiz.time_limit * 60);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No Quiz Available</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            There's no quiz for this lesson yet. Check back later!
          </p>
        </CardContent>
      </Card>
    );
  }

  // ─── Start Screen ────────────────────────────
  if (!quizStarted) {
    return (
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-2xl mb-2">{quiz.title}</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Test your knowledge and earn points
          </p>
        </div>
        <CardContent className="p-6 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {quiz.time_limit && (
              <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
                <Clock className="w-5 h-5 text-muted-foreground mb-1" />
                <span className="font-semibold text-sm">{quiz.time_limit} min</span>
                <span className="text-xs text-muted-foreground">Time Limit</span>
              </div>
            )}
            <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
              <Target className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="font-semibold text-sm">{questions.length}</span>
              <span className="text-xs text-muted-foreground">Questions</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
              <Award className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="font-semibold text-sm">{quiz.passing_score}%</span>
              <span className="text-xs text-muted-foreground">To Pass</span>
            </div>
          </div>
          
          {hasPassed && bestAttempt && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/20">
              <CheckCircle className="w-5 h-5 text-[hsl(var(--success))] shrink-0" />
              <div>
                <p className="text-sm font-medium">Already passed!</p>
                <p className="text-xs text-muted-foreground">Best: {bestAttempt.score}%</p>
              </div>
            </div>
          )}

          {quiz.time_limit && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/20 text-sm">
              <AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))] shrink-0" />
              <span>Timed quiz — {quiz.time_limit} minute limit</span>
            </div>
          )}
          
          <Button variant="hero" size="lg" onClick={startQuiz} className="w-full">
            {hasPassed ? 'Retake Quiz' : 'Start Quiz'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── Results Screen ────────────────────────────
  if (showResults) {
    const score = submittedScore ?? calculateScore();
    const passed = submittedPassed ?? score >= (quiz.passing_score || 70);
    const correctCount = selectedAnswers.filter((a, i) => a === questions[i]?.correct_answer).length;

    return (
      <div className="space-y-6">
        {/* Score card */}
        <Card className="overflow-hidden">
          <div className={`p-8 text-center ${passed ? 'bg-[hsl(var(--success))]/5' : 'bg-destructive/5'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              passed ? 'bg-[hsl(var(--success))]/10' : 'bg-destructive/10'
            }`}>
              <span className={`text-3xl font-bold ${passed ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}>
                {score}%
              </span>
            </div>
            <h3 className="font-semibold text-xl mb-1">
              {passed ? '🎉 Quiz Passed!' : 'Keep Practicing'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {correctCount} of {questions.length} correct
              {passed && quiz.points_reward ? ` • +${quiz.points_reward} points earned` : ''}
            </p>
          </div>
          <CardContent className="p-4 flex gap-3">
            <Button variant="outline" onClick={resetQuiz} className="flex-1 gap-2" disabled={isSubmitting}>
              <RotateCcw className="w-4 h-4" />
              Retry
            </Button>
            {passed && (
              <Button variant="hero" className="flex-1 gap-2">
                <Award className="w-4 h-4" />
                Certificate
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Answer review */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Review Answers</h4>
          {questions.map((q, index) => {
            const isCorrect = selectedAnswers[index] === q.correct_answer;
            const userAnswer = selectedAnswers[index];
            const options = Array.isArray(q.options) ? q.options : [];
            
            return (
              <Card key={q.id} className={`overflow-hidden border-l-4 ${
                isCorrect ? 'border-l-[hsl(var(--success))]' : 'border-l-destructive'
              }`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm font-medium">
                      <span className="text-muted-foreground mr-1">Q{index + 1}.</span>
                      {q.question}
                    </p>
                  </div>
                  
                  <div className="grid gap-1.5 pl-6">
                    {options.map((option, optIndex) => {
                      const isUserAnswer = userAnswer === optIndex;
                      const isCorrectAnswer = q.correct_answer === optIndex;
                      
                      return (
                        <div 
                          key={optIndex}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                            isCorrectAnswer
                              ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]'
                              : isUserAnswer && !isCorrect
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-secondary/30 text-muted-foreground'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isCorrectAnswer 
                              ? 'bg-[hsl(var(--success))] text-primary-foreground' 
                              : isUserAnswer 
                                ? 'bg-destructive text-primary-foreground' 
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="flex-1">{option as string}</span>
                          {isCorrectAnswer && <CheckCircle className="w-3.5 h-3.5" />}
                          {isUserAnswer && !isCorrect && <XCircle className="w-3.5 h-3.5" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && !quiz.hide_explanations && (
                    <div className="ml-6 p-3 rounded-md bg-primary/5 border border-primary/10 text-sm">
                      <span className="font-medium text-primary">💡 </span>
                      <span className="text-muted-foreground">{q.explanation}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Quiz Questions ────────────────────────────
  const options = Array.isArray(question?.options) ? question.options : [];
  
  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono">
            {currentQuestion + 1}/{questions.length}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {answeredCount} answered
          </span>
        </div>
        {timeRemaining !== null && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/50 font-mono text-sm font-semibold ${getTimerColor()} ${timeRemaining <= 60 ? 'animate-pulse' : ''}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-1.5" />

      {/* Question dots */}
      <div className="flex gap-1 flex-wrap">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQuestion(i)}
            className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
              i === currentQuestion
                ? 'bg-primary text-primary-foreground'
                : selectedAnswers[i] !== undefined
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <h4 className="font-semibold text-lg leading-relaxed">
            {question?.question}
          </h4>

          <div className="space-y-2">
            {options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion] === index;
              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  className={`w-full p-3.5 rounded-lg text-left transition-all duration-150 flex items-center gap-3 border ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-sm'
                      : 'bg-secondary/30 border-transparent hover:bg-secondary/60 hover:border-border'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>{option as string}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        <Button 
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button 
          variant="hero"
          onClick={handleNext}
          disabled={selectedAnswers[currentQuestion] === undefined || isSubmitting}
          className="gap-2"
        >
          {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuizComponent;
