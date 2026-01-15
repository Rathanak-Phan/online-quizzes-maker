import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest, context: { params: any }) {
  const { classId } = await context.params;

  if (!classId || !ObjectId.isValid(classId)) {
    return NextResponse.json(
      { success: false, error: "Invalid class ID" },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const dbStudent = client.db("student");

    // Fetch class details from student database
    const classData = await dbStudent.collection("classes").findOne({
      _id: new ObjectId(classId),
    });

    if (!classData) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }

    // Extract students from the embedded array in the class document
    const students = (classData.students || []).map((student: any) => {
      // Handle both object format with id/name/grade and full student objects
      return {
        _id: String(student.id || student._id || ""),
        name: String(student.name || ""),
        email: String(student.email || ""),
        joinedAt: student.joinedAt
          ? new Date(student.joinedAt).toISOString()
          : new Date().toISOString(),
        quizzesAttempted: Number(student.quizzesAttempted) || 0,
        avgScore: Number(student.avgScore) || 0,
        grade: String(student.grade || ""),
      };
    });

    // Extract quizzes from the embedded array in the class document
    const quizzes = (classData.quizzes || []).map((quiz: any) => {
      return {
        id: String(quiz.id || ""),
        title: String(quiz.title || ""),
        questions: Number(quiz.questions) || 0,
        description: String(quiz.description || ""),
      };
    });

    // Calculate average score from students
    const avgScore =
      students.length > 0
        ? Math.round(
            (students.reduce((sum, s) => sum + (s.avgScore || 0), 0) /
              students.length) *
              10
          ) / 10
        : 0;

    return NextResponse.json({
      success: true,
      class: {
        _id: classData._id.toString(),
        name: classData.name || "",
        code: classData.code || "",
        type: classData.type || "public",
        description: classData.description || "",
        studentCount: students.length,
        quizzesCount: quizzes.length,
        avgScore: avgScore,
        createdAt: classData.createdAt || new Date().toISOString(),
        subject: classData.subject || "",
        schedule: classData.schedule || "",
        teacher: classData.teacher || null,
      },
      students: students,
      quizzes: quizzes,
    });
  } catch (error) {
    console.error("[GET /api/student/classes/[classId]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch class details" },
      { status: 500 }
    );
  }
}
