import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

/* ===============================
   MongoDB Quiz Document Interface
================================ */
interface QuizDocument {
  _id?: ObjectId;
  title: string;
  teacherId?: ObjectId;
  questions?: any[];
  assignedClassIds?: ObjectId[];
  status?: string;
  isTemplate?: boolean;
  lastUsed?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

/* ===============================
   POST - Duplicate Quiz (Next.js 16)
================================ */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ quizId: string }> }
) {
  try {
    // ✅ REQUIRED in Next.js 16
    const { quizId } = await context.params;

    if (!quizId) {
      return NextResponse.json(
        { error: "No quiz ID provided" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json(
        { error: "Invalid quiz ID format" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "online-quizzes");
    const quizzesCollection = db.collection<QuizDocument>("quizzes");

    // Find original quiz
    const originalQuiz = await quizzesCollection.findOne({
      _id: new ObjectId(quizId),
    });

    if (!originalQuiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Remove _id safely
    const { _id, ...quizWithoutId } = originalQuiz;

    // Create duplicated quiz
    const newQuiz: QuizDocument = {
      ...quizWithoutId,
      title: `${originalQuiz.title} (Copy)`,
      status: "draft",
      isTemplate: false,
      lastUsed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert duplicated quiz
    const result = await quizzesCollection.insertOne(newQuiz);

    // Response
    const createdQuiz = {
      ...newQuiz,
      _id: result.insertedId.toString(),
      teacherId: newQuiz.teacherId?.toString(),
      questions: newQuiz.questions?.length || 0,
      assignedClasses: newQuiz.assignedClassIds?.length || 0,
      avgScore: null,
    };

    return NextResponse.json({
      success: true,
      quiz: createdQuiz,
      message: "Quiz duplicated successfully",
    });
  } catch (error) {
    console.error("Error duplicating quiz:", error);
    return NextResponse.json(
      { error: "Failed to duplicate quiz" },
      { status: 500 }
    );
  }
}
