// app/api/teacher/classes/[classId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Helper: generate invite link
function generateInviteLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/join/${code}`;
}

// GET single class
export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  const { classId } = params;
  console.log("[GET] classId:", classId);

  // Validate ObjectId
  if (!ObjectId.isValid(classId)) {
    console.warn("[GET] Invalid classId format");
    return NextResponse.json(
      { success: false, error: "Invalid class ID format" },
      { status: 400 }
    );
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
      console.warn("[GET] Class not found or not authorized");
      return NextResponse.json(
        { success: false, error: "Class not found or not authorized" },
        { status: 404 }
      );
    }

    console.log("[GET] Class found:", classData.name);

    return NextResponse.json({
      success: true,
      data: {
        ...classData,
        _id: classData._id.toString(),
        inviteLink: classData.inviteLink || generateInviteLink(classData.code),
      },
    });
  } catch (err) {
    console.error("[GET] MongoDB error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}

// DELETE class
export async function DELETE(
  req: NextRequest,
  { params }: { params: { classId: string } }
) {
  const { classId } = params;
  console.log("[DELETE API] classId:", classId);

  // Validate ID
  if (!classId || !ObjectId.isValid(classId)) {
    return NextResponse.json(
      { success: false, error: "Invalid class ID" },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("online-quizzes");

    const result = await db.collection("classes").deleteOne({
      _id: new ObjectId(classId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
