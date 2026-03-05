import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, User, Menu, X, LogOut } from 'lucide-react';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Learn With RT</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Home
            </Link>
            <Link 
              to="/courses" 
              className={`text-sm font-medium transition-colors ${isActive('/courses') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Courses
            </Link>
            <Link 
              to="/dashboard" 
              className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              My Learning
            </Link>
            {user && (
              <Link 
                to="/instructor" 
                className={`text-sm font-medium transition-colors ${isActive('/instructor') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Instructor
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search courses..." 
                className="pl-10 bg-secondary/50 border-border focus:bg-secondary"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-[10px] flex items-center justify-center font-bold">3</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">My Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/instructor">Instructor Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm">Get Started</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search courses..." className="pl-10" />
              </div>
              <Link to="/" className="px-4 py-2 text-sm font-medium hover:bg-secondary">Home</Link>
              <Link to="/courses" className="px-4 py-2 text-sm font-medium hover:bg-secondary">Courses</Link>
              <Link to="/dashboard" className="px-4 py-2 text-sm font-medium hover:bg-secondary">My Learning</Link>
              {user && (
                <Link to="/instructor" className="px-4 py-2 text-sm font-medium hover:bg-secondary">Instructor</Link>
              )}
              {user ? (
                <Button onClick={signOut} variant="outline" className="mt-2">Sign Out</Button>
              ) : (
                <Link to="/auth">
                  <Button className="mt-2 w-full">Get Started</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
