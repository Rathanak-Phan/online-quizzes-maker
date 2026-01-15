import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const raw = (body?.code as string | undefined)?.trim();
    if (!raw) {
      return NextResponse.json({ success: false, error: "Quiz code is required" }, { status: 400 });
    }

    const client = await clientPromise;

    const mainDb = client.db("main");
    const teacherQuizzes = mainDb.collection("quizzes");

    const studentDb = client.db("student");
    const studentQuizzes = studentDb.collection("quizzes");

    type TeacherQuizDoc = {
      _id: ObjectId;
      title?: string;
      description?: string;
      category?: string;
      status?: string;
      timeLimit?: number;
      questions?: any[];
    };
    let sourceQuiz: TeacherQuizDoc | null = null;
    if (ObjectId.isValid(raw)) {
      sourceQuiz = await teacherQuizzes.findOne<TeacherQuizDoc>({ _id: new ObjectId(raw) });
    } else {
      sourceQuiz = await teacherQuizzes.findOne<TeacherQuizDoc>({ title: raw });
    }

    if (!sourceQuiz) {
      return NextResponse.json({ success: false, error: "Quiz not found for provided code" }, { status: 404 });
    }

    const existing = await studentQuizzes.findOne({
      $or: [
        { sourceQuizId: sourceQuiz._id },
        { title: sourceQuiz.title },
      ],
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Quiz already added",
        quiz: {
          _id: existing._id?.toString?.() ?? existing._id,
          title: existing.title,
          description: existing.description,
          category: existing.category,
          timeLimit: existing.timeLimit,
          status: existing.status,
          isTemplate: existing.isTemplate,
          lastUsed: existing.lastUsed,
          createdAt: existing.createdAt,
          updatedAt: existing.updatedAt,
        },
      });
    }

    const doc = {
      title: sourceQuiz.title || "Untitled Quiz",
      description: sourceQuiz.description || "",
      category: sourceQuiz.category || "General",
      status: sourceQuiz.status || "draft",
      timeLimit: sourceQuiz.timeLimit || 30,
      questions: sourceQuiz.questions || [],
    };

    const result = await studentQuizzes.insertOne(doc);

    return NextResponse.json(
      {
        success: true,
        message: "Quiz added successfully",
        quiz: {
          _id: result.insertedId.toString(),
          title: doc.title,
          description: doc.description,
          status: doc.status,
          category: doc.category,
          timeLimit: doc.timeLimit,
          questions: doc.questions, 
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
