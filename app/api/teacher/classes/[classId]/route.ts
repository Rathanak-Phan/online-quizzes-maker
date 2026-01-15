import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Helper: generate invite link
function generateInviteLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/join/${code}`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ classId: string }> }
) {
  const { classId } = await context.params;
  try {
    const client = await clientPromise;
    const db = client.db("teacher");
    const classesCollection = db.collection("classes");
    const classData = await classesCollection.findOne({
      _id: new ObjectId(classId),
    });

    if (!classData) {
      return NextResponse.json(
        { success: false, error: "Class not found or not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: classData });
  } catch (err) {
    console.error("[GET] MongoDB error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}

// DELETE class from all databases
export async function DELETE(request: NextRequest, context: { params: any }) {
  try {
    const { classId } = await context.params;
    console.log("[DELETE] classId:", classId);

    if (!classId || !ObjectId.isValid(classId)) {
      return NextResponse.json(
        { success: false, error: "Invalid class ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const objectId = new ObjectId(classId);

    const teacherDb = client.db("teacher");
    const mainDb = client.db("main");
    const studentDb = client.db("student");

    let deletionResults = {
      teacher: 0,
      main: 0,
      student: 0,
    };

    try {
      const teacherResult = await teacherDb
        .collection("classes")
        .deleteOne({ _id: objectId });
      deletionResults.teacher = teacherResult.deletedCount;
      console.log(
        `[DELETE] Deleted ${teacherResult.deletedCount} from teacher db`
      );
    } catch (err) {
      console.error("[DELETE] Error deleting from teacher db:", err);
    }

    try {
      const mainResult = await mainDb
        .collection("classes")
        .deleteOne({ _id: objectId });
      deletionResults.main = mainResult.deletedCount;
      console.log(`[DELETE] Deleted ${mainResult.deletedCount} from main db`);
    } catch (err) {
      console.error("[DELETE] Error deleting from main db:", err);
    }

    // Delete from student database
    try {
      const studentResult = await studentDb
        .collection("classes")
        .deleteOne({ _id: objectId });
      deletionResults.student = studentResult.deletedCount;
      console.log(
        `[DELETE] Deleted ${studentResult.deletedCount} from student db`
      );
    } catch (err) {
      console.error("[DELETE] Error deleting from student db:", err);
    }

    const totalDeleted =
      deletionResults.teacher + deletionResults.main + deletionResults.student;

    if (totalDeleted === 0) {
      return NextResponse.json(
        { success: false, error: "Class not found in any database" },
        { status: 404 }
      );
    }

    console.log(
      `[DELETE] Class deleted successfully: teacher=${deletionResults.teacher}, main=${deletionResults.main}, student=${deletionResults.student}`
    );
    return NextResponse.json(
      {
        success: true,
        message: "Class deleted successfully from all databases",
        deletedFrom: totalDeleted,
        details: deletionResults,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[DELETE] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete class",
      },
      { status: 500 }
    );
  }
}
