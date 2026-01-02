// app/api/teacher/quizzes/[quizId]/duplicate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const quizId = params.quizId;

    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json(
        { error: "Invalid quiz ID format" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'online-quizzes');

    // Get the original quiz
    const originalQuiz = await db.collection("quizzes").findOne({
      _id: new ObjectId(quizId)
    });

    if (!originalQuiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Create a copy with new ID
    const newQuiz = {
      ...originalQuiz,
      _id: new ObjectId(),
      title: `${originalQuiz.title} (Copy)`,
      status: "draft",
      isTemplate: false,
      lastUsed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Remove the original _id field
    delete newQuiz._id;

    const result = await db.collection("quizzes").insertOne(newQuiz);

    const createdQuiz = {
      ...newQuiz,
      _id: result.insertedId.toString(),
      teacherId: newQuiz.teacherId.toString(),
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
    return NextResponse.json(
      { error: "Failed to duplicate quiz" },
      { status: 500 }
    );
  }
}