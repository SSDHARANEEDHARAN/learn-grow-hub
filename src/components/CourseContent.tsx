import { useState } from 'react';
import { Module } from '@/types/course';
import { mockModules } from '@/data/mockData';
import { ChevronDown, ChevronUp, Play, FileText, HelpCircle, Lock, CheckCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CourseContentProps {
  onSelectLesson: (lessonId: string) => void;
  activeLesson?: string;
}

const CourseContent = ({ onSelectLesson, activeLesson }: CourseContentProps) => {
  const [openModules, setOpenModules] = useState<string[]>(['m1', 'm2']);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getLessonIcon = (type: string, isCompleted: boolean, isLocked: boolean) => {
    if (isLocked) return <Lock className="w-4 h-4 text-muted-foreground" />;
    if (isCompleted) return <CheckCircle className="w-4 h-4 text-success" />;
    
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      case 'material': return <FileText className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold text-lg mb-4">Course Content</h3>
      
      {mockModules.map((module) => (
        <Collapsible
          key={module.id}
          open={openModules.includes(module.id)}
          onOpenChange={() => toggleModule(module.id)}
        >
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {mockModules.indexOf(module) + 1}
                </div>
                <div className="text-left">
                  <h4 className="font-medium">{module.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {module.lessons.length} lessons • {module.lessons.filter(l => l.isCompleted).length} completed
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
              {module.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => !lesson.isLocked && onSelectLesson(lesson.id)}
                  disabled={lesson.isLocked}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeLesson === lesson.id
                      ? 'bg-primary/10 border border-primary/20'
                      : lesson.isLocked
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      lesson.isCompleted ? 'bg-success/10' : 'bg-muted'
                    }`}>
                      {getLessonIcon(lesson.type, lesson.isCompleted, lesson.isLocked)}
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${lesson.isLocked ? 'text-muted-foreground' : ''}`}>
                        {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {lesson.type} • {lesson.duration}
                      </p>
                    </div>
                  </div>
                  
                  {lesson.isCompleted && (
                    <span className="text-xs text-success font-medium">Completed</span>
                  )}
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default CourseContent;
