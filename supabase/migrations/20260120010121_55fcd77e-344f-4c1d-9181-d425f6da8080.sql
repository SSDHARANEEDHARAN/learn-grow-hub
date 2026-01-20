
-- Add mentors table for course mentor selection
CREATE TABLE public.mentors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  expertise TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add hardware_orders table for live hardware purchases
CREATE TABLE public.hardware_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  hardware_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  shipping_address TEXT NOT NULL,
  phone TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add student_performance table for analytics
CREATE TABLE public.student_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  module_id UUID REFERENCES public.modules(id),
  quiz_score INTEGER,
  lessons_completed INTEGER DEFAULT 0,
  total_watch_time INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add mentor_id to enrollments
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS mentor_id UUID;

-- Enable RLS
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_performance ENABLE ROW LEVEL SECURITY;

-- Mentors are viewable by everyone
CREATE POLICY "Mentors are viewable by everyone" ON public.mentors
  FOR SELECT USING (true);

-- Hardware orders policies
CREATE POLICY "Users can view own hardware orders" ON public.hardware_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create hardware orders" ON public.hardware_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Student performance policies
CREATE POLICY "Users can view own performance" ON public.student_performance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own performance" ON public.student_performance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own performance" ON public.student_performance
  FOR UPDATE USING (auth.uid() = user_id);

-- Instructors can view all performance for their courses
CREATE POLICY "Instructors can view course performance" ON public.student_performance
  FOR SELECT USING (
    course_id IN (
      SELECT c.id FROM courses c
      JOIN profiles p ON c.instructor_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Insert demo mentors
INSERT INTO public.mentors (name, bio, avatar_url, expertise) VALUES
('Dr. Raj Kumar', 'PhD in Electronics with 15+ years of industry experience', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', ARRAY['Arduino', 'ESP32', 'IoT']),
('Prof. Meera Singh', 'IIT graduate specializing in embedded systems', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', ARRAY['Raspberry Pi', 'Python', 'Linux']),
('Eng. Arjun Patel', 'Senior hardware engineer at leading tech company', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', ARRAY['PCB Design', 'STM32', 'RTOS']),
('Ms. Priya Sharma', 'Robotics expert and competition judge', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', ARRAY['Robotics', 'ROS', 'Drones']),
('Mr. Vikram Reddy', 'Industrial automation specialist', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', ARRAY['PLC', 'SCADA', 'IIoT']);
