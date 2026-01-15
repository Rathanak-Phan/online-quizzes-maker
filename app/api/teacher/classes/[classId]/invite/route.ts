import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: NextRequest,
  context: { params: { classId: string } | Promise<{ classId: string }> }
) {
  const params = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const classId = params.classId;
  try {
    const body = await request.json().catch(() => null);
    const email = String(body?.email || "").trim().toLowerCase();
    if (!classId || !ObjectId.isValid(classId)) {
      return NextResponse.json({ success: false, error: "Invalid class ID" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const mainDb = client.db("main");
    const teacherDb = client.db("teacher");

    const user = await mainDb.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const studentEntry = {
      id: user._id,
      name: user.name || "",
      email: user.email,
      joinedAt: new Date(),
    };

    const res = await teacherDb.collection("classes").updateOne(
      { _id: new ObjectId(classId) },
      { $addToSet: { students: studentEntry }, $set: { updatedAt: new Date() } }
    );
    if (res.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      student: { _id: user._id.toString(), name: user.name || "", email: user.email },
      message: "Student invited to class",
    });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
