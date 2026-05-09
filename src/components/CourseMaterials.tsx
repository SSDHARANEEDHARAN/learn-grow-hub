import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, FileText, Lock } from 'lucide-react';

interface Props {
  courseId: string;
  canAccess: boolean;
}

const formatSize = (bytes?: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const CourseMaterials = ({ courseId, canAccess }: Props) => {
  const { data: materials, isLoading } = useQuery({
    queryKey: ['course-materials', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading materials...</p>;
  }

  if (!materials || materials.length === 0) {
    return (
      <div className="border border-border bg-card p-6 text-center">
        <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          No downloadable materials have been added for this course yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {materials.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between gap-4 p-4 border border-border bg-card"
        >
          <div className="flex items-start gap-3 min-w-0">
            <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-medium truncate">{m.title}</p>
              {m.description && (
                <p className="text-sm text-muted-foreground truncate">{m.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {m.file_type || 'File'} {m.file_size ? `• ${formatSize(m.file_size)}` : ''}
              </p>
            </div>
          </div>
          {canAccess ? (
            <Button asChild variant="outline" size="sm" className="gap-2 shrink-0">
              <a href={m.file_url} target="_blank" rel="noopener noreferrer" download>
                <Download className="w-4 h-4" />
                Download
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled className="gap-2 shrink-0">
              <Lock className="w-4 h-4" />
              Locked
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CourseMaterials;