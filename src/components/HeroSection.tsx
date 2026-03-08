import { Button } from '@/components/ui/button';
import { Play, Star, Users, Award, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,hsl(var(--primary)/0.08),transparent_60%)]" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-[hsl(var(--neon-magenta)/0.05)] rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-[hsl(var(--primary)/0.05)] rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 bg-primary/5 font-mono-cyber">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary tracking-wider uppercase">Rated #1 Learning Platform</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Master New Skills,{' '}
              <span className="gradient-text neon-text">Transform</span>{' '}
              Your Career
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Join millions of learners worldwide. Access 10,000+ expert-led courses 
              with certificates, hands-on projects, and personalized learning paths.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/courses">
                <Button size="xl" className="gap-2 group">
                  Explore Courses
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="gap-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-border">
              {[
                { icon: Users, value: '2M+', label: 'Active Learners' },
                { icon: Award, value: '50K+', label: 'Certificates Issued' },
                { icon: Star, value: '4.9', label: 'Average Rating' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-12 h-12 border border-primary/20 bg-primary/5 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-2xl">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Course Cards Preview */}
          <div className="relative hidden lg:block animate-slide-in-right">
            <div className="relative">
              {/* Main Card */}
              <div className="neon-border bg-card p-6 hover-lift">
                <img 
                  src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=340&fit=crop" 
                  alt="Course Preview" 
                  className="w-full h-48 object-cover mb-4 border border-border"
                />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold font-mono-cyber tracking-wider">
                      BESTSELLER
                    </span>
                    <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-bold font-mono-cyber tracking-wider">
                      55% OFF
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-lg">Complete Web Development Bootcamp</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span>4.9</span>
                    <span>•</span>
                    <span>12,453 reviews</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-xl text-primary">$89.99</span>
                      <span className="text-sm text-muted-foreground line-through">$199.99</span>
                    </div>
                    <Button size="sm">Enroll Now</Button>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -right-4 top-10 neon-border bg-card p-4 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                    <Award className="w-5 h-5 text-neon-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Certificate Earned!</p>
                    <p className="text-xs text-muted-foreground font-mono-cyber">Web Development</p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-8 bottom-20 neon-border bg-card p-4 animate-float" style={{ animationDelay: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop" className="w-8 h-8 border-2 border-background" alt="" />
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" className="w-8 h-8 border-2 border-background" alt="" />
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop" className="w-8 h-8 border-2 border-background" alt="" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">+2,847 enrolled</p>
                    <p className="text-xs text-muted-foreground font-mono-cyber">This week</p>
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
