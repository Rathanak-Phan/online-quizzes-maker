// app/api/teacher/quizzes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

// Helper to format quiz for the frontend list view
function formatQuizResponse(quiz: any) {
  return {
    _id: quiz._id.toString(),
    title: quiz.title || "Untitled Quiz",
    description: quiz.description || "",
    category: quiz.category || "General",
    status: quiz.status || "draft",
    timeLimit: quiz.timeLimit || 30,
    // Return the count for the list view, or the full array if needed
    questionsCount: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
    questions: quiz.questions || [], 
    assignedClasses: quiz.assignedClassIds || [],
    teacherId: quiz.teacherId?.toString(),
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("teacher");

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "newest";

    // Build query
    const query: any = {};

    // Mock teacher ID (Ensure we only fetch this teacher's quizzes)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    // Build sort
    let sortQuery = {};
    switch (sort) {
      case "title":
        sortQuery = { title: 1 };
        break;
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      default: // "newest"
        sortQuery = { createdAt: -1 };
    }

    // Fetch from MongoDB Atlas
    const quizzes = await db
      .collection("quizzes")
      .find(query)
      .sort(sortQuery)
      .limit(50)
      .toArray();

    // Format response
    const formattedQuizzes = quizzes.map(formatQuizResponse);

    return NextResponse.json({
      success: true,
      quizzes: formattedQuizzes,
      total: formattedQuizzes.length,
      source: "mongodb-atlas",
    });
  } catch (error: any) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json({
      success: false,
      quizzes: [],
      error: "Failed to load quizzes",
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { title, description, category, status, timeLimit, questions } = data;

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: "Quiz title is required" },
        { status: 400 }
      );
    }

    // Mock teacher ID

    const client = await clientPromise;
    const teacherDb = client.db("teacher");
    const mainDb = client.db("main"); // Dual write for student access

    const teacherQuizzes = teacherDb.collection("quizzes");
    const publicQuizzes = mainDb.collection("quizzes");

    const newQuizData = {
      title: title.trim(),
      description: description?.trim() || "",
      category: category?.trim() || "General",
      status: status || "draft",
      timeLimit: parseInt(timeLimit?.toString() || "30"), // Ensure number
      questions: Array.isArray(questions) ? questions : [], 
    };

    const teacherInsert = await teacherQuizzes.insertOne({ ...newQuizData });

    try {
      await publicQuizzes.insertOne({ ...newQuizData });
    } catch (err) {
      await teacherQuizzes.deleteOne({ _id: teacherInsert.insertedId });
      throw err;
    }

    return NextResponse.json({
      success: true,
      message: "Quiz created successfully",
      quizId: teacherInsert.insertedId.toString(),
      quiz: formatQuizResponse({
        _id: teacherInsert.insertedId,
        ...newQuizData
      }),
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}