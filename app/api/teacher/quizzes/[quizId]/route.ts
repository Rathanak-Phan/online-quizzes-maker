import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

// Helper to resolve params if promise
async function resolveParams<T>(params: T | Promise<T>): Promise<T> {
  return params instanceof Promise ? await params : params;
}

// GET - Fetch single quiz
export async function GET(
  request: NextRequest,
  context: { params: { quizId: string } | Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await resolveParams(context.params);

    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("teacher");

    const quiz = await db.collection("quizzes").findOne({ _id: new ObjectId(quizId) });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      quiz: {
        ...quiz,
        _id: quiz._id.toString(),
        questions: quiz.questions || [],
      },
    });
  } catch (error: any) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}

// PUT - Update quiz
export async function PUT(
  request: NextRequest,
  context: { params: { quizId: string } | Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await resolveParams(context.params);
    const data = await request.json();

    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID format" }, { status: 400 });
    }

    if (!data.title?.trim()) {
      return NextResponse.json({ error: "Quiz title is required" }, { status: 400 });
    }

    if (!data.category?.trim()) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("teacher");

    const updateData = {
      title: data.title.trim(),
      description: data.description?.trim() || "",
      category: data.category.trim(),
      timeLimit: data.timeLimit || 30,
      questions: data.questions || [],
      status: data.status || "draft",
      isTemplate: data.isTemplate || false,
      updatedAt: new Date(),
    };

    const result = await db.collection("quizzes").updateOne(
      { _id: new ObjectId(quizId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const updatedQuiz = await db.collection("quizzes").findOne({ _id: new ObjectId(quizId) });

    return NextResponse.json({
      success: true,
      quiz: {
        ...updatedQuiz,
        _id: updatedQuiz?._id.toString(),
        teacherId: updatedQuiz?.teacherId.toString(),
      },
      message: "Quiz updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating quiz:", error);
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 });
  }
}

// DELETE - Delete quiz
export async function DELETE(
  request: NextRequest,
  context: { params: { quizId: string } | Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await resolveParams(context.params);

    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("teacher");

    const result = await db.collection("quizzes").deleteOne({ _id: new ObjectId(quizId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Quiz deleted successfully",
      deletedId: quizId,
    });
  } catch (error: any) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
  }
}