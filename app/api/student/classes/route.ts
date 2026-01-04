// app/api/student/classes/route.ts
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

    // Get student's classes
    const classes = await db.collection("classes").aggregate([
      {
        $match: {
          students: new ObjectId(session.user.id)
        }
      },
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
          from: "quizzes",
          let: { classId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$classId", "$$classId"] },
                status: "active"
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
                isCompleted: { $gt: [{ $size: "$submission" }, 0] }
              }
            }
          ],
          as: "quizzes"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          code: 1,
          subject: 1,
          teacher: { $arrayElemAt: ["$teacher", 0] },
          totalQuizzes: { $size: "$quizzes" },
          upcomingQuizzes: {
            $size: {
              $filter: {
                input: "$quizzes",
                as: "quiz",
                cond: {
                  $and: [
                    { $eq: ["$$quiz.isCompleted", false] },
                    { $or: [
                      { $eq: ["$$quiz.dueDate", null] },
                      { $gt: ["$$quiz.dueDate", new Date()] }
                    ]}
                  ]
                }
              }
            }
          },
          completedQuizzes: {
            $size: {
              $filter: {
                input: "$quizzes",
                as: "quiz",
                cond: { $eq: ["$$quiz.isCompleted", true] }
              }
            }
          }
        }
      },
      { $sort: { name: 1 } }
    ]).toArray();

    // Format response
    const formattedClasses = classes.map(cls => ({
      _id: cls._id.toString(),
      name: cls.name,
      code: cls.code,
      subject: cls.subject,
      teacher: {
        name: cls.teacher?.name || "Unknown Teacher",
        email: cls.teacher?.email || ""
      },
      totalQuizzes: cls.totalQuizzes,
      upcomingQuizzes: cls.upcomingQuizzes,
      completedQuizzes: cls.completedQuizzes
    }));

    return NextResponse.json(formattedClasses);
  } catch (error) {
    console.error("Error fetching student classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}