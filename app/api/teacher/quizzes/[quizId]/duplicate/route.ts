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
   POST - Duplicate Quiz (SAFE)
================================ */
export async function POST(request: NextRequest) {
  try {
    // ✅ SAFE way (no params typing issues)
    const pathnameParts = request.nextUrl.pathname.split("/");
    const quizId = pathnameParts[pathnameParts.length - 2];

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

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "online-quizzes");
    const quizzesCollection = db.collection<QuizDocument>("quizzes");

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

    const newQuiz: QuizDocument = {
      ...quizWithoutId,
      title: `${originalQuiz.title} (Copy)`,
      status: "draft",
      isTemplate: false,
      lastUsed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await quizzesCollection.insertOne(newQuiz);

    return NextResponse.json({
      success: true,
      quiz: {
        ...newQuiz,
        _id: result.insertedId.toString(),
        teacherId: newQuiz.teacherId?.toString(),
        questions: newQuiz.questions?.length || 0,
        assignedClasses: newQuiz.assignedClassIds?.length || 0,
        avgScore: null,
      },
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
