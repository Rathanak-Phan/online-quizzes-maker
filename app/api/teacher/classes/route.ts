// app/api/teacher/classes/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Helper: Generate Invite Link
function generateInviteLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/join/${code}`;
}

// Helper: Format Database Response to JSON
// This ensures _id and teacherId are strings in the API response
function formatClassResponse(classData: any) {
  return {
    _id: classData._id?.toString(),
    name: classData.name,
    code: classData.code,
    type: classData.type || "public",
    teacherId: classData.teacherId?.toString(), // Convert ObjectId to string
    students: classData.students || [],
    quizzes: classData.quizzes || [],
    inviteLink: classData.inviteLink || generateInviteLink(classData.code),
  };
}

// Mock data updated to match the requested structure
const mockClasses = [
  {
    _id: "65a1b2c3d4e5f67890123456",
    name: "Mathematics 101",
    code: "MATH101",
    type: "public",
    teacherId: "65a1b2c3d4e5f67890123456",
    students: [],
    quizzes: [],
    inviteLink: "http://localhost:3000/join/MATH101",
  },
];

export async function GET(request: NextRequest) {
  try {
    try {
      const client = await clientPromise;
      const db = client.db("teacher");
      const classesCollection = db.collection("classes");

      // Mock teacher ID (as per your example)
      const teacherId = new ObjectId("65a1b2c3d4e5f67890123456");

      // Fetch classes from MongoDB
      const classes = await classesCollection
        .find({ teacherId })
        .sort({ _id: -1 })
        .toArray();

      // Format response to match the structure provided
      const formattedClasses = classes.map(formatClassResponse);

      return NextResponse.json({
        success: true,
        classes: formattedClasses,
        total: formattedClasses.length,
        source: "mongodb",
      });
    } catch (dbError) {
      console.log("MongoDB error, using mock data:", dbError);
    }

    // Fallback: mock data logic
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    
    let filteredClasses = mockClasses;

    if (search) {
      filteredClasses = filteredClasses.filter(
        (cls) =>
          cls.name.toLowerCase().includes(search.toLowerCase()) ||
          cls.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      classes: filteredClasses,
      total: filteredClasses.length,
      source: "mock-data",
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load classes",
        classes: mockClasses,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, type } = body;

    // Validation
    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: "Name and code are required" },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase();
    
    // Mock teacher ID (Hardcoded as per request)
    const teacherId = new ObjectId("65a1b2c3d4e5f67890123456");

    const client = await clientPromise;
    const teacherDb = client.db("teacher");
    const quizzesDb = client.db("norak");

    const teacherClasses = teacherDb.collection("classes");
    const quizzesClasses = quizzesDb.collection("classes");

    // Check for duplicate class code
    const exists = await Promise.all([
      teacherClasses.findOne({ code: normalizedCode }),
      quizzesClasses.findOne({ code: normalizedCode }),
    ]);

    if (exists[0] || exists[1]) {
      return NextResponse.json(
        { success: false, error: "Class code already exists" },
        { status: 409 }
      );
    }

    // Construct the object strictly according to the requested structure
    const newClassData = {
      name: name,
      code: normalizedCode,
      type: type || "public",
      teacherId: teacherId, // Stored as ObjectId
      students: [],         // Explicit empty array
      quizzes: [],          // Explicit empty array
      inviteLink: generateInviteLink(normalizedCode),
    };

    // Insert into Teacher DB
    const teacherInsert = await teacherClasses.insertOne({ ...newClassData });

    // Insert into Quizzes DB (Dual write)
    try {
      await quizzesClasses.insertOne({ ...newClassData });
    } catch (err) {
      // Rollback teacher DB insert if quizzes DB fails
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