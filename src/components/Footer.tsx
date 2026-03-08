import { Link } from 'react-router-dom';
import { Zap, Twitter, Linkedin, Youtube, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-primary/10 bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-lg tracking-wider">LEAR<span className="text-primary">HUB</span></span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering millions of learners worldwide with expert-led courses and certifications.
            </p>
            <div className="flex gap-4">
              {[Twitter, Linkedin, Youtube, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 border border-border bg-secondary flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 tracking-wider text-sm uppercase">Quick Links</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/courses" className="hover:text-primary transition-colors">All Courses</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">My Learning</Link></li>
              <li><Link to="/instructor" className="hover:text-primary transition-colors">Become an Instructor</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 tracking-wider text-sm uppercase">Categories</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Development</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Data Science</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Design</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Marketing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 tracking-wider text-sm uppercase">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-mono-cyber">© 2024 LearHub. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Made with <span className="text-primary">⚡</span> for learners everywhere</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
