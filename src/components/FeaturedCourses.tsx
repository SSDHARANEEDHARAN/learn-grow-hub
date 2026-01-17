import { useState } from 'react';
import { useCourses, useCategories } from '@/hooks/useCourses';
import CourseCard from './CourseCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedCourses = () => {
  const [activeCategory, setActiveCategory] = useState('All Courses');
  const { data: courses, isLoading } = useCourses();
  const { data: categories } = useCategories();

  const filteredCourses = activeCategory === 'All Courses' 
    ? courses 
    : courses?.filter(course => course.category === activeCategory);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Featured <span className="gradient-text">Courses</span>
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Explore our most popular courses, handpicked by our expert team to help you achieve your learning goals.
            </p>
          </div>
          <Link to="/courses">
            <Button variant="outline" className="gap-2 group shrink-0">
              View All Courses
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {(categories || ['All Courses']).map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? 'hero' : 'secondary'}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className="transition-all duration-300"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-border bg-card">
                <Skeleton className="aspect-video w-full" />
                <div className="p-5 space-y-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses && filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.slice(0, 6).map((course, index) => (
              <div 
                key={course.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-border bg-secondary/20">
            <p className="text-muted-foreground">No courses available yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon for new content!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCourses;
