import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest, context: { params: any }) {
  try {
    const { classId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const quizId = String(body.quizId || "").trim();
    const title = String(body.title || "").trim();

    if (!classId || !ObjectId.isValid(classId)) {
      return NextResponse.json({ success: false, error: "Invalid class ID" }, { status: 400 });
    }
    if (!quizId && !title) {
      return NextResponse.json({ success: false, error: "quizId or title required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("teacher");
    const classes = db.collection("classes");

    const pullQuery: any = {};
    if (quizId) {
      pullQuery.$or = [
        { id: quizId },
        { _id: quizId },
        { _id: new ObjectId(quizId) },
      ];
    }
    if (title) {
      if (pullQuery.$or) {
        pullQuery.$or.push({ title });
      } else {
        pullQuery.$or = [{ title }];
      }
    }

    const result = await classes.updateOne(
      { _id: new ObjectId(classId) },
      { $pull: { quizzes: pullQuery } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, removed: quizId || title });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
