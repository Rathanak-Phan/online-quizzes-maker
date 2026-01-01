// app/api/teacher/classes/route.ts
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('online-quizzes');

    const body = await request.json();
    console.log("Received body:", body); // ← Logs incoming data (name, code, type)

    const result = await db.collection('classes').insertOne({
      ...body,
      teacherId: "test-teacher-123", // Replace with real auth later
      students: [],
      createdAt: new Date(),
    });

    // ← ADD THIS LINE TO LOG THE CREATED ID
    console.log("Class created successfully with ID:", result.insertedId.toString());

    return NextResponse.json({ 
      message: "Class created",
      classId: result.insertedId.toString() // ← This sends ID to frontend for redirect
    }, { status: 201 });

  } catch (error) {
    console.error("API Error creating class:", error);
    return NextResponse.json({ 
      message: "Failed to create class" 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('online-quizzes');

    const classes = await db.collection('classes').find({}).toArray();

    return NextResponse.json({ 
      classes: classes.map(c => ({
        _id: c._id.toString(),
        name: c.name,
        code: c.code,
        type: c.type,
        students: c.students?.length || 0,
      }))
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json({ classes: [] });
  }
}