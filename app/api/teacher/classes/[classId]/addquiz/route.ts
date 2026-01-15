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
    const raw = String(body?.quiz || body?.quizId || body?.code || "").trim();
    if (!classId || !ObjectId.isValid(classId)) {
      return NextResponse.json({ success: false, error: "Invalid class ID" }, { status: 400 });
    }
    if (!raw) {
      return NextResponse.json({ success: false, error: "Quiz identifier is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const teacherDb = client.db("teacher");
    const mainDb = client.db("main");

    const teacherQuizzes = teacherDb.collection("quizzes");
    const mainQuizzes = mainDb.collection("quizzes");

    let quiz: any = null;
    if (ObjectId.isValid(raw)) {
      quiz = (await teacherQuizzes.findOne({ _id: new ObjectId(raw) })) || (await mainQuizzes.findOne({ _id: new ObjectId(raw) }));
    } else {
      quiz = (await teacherQuizzes.findOne({ title: raw })) || (await mainQuizzes.findOne({ title: raw }));
    }
    if (!quiz) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
    }

    const entry = {
      id: quiz._id,
      title: quiz.title || "Untitled Quiz",
      questions: Array.isArray(quiz.questions) ? quiz.questions.length : Number(quiz.questions) || 0,
      description: quiz.description || "",
    };

    const res = await teacherDb.collection("classes").updateOne(
      { _id: new ObjectId(classId) },
      { $addToSet: { quizzes: entry }, $set: { updatedAt: new Date() } }
    );
    if (res.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, quiz: { ...entry, id: entry.id.toString() }, message: "Quiz added to class" });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
