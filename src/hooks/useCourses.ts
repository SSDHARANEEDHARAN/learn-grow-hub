import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CourseWithDetails {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number | null;
  original_price: number | null;
  duration: string | null;
  level: string | null;
  category: string | null;
  is_bestseller: boolean | null;
  is_published: boolean | null;
  created_at: string;
  instructor: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  lessons_count: number;
  students_count: number;
  average_rating: number;
  review_count: number;
}

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      // Fetch published courses with instructor info and modules+lessons in one query
      const { data: courses, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id (
            id,
            full_name,
            avatar_url
          ),
          modules (
            id,
            lessons (id)
          ),
          enrollments (id),
          reviews!reviews_course_id_fkey (rating, is_approved)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (courses || []).map((course: any) => {
        const lessons = course.modules?.flatMap((m: any) => m.lessons || []) || [];
        const approvedReviews = course.reviews?.filter((r: any) => r.is_approved) || [];
        const avgRating = approvedReviews.length
          ? approvedReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / approvedReviews.length
          : 0;

        return {
          ...course,
          instructor: course.profiles,
          modules: undefined,
          enrollments: undefined,
          reviews: undefined,
          profiles: undefined,
          lessons_count: lessons.length,
          students_count: course.enrollments?.length || 0,
          average_rating: Math.round(avgRating * 10) / 10,
          review_count: approvedReviews.length,
        } as CourseWithDetails;
      });
    },
  });
};

export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id (
            id,
            full_name,
            avatar_url,
            bio
          )
        `)
        .eq('id', courseId)
        .single();

      if (error) throw error;

      // Get modules and lessons
      const { data: modules } = await supabase
        .from('modules')
        .select(`
          *,
          lessons (
            *
          )
        `)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      // Get students count
      const { count: studentsCount } = await supabase
        .from('enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', courseId);

      // Get reviews stats
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('course_id', courseId)
        .eq('is_approved', true);

      const avgRating = reviews?.length 
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
        : 0;

      const lessonsCount = modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

      return {
        ...course,
        instructor: course.profiles,
        modules: modules || [],
        lessons_count: lessonsCount,
        students_count: studentsCount || 0,
        average_rating: Math.round(avgRating * 10) / 10,
        review_count: reviews?.length || 0,
      };
    },
    enabled: !!courseId,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('category')
        .eq('is_published', true)
        .not('category', 'is', null);

      if (error) throw error;

      const uniqueCategories = [...new Set(data?.map(c => c.category).filter(Boolean))];
      return ['All Courses', ...uniqueCategories] as string[];
    },
  });
};
