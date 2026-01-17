import { Link } from 'react-router-dom';
import { BookOpen, Twitter, Linkedin, Youtube, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">Learn With RT</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering millions of learners worldwide with expert-led courses and certifications.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/courses" className="hover:text-foreground transition-colors">All Courses</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">My Learning</Link></li>
              <li><Link to="/instructor" className="hover:text-foreground transition-colors">Become an Instructor</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Categories</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Development</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Data Science</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Design</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Marketing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2024 Learn With RT. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Made with ❤️ for learners everywhere</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
