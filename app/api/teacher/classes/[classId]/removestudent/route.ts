import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest, context: { params: any }) {
  try {
    const { classId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const studentId = String(body.studentId || "").trim();
    const studentEmail = String(body.email || "").trim();

    if (!classId || !ObjectId.isValid(classId)) {
      return NextResponse.json({ success: false, error: "Invalid class ID" }, { status: 400 });
    }
    if (!studentId && !studentEmail) {
      return NextResponse.json({ success: false, error: "studentId or email required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("teacher");
    const classes = db.collection("classes");

    const pullQuery: any = {};
    if (studentId) {
      pullQuery.$or = [
        { id: studentId },
        { _id: studentId },
        { _id: new ObjectId(studentId) },
      ];
    }
    if (studentEmail) {
      if (pullQuery.$or) {
        pullQuery.$or.push({ email: studentEmail });
      } else {
        pullQuery.$or = [{ email: studentEmail }];
      }
    }

    const result = await classes.updateOne(
      { _id: new ObjectId(classId) },
      { $pull: { students: pullQuery } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, removed: studentId || studentEmail });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
