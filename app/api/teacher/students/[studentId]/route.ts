// app/api/teacher/students/[studentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = params.studentId;

    if (!ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { error: "Invalid student ID format" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'online-quizzes-maker');

    // Get student info
    const student = await db.collection("users").findOne({
      _id: new ObjectId(studentId),
      role: "student"
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Get quiz results for this student
    const results = await db.collection("quiz_results")
      .find({ studentId: new ObjectId(studentId) })
      .sort({ submittedAt: -1 })
      .limit(20)
      .toArray();

    // Get quiz details for each result
    const quizHistory = await Promise.all(
      results.map(async (result: any) => {
        const quiz = await db.collection("quizzes").findOne({
          _id: result.quizId
        });

        return {
          quizId: result.quizId.toString(),
          quizTitle: quiz?.title || "Unknown Quiz",
          score: result.score || 0,
          percentage: result.percentage || 0,
          submittedAt: result.submittedAt || result.createdAt,
          timeSpent: result.timeSpent || 0,
        };
      })
    );

    // Calculate statistics
    const totalQuizzes = results.length;
    const averageScore = totalQuizzes > 0
      ? results.reduce((sum: number, r: any) => sum + (r.percentage || 0), 0) / totalQuizzes
      : 0;
    const totalPoints = results.reduce((sum: number, r: any) => sum + (r.score || 0), 0);

    // Get class info
    let className = "";
    if (student.classId) {
      const classInfo = await db.collection("classes").findOne({
        _id: student.classId
      });
      className = classInfo?.name || "";
    }

    // Get last activity
    const lastResult = results[0];

    const studentDetail = {
      _id: student._id.toString(),
      name: student.name || "Unknown Student",
      email: student.email,
      phone: student.phone,
      enrollmentDate: student.createdAt || new Date().toISOString(),
      className,
      status: student.status || "active",
      totalQuizzes,
      averageScore,
      totalPoints,
      lastActive: lastResult?.submittedAt || student.lastLogin || student.createdAt,
      quizHistory,
    };

    return NextResponse.json({
      success: true,
      student: studentDetail,
    });
  } catch (error: any) {
    console.error("Error fetching student details:", error);
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 }
    );
  }
}