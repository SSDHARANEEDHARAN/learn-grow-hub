import { Link } from 'react-router-dom';
import { Course } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Star, Clock, BookOpen, Users } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
}

const CourseCard = ({ course, showProgress = false }: CourseCardProps) => {
  return (
    <Link to={`/course/${course.id}`}>
      <div className="group border border-border bg-card overflow-hidden hover-lift cursor-pointer">
        {/* Thumbnail */}
        <div className="relative overflow-hidden">
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {course.isBestseller && (
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold">
                BESTSELLER
              </span>
            )}
            {course.isNew && (
              <span className="px-2 py-1 bg-foreground text-background text-xs font-bold">
                NEW
              </span>
            )}
          </div>

          {/* Price */}
          <div className="absolute bottom-3 right-3">
            <div className="border border-border bg-card px-3 py-1">
              <span className="font-display font-bold">${course.price}</span>
              {course.originalPrice && (
                <span className="text-xs text-muted-foreground line-through ml-1">${course.originalPrice}</span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Category & Level */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-secondary text-secondary-foreground font-medium">
              {course.category}
            </span>
            <span className={`px-2 py-1 font-medium ${
              course.level === 'Beginner' ? 'bg-secondary text-secondary-foreground' :
              course.level === 'Intermediate' ? 'bg-secondary text-secondary-foreground' :
              'bg-secondary text-secondary-foreground'
            }`}>
              {course.level}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-lg line-clamp-2 group-hover:underline transition-all">
            {course.title}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-2">
            <img 
              src={course.instructorAvatar} 
              alt={course.instructor}
              className="w-6 h-6 object-cover"
            />
            <span className="text-sm text-muted-foreground">{course.instructor}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-foreground fill-foreground" />
              <span className="font-medium text-foreground">{course.rating}</span>
              <span>({course.reviewCount.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{(course.studentsCount / 1000).toFixed(0)}K</span>
            </div>
          </div>

          {/* Duration & Lessons */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.lessonsCount} lessons</span>
            </div>
          </div>

          {/* Progress (for dashboard) */}
          {showProgress && course.progress !== undefined && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
              {course.lastWatched && (
                <p className="text-xs text-muted-foreground">Last watched: {course.lastWatched}</p>
              )}
            </div>
          )}

          {/* CTA */}
          {!showProgress && (
            <Button className="w-full mt-2">
              Enroll Now
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
