// app/api/teacher/quizzes/[quizId]/route.ts
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// Helper: Get current teacher ID (replace with real auth/session later)
async function getCurrentTeacherId() {
  // TODO: Use getServerSession() from next-auth or JWT
  // For now, mock — replace with real logic
  return "teacher_123"; // Hardcoded for testing
}

export async function GET(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('online-quizzes');

    const quizId = params.quizId;

    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    const quiz = await db.collection('quizzes').findOne({
      _id: new ObjectId(quizId),
      // Optional: teacherId: await getCurrentTeacherId()
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Convert _id to string for frontend
    const formattedQuiz = {
      ...quiz,
      _id: quiz._id.toString(),
    };

    return NextResponse.json(formattedQuiz);

  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('online-quizzes');

    const quizId = params.quizId;
    const body = await req.json();

    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    const { title, description, timeLimit, questions } = body;

    if (!title || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const result = await db.collection('quizzes').updateOne(
      { _id: new ObjectId(quizId) },
      {
        $set: {
          title: title.trim(),
          description: description?.trim() || "",
          timeLimit: Number(timeLimit),
          questions: questions.map((q: any) => ({
            title: q.title.trim(),
            type: q.type,
            points: Number(q.points),
            options: q.options || [],
            correctAnswer: q.correctAnswer,
          })),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Quiz updated successfully" });

  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('online-quizzes');

    const quizId = params.quizId;

    if (!ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    // Optional: Also delete related submissions
    await db.collection('quiz_submissions').deleteMany({
      quizId: new ObjectId(quizId),
    });

    const result = await db.collection('quizzes').deleteOne({
      _id: new ObjectId(quizId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Quiz deleted successfully" });

  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
  }
}