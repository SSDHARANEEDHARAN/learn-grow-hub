import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Award, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';
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

  const calculateScore = useCallback(() => {
    if (!questions.length) return 0;
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct_answer) {
        correct++;
      }
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
    
    submitQuiz({
      answers: selectedAnswers,
      score,
      passed,
    });
  }, [quiz, calculateScore, selectedAnswers, submitQuiz]);

  // Timer effect
  useEffect(() => {
    if (!quizStarted || !quiz?.time_limit || showResults) return;

    // Initialize timer when quiz starts
    if (timeRemaining === null) {
      setTimeRemaining(quiz.time_limit * 60); // Convert minutes to seconds
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
    if (timeRemaining <= 60) return 'text-destructive animate-pulse';
    if (timeRemaining <= 180) return 'text-warning';
    return 'text-muted-foreground';
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
    if (quiz?.time_limit) {
      setTimeRemaining(quiz.time_limit * 60);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-8 space-y-6">
        <Skeleton className="h-20 w-20 rounded-2xl mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
        <div className="flex justify-center gap-8">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-11 w-32 mx-auto" />
      </div>
    );
  }

  // No quiz available
  if (!quiz || questions.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto">
          <Award className="w-10 h-10 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-display font-bold text-2xl mb-2">No Quiz Available</h3>
          <p className="text-muted-foreground">
            There's no quiz for this lesson yet. Check back later!
          </p>
        </div>
      </div>
    );
  }

  // Start Screen
  if (!quizStarted) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Award className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-2xl mb-2">{quiz.title}</h3>
          <p className="text-muted-foreground">
            Test your knowledge and earn your certificate
          </p>
        </div>
        <div className="flex justify-center gap-8 text-sm flex-wrap">
          {quiz.time_limit && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{quiz.time_limit} minutes</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
            <span>{questions.length} questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-muted-foreground" />
            <span>{quiz.passing_score}% to pass</span>
          </div>
        </div>
        
        {hasPassed && bestAttempt && (
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center justify-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">You've already passed this quiz!</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Best score: {bestAttempt.score}%
            </p>
          </div>
        )}

        {quiz.time_limit && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm">
            <div className="flex items-center justify-center gap-2 text-warning">
              <AlertTriangle className="w-4 h-4" />
              <span>This quiz has a {quiz.time_limit} minute time limit</span>
            </div>
          </div>
        )}
        
        <Button variant="hero" size="lg" onClick={startQuiz}>
          {hasPassed ? 'Retake Quiz' : 'Start Quiz'}
        </Button>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const score = submittedScore ?? calculateScore();
    const passed = submittedPassed ?? score >= (quiz.passing_score || 70);

    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-6">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${
          passed ? 'bg-success/10' : 'bg-destructive/10'
        }`}>
          {passed ? (
            <Award className="w-12 h-12 text-success" />
          ) : (
            <XCircle className="w-12 h-12 text-destructive" />
          )}
        </div>
        
        <div>
          <h3 className="font-display font-bold text-3xl mb-2">
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h3>
          <p className="text-muted-foreground">
            {passed 
              ? `You passed the quiz${quiz.points_reward ? ` and earned ${quiz.points_reward} points` : ''}!`
              : `You need ${quiz.passing_score}% to pass. Try again!`
            }
          </p>
        </div>

        <div className="py-6">
          <div className="text-6xl font-display font-bold mb-2">
            <span className={passed ? 'text-success' : 'text-destructive'}>{score}%</span>
          </div>
          <p className="text-muted-foreground">
            {selectedAnswers.filter((a, i) => a === questions[i]?.correct_answer).length} of {questions.length} correct
          </p>
        </div>

        {/* Detailed Question Review */}
        <div className="text-left space-y-4">
          <h4 className="font-semibold text-lg">Review Your Answers</h4>
          {questions.map((q, index) => {
            const isCorrect = selectedAnswers[index] === q.correct_answer;
            const userAnswer = selectedAnswers[index];
            const options = Array.isArray(q.options) ? q.options : [];
            
            return (
              <div key={q.id} className={`p-4 rounded-xl border-2 ${
                isCorrect ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'
              }`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-3">
                    <p className="font-medium">
                      <span className="text-muted-foreground">Q{index + 1}:</span> {q.question}
                    </p>
                    
                    {/* Answer options with highlighting */}
                    <div className="space-y-2">
                      {options.map((option, optIndex) => {
                        const isUserAnswer = userAnswer === optIndex;
                        const isCorrectAnswer = q.correct_answer === optIndex;
                        
                        let optionStyle = 'bg-secondary/30';
                        if (isCorrectAnswer) {
                          optionStyle = 'bg-success/20 border-success/40 border';
                        } else if (isUserAnswer && !isCorrect) {
                          optionStyle = 'bg-destructive/20 border-destructive/40 border';
                        }
                        
                        return (
                          <div 
                            key={optIndex}
                            className={`p-3 rounded-lg ${optionStyle} flex items-center gap-2`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                              isCorrectAnswer 
                                ? 'bg-success text-success-foreground' 
                                : isUserAnswer 
                                  ? 'bg-destructive text-destructive-foreground' 
                                  : 'bg-muted text-muted-foreground'
                            }`}>
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            <span className={`text-sm ${isCorrectAnswer ? 'font-medium' : ''}`}>
                              {option as string}
                            </span>
                            {isCorrectAnswer && (
                              <CheckCircle className="w-4 h-4 text-success ml-auto" />
                            )}
                            {isUserAnswer && !isCorrect && (
                              <XCircle className="w-4 h-4 text-destructive ml-auto" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 mt-2">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-primary">Explanation:</span> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center pt-4">
          <Button variant="outline" onClick={resetQuiz} className="gap-2" disabled={isSubmitting}>
            <RotateCcw className="w-4 h-4" />
            Retry Quiz
          </Button>
          {passed && (
            <Button variant="hero" className="gap-2">
              <Award className="w-4 h-4" />
              View Certificate
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Quiz Questions with Timer
  const options = Array.isArray(question?.options) ? question.options : [];
  
  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      {/* Header with Progress and Timer */}
      <div className="space-y-4">
        {/* Timer Display */}
        {timeRemaining !== null && (
          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary/50 ${getTimerColor()}`}>
            <Clock className="w-5 h-5" />
            <span className="font-mono text-lg font-bold">{formatTime(timeRemaining)}</span>
            {timeRemaining <= 60 && (
              <span className="text-sm">remaining</span>
            )}
          </div>
        )}
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question */}
      <div className="py-4">
        <h4 className="font-display font-semibold text-xl mb-6">
          {question?.question}
        </h4>

        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                selectedAnswers[currentQuestion] === index
                  ? 'bg-primary/20 border-2 border-primary'
                  : 'bg-secondary/50 border-2 border-transparent hover:bg-secondary'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  selectedAnswers[currentQuestion] === index
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-medium">{option as string}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border/50">
        <Button 
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
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
