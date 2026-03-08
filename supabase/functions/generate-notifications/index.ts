import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const notifications: Array<{
      user_id: string;
      title: string;
      message: string;
      type: string;
      link: string | null;
    }> = [];

    // 1. New lessons published in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: newLessons } = await supabase
      .from('lessons')
      .select('id, title, module_id, modules!inner(course_id, courses!inner(id, title))')
      .gte('created_at', oneHourAgo);

    if (newLessons && newLessons.length > 0) {
      for (const lesson of newLessons) {
        const courseData = (lesson as any).modules?.courses;
        if (!courseData) continue;
        const courseId = courseData.id;
        const courseTitle = courseData.title;

        // Get all enrolled users for this course
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('user_id')
          .eq('course_id', courseId);

        if (enrollments) {
          for (const enrollment of enrollments) {
            notifications.push({
              user_id: enrollment.user_id,
              title: '📚 New Lesson Available',
              message: `"${lesson.title}" has been added to ${courseTitle}`,
              type: 'lesson',
              link: `/course/${courseId}`,
            });
          }
        }
      }
    }

    // 2. Streak reminders - users who haven't had activity today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: activeUsers } = await supabase
      .from('lesson_progress')
      .select('user_id')
      .gte('last_watched_at', todayStart.toISOString());

    const activeUserIds = new Set((activeUsers || []).map(u => u.user_id));

    // Get users with recent activity (last 7 days) who haven't been active today
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentUsers } = await supabase
      .from('lesson_progress')
      .select('user_id')
      .gte('last_watched_at', weekAgo);

    const recentUserIds = new Set((recentUsers || []).map(u => u.user_id));
    
    for (const userId of recentUserIds) {
      if (!activeUserIds.has(userId)) {
        notifications.push({
          user_id: userId,
          title: '🔥 Keep Your Streak Alive!',
          message: "You haven't studied today. Complete a lesson to maintain your learning streak!",
          type: 'streak',
          link: '/dashboard',
        });
      }
    }

    // 3. Insert all notifications (skip duplicates by checking recent)
    if (notifications.length > 0) {
      const { error } = await supabase.from('notifications').insert(notifications);
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ success: true, generated: notifications.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
