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

    // Normalize questions to match schema
    const normalizedQuestions = (questions || []).map((q: any, idx: number) => {
      const type = q.type || q.kind || "singleSelect";
      const question = q.question || q.text || "";
      const options = Array.isArray(q.options)
        ? q.options.map((opt: any) => (typeof opt === "string" ? opt : opt?.text ?? String(opt)))
        : undefined;

      // Normalize answer depending on type
      let answer: any = q.answer;
      if (type === "singleSelect") {
        answer =
          typeof q.answer === "number"
            ? q.answer
            : q.answerIndex !== undefined
            ? q.answerIndex
            : Array.isArray(q.correctAnswer)
            ? q.correctAnswer[0]
            : q.correctAnswer;
      } else if (type === "multiSelect") {
        answer =
          Array.isArray(q.answers) ? q.answers : Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
      } else if (type === "trueFalse") {
        answer = typeof q.answer === "boolean" ? q.answer : q.correctAnswer === true;
      } else if (type === "fillBlank") {
        answer = typeof q.answer === "string" ? q.answer : String(q.correctAnswer ?? "");
      }

      return {
        id: q.id || q._id?.toString?.() || String(idx),
        type,
        question,
        options,
        answer,
        hint: q.hint,
        explanation: q.explanation,
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
      return NextResponse.json({ success: false, error: "Invalid quiz ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("student");
    const quizzes = db.collection("quizzes");

    // Find the quiz before deleting so we can return its metadata
    const quizDoc = await quizzes.findOne({ _id: new ObjectId(quizId) });
    if (!quizDoc) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
    }

    const result = await quizzes.deleteOne({ _id: new ObjectId(quizId) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
    }

    // Return deleted quiz metadata (matching schema)
    const payload = {
      _id: quizDoc._id.toString(),
      title: quizDoc.title || "",
      description: quizDoc.description || "",
      category: quizDoc.category || "General",
      timeLimit: quizDoc.timeLimit || 30,
      status: quizDoc.status || "draft",
      isTemplate: Boolean(quizDoc.isTemplate),
      createdAt: quizDoc.createdAt,
      updatedAt: quizDoc.updatedAt,
    };

    return NextResponse.json({
      success: true,
      message: "Quiz removed",
      deletedQuiz: payload,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to remove quiz" }, { status: 500 });
  }
}
