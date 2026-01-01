// app/api/teacher/notifications/count/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Helper to get current user from localStorage (client-side) — but in API, we use headers or cookies later
// For now, we'll assume you pass teacherId via query or use auth later

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('online-quizzes');

    // Get teacher ID from URL query (temporary — replace with real auth later)
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json({ count: 0, error: 'Teacher ID required' }, { status: 400 });
    }

    // Count unread notifications for this teacher
    const count = await db.collection('notifications').countDocuments({
      teacherId: teacherId,           // or userId if your schema uses that
      read: false,
      // Optional: filter by notification types
      // type: { $in: ['quiz_submission', 'student_message', 'class_update', 'system'] }
    });

    return NextResponse.json({ count });

  } catch (error) {
    console.error('Notification count error:', error);
    return NextResponse.json({ count: 0 }); // Safe fallback
  }
}