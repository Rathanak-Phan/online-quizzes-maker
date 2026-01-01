// app/api/teacher/quizzes/route.ts
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// Helper to get current teacher (replace with real auth later)
async function getCurrentTeacherId() {
  // TODO: Replace with real session/auth (NextAuth, JWT, etc.)
  // For now, mock from localStorage (client-side only — not secure!)
  // In production: use cookies, getServerSession, etc.
  return "current-teacher-id"; // Replace with real logic
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('online-quizzes');

    const teacherId = await getCurrentTeacherId();

    const quizzes = await db
      .collection('quizzes')
      .aggregate([
        { $match: { teacherId: teacherId } },
        {
          $lookup: {
            from: 'classes',
            localField: 'assignedClasses',
            foreignField: '_id',
            as: 'classInfo'
          }
        },
        {
          $addFields: {
            classes: { $size: "$classInfo" },
            questions: { $size: { $ifNull: ["$questions", []] } },
          }
        },
        {
          $project: {
            _id: { $toString: "$_id" },
            title: 1,
            category: 1,
            questions: 1,
            classes: 1,
            avgScore: 1,
            status: 1,
            lastUsed: {
              $dateToString: {
                format: "%b %d, %Y",
                date: "$lastUsed",
                onNull: "Not used yet"
              }
            },
            createdAt: 1,
          }
        },
        { $sort: { createdAt: -1 } }
      ])
      .toArray();

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ quizzes: [], error: 'Failed to load quizzes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('online-quizzes');

    const teacherId = await getCurrentTeacherId();

    const body = await request.json();

    const { title, description = "", timeLimit = 30, questions = [] } = body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Title and at least one question required' }, { status: 400 });
    }

    const newQuiz = {
      teacherId,
      title: title.trim(),
      description: description.trim(),
      timeLimit: Number(timeLimit),
      questions: questions.map((q: any) => ({
        title: q.title.trim(),
        type: q.type,
        points: Number(q.points),
        options: q.options || [],
        correctAnswer: q.correctAnswer,
      })),
      assignedClasses: [], // will be filled later
      status: "draft" as const,
      avgScore: null,
      createdAt: new Date(),
      lastUsed: null,
    };

    const result = await db.collection('quizzes').insertOne(newQuiz);

    return NextResponse.json({
      message: "Quiz created successfully",
      quizId: result.insertedId.toString(),
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}