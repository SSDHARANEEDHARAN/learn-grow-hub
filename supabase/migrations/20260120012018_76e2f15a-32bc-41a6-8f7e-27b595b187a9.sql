-- Allow instructors to manage quizzes for their course lessons
CREATE POLICY "Instructors can insert quizzes"
ON public.quizzes
FOR INSERT
WITH CHECK (
  lesson_id IN (
    SELECT l.id FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    JOIN profiles p ON c.instructor_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Instructors can update quizzes"
ON public.quizzes
FOR UPDATE
USING (
  lesson_id IN (
    SELECT l.id FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    JOIN profiles p ON c.instructor_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Instructors can delete quizzes"
ON public.quizzes
FOR DELETE
USING (
  lesson_id IN (
    SELECT l.id FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    JOIN profiles p ON c.instructor_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Allow instructors to view quizzes for their courses
CREATE POLICY "Instructors can view own course quizzes"
ON public.quizzes
FOR SELECT
USING (
  lesson_id IN (
    SELECT l.id FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    JOIN profiles p ON c.instructor_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Allow instructors to manage quiz questions
CREATE POLICY "Instructors can insert quiz questions"
ON public.quiz_questions
FOR INSERT
WITH CHECK (
  quiz_id IN (
    SELECT q.id FROM quizzes q
    JOIN lessons l ON q.lesson_id = l.id
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    JOIN profiles p ON c.instructor_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Instructors can update quiz questions"
ON public.quiz_questions
FOR UPDATE
USING (
  quiz_id IN (
    SELECT q.id FROM quizzes q
    JOIN lessons l ON q.lesson_id = l.id
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    JOIN profiles p ON c.instructor_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Instructors can delete quiz questions"
ON public.quiz_questions
FOR DELETE
USING (
  quiz_id IN (
    SELECT q.id FROM quizzes q
    JOIN lessons l ON q.lesson_id = l.id
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    JOIN profiles p ON c.instructor_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Allow instructors to view quiz questions for their courses
CREATE POLICY "Instructors can view own course quiz questions"
ON public.quiz_questions
FOR SELECT
USING (
  quiz_id IN (
    SELECT q.id FROM quizzes q
    JOIN lessons l ON q.lesson_id = l.id
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    JOIN profiles p ON c.instructor_id = p.id
    WHERE p.user_id = auth.uid()
  )
);