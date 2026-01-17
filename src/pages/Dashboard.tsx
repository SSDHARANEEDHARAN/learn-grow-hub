import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CertificatePreview from '@/components/CertificatePreview';
import RewardPointsDisplay from '@/components/RewardPointsDisplay';
import { useUserEnrollments } from '@/hooks/useEnrollment';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, Award, Clock, TrendingUp, Play, Target,
  Calendar, ChevronRight, Star, Flame
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: enrollments, isLoading } = useUserEnrollments();

  const enrolledCourses = enrollments || [];
  const completedCourses = enrolledCourses.filter(e => e.completed_at);
  const inProgressCourses = enrolledCourses.filter(e => !e.completed_at);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-display text-4xl font-bold mb-2">
              Welcome back!
            </h1>
            <p className="text-muted-foreground">
              Continue your learning journey and track your progress
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { icon: BookOpen, label: 'Enrolled Courses', value: enrolledCourses.length, color: 'primary' },
              { icon: Clock, label: 'In Progress', value: inProgressCourses.length, color: 'info' },
              { icon: Award, label: 'Completed', value: completedCourses.length, color: 'accent' },
              { icon: Flame, label: 'Day Streak', value: '0', color: 'warning' },
            ].map((stat, index) => (
              <div key={stat.label} className="border border-border bg-card p-6 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <p className="font-display font-bold text-3xl mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs defaultValue="in-progress" className="space-y-6">
                <TabsList className="bg-secondary/50 p-1">
                  <TabsTrigger value="in-progress">In Progress ({inProgressCourses.length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="in-progress" className="space-y-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                    </div>
                  ) : inProgressCourses.length > 0 ? (
                    <div className="space-y-4">
                      {inProgressCourses.map((enrollment) => (
                        <Link key={enrollment.id} to={`/course/${enrollment.course_id}`}>
                          <div className="border border-border bg-card p-4 hover:bg-secondary/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <img 
                                src={enrollment.courses?.thumbnail_url || '/placeholder.svg'}
                                alt={enrollment.courses?.title}
                                className="w-24 h-16 object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold">{enrollment.courses?.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Button variant="hero" size="sm">Resume</Button>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-border">
                      <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No courses in progress</p>
                      <Link to="/courses">
                        <Button variant="outline" className="mt-4">Browse Courses</Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-6">
                  {completedCourses.length > 0 ? (
                    <div className="space-y-4">
                      {completedCourses.map((enrollment) => (
                        <div key={enrollment.id} className="border border-border bg-card p-4">
                          <div className="flex items-center gap-4">
                            <img 
                              src={enrollment.courses?.thumbnail_url || '/placeholder.svg'}
                              alt={enrollment.courses?.title}
                              className="w-24 h-16 object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold">{enrollment.courses?.title}</h4>
                              <p className="text-sm text-primary">Completed</p>
                            </div>
                            <Award className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-border">
                      <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No completed courses yet</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <RewardPointsDisplay variant="full" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
