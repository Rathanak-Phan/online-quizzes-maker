import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
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

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "online-quizzes");

    // Check if student has access to this quiz
    const quiz = await db.collection("quizzes").aggregate([
      {
        $match: { _id: new ObjectId(quizId), status: "active" }
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
          isCompleted: { $gt: [{ $size: "$submission" }, 0] },
          submittedAt: { $arrayElemAt: ["$submission.submittedAt", 0] }
        }
      },
      {
        $project: {
          questions: {
            $map: {
              input: "$questions",
              as: "question",
              in: {
                _id: "$$question._id",
                question: "$$question.question",
                options: "$$question.options",
                points: "$$question.points"
                // Don't include correctAnswer for students
              }
            }
          },
          title: 1,
          description: 1,
          timeLimit: 1,
          isCompleted: 1,
          submittedAt: 1
        }
      }
    ]).toArray();

    if (!quiz || quiz.length === 0) {
      return NextResponse.json({ error: "Quiz not found or access denied" }, { status: 404 });
    }

    return NextResponse.json(quiz[0]);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}