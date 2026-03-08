import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen } from 'lucide-react';
import AuthForm from '@/components/AuthForm';

const InstructorAuth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/instructor');
  }, [user, navigate]);

  return (
    <AuthForm
      role="instructor"
      icon={
        <div className="w-12 h-12 bg-primary flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-primary-foreground" />
        </div>
      }
      title="Instructor Portal"
    />
  );
};

export default InstructorAuth;
