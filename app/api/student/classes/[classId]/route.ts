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

    const students = (classData.students || []).map((student: any) => {
      const raw = student.grade;
      let grade: number[] = [];
      if (Array.isArray(raw)) {
        grade = raw.map((g: any) => Number(g)).filter((n: number) => Number.isFinite(n));
      } else if (raw !== undefined && raw !== null) {
        const n = Number(raw);
        if (Number.isFinite(n)) grade = [n];
      }
      return {
        _id: String(student.id || student._id || ""),
        name: String(student.name || ""),
        email: String(student.email || ""),
        grade: grade,
      };
    });

    // Extract quizzes from the embedded array in the class document
    const quizzes = (classData.quizzes || []).map((quiz: any) => {
      return {
        id: String(quiz.id || ""),
        title: String(quiz.title || ""),
        questions: Number(quiz.questions) || 0,
      };
    });

    // Calculate average score from students
    const avgScore =
      students.length > 0
        ? Math.round(
            (students.reduce((sum: number, s: any) => sum + (s.avgScore || 0), 0) /
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
        studentCount: students.length,
        quizzesCount: quizzes.length,
        avgScore: avgScore,
        subject: classData.subject || "",
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

export async function DELETE(request: NextRequest, context: { params: any }) {
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
    const classes = dbStudent.collection("classes");

    const result = await classes.deleteOne({ _id: new ObjectId(classId) });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Class removed",
      deletedId: classId,
    });
  } catch (error) {
    console.error("[DELETE /api/student/classes/[classId]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove class" },
      { status: 500 }
    );
  }
}
