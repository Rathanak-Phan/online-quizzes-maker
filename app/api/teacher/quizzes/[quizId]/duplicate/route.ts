// app/api/teacher/quizzes/[quizId]/duplicate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

// POST - Duplicate a quiz
export async function POST(request: NextRequest) {
  try {
    // Extract quizId from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/"); 
    // ['', 'api', 'teacher', 'quizzes', '<quizId>', 'duplicate']
    const quizId = pathSegments[pathSegments.length - 2]; // second-to-last segment

    if (!quizId) {
      return NextResponse.json({ error: "No quiz ID provided" }, { status: 400 });
    }

    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "online-quizzes");

    const quizzesCollection = db.collection("quizzes");

    // Get the original quiz
    const originalQuiz = await quizzesCollection.findOne({ _id: new ObjectId(quizId) });

    if (!originalQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Create a copy
    const newQuiz = {
      ...originalQuiz,
      title: `${originalQuiz.title} (Copy)`,
      status: "draft",
      isTemplate: false,
      lastUsed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    delete newQuiz._id; // Remove original _id

    const result = await quizzesCollection.insertOne(newQuiz);

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
  } catch (error: any) {
    console.error("Error duplicating quiz:", error);
    return NextResponse.json({ error: "Failed to duplicate quiz", details: error.message }, { status: 500 });
  }
}
