import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, BookOpen, GraduationCap } from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  expertise: string[] | null;
}

interface EnrollmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  onEnrollmentComplete: () => void;
}

const EnrollmentForm = ({ isOpen, onClose, courseId, courseTitle, onEnrollmentComplete }: EnrollmentFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    education: '',
    experience: '',
    goals: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    const { data } = await supabase
      .from('mentors')
      .select('*')
      .eq('is_active', true);
    if (data) setMentors(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedMentor) {
      toast({
        title: 'Error',
        description: 'Please select a mentor and fill all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create enrollment with mentor
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          mentor_id: selectedMentor,
        });

      if (error) throw error;

      toast({
        title: 'Enrollment Submitted!',
        description: 'Complete payment to activate your course access.',
      });
      
      onEnrollmentComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Enroll in {courseTitle}
          </DialogTitle>
          <DialogDescription>
            Fill in your details and select a mentor to guide you through the course
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">Personal Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Educational Background</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="e.g., B.Tech in Electronics"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Prior Experience (if any)</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="Describe any relevant experience..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Learning Goals</Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                placeholder="What do you hope to achieve from this course?"
                rows={2}
                required
              />
            </div>
          </div>

          {/* Mentor Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">Select Your Mentor</h3>
            
            <div className="grid gap-3">
              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  onClick={() => setSelectedMentor(mentor.id)}
                  className={`p-4 border cursor-pointer transition-all ${
                    selectedMentor === mentor.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={mentor.avatar_url || '/placeholder.svg'}
                      alt={mentor.name}
                      className="w-12 h-12 object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{mentor.name}</h4>
                      <p className="text-sm text-muted-foreground">{mentor.bio}</p>
                      {mentor.expertise && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mentor.expertise.map((skill, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedMentor === mentor.id && (
                      <div className="w-6 h-6 bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-sm">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || !selectedMentor}>
            {isSubmitting ? 'Submitting...' : 'Proceed to Payment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentForm;
