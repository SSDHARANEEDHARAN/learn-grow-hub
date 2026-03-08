import { Link } from 'react-router-dom';
import { Star, Clock, BookOpen, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { CourseWithDetails } from '@/hooks/useCourses';

interface CourseCardProps {
  course: CourseWithDetails;
  showProgress?: boolean;
  progress?: number;
}

const CourseCard = ({ course, showProgress = false, progress = 0 }: CourseCardProps) => {
  return (
    <Link to={`/course/${course.id}`}>
      <div className="group neon-border bg-card overflow-hidden hover-lift cursor-pointer">
        {/* Thumbnail */}
        <div className="relative overflow-hidden">
          <img 
            src={course.thumbnail_url || '/placeholder.svg'} 
            alt={course.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {course.is_bestseller && (
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold font-mono-cyber tracking-wider">
                BESTSELLER
              </span>
            )}
          </div>

          {/* Price */}
          <div className="absolute bottom-3 right-3">
            <div className="border border-primary/20 bg-card/90 backdrop-blur-sm px-3 py-1">
              <span className="font-display font-bold text-primary">${course.price || 0}</span>
              {course.original_price && course.original_price > (course.price || 0) && (
                <span className="text-xs text-muted-foreground line-through ml-1">
                  ${course.original_price}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Category & Level */}
          <div className="flex items-center gap-2 text-xs">
            {course.category && (
              <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 font-mono-cyber tracking-wider">
                {course.category}
              </span>
            )}
            {course.level && (
              <span className="px-2 py-1 bg-secondary text-secondary-foreground font-mono-cyber tracking-wider">
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Instructor */}
          {course.instructor && (
            <div className="flex items-center gap-2">
              <img 
                src={course.instructor.avatar_url || '/placeholder.svg'} 
                alt={course.instructor.full_name || 'Instructor'}
                className="w-6 h-6 object-cover border border-border"
              />
              <span className="text-sm text-muted-foreground">
                {course.instructor.full_name}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="font-medium text-foreground">{course.average_rating}</span>
              <span>({course.review_count.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>
                {course.students_count >= 1000 
                  ? `${(course.students_count / 1000).toFixed(0)}K` 
                  : course.students_count}
              </span>
            </div>
          </div>

          {/* Duration & Lessons */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono-cyber">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration || '3 months'}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.lessons_count} lessons</span>
            </div>
          </div>

          {/* Progress (for dashboard) */}
          {showProgress && (
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-primary font-medium font-mono-cyber">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
