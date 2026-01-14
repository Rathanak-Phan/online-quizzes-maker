import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Helper: generate invite link
function generateInviteLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/join/${code}`;
}

// GET single class
export async function GET(request: NextRequest, context: { params: any }) {
  const { classId } = await context.params;
  console.log("[GET] classId:", classId);

  if (!ObjectId.isValid(classId)) {
    return NextResponse.json({ success: false, error: "Invalid class ID format" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("online-quizzes");
    const classesCollection = db.collection("classes");

    const teacherId = new ObjectId("65a1b2c3d4e5f67890123456"); // Replace with session ID later

    const classData = await classesCollection.findOne({
      _id: new ObjectId(classId),
      teacherId,
    });

    if (!classData) {
      return NextResponse.json({ success: false, error: "Class not found or not authorized" }, { status: 404 });
    }

    const responseData = {
      ...classData,
      _id: classData._id.toString(),
      inviteLink: classData.inviteLink || generateInviteLink(classData.code),
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (err) {
    console.error("[GET] MongoDB error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch class" }, { status: 500 });
  }
}

// DELETE class
export async function DELETE(request: NextRequest, context: { params: any }) {
  const classId = context.params.classId;
  console.log("[DELETE] classId:", classId);

  if (!classId || !ObjectId.isValid(classId)) {
    return NextResponse.json({ success: false, error: "Invalid class ID" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("online-quizzes");

    const result = await db.collection("classes").deleteOne({
      _id: new ObjectId(classId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to delete class" }, { status: 500 });
  }
}
