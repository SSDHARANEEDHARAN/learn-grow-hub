-- Create reward points table
CREATE TABLE public.reward_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL, -- 'quiz', 'lesson_complete', 'streak', 'course_complete'
  source_id UUID, -- quiz_id, lesson_id, course_id
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT
);

-- Enable RLS
ALTER TABLE public.reward_points ENABLE ROW LEVEL SECURITY;

-- RLS policies for reward points
CREATE POLICY "Users can view own reward points"
ON public.reward_points
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert reward points"
ON public.reward_points
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit INTEGER, -- in minutes
  points_reward INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- RLS policies for quizzes
CREATE POLICY "Quizzes viewable for enrolled users"
ON public.quizzes
FOR SELECT
USING (
  lesson_id IN (
    SELECT l.id FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN enrollments e ON m.course_id = e.course_id
    WHERE e.user_id = auth.uid()
  )
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- array of option strings
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  order_index INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- RLS policies for quiz questions
CREATE POLICY "Quiz questions viewable for enrolled users"
ON public.quiz_questions
FOR SELECT
USING (
  quiz_id IN (
    SELECT q.id FROM quizzes q
    JOIN lessons l ON q.lesson_id = l.id
    JOIN modules m ON l.module_id = m.id
    JOIN enrollments e ON m.course_id = e.course_id
    WHERE e.user_id = auth.uid()
  )
);

-- Create quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB, -- user's answers
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for quiz attempts
CREATE POLICY "Users can view own quiz attempts"
ON public.quiz_attempts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create quiz attempts"
ON public.quiz_attempts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add is_weekly_test column to lessons to mark weekly tests
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_weekly_test BOOLEAN DEFAULT false;

-- Add week_number to lessons for organizing by weeks
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS week_number INTEGER;

-- Add day_number to lessons for organizing by days
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS day_number INTEGER;

-- Enable realtime for reward points
ALTER PUBLICATION supabase_realtime ADD TABLE public.reward_points;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_attempts;