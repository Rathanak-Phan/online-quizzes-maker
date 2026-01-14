import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: Fetch all quizzes
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("student");
    const quizzesCollection = db.collection("quizzes");

    const quizzes = await quizzesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = quizzes.map((quiz) => ({
      _id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      timeLimit: quiz.timeLimit,
      status: quiz.status,
      isTemplate: quiz.isTemplate,
      lastUsed: quiz.lastUsed,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    }));

    return NextResponse.json({ success: true, quizzes: formatted }, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

// POST: Create or update a quiz
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      _id, // optional: if present, update existing quiz
      title,
      description,
      category,
      timeLimit,
      status,
      isTemplate,
    } = body;

    const client = await clientPromise;
    const db = client.db("student");
    const quizzesCollection = db.collection("quizzes");

    const now = new Date();

    if (_id) {
      // Update existing quiz
      const result = await quizzesCollection.updateOne(
        { _id: new ObjectId(_id) },
        {
          $set: {
            title,
            description,
            category,
            timeLimit,
            status,
            isTemplate,
            updatedAt: now,
          },
        }
      );

      return NextResponse.json(
        { success: true, message: "Quiz updated", updatedCount: result.modifiedCount },
        { status: 200 }
      );
    } else {
      // Create new quiz
      const newQuiz = {
        title,
        description,
        category,
        timeLimit,
        status: status || "draft",
        isTemplate: isTemplate || false,
        lastUsed: null,
        createdAt: now,
        updatedAt: now,
      };

      const result = await quizzesCollection.insertOne(newQuiz);

      return NextResponse.json(
        {
          success: true,
          message: "Quiz created",
          quiz: { _id: result.insertedId.toString(), ...newQuiz },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to save quiz" }, { status: 500 });
  }
}
