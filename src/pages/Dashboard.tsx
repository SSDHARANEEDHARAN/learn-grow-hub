import { Link } from 'react-router-dom';
import StudentNavbar from '@/components/StudentNavbar';
import Footer from '@/components/Footer';
import CertificatePreview from '@/components/CertificatePreview';
import RewardPointsDisplay from '@/components/RewardPointsDisplay';
import StudentProgressDashboard from '@/components/StudentProgressDashboard';
import { useUserEnrollments } from '@/hooks/useEnrollment';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, Award, Clock, TrendingUp, Play, 
  User, Mail, Calendar, ChevronRight, Flame, BarChart3, Settings
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: enrollments, isLoading } = useUserEnrollments();

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const enrolledCourses = enrollments || [];
  const completedCourses = enrolledCourses.filter(e => e.completed_at);
  const inProgressCourses = enrolledCourses.filter(e => !e.completed_at);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar />
        <main className="pt-24 pb-16 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Please login to view your dashboard</h1>
          <Link to="/auth">
            <Button variant="hero">Login</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = (profile?.full_name || user.email || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="font-semibold text-2xl">
                    {profile?.full_name || 'Student'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Joined {new Date(user.created_at || '').toLocaleDateString()}
                    </span>
                  </div>
                  {profile?.bio && (
                    <p className="text-sm text-muted-foreground mt-2 max-w-lg">{profile.bio}</p>
                  )}
                </div>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Main Tabs */}
          <Tabs defaultValue="progress" className="space-y-6">
            <TabsList className="bg-secondary/50 p-1">
              <TabsTrigger value="progress" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Courses ({enrolledCourses.length})
              </TabsTrigger>
              <TabsTrigger value="rewards" className="gap-2">
                <Award className="w-4 h-4" />
                Rewards
              </TabsTrigger>
            </TabsList>

            {/* Progress Tab */}
            <TabsContent value="progress">
              <StudentProgressDashboard />
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: BookOpen, label: 'Enrolled', value: enrolledCourses.length },
                  { icon: Clock, label: 'In Progress', value: inProgressCourses.length },
                  { icon: Award, label: 'Completed', value: completedCourses.length },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xl font-bold leading-none">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* In Progress */}
              {inProgressCourses.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">In Progress</h3>
                  {inProgressCourses.map((enrollment) => (
                    <Link key={enrollment.id} to={`/course/${enrollment.course_id}`}>
                      <Card className="hover:bg-secondary/30 transition-colors cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-4">
                          <img 
                            src={enrollment.courses?.thumbnail_url || '/placeholder.svg'}
                            alt={enrollment.courses?.title}
                            className="w-20 h-14 object-cover rounded-md"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{enrollment.courses?.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="hero" size="sm" className="gap-1 shrink-0">
                            <Play className="w-3 h-3" />
                            Resume
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* Completed */}
              {completedCourses.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Completed</h3>
                  {completedCourses.map((enrollment) => (
                    <Card key={enrollment.id}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <img 
                          src={enrollment.courses?.thumbnail_url || '/placeholder.svg'}
                          alt={enrollment.courses?.title}
                          className="w-20 h-14 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{enrollment.courses?.title}</h4>
                          <p className="text-xs text-[hsl(var(--success))]">✓ Completed</p>
                        </div>
                        <Award className="w-5 h-5 text-primary shrink-0" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {enrolledCourses.length === 0 && !isLoading && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">No courses yet</p>
                    <Link to="/courses">
                      <Button variant="outline">Browse Courses</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {isLoading && (
                <div className="space-y-3">
                  {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                </div>
              )}
            </TabsContent>

            {/* Rewards Tab */}
            <TabsContent value="rewards">
              <RewardPointsDisplay variant="full" />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
