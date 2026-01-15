import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";


// Helper: Generate Invite Link
function generateInviteLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/join/${code}`;
}

function formatClassResponse(classData: any) {
  return {
    _id: classData._id?.toString(),
    name: classData.name,
    code: classData.code,
    type: classData.type || "public",
    teacherId: classData.teacherId?.toString(),
    students: classData.students || [],
    quizzes: classData.quizzes || [],
    inviteLink: classData.inviteLink || generateInviteLink(classData.code),
  };
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("teacher");
    const classesCollection = db.collection("classes");

    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");
    const searchFilter = searchParams.get("search");

    const query: any = {};

    if (typeFilter) {
      if (typeFilter === "public") {

        query.$or = [
          { type: "public" },
          { type: { $exists: false } },
          { type: null },
        ];
      } else {
        query.type = typeFilter;
      }
    }

    if (searchFilter) {
      const regex = new RegExp(searchFilter, "i");
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: [{ name: regex }, { code: regex }] },
        ];
        delete query.$or;
      } else {
        query.$or = [{ name: regex }, { code: regex }];
      }
    }

    const classes = await classesCollection
      .find(query)
      .sort({ _id: -1 })
      .toArray();

    const formattedClasses = classes.map(formatClassResponse);

    return NextResponse.json({
      success: true,
      classes: formattedClasses,
      total: formattedClasses.length,
      source: "mongodb",
    });

  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load classes",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, type } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: "Name and code are required" },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase();
    
    const teacherId = new ObjectId("65a1b2c3d4e5f67890123456");

    const client = await clientPromise;
    const teacherDb = client.db("teacher");
    const mainDb = client.db("main");

    const teacherClasses = teacherDb.collection("classes");
    const mainClasses = mainDb.collection("classes");

    const exists = await Promise.all([
      teacherClasses.findOne({ code: normalizedCode }),
      mainClasses.findOne({ code: normalizedCode }),  
    ]);

    if (exists[0] || exists[1]) {
      return NextResponse.json(
        { success: false, error: "Class code already exists" },
        { status: 409 }
      );
    }

    const newClassData = {
      name: name,
      code: normalizedCode,
      type: type || "public",
      teacherId: teacherId,
      students: [],
      quizzes: [],
      inviteLink: generateInviteLink(normalizedCode),
    };

    const teacherInsert = await teacherClasses.insertOne({ ...newClassData });

    try {
      await mainClasses.insertOne({ ...newClassData });
    } catch (err) {
      await teacherClasses.deleteOne({ _id: teacherInsert.insertedId });
      throw err;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Class created successfully",
        class: formatClassResponse({
            _id: teacherInsert.insertedId,
            ...newClassData
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create class",
      },
      { status: 500 }
    );
  }
}