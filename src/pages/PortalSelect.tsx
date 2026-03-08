import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PortalSelect = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <span className="font-display font-bold text-3xl tracking-wider">
            LEAR<span className="text-primary">HUB</span>
          </span>
        </div>

        <h1 className="text-center text-2xl font-display font-bold mb-2">Welcome to LearHub</h1>
        <p className="text-center text-muted-foreground mb-10">
          Choose how you'd like to continue
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Portal */}
          <Link to="/auth/student" className="group">
            <div className="border border-border bg-card p-8 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold">Student Portal</h2>
              <p className="text-sm text-muted-foreground">
                Browse courses, watch videos, download materials, take exams, and track your progress
              </p>
              <Button variant="outline" className="mt-2 w-full border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                Continue as Student
              </Button>
            </div>
          </Link>

          {/* Instructor Portal */}
          <Link to="/auth/instructor" className="group">
            <div className="border border-border bg-card p-8 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold">Instructor Portal</h2>
              <p className="text-sm text-muted-foreground">
                Create courses, add exams, manage students, view analytics, and grow your teaching business
              </p>
              <Button variant="outline" className="mt-2 w-full border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                Continue as Instructor
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PortalSelect;
