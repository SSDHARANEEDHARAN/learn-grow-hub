import { Button } from '@/components/ui/button';
import { Play, Star, Users, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(173_80%_45%_/_0.15),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(15_90%_60%_/_0.1),_transparent_50%)]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-32 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-32 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-medium text-primary">Rated #1 Learning Platform</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Master New Skills,{' '}
              <span className="gradient-text">Transform</span>{' '}
              Your Career
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Join millions of learners worldwide. Access 10,000+ expert-led courses 
              with certificates, hands-on projects, and personalized learning paths.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/courses">
                <Button variant="hero" size="xl" className="gap-2 group">
                  Explore Courses
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="glass" size="xl" className="gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold text-2xl">2M+</p>
                  <p className="text-sm text-muted-foreground">Active Learners</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-display font-bold text-2xl">50K+</p>
                  <p className="text-sm text-muted-foreground">Certificates Issued</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="font-display font-bold text-2xl">4.9</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Course Cards Preview */}
          <div className="relative hidden lg:block animate-slide-in-right">
            <div className="relative">
              {/* Main Card */}
              <div className="glass-card rounded-2xl p-6 hover-lift glow-effect">
                <img 
                  src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=340&fit=crop" 
                  alt="Course Preview" 
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-semibold">BESTSELLER</span>
                    <span className="px-2 py-1 rounded-md bg-accent/20 text-accent text-xs font-semibold">55% OFF</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg">Complete Web Development Bootcamp</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span>4.9</span>
                    <span>•</span>
                    <span>12,453 reviews</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-xl text-primary">$89.99</span>
                      <span className="text-sm text-muted-foreground line-through">$199.99</span>
                    </div>
                    <Button size="sm" variant="hero">Enroll Now</Button>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -right-4 top-10 glass-card rounded-xl p-4 animate-float shadow-lg" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Certificate Earned!</p>
                    <p className="text-xs text-muted-foreground">Web Development</p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-8 bottom-20 glass-card rounded-xl p-4 animate-float shadow-lg" style={{ animationDelay: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop" className="w-8 h-8 rounded-full border-2 border-background" alt="" />
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" className="w-8 h-8 rounded-full border-2 border-background" alt="" />
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop" className="w-8 h-8 rounded-full border-2 border-background" alt="" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">+2,847 enrolled</p>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
