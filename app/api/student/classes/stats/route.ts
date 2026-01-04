import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "online-quizzes");

    const stats = await db.collection("quizsubmissions").aggregate([
      {
        $match: {
          studentId: new ObjectId(session.user.id)
        }
      },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalScore: { $sum: "$score" },
          totalPoints: { $sum: "$totalPoints" },
          latestSubmission: { $max: "$submittedAt" }
        }
      }
    ]).toArray();

    const classesCount = await db.collection("classes").countDocuments({
      students: new ObjectId(session.user.id)
    });

    const activeQuizzes = await db.collection("quizzes").countDocuments({
      status: "active",
      classId: {
        $in: await db.collection("classes")
          .find({ students: new ObjectId(session.user.id) })
          .map(c => c._id)
          .toArray()
      }
    });

    const totalQuizzes = stats[0]?.totalQuizzes || 0;
    const averageScore = stats[0] ? 
      Math.round((stats[0].totalScore / stats[0].totalPoints) * 100 * 10) / 10 : 0;

    // Simple streak calculation (mock for now)
    const streak = 3; // You can implement proper streak logic

    return NextResponse.json({
      totalQuizzes,
      completedQuizzes: totalQuizzes,
      averageScore,
      classesCount,
      activeQuizzes,
      streak
    });
  } catch (error) {
    console.error("Error fetching student stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}