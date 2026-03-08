import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GraduationCap } from 'lucide-react';
import AuthForm from '@/components/AuthForm';

const StudentAuth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <AuthForm
      role="student"
      icon={
        <div className="w-12 h-12 bg-primary flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-primary-foreground" />
        </div>
      }
      title="Student Portal"
    />
  );
};

export default StudentAuth;
