import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoPlayer from '@/components/VideoPlayer';
import CourseContent from '@/components/CourseContent';
import CommentsSection from '@/components/CommentsSection';
import QuizComponent from '@/components/QuizComponent';
import ReviewsSection from '@/components/ReviewsSection';
import UPIPayment from '@/components/UPIPayment';
import RewardPointsDisplay from '@/components/RewardPointsDisplay';
import EnrollmentForm from '@/components/EnrollmentForm';
import HardwarePurchaseForm from '@/components/HardwarePurchaseForm';
import { useCourse } from '@/hooks/useCourses';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Star, Clock, BookOpen, Users, Award, CheckCircle, 
  Play, FileText, Download, Share2, Heart, Lock, Package
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: course, isLoading } = useCourse(id || '');
  const { isEnrolled, hasPaid, isLoading: enrollmentLoading } = useEnrollment(id || '');
  const { progress, completedLessons } = useLessonProgress(id || '');
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [enrollmentFormOpen, setEnrollmentFormOpen] = useState(false);
  const [hardwareFormOpen, setHardwareFormOpen] = useState(false);

  // Calculate progress percentage
  const totalLessons = course?.lessons_count || 0;
  const progressPercent = totalLessons > 0 
    ? Math.round((completedLessons.length / totalLessons) * 100) 
    : 0;

  useEffect(() => {
    // Set first lesson as active when course loads
    if (course?.modules?.[0]?.lessons?.[0]) {
      setActiveLesson(course.modules[0].lessons[0].id);
    }
  }, [course]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 py-12">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="aspect-video w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 container mx-auto px-4 text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <p className="text-muted-foreground mb-6">This course doesn't exist or has been removed.</p>
          <Link to="/courses">
            <Button variant="hero">Browse Courses</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const canAccessCourse = hasPaid || isEnrolled;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-secondary/50 to-background py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Course Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  {course.category && (
                    <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-semibold">
                      {course.category}
                    </span>
                  )}
                  {course.is_bestseller && (
                    <span className="px-3 py-1 bg-foreground/20 text-foreground text-sm font-semibold">
                      BESTSELLER
                    </span>
                  )}
                  {course.level && (
                    <span className={`px-3 py-1 text-sm font-semibold ${
                      course.level === 'beginner' ? 'bg-secondary text-secondary-foreground' :
                      course.level === 'intermediate' ? 'bg-secondary text-secondary-foreground' :
                      'bg-secondary text-secondary-foreground'
                    }`}>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-3xl md:text-4xl font-bold">
                  {course.title}
                </h1>

                <p className="text-lg text-muted-foreground">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-foreground fill-foreground" />
                    <span className="font-bold">{course.average_rating}</span>
                    <span className="text-muted-foreground">({course.review_count.toLocaleString()} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span>{course.students_count.toLocaleString()} students</span>
                  </div>
                </div>

                {course.instructor && (
                  <div className="flex items-center gap-4">
                    <img 
                      src={course.instructor.avatar_url || '/placeholder.svg'}
                      alt={course.instructor.full_name || 'Instructor'}
                      className="w-12 h-12 object-cover"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">Created by</p>
                      <p className="font-semibold">{course.instructor.full_name}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration || '3 months'} total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessons_count} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="lg:col-span-1">
                <div className="border border-border bg-card p-6 sticky top-24 space-y-6">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={course.thumbnail_url || '/placeholder.svg'}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="font-display font-bold text-4xl">${course.price || 0}</span>
                    {course.original_price && course.original_price > (course.price || 0) && (
                      <>
                        <span className="text-xl text-muted-foreground line-through">${course.original_price}</span>
                        <span className="px-2 py-1 bg-foreground/20 text-foreground text-sm font-semibold">
                          {Math.round((1 - (course.price || 0) / course.original_price) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {canAccessCourse ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Your Progress</span>
                          <span className="text-primary font-semibold">{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                      <RewardPointsDisplay variant="full" />
                      <Button variant="hero" className="w-full gap-2" size="lg">
                        <Play className="w-5 h-5" />
                        Continue Learning
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <UPIPayment
                        courseId={course.id}
                        courseTitle={course.title}
                        price={course.price || 0}
                        onPaymentComplete={() => window.location.reload()}
                      />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                        <Lock className="w-4 h-4" />
                        <span>UPI payment • Instant access after verification</span>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full gap-2" 
                        size="lg"
                        onClick={() => setHardwareFormOpen(true)}
                      >
                        <Package className="w-5 h-5" />
                        Buy Hardware Kit
                      </Button>
                    </div>
                  )}

                  <div className="space-y-3 pt-4 border-t border-border">
                    <p className="font-semibold text-sm">This course includes:</p>
                    {[
                      { icon: Play, text: `${course.duration || '3 months'} of daily videos` },
                      { icon: FileText, text: 'Weekly tests with rewards' },
                      { icon: Award, text: 'Certificate of completion' },
                      { icon: Clock, text: 'Full lifetime access' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <item.icon className="w-4 h-4" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Download className="w-4 h-4" />
                      Gift
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* Video Player - Only show if enrolled */}
                {canAccessCourse ? (
                  <div className="mb-8">
                    <VideoPlayer 
                      thumbnail={course.thumbnail_url || '/placeholder.svg'} 
                      title={course.title} 
                    />
                  </div>
                ) : (
                  <div className="mb-8 aspect-video bg-secondary flex items-center justify-center border border-border">
                    <div className="text-center space-y-4">
                      <Lock className="w-16 h-16 text-muted-foreground mx-auto" />
                      <h3 className="text-xl font-semibold">Purchase Required</h3>
                      <p className="text-muted-foreground max-w-md">
                        Purchase this course to access all video lessons, weekly tests, and earn reward points.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="bg-secondary/50 p-1">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    {canAccessCourse && (
                      <>
                        <TabsTrigger value="quiz">Quiz</TabsTrigger>
                        <TabsTrigger value="discussion">Discussion</TabsTrigger>
                      </>
                    )}
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="font-display font-semibold text-xl mb-4">What you'll learn</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          '90 days of structured video content',
                          'Weekly tests to track your progress',
                          'Earn reward points as you learn',
                          'Certificate upon completion',
                          'Lifetime access to all materials',
                          'Expert instructor support',
                        ].map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display font-semibold text-xl mb-4">Description</h3>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-muted-foreground">
                          {course.description || 'No description available.'}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews">
                    <ReviewsSection courseId={course.id} />
                  </TabsContent>

                  {canAccessCourse && (
                    <>
                      <TabsContent value="quiz">
                        <QuizComponent lessonId={activeLesson || ''} />
                      </TabsContent>

                      <TabsContent value="discussion">
                        <CommentsSection />
                      </TabsContent>
                    </>
                  )}
                </Tabs>
              </div>

              {/* Sidebar - Course Content */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <CourseContent 
                    courseId={course.id}
                    modules={course.modules || []}
                    onSelectLesson={setActiveLesson}
                    activeLesson={activeLesson || ''}
                    isLocked={!canAccessCourse}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enrollment Form */}
      <EnrollmentForm
        isOpen={enrollmentFormOpen}
        onClose={() => setEnrollmentFormOpen(false)}
        courseId={course.id}
        courseTitle={course.title}
        onEnrollmentComplete={() => window.location.reload()}
      />

      {/* Hardware Purchase Form */}
      <HardwarePurchaseForm
        isOpen={hardwareFormOpen}
        onClose={() => setHardwareFormOpen(false)}
        courseId={course.id}
        courseTitle={course.title}
      />

      <Footer />
    </div>
  );
};

export default CourseDetail;
