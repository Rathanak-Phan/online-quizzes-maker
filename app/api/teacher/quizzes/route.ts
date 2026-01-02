// app/api/teacher/quizzes/route.ts - For Atlas
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching quizzes from MongoDB Atlas...");

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "online-quizzes");

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "newest";

    // Build query
    const query: any = {};

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
      case "lastUsed":
        sortQuery = { lastUsed: -1 };
        break;
      default: // "newest"
        sortQuery = { createdAt: -1 };
    }

    // Fetch from MongoDB Atlas
    const quizzes = await db
      .collection("quizzes")
      .find(query)
      .sort(sortQuery)
      .limit(50) // Limit results
      .toArray();

    console.log(`Found ${quizzes.length} quizzes in Atlas`);

    // Format response
    const formattedQuizzes = quizzes.map((quiz: any) => ({
      _id: quiz._id.toString(),
      title: quiz.title || "Untitled Quiz",
      description: quiz.description || "",
      category: quiz.category || "General",
      questions: quiz.questions?.length || 0,
      assignedClasses: quiz.assignedClassIds?.length || 0,
      avgScore: null, // You can calculate this from quiz_results
      status: quiz.status || "draft",
      lastUsed: quiz.lastUsed || quiz.createdAt,
      timeLimit: quiz.timeLimit || 30,
      createdAt: quiz.createdAt,
      isTemplate: quiz.isTemplate || false,
      teacherId: quiz.teacherId?.toString() || "unknown",
    }));

    return NextResponse.json({
      quizzes: formattedQuizzes,
      total: formattedQuizzes.length,
      page: 1,
      totalPages: 1,
      source: "mongodb-atlas",
    });
  } catch (error: any) {
    console.error("Error fetching from MongoDB Atlas:", error);

    // Return empty but with error details
    return NextResponse.json({
      quizzes: [],
      total: 0,
      page: 1,
      totalPages: 0,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      source: "error",
    });
  }
}

// app/api/teacher/quizzes/route.ts - Add POST method
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

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
    const db = client.db(process.env.MONGODB_DB_NAME || "online-quizzes");

    const quizData = {
      title: data.title.trim(),
      description: data.description?.trim() || "",
      category: data.category.trim(),
      timeLimit: data.timeLimit || 30,
      questions: data.questions || [],
      assignedClassIds: [],
      teacherId: new ObjectId("65a1b2c3d4e5f67890123456"), // Mock teacher ID
      status: data.status || "draft",
      isTemplate: data.isTemplate || false,
      lastUsed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("quizzes").insertOne(quizData);

    const newQuiz = {
      ...quizData,
      _id: result.insertedId.toString(),
      teacherId: quizData.teacherId.toString(),
      questions: quizData.questions.length,
      assignedClasses: 0,
      avgScore: null,
    };

    return NextResponse.json({
      success: true,
      quizId: newQuiz._id,
      quiz: newQuiz,
      message: "Quiz created successfully",
    });
  } catch (error: any) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
