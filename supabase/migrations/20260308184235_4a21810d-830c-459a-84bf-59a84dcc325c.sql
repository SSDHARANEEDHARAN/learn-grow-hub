-- Drop existing restrictive policy and add a public one
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;

-- Allow anyone to read enrollments (needed for student counts on course cards)
CREATE POLICY "Enrollments are publicly readable"
ON public.enrollments
FOR SELECT
USING (true);