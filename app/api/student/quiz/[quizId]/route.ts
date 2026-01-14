import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  request: NextRequest,
  context: { params: { quizId: string } | Promise<{ quizId: string }> }
) {
  const resolveParams = async (params: { quizId: string } | Promise<{ quizId: string }>) =>
    params instanceof Promise ? await params : params;
  try {
    const { quizId } = await resolveParams(context.params);
    if (!quizId || !ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("student");
    const quizzes = db.collection("quizzes");

    const result = await quizzes.deleteOne({ _id: new ObjectId(quizId) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Quiz removed", deletedId: quizId });
  } catch {
    return NextResponse.json({ error: "Failed to remove quiz" }, { status: 500 });
  }
}
