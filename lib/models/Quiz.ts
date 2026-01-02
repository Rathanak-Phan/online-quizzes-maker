// models/Quiz.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  description?: string;
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    points: number;
  }>;
  dueDate?: Date;
  status: 'draft' | 'active' | 'completed';
  averageScore: number;
  submissions: Array<{
    studentId: mongoose.Types.ObjectId;
    score: number;
    submittedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: Number,
        points: Number,
      },
    ],
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed'],
      default: 'draft',
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    submissions: [
      {
        studentId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        score: Number,
        submittedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);

export default Quiz;