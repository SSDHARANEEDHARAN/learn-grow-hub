import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  HelpCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Mock data for instructor
const mockInstructorStats = {
  totalCourses: 5,
  totalStudents: 12453,
  totalRevenue: 45890,
  avgRating: 4.8,
};

const mockInstructorCourses = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    students: 8234,
    revenue: 28500,
    rating: 4.9,
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop',
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    students: 3219,
    revenue: 12890,
    rating: 4.7,
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop',
  },
  {
    id: '3',
    title: 'Node.js Masterclass',
    students: 1000,
    revenue: 4500,
    rating: 4.8,
    status: 'draft',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=200&fit=crop',
  },
];

const InstructorDashboard = () => {
  const [courses, setCourses] = useState(mockInstructorCourses);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    
    const course = {
      id: Date.now().toString(),
      title: newCourse.title,
      students: 0,
      revenue: 0,
      rating: 0,
      status: 'draft' as const,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
    };
    
    setCourses([course, ...courses]);
    setNewCourse({ title: '', description: '', price: '', category: '' });
    setIsCreateDialogOpen(false);
    
    toast({
      title: 'Course Created!',
      description: 'Your new course has been created as a draft.',
    });
  };

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
                      <label className="text-sm font-medium">Price ($)</label>
                      <Input
                        type="number"
                        value={newCourse.price}
                        onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                        placeholder="99.99"
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
                        <option value="Development">Development</option>
                        <option value="Design">Design</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Marketing">Marketing</option>
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
              <p className="font-display text-3xl font-bold">{mockInstructorStats.totalCourses}</p>
            </div>

            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Total Students</span>
              </div>
              <p className="font-display text-3xl font-bold">{mockInstructorStats.totalStudents.toLocaleString()}</p>
            </div>

            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Total Revenue</span>
              </div>
              <p className="font-display text-3xl font-bold">${mockInstructorStats.totalRevenue.toLocaleString()}</p>
            </div>

            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Avg Rating</span>
              </div>
              <p className="font-display text-3xl font-bold">{mockInstructorStats.avgRating}</p>
            </div>
          </div>

          {/* Courses Table */}
          <div className="border border-border bg-card">
            <div className="p-6 border-b border-border">
              <h2 className="font-display text-xl font-semibold">Your Courses</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Course</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Students</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Revenue</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Rating</th>
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
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-16 h-12 object-cover"
                          />
                          <span className="font-medium">{course.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {course.students.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        ${course.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {course.rating > 0 ? `⭐ ${course.rating}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium ${
                          course.status === 'published' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {course.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      <Footer />
    </div>
  );
};

export default InstructorDashboard;
