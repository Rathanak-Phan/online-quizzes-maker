// app/api/teacher/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const classFilter = searchParams.get("class");
    const sort = searchParams.get("sort") || "name";

    const client = await clientPromise;
    const db = client.db("student");

    // Build query
    const query: any = { role: "student" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    // Get students
    const users = await db.collection("users")
      .find(query)
      .toArray();

    // For each student, get their performance data
    const students = await Promise.all(
      users.map(async (user: any) => {
        // Get quiz results for this student
        const results = await db.collection("quiz_results")
          .find({ studentId: user._id })
          .toArray();

        // Calculate statistics
        const totalQuizzes = results.length;
        const averageScore = totalQuizzes > 0
          ? results.reduce((sum: number, r: any) => sum + (r.percentage || 0), 0) / totalQuizzes
          : 0;

        // Get class info if available
        let className = "";
        if (user.classId) {
          const classInfo = await db.collection("classes").findOne({
            _id: user.classId
          });
          className = classInfo?.name || "";
        }

        // Get last activity
        const lastResult = results.sort((a: any, b: any) => 
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        )[0];

        return {
          _id: user._id.toString(),
          name: user.name || "Unknown Student",
          email: user.email,
          phone: user.phone,
          enrollmentDate: user.createdAt || new Date().toISOString(),
          classId: user.classId?.toString(),
          className,
          totalQuizzes,
          averageScore,
          lastActive: lastResult?.submittedAt || user.lastLogin || user.createdAt,
          status: user.status || "active",
        };
      })
    );

    // Apply class filter
    let filteredStudents = students;
    if (classFilter && classFilter !== "all") {
      filteredStudents = students.filter(s => s.className === classFilter);
    }

    // Apply sorting
    switch (sort) {
      case "name":
        filteredStudents.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "score":
        filteredStudents.sort((a, b) => b.averageScore - a.averageScore);
        break;
      case "quizzes":
        filteredStudents.sort((a, b) => b.totalQuizzes - a.totalQuizzes);
        break;
      case "recent":
        filteredStudents.sort((a, b) => 
          new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
        );
        break;
    }

    return NextResponse.json({
      students: filteredStudents,
      total: filteredStudents.length,
    });
  } catch (error: any) {
    console.error("Error fetching students:", error);
    
    // Return empty array for development
    return NextResponse.json({
      students: [],
      total: 0,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// POST - Add new student
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validation
    if (!data.email?.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'online-quizzes-maker');

    // Check if student already exists
    const existingStudent = await db.collection("users").findOne({
      email: data.email.toLowerCase(),
      role: "student"
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "Student with this email already exists" },
        { status: 409 }
      );
    }

    const studentData = {
      name: data.name?.trim() || "",
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim() || "",
      role: "student",
      status: "pending", // Will be active after they accept invitation
      classId: data.classId ? new ObjectId(data.classId) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(studentData);

    // TODO: Send invitation email

    return NextResponse.json({
      success: true,
      studentId: result.insertedId.toString(),
      message: "Student invitation sent successfully",
    });
  } catch (error: any) {
    console.error("Error adding student:", error);
    return NextResponse.json(
      { error: "Failed to add student" },
      { status: 500 }
    );
  }
}