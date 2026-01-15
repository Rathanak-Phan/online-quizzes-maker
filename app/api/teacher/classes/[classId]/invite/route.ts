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
    const email = String(body?.email || "").trim().toLowerCase();
    if (!classId || !ObjectId.isValid(classId)) {
      return NextResponse.json({ success: false, error: "Invalid class ID" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const mainDb = client.db("main");
    const teacherDb = client.db("teacher");

    const user = await mainDb.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const studentEntry = {
      id: user._id,
      name: user.name || "",
      email: user.email,
      joinedAt: new Date(),
    };

    const res = await teacherDb.collection("classes").updateOne(
      { _id: new ObjectId(classId) },
      { $addToSet: { students: studentEntry }, $set: { updatedAt: new Date() } }
    );
    if (res.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
    }

    const classDoc = await teacherDb.collection("classes").findOne({ _id: new ObjectId(classId) });
    if (classDoc) {
      const studentDb = client.db("student");
      const studentClasses = studentDb.collection("classes");
      const studentQuizzes = studentDb.collection("quizzes");

      const classMirror = {
        name: classDoc.name || "",
        code: classDoc.code || "",
        type: classDoc.type || "public",
        teacherId:
          typeof classDoc.teacherId === "string"
            ? classDoc.teacherId
            : classDoc.teacherId instanceof ObjectId
            ? classDoc.teacherId
            : undefined,
        students: Array.isArray(classDoc.students) ? classDoc.students : [],
        quizzes: Array.isArray(classDoc.quizzes) ? classDoc.quizzes : [],
        inviteLink: classDoc.inviteLink,
        updatedAt: new Date(),
      };

      await studentClasses.updateOne(
        { code: classMirror.code },
        { $setOnInsert: { createdAt: new Date() }, $set: classMirror },
        { upsert: true }
      );

      const quizzesArr: any[] = Array.isArray(classDoc.quizzes) ? classDoc.quizzes : [];
      const mainDb = client.db("main");
      const mainQuizzes = mainDb.collection("quizzes");
      for (const q of quizzesArr) {
        let source: any = null;
        if (q?.id && ObjectId.isValid(q.id)) {
          source = await mainQuizzes.findOne({ _id: new ObjectId(q.id) });
        }
        if (!source && q?.title) {
          source = await mainQuizzes.findOne({ title: q.title });
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
    }

    return NextResponse.json({
      success: true,
      student: { _id: user._id.toString(), name: user.name || "", email: user.email },
      message: "Student invited to class",
    });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
