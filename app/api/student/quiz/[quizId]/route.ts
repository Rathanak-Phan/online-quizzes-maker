import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  context: { params: { quizId: string } | Promise<{ quizId: string }> }
) {
  const resolveParams = async (params: { quizId: string } | Promise<{ quizId: string }>) =>
    params instanceof Promise ? await params : params;
  try {
    const { quizId } = await resolveParams(context.params);
    if (!quizId || !ObjectId.isValid(quizId)) {
      return NextResponse.json({ success: false, error: "Invalid quiz ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const studentDb = client.db("student");
    const studentQuizzes = studentDb.collection("quizzes");

    const studentDoc = await studentQuizzes.findOne({ _id: new ObjectId(quizId) });
    if (!studentDoc) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
    }

    let questions = Array.isArray(studentDoc.questions) ? studentDoc.questions : [];
    if (!questions || questions.length === 0) {
      const mainDbName = process.env.MONGODB_DB_NAME || "online-quizzes-maker";
      const mainDb = client.db(mainDbName);
      const teacherQuizzes = mainDb.collection("quizzes");
      let source: any = null;
      if (studentDoc.sourceQuizId && ObjectId.isValid(studentDoc.sourceQuizId)) {
        source = await teacherQuizzes.findOne({ _id: new ObjectId(studentDoc.sourceQuizId) });
      }
      if (!source && studentDoc.title) {
        source = await teacherQuizzes.findOne({ title: studentDoc.title });
      }
      questions = Array.isArray(source?.questions) ? source.questions : [];
    }

    const normalizedQuestions = (questions || []).map((q: any, idx: number) => {
      const text = typeof q.text === "string" ? q.text : typeof q.question === "string" ? q.question : "";
      const type =
        q.type ||
        (q.kind || "multiple");
      const options = Array.isArray(q.options)
        ? q.options.map((opt: any) => (typeof opt === "string" ? opt : opt?.text ?? String(opt)))
        : undefined;
      return {
        id: q.id || q._id?.toString?.() || String(idx),
        text,
        type,
        options,
        points: typeof q.points === "number" ? q.points : 1,
        correctAnswer:
          q.correctAnswer !== undefined
            ? q.correctAnswer
            : q.answerIndex !== undefined
            ? q.answerIndex
            : q.answer,
        explanation: q.explanation,
        hint: q.hint,
      };
    });

    const payload = {
      _id: studentDoc._id.toString(),
      title: studentDoc.title || "",
      description: studentDoc.description || "",
      category: studentDoc.category || "General",
      timeLimit: studentDoc.timeLimit || 30,
      status: studentDoc.status || "draft",
      isTemplate: Boolean(studentDoc.isTemplate),
      lastUsed: studentDoc.lastUsed || studentDoc.createdAt,
      createdAt: studentDoc.createdAt,
      updatedAt: studentDoc.updatedAt,
      questions: normalizedQuestions,
    };

    return NextResponse.json({ success: true, quiz: payload });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to load quiz" }, { status: 500 });
  }
}

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
