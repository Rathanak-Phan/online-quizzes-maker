// app/api/teacher/quizzes/[quizId]/route.ts - COMPLETE CLEAN VERSION
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

// GET - Fetch single quiz
export async function GET(
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
    const db = client.db(process.env.MONGODB_DB_NAME || 'online-quizzes-maker');

    const quiz = await db.collection("quizzes").findOne({
      _id: new ObjectId(quizId)
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Format the response
    const formattedQuiz = {
      ...quiz,
      _id: quiz._id.toString(),
      teacherId: quiz.teacherId.toString(),
      questions: quiz.questions || [],
    };

    return NextResponse.json({
      success: true,
      quiz: formattedQuiz,
    });
  } catch (error: any) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// PUT - Update quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const quizId = params.quizId;
    const data = await request.json();

    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json(
        { error: "Invalid quiz ID format" },
        { status: 400 }
      );
    }

    // Validation
    if (!data.title?.trim()) {
      return NextResponse.json(
        { error: "Quiz title is required" },
        { status: 400 }
      );
    }

    if (!data.category?.trim()) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'online-quizzes-maker');

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
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Get updated quiz
    const updatedQuiz = await db.collection("quizzes").findOne({
      _id: new ObjectId(quizId)
    });

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
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

// DELETE - Delete quiz (ONLY ONE DELETE FUNCTION!)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const quizId = params.quizId;

    console.log("DELETE request for quiz ID:", quizId);

    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json(
        { 
          error: "Invalid quiz ID format",
          receivedId: quizId
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'online-quizzes-maker');

    // Delete the quiz
    const result = await db.collection("quizzes").deleteOne({
      _id: new ObjectId(quizId)
    });

    console.log("Delete result:", result);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Quiz not found", receivedId: quizId },
        { status: 404 }
      );
    }

    // Also delete related results (optional)
    await db.collection("quiz_results").deleteMany({
      quizId: new ObjectId(quizId)
    });

    return NextResponse.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete quiz",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}