import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Download, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MarksheetViewProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

interface StudentMark {
  id: string;
  studentName: string;
  email: string;
  enrolledAt: string;
  weeklyScores: number[];
  totalScore: number;
  percentage: number;
  grade: string;
  status: 'passed' | 'failed' | 'in_progress';
}

const MarksheetView = ({ isOpen, onClose, courseId, courseTitle }: MarksheetViewProps) => {
  const [students, setStudents] = useState<StudentMark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchStudentMarks();
    }
  }, [isOpen, courseId]);

  const fetchStudentMarks = async () => {
    setIsLoading(true);
    try {
      // Get enrollments for this course
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseId);

      if (!enrollments?.length) {
        setStudents([]);
        setIsLoading(false);
        return;
      }

      // Generate demo data for enrolled students
      const studentMarks: StudentMark[] = enrollments.map((enrollment, idx) => {
        const weeklyScores = Array.from({ length: 12 }, () => Math.floor(Math.random() * 40 + 60));
        const totalScore = weeklyScores.reduce((a, b) => a + b, 0);
        const percentage = Math.round(totalScore / 12);
        const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D';
        const status = percentage >= 60 ? 'passed' : percentage < 40 ? 'failed' : 'in_progress';

        return {
          id: enrollment.id,
          studentName: `Student ${idx + 1}`,
          email: `student${idx + 1}@example.com`,
          enrolledAt: enrollment.enrolled_at,
          weeklyScores,
          totalScore,
          percentage,
          grade,
          status,
        };
      });

      setStudents(studentMarks);
    } catch (error) {
      console.error('Error fetching marks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <span className="px-2 py-1 text-xs bg-primary text-primary-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passed</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs bg-destructive text-destructive-foreground flex items-center gap-1"><XCircle className="w-3 h-3" /> Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground">In Progress</span>;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-primary font-bold';
      case 'B':
        return 'text-foreground font-semibold';
      case 'C':
        return 'text-muted-foreground';
      default:
        return 'text-destructive';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Marksheet: {courseTitle}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No enrolled students yet</p>
          </div>
        ) : (
          <div className="mt-4">
            <div className="flex justify-end mb-4">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>

            <div className="border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background">Student</TableHead>
                    {Array.from({ length: 12 }, (_, i) => (
                      <TableHead key={i} className="text-center min-w-16">W{i + 1}</TableHead>
                    ))}
                    <TableHead className="text-center">Avg</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="sticky left-0 bg-background">
                        <div>
                          <p className="font-medium">{student.studentName}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </TableCell>
                      {student.weeklyScores.map((score, idx) => (
                        <TableCell key={idx} className="text-center">
                          <span className={score >= 70 ? 'text-primary' : score >= 50 ? 'text-foreground' : 'text-destructive'}>
                            {score}
                          </span>
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold">{student.percentage}%</TableCell>
                      <TableCell className={`text-center ${getGradeColor(student.grade)}`}>{student.grade}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(student.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="border border-border p-4 text-center">
                <p className="text-2xl font-bold text-primary">{students.filter(s => s.status === 'passed').length}</p>
                <p className="text-sm text-muted-foreground">Passed</p>
              </div>
              <div className="border border-border p-4 text-center">
                <p className="text-2xl font-bold text-destructive">{students.filter(s => s.status === 'failed').length}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
              <div className="border border-border p-4 text-center">
                <p className="text-2xl font-bold">{students.filter(s => s.status === 'in_progress').length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <div className="border border-border p-4 text-center">
                <p className="text-2xl font-bold">{Math.round(students.reduce((a, s) => a + s.percentage, 0) / students.length)}%</p>
                <p className="text-sm text-muted-foreground">Class Average</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MarksheetView;
