import { Link } from 'react-router-dom';
import { BookOpen, Twitter, Linkedin, Youtube, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">LearnHub</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering millions of learners worldwide with expert-led courses and certifications.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/courses" className="hover:text-primary transition-colors">All Courses</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">My Learning</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Become an Instructor</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-semibold mb-4">Categories</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Development</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Data Science</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Design</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Marketing</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 LearnHub. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for learners everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
