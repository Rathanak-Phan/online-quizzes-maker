// Server-side only
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs"; // ensure server runtime

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("online-quizzes");

    const totalUsers = await db.collection("users").countDocuments();
    const totalTeachers = await db
      .collection("users")
      .countDocuments({ role: "teacher" });
    const pendingTeachers = await db.collection("users").countDocuments({
      role: "teacher",
      isValidated: false,
    });
    const totalQuizzes = await db.collection("quizzes").countDocuments();

    return NextResponse.json({
      totalUsers,
      totalTeachers,
      pendingTeachers,
      totalQuizzes,
    });
  } catch (error) {
    console.error("MongoDB error:", error);
    return NextResponse.json(
      {
        totalUsers: 0,
        totalTeachers: 0,
        pendingTeachers: 0,
        totalQuizzes: 0,
      },
      { status: 500 }
    );
  }
}
