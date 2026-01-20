import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StudentAnalytics from '@/components/StudentAnalytics';
import MarksheetView from '@/components/MarksheetView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Video,
  FileText,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Course {
  id: string;
  title: string;
  thumbnail_url: string | null;
  is_published: boolean | null;
  price: number | null;
  category: string | null;
  students_count?: number;
  revenue?: number;
}

const InstructorDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [marksheetOpen, setMarksheetOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get enrollment counts for each course
      const coursesWithStats = await Promise.all(
        (data || []).map(async (course) => {
          const { count } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);

          return {
            ...course,
            students_count: count || 0,
            revenue: (count || 0) * (course.price || 0),
          };
        })
      );

      setCourses(coursesWithStats);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: newCourse.title,
          description: newCourse.description,
          price: parseFloat(newCourse.price) || 0,
          category: newCourse.category,
          is_published: false,
          duration: '3 months',
        })
        .select()
        .single();

      if (error) throw error;

      setCourses([{ ...data, students_count: 0, revenue: 0 }, ...courses]);
      setNewCourse({ title: '', description: '', price: '', category: '' });
      setIsCreateDialogOpen(false);
      
      toast({
        title: 'Course Created!',
        description: 'Your new course has been created as a draft.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseToDelete.id);

      if (error) throw error;

      setCourses(courses.filter(c => c.id !== courseToDelete.id));
      setDeleteDialogOpen(false);
      setCourseToDelete(null);

      toast({
        title: 'Course Deleted',
        description: 'The course has been permanently deleted.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openAnalytics = (course: Course) => {
    setSelectedCourse(course);
    setAnalyticsOpen(true);
  };

  const openMarksheet = (course: Course) => {
    setSelectedCourse(course);
    setMarksheetOpen(true);
  };

  const confirmDelete = (course: Course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  // Calculate totals
  const totalStudents = courses.reduce((acc, c) => acc + (c.students_count || 0), 0);
  const totalRevenue = courses.reduce((acc, c) => acc + (c.revenue || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Instructor Dashboard</h1>
              <p className="text-muted-foreground">Manage your courses and track your performance</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new course
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCourse} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Course Title</label>
                    <Input
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      placeholder="Enter course title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      placeholder="Describe your course"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price (₹)</label>
                      <Input
                        type="number"
                        value={newCourse.price}
                        onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                        placeholder="4999"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <select
                        value={newCourse.category}
                        onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Embedded Systems">Embedded Systems</option>
                        <option value="IoT">IoT</option>
                        <option value="Robotics">Robotics</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Programming">Programming</option>
                        <option value="AI & ML">AI & ML</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Create Course</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Total Courses</span>
              </div>
              <p className="font-display text-3xl font-bold">{courses.length}</p>
            </div>

            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Total Students</span>
              </div>
              <p className="font-display text-3xl font-bold">{totalStudents.toLocaleString()}</p>
            </div>

            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Total Revenue</span>
              </div>
              <p className="font-display text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
            </div>

            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Published</span>
              </div>
              <p className="font-display text-3xl font-bold">{courses.filter(c => c.is_published).length}</p>
            </div>
          </div>

          {/* Courses Table */}
          <div className="border border-border bg-card">
            <div className="p-6 border-b border-border">
              <h2 className="font-display text-xl font-semibold">Your Courses</h2>
            </div>
            
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : courses.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No courses yet. Create your first course!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Course</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Students</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Revenue</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id} className="border-b border-border last:border-0">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img 
                              src={course.thumbnail_url || '/placeholder.svg'} 
                              alt={course.title}
                              className="w-16 h-12 object-cover"
                            />
                            <div>
                              <span className="font-medium block">{course.title}</span>
                              <span className="text-xs text-muted-foreground">{course.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {(course.students_count || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          ₹{(course.revenue || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          ₹{(course.price || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium ${
                            course.is_published 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {course.is_published ? 'PUBLISHED' : 'DRAFT'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="View Marksheet"
                              onClick={() => openMarksheet(course)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Link to={`/course/${course.id}`}>
                              <Button variant="ghost" size="icon" title="Edit Course">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="View Analytics"
                              onClick={() => openAnalytics(course)}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive"
                              title="Delete Course"
                              onClick={() => confirmDelete(course)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Upload Video</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Add new video content to your courses</p>
              <Button variant="outline" className="w-full">Upload</Button>
            </div>

            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Add Materials</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Upload PDFs, slides, and resources</p>
              <Button variant="outline" className="w-full">Add Files</Button>
            </div>

            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Create Quiz</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Build interactive quizzes for students</p>
              <Button variant="outline" className="w-full">Create</Button>
            </div>
          </div>
        </div>
      </main>

      {/* Analytics Dialog */}
      {selectedCourse && (
        <StudentAnalytics
          isOpen={analyticsOpen}
          onClose={() => setAnalyticsOpen(false)}
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
        />
      )}

      {/* Marksheet Dialog */}
      {selectedCourse && (
        <MarksheetView
          isOpen={marksheetOpen}
          onClose={() => setMarksheetOpen(false)}
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Course
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone.
              All modules, lessons, and student enrollments will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default InstructorDashboard;
