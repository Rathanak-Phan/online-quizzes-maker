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

    const teacherDb = client.db("teacher");
    const sourceCollection = teacherDb.collection("classes");

    const studentDb = client.db("student");
    const targetCollection = studentDb.collection("classes");

    const sourceClass = await sourceCollection.findOne({ code });
    
    if (!sourceClass) {
      return NextResponse.json(
        { success: false, error: "Class code not found in database" },
        { status: 404 }
      );
    }

    console.log(sourceClass)

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

    // Also copy quizzes referenced by the class into student quizzes collection
    try {
      const quizzesArr: any[] = Array.isArray(doc.quizzes) ? doc.quizzes : [];
      const studentQuizzes = studentDb.collection("quizzes");
      const classQuizzes = teacherDb.collection("quizzes");

      for (const q of quizzesArr) {
        let source: any = null;
        if (q?.id && ObjectId.isValid(q.id)) {
          source = await classQuizzes.findOne({ _id: new ObjectId(q.id) });
        }
        if (!source && q?.title) {
          source = await classQuizzes.findOne({ title: q.title });
        }
        if (!source) continue;

        const exists = await studentQuizzes.findOne({
          $or: [{ sourceQuizId: source._id }, { title: source.title }],
        });
        if (exists) continue;

        await studentQuizzes.insertOne({
          title: source.title || "Untitled Quiz",
          description: source.description || "",
          category: source.category || "General",
          status: source.status || "draft",
          timeLimit: source.timeLimit || 30,
          questions: source.questions || [],
          sourceQuizId: source._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (e) {
      console.warn("Failed to copy class quizzes to student DB:", e);
    }

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
