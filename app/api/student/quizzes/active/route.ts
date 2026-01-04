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

    const activeQuizzes = await db.collection("quizzes").aggregate([
      {
        $match: {
          status: "active",
          $or: [
            { "assignedClassIds": { $exists: false } },
            { "assignedClassIds": { $size: 0 } }
          ]
        }
      },
      {
        $lookup: {
          from: "classes",
          let: { classId: "$classId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$classId"] } } },
            { $match: { students: new ObjectId(session.user.id) } }
          ],
          as: "class"
        }
      },
      { $match: { class: { $ne: [] } } },
      {
        $lookup: {
          from: "users",
          localField: "teacherId",
          foreignField: "_id",
          as: "teacher"
        }
      },
      {
        $lookup: {
          from: "quizsubmissions",
          let: { quizId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$quizId", "$$quizId"] },
                    { $eq: ["$studentId", new ObjectId(session.user.id)] }
                  ]
                }
              }
            }
          ],
          as: "submission"
        }
      },
      {
        $addFields: {
          className: { $arrayElemAt: ["$class.name", 0] },
          teacherName: { $arrayElemAt: ["$teacher.name", 0] },
          isCompleted: { $gt: [{ $size: "$submission" }, 0] },
          score: { $arrayElemAt: ["$submission.score", 0] },
          maxScore: {
            $reduce: {
              input: "$questions",
              initialValue: 0,
              in: { $add: ["$$value", "$$this.points"] }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          dueDate: 1,
          timeLimit: 1,
          totalQuestions: { $size: "$questions" },
          className: 1,
          teacherName: 1,
          isCompleted: 1,
          score: 1,
          maxScore: 1
        }
      },
      { $sort: { dueDate: 1 } }
    ]).toArray();

    return NextResponse.json(activeQuizzes);
  } catch (error) {
    console.error("Error fetching active quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch active quizzes" },
      { status: 500 }
    );
  }
}