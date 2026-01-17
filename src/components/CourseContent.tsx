import { useState } from 'react';
import { ChevronDown, ChevronUp, Play, FileText, HelpCircle, Lock, CheckCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Lesson {
  id: string;
  title: string;
  duration: string | null;
  type: string | null;
  is_free: boolean | null;
  is_weekly_test: boolean | null;
  week_number: number | null;
  day_number: number | null;
}

interface Module {
  id: string;
  title: string;
  order_index: number | null;
  lessons: Lesson[];
}

interface CourseContentProps {
  courseId: string;
  modules: Module[];
  onSelectLesson: (lessonId: string) => void;
  activeLesson?: string;
  isLocked?: boolean;
  completedLessons?: string[];
}

const CourseContent = ({ 
  courseId, 
  modules, 
  onSelectLesson, 
  activeLesson, 
  isLocked = false,
  completedLessons = []
}: CourseContentProps) => {
  const [openModules, setOpenModules] = useState<string[]>(
    modules.slice(0, 2).map(m => m.id)
  );

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getLessonIcon = (lesson: Lesson, isCompleted: boolean, locked: boolean) => {
    if (locked) return <Lock className="w-4 h-4 text-muted-foreground" />;
    if (isCompleted) return <CheckCircle className="w-4 h-4 text-primary" />;
    
    if (lesson.is_weekly_test) return <HelpCircle className="w-4 h-4 text-primary" />;
    if (lesson.type === 'quiz') return <HelpCircle className="w-4 h-4" />;
    if (lesson.type === 'material') return <FileText className="w-4 h-4" />;
    return <Play className="w-4 h-4" />;
  };

  const formatDuration = (lesson: Lesson) => {
    if (lesson.is_weekly_test) return 'Weekly Test';
    if (lesson.week_number && lesson.day_number) {
      return `Week ${lesson.week_number}, Day ${lesson.day_number}`;
    }
    return lesson.duration || '';
  };

  if (modules.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-display font-semibold text-lg mb-4">Course Content</h3>
        <div className="text-center py-8 border border-border bg-secondary/20">
          <p className="text-muted-foreground">No content available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold text-lg mb-4">Course Content</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {modules.length} modules • {modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons
      </p>
      
      {modules.map((module, moduleIndex) => (
        <Collapsible
          key={module.id}
          open={openModules.includes(module.id)}
          onOpenChange={() => toggleModule(module.id)}
        >
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 bg-secondary/50 hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {moduleIndex + 1}
                </div>
                <div className="text-left">
                  <h4 className="font-medium">{module.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {module.lessons.length} lessons
                    {!isLocked && completedLessons.length > 0 && (
                      <> • {module.lessons.filter(l => completedLessons.includes(l.id)).length} completed</>
                    )}
                  </p>
                </div>
              </div>
              {openModules.includes(module.id) ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-2 space-y-1">
              {module.lessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const lessonLocked = isLocked && !lesson.is_free;
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => !lessonLocked && onSelectLesson(lesson.id)}
                    disabled={lessonLocked}
                    className={`w-full flex items-center justify-between p-3 transition-colors ${
                      activeLesson === lesson.id
                        ? 'bg-primary/10 border border-primary/20'
                        : lessonLocked
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center ${
                        isCompleted ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {getLessonIcon(lesson, isCompleted, lessonLocked)}
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-medium ${lessonLocked ? 'text-muted-foreground' : ''}`}>
                          {lesson.title}
                          {lesson.is_weekly_test && (
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5">
                              WEEKLY TEST
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(lesson)}
                        </p>
                      </div>
                    </div>
                    
                    {isCompleted && (
                      <span className="text-xs text-primary font-medium">Completed</span>
                    )}
                    {lesson.is_free && !isCompleted && (
                      <span className="text-xs text-muted-foreground">Free</span>
                    )}
                  </button>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default CourseContent;
