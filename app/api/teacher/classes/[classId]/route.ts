// app/api/teacher/classes/[classId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Helper function
function generateInviteLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/join/${code}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const { classId } = params;
    
    // Try MongoDB first
    try {
      const client = await clientPromise;
      const db = client.db('online-quizzes');
      const classesCollection = db.collection('classes');
      
      // Validate ObjectId
      if (!ObjectId.isValid(classId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid class ID format' },
          { status: 400 }
        );
      }
      
      // Find class in MongoDB
      const classData = await classesCollection.findOne({
        _id: new ObjectId(classId),
        teacherId: new ObjectId('65a1b2c3d4e5f67890123456') // Mock teacher ID
      });
      
      if (!classData) {
        return NextResponse.json(
          { success: false, error: 'Class not found' },
          { status: 404 }
        );
      }
      
      // Get student count
      const studentsCount = classData.students ? classData.students.length : 0;
      
      // Get quiz count
      const quizzesCollection = db.collection('online-quizzes');
      const quizCount = await quizzesCollection.countDocuments({
        classId: new ObjectId(classId)
      });
      
      const activeQuizzes = await quizzesCollection.countDocuments({
        classId: new ObjectId(classId),
        status: 'active'
      });
      
      // Format response
      const responseData = {
        _id: classData._id.toString(),
        name: classData.name,
        code: classData.code,
        type: classData.type,
        description: classData.description || '',
        subject: classData.subject || '',
        schedule: classData.schedule || '',
        students: studentsCount,
        quizzes: quizCount,
        activeQuizzes: activeQuizzes,
        avgScore: 75.5,
        inviteLink: classData.inviteLink || generateInviteLink(classData.code),
        createdAt: classData.createdAt,
        recentActivity: [
          {
            type: 'class_created',
            title: 'Class Created',
            description: `${classData.name} was created`,
            time: 'Recently'
          }
        ]
      };
      
      console.log('Class data loaded from MongoDB:', responseData.name);
      
      return NextResponse.json({
        success: true,
        data: responseData
      });
      
    } catch (dbError) {
      console.log('MongoDB error, using mock data:', dbError);
    }
    
    // Mock data fallback
    const mockData = {
      _id: classId,
      name: "Mathematics 101",
      code: "MATH101",
      type: "public",
      description: "Introduction to mathematics",
      students: 25,
      quizzes: 5,
      activeQuizzes: 3,
      avgScore: 78.5,
      inviteLink: `http://localhost:3000/join/${classId}`,
      createdAt: new Date().toISOString(),
      subject: "Mathematics",
      schedule: "Mon/Wed 10:00 AM",
      recentActivity: [],
      teacherId: "teacher-123"
    };
    
    return NextResponse.json({
      success: true,
      data: mockData,
      note: "Using mock data due to MongoDB error"
    });
    
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load class details' },
      { status: 500 }
    );
  }
}