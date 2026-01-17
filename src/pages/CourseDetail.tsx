import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoPlayer from '@/components/VideoPlayer';
import CourseContent from '@/components/CourseContent';
import CommentsSection from '@/components/CommentsSection';
import QuizComponent from '@/components/QuizComponent';
import { mockCourses } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Star, Clock, BookOpen, Users, Award, CheckCircle, 
  Play, FileText, Download, Share2, Heart, ShoppingCart
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const [activeLesson, setActiveLesson] = useState('l1');
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  const course = mockCourses.find(c => c.id === id) || mockCourses[0];

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
                  <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-sm font-semibold">
                    {course.category}
                  </span>
                  {course.isBestseller && (
                    <span className="px-3 py-1 rounded-lg bg-accent/20 text-accent text-sm font-semibold">
                      BESTSELLER
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    course.level === 'Beginner' ? 'bg-success/20 text-success' :
                    course.level === 'Intermediate' ? 'bg-warning/20 text-warning' :
                    'bg-destructive/20 text-destructive'
                  }`}>
                    {course.level}
                  </span>
                </div>

                <h1 className="font-display text-3xl md:text-4xl font-bold">
                  {course.title}
                </h1>

                <p className="text-lg text-muted-foreground">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-warning fill-warning" />
                    <span className="font-bold">{course.rating}</span>
                    <span className="text-muted-foreground">({course.reviewCount.toLocaleString()} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span>{course.studentsCount.toLocaleString()} students</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <img 
                    src={course.instructorAvatar}
                    alt={course.instructor}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">Created by</p>
                    <p className="font-semibold">{course.instructor}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration} total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessonsCount} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="lg:col-span-1">
                <div className="glass-card rounded-2xl p-6 sticky top-24 space-y-6">
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <img 
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="font-display font-bold text-4xl">${course.price}</span>
                    {course.originalPrice && (
                      <>
                        <span className="text-xl text-muted-foreground line-through">${course.originalPrice}</span>
                        <span className="px-2 py-1 rounded-lg bg-accent/20 text-accent text-sm font-semibold">
                          {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {isEnrolled ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Your Progress</span>
                          <span className="text-primary font-semibold">{course.progress || 0}%</span>
                        </div>
                        <Progress value={course.progress || 0} className="h-2" />
                      </div>
                      <Button variant="hero" className="w-full gap-2" size="lg">
                        <Play className="w-5 h-5" />
                        Continue Learning
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        variant="hero" 
                        className="w-full gap-2" 
                        size="lg"
                        onClick={() => setIsEnrolled(true)}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Enroll Now
                      </Button>
                      <Button variant="outline" className="w-full gap-2" size="lg">
                        <Heart className="w-5 h-5" />
                        Add to Wishlist
                      </Button>
                    </div>
                  )}

                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <p className="font-semibold text-sm">This course includes:</p>
                    {[
                      { icon: Play, text: `${course.duration} on-demand video` },
                      { icon: FileText, text: '25 downloadable resources' },
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
                {/* Video Player */}
                <div className="mb-8">
                  <VideoPlayer thumbnail={course.thumbnail} title={course.title} />
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="bg-secondary/50 p-1">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="materials">Materials</TabsTrigger>
                    <TabsTrigger value="quiz">Quiz</TabsTrigger>
                    <TabsTrigger value="discussion">Discussion</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="font-display font-semibold text-xl mb-4">What you'll learn</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          'Build 16+ real-world projects',
                          'Master HTML, CSS, and JavaScript',
                          'Learn React and modern frameworks',
                          'Understand backend development',
                          'Deploy applications to production',
                          'Best practices and clean code',
                        ].map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display font-semibold text-xl mb-4">Description</h3>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-muted-foreground">
                          Welcome to the most comprehensive web development course on the internet! 
                          This course covers everything from HTML basics to advanced React patterns 
                          and backend development. Whether you're a complete beginner or looking to 
                          level up your skills, this course has something for everyone.
                        </p>
                        <p className="text-muted-foreground mt-4">
                          By the end of this course, you'll have built real projects that you can 
                          add to your portfolio, and you'll be ready to apply for junior developer 
                          positions or take on freelance work.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="materials">
                    <div className="space-y-4">
                      <h3 className="font-display font-semibold text-xl mb-4">Course Materials</h3>
                      {[
                        { name: 'HTML & CSS Cheat Sheet.pdf', size: '2.4 MB' },
                        { name: 'JavaScript ES6+ Guide.pdf', size: '3.1 MB' },
                        { name: 'React Best Practices.pdf', size: '1.8 MB' },
                        { name: 'Project Starter Files.zip', size: '12.5 MB' },
                      ].map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <span className="font-medium">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{file.size}</span>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="quiz">
                    <QuizComponent />
                  </TabsContent>

                  <TabsContent value="discussion">
                    <CommentsSection />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar - Course Content */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <CourseContent 
                    onSelectLesson={setActiveLesson}
                    activeLesson={activeLesson}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CourseDetail;
