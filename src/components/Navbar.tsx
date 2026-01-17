import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Bell, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">LearnHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Home
            </Link>
            <Link 
              to="/courses" 
              className={`text-sm font-medium transition-colors ${isActive('/courses') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Courses
            </Link>
            <Link 
              to="/dashboard" 
              className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              My Learning
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search courses..." 
                className="pl-10 bg-secondary/50 border-border/50 focus:bg-secondary"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-[10px] flex items-center justify-center font-bold">3</span>
            </Button>
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="hero" size="sm">Get Started</Button>
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search courses..." className="pl-10" />
              </div>
              <Link to="/" className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg">Home</Link>
              <Link to="/courses" className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg">Courses</Link>
              <Link to="/dashboard" className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg">My Learning</Link>
              <Button variant="hero" className="mt-2">Get Started</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
