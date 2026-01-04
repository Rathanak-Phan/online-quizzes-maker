import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizId = params.quizId;
    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    const body = await request.json();
    const { answers, score, totalPoints, timeSpent } = body;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "online-quizzes");

    // Check if already submitted
    const existingSubmission = await db.collection("quizsubmissions").findOne({
      quizId: new ObjectId(quizId),
      studentId: new ObjectId(session.user.id)
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "Quiz already submitted" },
        { status: 400 }
      );
    }

    // Create submission
    const submission = {
      quizId: new ObjectId(quizId),
      studentId: new ObjectId(session.user.id),
      answers,
      score,
      totalPoints,
      timeSpent,
      percentage: Math.round((score / totalPoints) * 100 * 10) / 10,
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection("quizsubmissions").insertOne(submission);

    // Update quiz statistics
    await db.collection("quizzes").updateOne(
      { _id: new ObjectId(quizId) },
      {
        $inc: {
          "stats.totalSubmissions": 1,
          "stats.totalScore": score
        },
        $set: {
          "stats.averageScore": {
            $divide: ["$stats.totalScore", "$stats.totalSubmissions"]
          }
        }
      }
    );

    return NextResponse.json({
      success: true,
      score,
      totalPoints,
      percentage: submission.percentage,
      submittedAt: submission.submittedAt
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}