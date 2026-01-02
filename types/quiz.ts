// app/types/quiz.ts
export interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  questions: number;
  assignedClasses: number;
  avgScore: number | null;
  status: 'active' | 'completed' | 'draft';
  lastUsed: string;
  timeLimit: number;
  createdAt: string;
  updatedAt: string;
  teacherId: string;
  isTemplate: boolean;
}

export interface Question {
  _id?: string;
  text: string;
  type: 'multiple' | 'truefalse' | 'short' | 'essay';
  points: number;
  options?: string[];
  correctAnswer?: number | boolean | string;
  explanation?: string;
}

export interface QuizResult {
  _id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number; // in minutes
  submittedAt: string;
  answers: Answer[];
}

export interface Answer {
  questionId: string;
  selectedAnswer: string | boolean;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface QuizTemplate {
  _id: string;
  name: string;
  description: string;
  category: string;
  questions: number;
  uses: number;
  createdAt: string;
}