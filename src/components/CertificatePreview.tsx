import { Award, Download, Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CertificatePreviewProps {
  courseName: string;
  userName: string;
  completionDate: string;
  score: number;
}

const CertificatePreview = ({ 
  courseName = "Complete Web Development Bootcamp 2024",
  userName = "John Doe",
  completionDate = "January 15, 2024",
  score = 92
}: CertificatePreviewProps) => {
  return (
    <div className="glass-card rounded-2xl p-8 space-y-6">
      {/* Certificate Visual */}
      <div className="relative bg-gradient-to-br from-secondary via-card to-secondary rounded-xl p-8 border border-primary/20 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative text-center space-y-6">
          {/* Header */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <Award className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl gradient-text">LearnHub</span>
          </div>

          {/* Title */}
          <div>
            <p className="text-muted-foreground uppercase tracking-widest text-sm mb-2">
              Certificate of Completion
            </p>
            <h3 className="font-display font-bold text-3xl">
              {courseName}
            </h3>
          </div>

          {/* Recipient */}
          <div className="py-6">
            <p className="text-muted-foreground mb-2">This certifies that</p>
            <p className="font-display font-bold text-4xl gradient-text">{userName}</p>
            <p className="text-muted-foreground mt-2">
              has successfully completed the course
            </p>
          </div>

          {/* Score & Date */}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold text-xl">{score}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Final Score</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{completionDate}</p>
              <p className="text-xs text-muted-foreground mt-1">Completion Date</p>
            </div>
          </div>

          {/* Signature Line */}
          <div className="pt-6 border-t border-border/50">
            <div className="flex justify-around items-center">
              <div className="text-center">
                <div className="font-display italic text-xl mb-1">Sarah Chen</div>
                <p className="text-xs text-muted-foreground">Lead Instructor</p>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Certificate ID</div>
                <p className="font-mono text-sm">LH-2024-WD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="hero" className="flex-1 gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button variant="outline" className="flex-1 gap-2">
          <Share2 className="w-4 h-4" />
          Share on LinkedIn
        </Button>
      </div>
    </div>
  );
};

export default CertificatePreview;
