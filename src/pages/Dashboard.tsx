import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import CertificatePreview from '@/components/CertificatePreview';
import { mockCourses } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, Award, Clock, TrendingUp, Play, Target,
  Calendar, ChevronRight, Star, Flame
} from 'lucide-react';

const Dashboard = () => {
  const enrolledCourses = mockCourses.filter(c => c.progress !== undefined);
  const completedCourses = enrolledCourses.filter(c => c.progress === 100);
  const inProgressCourses = enrolledCourses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100);

  const totalProgress = enrolledCourses.reduce((acc, c) => acc + (c.progress || 0), 0) / enrolledCourses.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-display text-4xl font-bold mb-2">
              Welcome back, <span className="gradient-text">John!</span>
            </h1>
            <p className="text-muted-foreground">
              Continue your learning journey and track your progress
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { 
                icon: BookOpen, 
                label: 'Enrolled Courses', 
                value: enrolledCourses.length,
                color: 'primary',
                trend: '+2 this month'
              },
              { 
                icon: Clock, 
                label: 'Hours Learned', 
                value: '48.5h',
                color: 'info',
                trend: '+8h this week'
              },
              { 
                icon: Award, 
                label: 'Certificates', 
                value: completedCourses.length,
                color: 'accent',
                trend: '1 pending'
              },
              { 
                icon: Flame, 
                label: 'Day Streak', 
                value: '12',
                color: 'warning',
                trend: 'Keep it up!'
              },
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="glass-card rounded-2xl p-6 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <p className="font-display font-bold text-3xl mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xs text-success mt-2">{stat.trend}</p>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Courses */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="in-progress" className="space-y-6">
                <TabsList className="bg-secondary/50 p-1">
                  <TabsTrigger value="in-progress">In Progress ({inProgressCourses.length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
                  <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                </TabsList>

                <TabsContent value="in-progress" className="space-y-6">
                  {/* Continue Learning */}
                  {inProgressCourses.length > 0 && (
                    <div className="glass-card rounded-2xl p-6 glow-effect">
                      <div className="flex items-center gap-4 mb-4">
                        <Play className="w-5 h-5 text-primary" />
                        <h3 className="font-display font-semibold">Continue Learning</h3>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <img 
                          src={inProgressCourses[0].thumbnail}
                          alt={inProgressCourses[0].title}
                          className="w-40 h-24 object-cover rounded-xl"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">{inProgressCourses[0].title}</h4>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              {inProgressCourses[0].progress}% complete
                            </span>
                            <span className="text-sm text-primary">
                              {inProgressCourses[0].lastWatched}
                            </span>
                          </div>
                          <Progress value={inProgressCourses[0].progress} className="h-2" />
                        </div>
                        <Link to={`/course/${inProgressCourses[0].id}`}>
                          <Button variant="hero">Resume</Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Course Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {inProgressCourses.map((course, index) => (
                      <div 
                        key={course.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CourseCard course={course} showProgress />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="space-y-6">
                  {completedCourses.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {completedCourses.map((course, index) => (
                        <div 
                          key={course.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <CourseCard course={course} showProgress />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No completed courses yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Keep learning to earn your first certificate!
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="wishlist">
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Your wishlist is empty</p>
                    <Link to="/courses">
                      <Button variant="outline" className="mt-4">
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Overall Progress */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-4">Overall Progress</h3>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-secondary"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - totalProgress / 100)}`}
                      className="text-primary"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display font-bold text-2xl">{Math.round(totalProgress)}%</span>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Keep going! You're doing great.
                </p>
              </div>

              {/* Weekly Goals */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold">Weekly Goals</h3>
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Learning Hours</span>
                      <span className="text-primary">8/10 hours</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Lessons Completed</span>
                      <span className="text-primary">12/15 lessons</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Quizzes Passed</span>
                      <span className="text-primary">3/5 quizzes</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold">Recent Activity</h3>
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-4">
                  {[
                    { action: 'Completed', item: 'CSS Selectors lesson', time: '2 hours ago' },
                    { action: 'Passed', item: 'HTML Quiz with 92%', time: '5 hours ago' },
                    { action: 'Started', item: 'JavaScript Basics', time: '1 day ago' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="text-primary">{activity.action}</span> {activity.item}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 gap-2">
                  View All Activity
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Certificate Preview */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold">Latest Certificate</h3>
                <CertificatePreview 
                  courseName="HTML & CSS Fundamentals"
                  userName="John Doe"
                  completionDate="January 10, 2024"
                  score={92}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
