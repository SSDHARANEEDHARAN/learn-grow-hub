import { useState } from 'react';
import { mockQuiz } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Award, ArrowRight, RotateCcw } from 'lucide-react';

const QuizComponent = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const question = mockQuiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / mockQuiz.questions.length) * 100;

  const handleSelectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < mockQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    mockQuiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / mockQuiz.questions.length) * 100);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizStarted(false);
  };

  // Start Screen
  if (!quizStarted) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Award className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-2xl mb-2">{mockQuiz.title}</h3>
          <p className="text-muted-foreground">
            Test your knowledge and earn your certificate
          </p>
        </div>
        <div className="flex justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{mockQuiz.timeLimit} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
            <span>{mockQuiz.questions.length} questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-muted-foreground" />
            <span>{mockQuiz.passingScore}% to pass</span>
          </div>
        </div>
        <Button variant="hero" size="lg" onClick={() => setQuizStarted(true)}>
          Start Quiz
        </Button>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const score = calculateScore();
    const passed = score >= mockQuiz.passingScore;

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
              ? 'You passed the quiz and earned your certificate!'
              : `You need ${mockQuiz.passingScore}% to pass. Try again!`
            }
          </p>
        </div>

        <div className="py-6">
          <div className="text-6xl font-display font-bold mb-2">
            <span className={passed ? 'text-success' : 'text-destructive'}>{score}%</span>
          </div>
          <p className="text-muted-foreground">
            {selectedAnswers.filter((a, i) => a === mockQuiz.questions[i].correctAnswer).length} of {mockQuiz.questions.length} correct
          </p>
        </div>

        {/* Question Review */}
        <div className="text-left space-y-4">
          <h4 className="font-semibold">Review Answers</h4>
          {mockQuiz.questions.map((q, index) => {
            const isCorrect = selectedAnswers[index] === q.correctAnswer;
            return (
              <div key={q.id} className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-sm mb-1">{q.question}</p>
                    {!isCorrect && (
                      <p className="text-sm text-muted-foreground">
                        Correct answer: {q.options[q.correctAnswer]}
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={resetQuiz} className="gap-2">
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

  // Quiz Questions
  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentQuestion + 1} of {mockQuiz.questions.length}
          </span>
          <span className="font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <div className="py-4">
        <h4 className="font-display font-semibold text-xl mb-6">
          {question.question}
        </h4>

        <div className="space-y-3">
          {question.options.map((option, index) => (
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
                <span className="font-medium">{option}</span>
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
          disabled={selectedAnswers[currentQuestion] === undefined}
          className="gap-2"
        >
          {currentQuestion === mockQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuizComponent;
