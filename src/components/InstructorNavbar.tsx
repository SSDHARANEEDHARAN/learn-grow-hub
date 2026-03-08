import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, User, Menu, X, LogOut, Zap, Plus, BarChart3, HelpCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const InstructorNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/instructor', label: 'Dashboard' },
    { path: '/courses', label: 'Browse Courses' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/instructor" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-lg tracking-wider">LEAR<span className="text-primary">HUB</span></span>
            <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 border border-orange-500/20 tracking-wider uppercase">Instructor</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ path, label }) => (
              <Link key={path} to={path}
                className={`text-sm font-medium tracking-wider uppercase transition-colors ${
                  isActive(path) ? 'text-primary neon-text' : 'text-muted-foreground hover:text-foreground'
                }`}>
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-primary/20">
                  <DropdownMenuItem asChild><Link to="/profile">My Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/instructor">Instructor Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth/instructor"><Button size="sm" className="font-mono-cyber tracking-wider">Sign In</Button></Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="hover:bg-primary/10">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/10 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map(({ path, label }) => (
                <Link key={path} to={path} className="px-4 py-2 text-sm font-medium tracking-wider uppercase hover:bg-primary/10 hover:text-primary">{label}</Link>
              ))}
              {user ? (
                <Button onClick={signOut} variant="outline" className="mt-2 border-primary/30">Sign Out</Button>
              ) : (
                <Link to="/auth/instructor"><Button className="mt-2 w-full font-mono-cyber tracking-wider">Sign In</Button></Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default InstructorNavbar;
