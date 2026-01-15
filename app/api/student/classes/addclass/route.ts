import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function generateInviteLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/join/${code}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const rawCode = body?.code as string | undefined;
    const code = rawCode?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Class code is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const mainDb = client.db("main");
    const sourceCollection = mainDb.collection("classes");

    const targetDb = client.db("student");
    const targetCollection = targetDb.collection("classes");

    const sourceClass = await sourceCollection.findOne({ code });
    if (!sourceClass) {
      return NextResponse.json(
        { success: false, error: "Class code not found in database" },
        { status: 404 }
      );
    }

    const existing = await targetCollection.findOne({ code });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Class already added",
        class: {
          _id: existing._id?.toString?.() ?? existing._id,
          name: existing.name,
          code: existing.code,
          type: existing.type,
          students: Array.isArray(existing.students)
            ? existing.students.length
            : existing.students || 0,
          inviteLink: existing.inviteLink,
        },
      });
    }

    const doc = {
      name: sourceClass.name,
      code: sourceClass.code,
      type: sourceClass.type || "public",
      teacherId:
        typeof sourceClass.teacherId === "string"
          ? sourceClass.teacherId
          : sourceClass.teacherId instanceof ObjectId
          ? sourceClass.teacherId
          : undefined,
      students: sourceClass.students || [],
      quizzes: sourceClass.quizzes || [],
      inviteLink:
        sourceClass.inviteLink || generateInviteLink(sourceClass.code),
    };

    const result = await targetCollection.insertOne(doc);

    return NextResponse.json(
      {
        success: true,
        message: "Class added successfully",
        class: {
          _id: result.insertedId.toString(),
          name: doc.name,
          code: doc.code,
          type: doc.type,
          students: Array.isArray(doc.students)
            ? doc.students.length
            : doc.students || 0,
          inviteLink: doc.inviteLink,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Add class error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
