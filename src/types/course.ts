export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  studentsCount: number;
  duration: string;
  lessonsCount: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  tags: string[];
  isBestseller?: boolean;
  isNew?: boolean;
  progress?: number;
  lastWatched?: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'quiz' | 'material';
  isCompleted: boolean;
  isLocked: boolean;
  videoUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  userName: string;
  completionDate: string;
  score: number;
  certificateUrl: string;
}

export interface WatchHistory {
  courseId: string;
  lessonId: string;
  watchedAt: string;
  progress: number;
}
