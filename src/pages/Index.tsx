import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturedCourses from '@/components/FeaturedCourses';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Award, BookOpen, Users, Zap, CheckCircle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background scanline">
      <Navbar />
      <HeroSection />
      <FeaturedCourses />

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.06),_transparent_70%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Why Choose <span className="gradient-text neon-text">LearnHub?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Expert-Led Courses',
                description: 'Learn from industry professionals with real-world experience',
                glowColor: 'primary'
              },
              {
                icon: Award,
                title: 'Verified Certificates',
                description: 'Earn certificates recognized by top employers worldwide',
                glowColor: 'accent'
              },
              {
                icon: Zap,
                title: 'Interactive Learning',
                description: 'Hands-on projects, quizzes, and real-time feedback',
                glowColor: 'primary'
              },
              {
                icon: Users,
                title: 'Community Support',
                description: 'Join a community of millions of learners and mentors',
                glowColor: 'accent'
              },
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="neon-border bg-card p-6 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 border border-primary/20 bg-primary/5 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-base mb-2 tracking-wide">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="neon-border bg-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.1),transparent_60%)]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[hsl(var(--neon-magenta)/0.05)] rounded-full blur-[120px]" />
            
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Start Your Learning Journey <span className="gradient-text">Today</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join over 2 million learners and get access to 10,000+ courses 
                with certificates and hands-on projects.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {['Lifetime access', 'Certificate included', '30-day money-back guarantee'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-mono-cyber">
                    <CheckCircle className="w-4 h-4 text-neon-green" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Button variant="hero" size="xl" className="font-mono-cyber tracking-wider">
                Get Started for Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
