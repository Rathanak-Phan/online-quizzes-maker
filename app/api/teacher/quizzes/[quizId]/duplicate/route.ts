import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

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

export async function POST(request: NextRequest) {
  try {
    const parts = request.nextUrl.pathname.split("/");
    const quizId = parts[parts.length - 2]; // extract quizId from URL

    if (!quizId || !ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "online-quizzes");
    const quizzesCollection = db.collection<QuizDocument>("quizzes");

    const originalQuiz = await quizzesCollection.findOne({ _id: new ObjectId(quizId) });
    if (!originalQuiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

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
    return NextResponse.json({ error: "Failed to duplicate quiz" }, { status: 500 });
  }
}
