// app/api/teacher/classes/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Helper functions directly in the file
function generateInviteLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/join/${code}`;
}

function formatClassResponse(classData: any) {
  return {
    _id: classData._id?.toString(),
    name: classData.name,
    code: classData.code,
    type: classData.type,
    description: classData.description || "",
    subject: classData.subject || "",
    schedule: classData.schedule || "",
    teacherId: classData.teacherId?.toString() || classData.teacherId,
    students: classData.students || [],
    inviteLink: classData.inviteLink || generateInviteLink(classData.code),
    createdAt: classData.createdAt || new Date(),
    updatedAt: classData.updatedAt || new Date(),
  };
}

// Mock data for fallback
const mockClasses = [
  {
    _id: "65a1b2c3d4e5f67890123456",
    name: "Mathematics 101",
    code: "MATH101",
    type: "public" as const,
    description: "Introduction to basic mathematics concepts",
    students: 25,
    inviteLink: "http://localhost:3000/join/MATH101",
    createdAt: "2024-01-15T10:30:00Z",
    subject: "Mathematics",
    schedule: "Mon/Wed 10:00 AM",
    teacherId: "teacher-123",
  },
  {
    _id: "65b2c3d4e5f6789012345678",
    name: "Physics: Intro",
    code: "PHYS101",
    type: "private" as const,
    description: "Fundamentals of physics",
    students: 18,
    inviteLink: "http://localhost:3000/join/PHYS101",
    createdAt: "2024-02-01T14:00:00Z",
    subject: "Physics",
    schedule: "Tue/Thu 2:00 PM",
    teacherId: "teacher-123",
  },
];

export async function GET(request: NextRequest) {
  try {
    // Try to connect to MongoDB
    try {
      const client = await clientPromise;
      const db = client.db("student");
      const classesCollection = db.collection("classes");

      // Get teacher ID (for now use mock)
      const teacherId = new ObjectId("65a1b2c3d4e5f67890123456");

      // Fetch classes from MongoDB
      const classes = await classesCollection
        .find({ teacherId })
        .sort({ createdAt: -1 })
        .toArray();

      console.log(classesCollection);
      console.log(`Found ${classes.length} classes in MongoDB`);

      // Format response
      const formattedClasses = classes.map((cls) => {
        const formatted = formatClassResponse(cls);
        return {
          ...formatted,
          students: cls.students ? cls.students.length : 0,
        };
      });

      return NextResponse.json({
        success: true,
        classes: formattedClasses,
        total: formattedClasses.length,
        source: "mongodb",
      });
    } catch (dbError) {
      console.log("MongoDB error, using mock data:", dbError);
    }

    // Use mock data if MongoDB fails
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "all";

    let filteredClasses = mockClasses;

    if (search) {
      filteredClasses = filteredClasses.filter(
        (cls) =>
          cls.name.toLowerCase().includes(search.toLowerCase()) ||
          cls.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type !== "all") {
      filteredClasses = filteredClasses.filter((cls) => cls.type === type);
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
    const { name, code, type, subject, schedule, description } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: "Name and code are required" },
        { status: 400 }
      );
    }

    // Try to save to MongoDB
    try {
      const client = await clientPromise;
      const db = client.db("student");
      const classesCollection = db.collection("classes");

      // Check if code already exists
      const existingClass = await classesCollection.findOne({
        code: code.toUpperCase(),
      });

      if (existingClass) {
        return NextResponse.json(
          { success: false, error: "Class code already exists" },
          { status: 409 }
        );
      }

      const now = new Date();
      const newClass = {
        name,
        code: code.toUpperCase(),
        type: type || "public",
        description: description || "",
        subject: subject || "",
        schedule: schedule || "",
        teacherId: new ObjectId("65a1b2c3d4e5f67890123456"), // Mock teacher ID
        students: [],
        inviteLink: generateInviteLink(code.toUpperCase()),
        createdAt: now,
        updatedAt: now,
      };

      const result = await classesCollection.insertOne(newClass);

      console.log("Class saved to MongoDB:", result.insertedId);

      return NextResponse.json(
        {
          success: true,
          message: "Class created successfully in MongoDB",
          class: {
            _id: result.insertedId.toString(),
            name: newClass.name,
            code: newClass.code,
            type: newClass.type,
            students: 0,
            inviteLink: newClass.inviteLink,
            subject: newClass.subject,
            schedule: newClass.schedule,
            createdAt: newClass.createdAt,
          },
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.log("MongoDB save error, using mock:", dbError);
    }

    // Mock response if MongoDB fails
    const newClass = {
      _id: Date.now().toString(),
      name,
      code: code.toUpperCase(),
      type: type || "public",
      description: description || "",
      students: 0,
      inviteLink: generateInviteLink(code.toUpperCase()),
      createdAt: new Date().toISOString(),
      subject: subject || "",
      schedule: schedule || "",
      teacherId: "teacher-123",
    };

    mockClasses.push(newClass);

    return NextResponse.json(
      {
        success: true,
        message: "Class created successfully (mock)",
        class: newClass,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create class" },
      { status: 500 }
    );
  }
}
