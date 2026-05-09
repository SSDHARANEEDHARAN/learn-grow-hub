
CREATE TABLE public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view course materials"
ON public.course_materials FOR SELECT USING (true);

CREATE POLICY "Instructors can insert materials"
ON public.course_materials FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'instructor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Instructors can update materials"
ON public.course_materials FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'instructor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Instructors can delete materials"
ON public.course_materials FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'instructor') OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_course_materials_course_id ON public.course_materials(course_id);

INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read course material files"
ON storage.objects FOR SELECT USING (bucket_id = 'course-materials');

CREATE POLICY "Instructors can upload course material files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-materials' AND (public.has_role(auth.uid(), 'instructor') OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Instructors can update course material files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'course-materials' AND (public.has_role(auth.uid(), 'instructor') OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Instructors can delete course material files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'course-materials' AND (public.has_role(auth.uid(), 'instructor') OR public.has_role(auth.uid(), 'admin')));

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE selected_role public.app_role;
BEGIN
  selected_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::public.app_role,
    'student'::public.app_role
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, selected_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
