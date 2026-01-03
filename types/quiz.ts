// types/quiz.ts
export interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[]; // This should be an array, not a number!
  assignedClasses: number;
  avgScore: number | null;
  status: 'active' | 'completed' | 'draft'; // Check if your API uses 'completed' or 'active'
  lastUsed: string;
  timeLimit: number;
  createdAt: string;
  updatedAt: string;
  teacherId: string;
  isTemplate: boolean;
}

// Make sure Question interface is defined
export interface Question {
  _id?: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  points: number;
  options?: string[];
  correctAnswer?: string | number | boolean;
  explanation?: string;
}