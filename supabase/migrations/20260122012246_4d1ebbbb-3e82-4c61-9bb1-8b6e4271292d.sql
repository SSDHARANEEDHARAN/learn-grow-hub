-- Allow instructors to view quiz attempts for quizzes in their own courses
-- (needed for quiz analytics dashboards)

CREATE POLICY "Instructors can view quiz attempts for own courses"
ON public.quiz_attempts
FOR SELECT
USING (
  quiz_id IN (
    SELECT q.id
    FROM public.quizzes q
    JOIN public.lessons l ON q.lesson_id = l.id
    JOIN public.modules m ON l.module_id = m.id
    JOIN public.courses c ON m.course_id = c.id
    JOIN public.profiles p ON c.instructor_id = p.id
    WHERE p.user_id = auth.uid()
  )
);
