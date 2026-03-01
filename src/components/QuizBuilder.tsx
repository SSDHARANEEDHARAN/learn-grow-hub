import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Check, Save, Library } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import QuestionBank from './QuestionBank';

interface Question {
  id?: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  order_index: number;
}

interface QuizBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

interface Lesson {
  id: string;
  title: string;
  week_number: number | null;
  is_weekly_test: boolean | null;
  module_id: string;
}

const QuizBuilder = ({ isOpen, onClose, courseId, courseTitle }: QuizBuilderProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [quizTitle, setQuizTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [pointsReward, setPointsReward] = useState(10);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [existingQuizId, setExistingQuizId] = useState<string | null>(null);
  const [hideExplanations, setHideExplanations] = useState(false);
  const [questionBankOpen, setQuestionBankOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const hasQuestions = questions.length > 0;
  const dndHelpText = useMemo(
    () => (hasQuestions ? 'Drag the grip to reorder questions.' : ''),
    [hasQuestions]
  );

  useEffect(() => {
    if (isOpen && courseId) {
      fetchLessons();
    }
  }, [isOpen, courseId]);

  useEffect(() => {
    if (selectedLessonId) {
      fetchExistingQuiz();
    } else {
      resetQuizForm();
    }
  }, [selectedLessonId]);

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      // Get modules for this course
      const { data: modules } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId);

      if (!modules?.length) {
        setLessons([]);
        return;
      }

      // Get lessons that can have quizzes (weekly tests)
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, week_number, is_weekly_test, module_id')
        .in('module_id', modules.map(m => m.id))
        .order('week_number', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to load lessons');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingQuiz = async () => {
    try {
      const { data: quiz, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          quiz_questions (*)
        `)
        .eq('lesson_id', selectedLessonId)
        .maybeSingle();

      if (error) throw error;

      if (quiz) {
        setExistingQuizId(quiz.id);
        setQuizTitle(quiz.title);
        setPassingScore(quiz.passing_score);
        setPointsReward(quiz.points_reward || 10);
        setTimeLimit(quiz.time_limit);
        setHideExplanations(quiz.hide_explanations || false);
        setQuestions(
          (quiz.quiz_questions || [])
            .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
            .map((q: any) => ({
              id: q.id,
              question: q.question,
              options: Array.isArray(q.options) ? q.options : [],
              correct_answer: q.correct_answer,
              explanation: q.explanation || '',
              order_index: q.order_index || 0,
            }))
        );
      } else {
        resetQuizForm();
        // Auto-set title based on lesson
        const lesson = lessons.find(l => l.id === selectedLessonId);
        if (lesson) {
          setQuizTitle(`${lesson.title} Quiz`);
        }
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    }
  };

  const resetQuizForm = () => {
    setExistingQuizId(null);
    setQuizTitle('');
    setPassingScore(70);
    setPointsReward(10);
    setTimeLimit(null);
    setHideExplanations(false);
    setQuestions([]);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: '',
        order_index: questions.length,
      },
    ]);
  };

  const handleBankImport = (imported: Array<{ question: string; options: string[]; correct_answer: number; explanation: string }>) => {
    const newQuestions: Question[] = imported.map((q, i) => ({
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      order_index: questions.length + i,
    }));
    setQuestions([...questions, ...newQuestions]);
    toast.success(`Imported ${imported.length} questions from bank`);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    const newOptions = [...updated[questionIndex].options];
    newOptions[optionIndex] = value;
    updated[questionIndex].options = newOptions;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setQuestions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next.map((q, idx) => ({ ...q, order_index: idx }));
    });
  };

  const handleDragStart = (fromIndex: number) => (e: React.DragEvent) => {
    setDraggingIndex(fromIndex);
    setDragOverIndex(fromIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(fromIndex));
  };

  const handleDragOver = (toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragOverIndex !== toIndex) setDragOverIndex(toIndex);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (Number.isFinite(from)) {
      moveQuestion(from, toIndex);
    }
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    if (!selectedLessonId) {
      toast.error('Please select a lesson');
      return;
    }

    if (!quizTitle.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return;
      }
      const filledOptions = q.options.filter(o => o.trim());
      if (filledOptions.length < 2) {
        toast.error(`Question ${i + 1} needs at least 2 options`);
        return;
      }
    }

    setIsSaving(true);

    try {
      let quizId = existingQuizId;

      if (existingQuizId) {
        // Update existing quiz
        const { error } = await supabase
          .from('quizzes')
          .update({
            title: quizTitle,
            passing_score: passingScore,
            points_reward: pointsReward,
            time_limit: timeLimit,
          })
          .eq('id', existingQuizId);

        if (error) throw error;

        // Delete existing questions
        await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', existingQuizId);
      } else {
        // Create new quiz
        const { data, error } = await supabase
          .from('quizzes')
          .insert({
            lesson_id: selectedLessonId,
            title: quizTitle,
            passing_score: passingScore,
            points_reward: pointsReward,
            time_limit: timeLimit,
          })
          .select()
          .single();

        if (error) throw error;
        quizId = data.id;
      }

      // Insert questions
      const questionsToInsert = questions.map((q, index) => ({
        quiz_id: quizId,
        question: q.question,
        options: q.options.filter(o => o.trim()),
        correct_answer: q.correct_answer,
        explanation: q.explanation || null,
        order_index: index,
      }));

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast.success(existingQuizId ? 'Quiz updated successfully!' : 'Quiz created successfully!');
      onClose();
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      toast.error(error.message || 'Failed to save quiz');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quiz Builder - {courseTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Lesson Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Lesson</label>
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a lesson for this quiz" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.is_weekly_test ? '📝 ' : '📹 '}
                    {lesson.title}
                    {lesson.week_number && ` (Week ${lesson.week_number})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedLessonId && (
            <>
              {/* Quiz Settings */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Quiz Title</label>
                  <Input
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Enter quiz title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Passing Score (%)</label>
                  <Input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
                    min={1}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Points Reward</label>
                  <Input
                    type="number"
                    value={pointsReward}
                    onChange={(e) => setPointsReward(parseInt(e.target.value) || 10)}
                    min={0}
                  />
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Questions ({questions.length})</h3>
                  <Button onClick={addQuestion} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">No questions yet. Click "Add Question" to start.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dndHelpText ? (
                      <p className="text-xs text-muted-foreground">{dndHelpText}</p>
                    ) : null}
                    {questions.map((q, qIndex) => (
                      <div
                        key={qIndex}
                        className={`border border-border rounded-lg p-4 space-y-4 transition-colors ${
                          dragOverIndex === qIndex && draggingIndex !== null && draggingIndex !== qIndex
                            ? 'bg-accent/30'
                            : ''
                        }`}
                        onDragOver={handleDragOver(qIndex)}
                        onDrop={handleDrop(qIndex)}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            className="mt-2 cursor-grab text-muted-foreground"
                            draggable
                            onDragStart={handleDragStart(qIndex)}
                            onDragEnd={handleDragEnd}
                            aria-label={`Reorder question ${qIndex + 1}`}
                            title="Drag to reorder"
                          >
                            <GripVertical className="w-5 h-5" />
                          </button>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">Q{qIndex + 1}</span>
                              <Input
                                value={q.question}
                                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                placeholder="Enter your question"
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeQuestion(qIndex)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {q.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                      q.correct_answer === oIndex
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : 'border-muted-foreground hover:border-primary'
                                    }`}
                                  >
                                    {q.correct_answer === oIndex && <Check className="w-4 h-4" />}
                                  </button>
                                  <Input
                                    value={option}
                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                    placeholder={`Option ${oIndex + 1}`}
                                    className="flex-1"
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Explanation */}
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">Explanation (optional)</label>
                              <Textarea
                                value={q.explanation}
                                onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                placeholder="Explain why the correct answer is right..."
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : existingQuizId ? 'Update Quiz' : 'Create Quiz'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizBuilder;
