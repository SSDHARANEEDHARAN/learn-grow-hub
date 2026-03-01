
-- Question bank table for reusable questions
CREATE TABLE public.question_bank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can manage own questions"
  ON public.question_bank FOR ALL
  USING (instructor_id IN (SELECT user_id FROM profiles WHERE user_id = auth.uid()));

-- Add hide_explanations column to quizzes
ALTER TABLE public.quizzes ADD COLUMN hide_explanations BOOLEAN DEFAULT false;
