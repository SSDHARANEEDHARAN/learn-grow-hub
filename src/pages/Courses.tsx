import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { useCourses, useCategories } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Courses');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  const { data: courses, isLoading } = useCourses();
  const { data: categories } = useCategories();

  const filteredCourses = (courses || []).filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'All Courses' || course.category === activeCategory;
    const matchesPrice = (course.price || 0) >= priceRange[0] && (course.price || 0) <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return (a.price || 0) - (b.price || 0);
      case 'price-high': return (b.price || 0) - (a.price || 0);
      case 'rating': return b.average_rating - a.average_rating;
      case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default: return b.students_count - a.students_count;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Explore <span className="gradient-text">Courses</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover courses from world-class instructors and advance your career
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                className="h-12 gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border border-border bg-card p-6 mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-semibold text-lg">Filters</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="text-sm font-medium mb-3 block">Price Range</label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={500}
                    step={10}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-3 block">Level</label>
                  <div className="flex flex-wrap gap-2">
                    {['All Levels', 'Beginner', 'Intermediate', 'Advanced'].map(level => (
                      <Button key={level} variant="secondary" size="sm">
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-border">
            {(categories || ['All Courses']).map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? 'hero' : 'ghost'}
                size="sm"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Results Count */}
          <p className="text-muted-foreground mb-6">
            Showing {sortedCourses.length} courses
          </p>

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
          ) : (
            <>
              {/* Course Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCourses.map((course, index) => (
                  <div 
                    key={course.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>

              {sortedCourses.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-xl text-muted-foreground mb-4">No courses found</p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All Courses');
                    setPriceRange([0, 500]);
                  }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Courses;
