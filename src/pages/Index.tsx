import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturedCourses from '@/components/FeaturedCourses';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Award, BookOpen, Users, Zap, CheckCircle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturedCourses />

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(173_80%_45%_/_0.08),_transparent_70%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text">LearnHub?</span>
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
                color: 'primary'
              },
              {
                icon: Award,
                title: 'Verified Certificates',
                description: 'Earn certificates recognized by top employers worldwide',
                color: 'accent'
              },
              {
                icon: Zap,
                title: 'Interactive Learning',
                description: 'Hands-on projects, quizzes, and real-time feedback',
                color: 'info'
              },
              {
                icon: Users,
                title: 'Community Support',
                description: 'Join a community of millions of learners and mentors',
                color: 'success'
              },
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="glass-card rounded-2xl p-6 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}`} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Start Your Learning Journey Today
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join over 2 million learners and get access to 10,000+ courses 
                with certificates and hands-on projects.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {['Lifetime access', 'Certificate included', '30-day money-back guarantee'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Button variant="hero" size="xl">
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
