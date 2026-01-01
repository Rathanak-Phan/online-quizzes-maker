// app/admin/students/[id]/page.tsx
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { BookOpen, Clock, Award, Calendar, Ban } from "lucide-react";
import Image from "next/image";

interface Student {
  _id: ObjectId;
  name: string;
  email: string;
  profile_image?: string;
  createdAt: Date;
}

interface QuizAttempt {
  quizTitle: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  date: Date;
}

async function getStudent(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db('online-quizzes');
    
    // Validate if id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return null;
    }
    
    const student = await db.collection('users').findOne({ 
      _id: new ObjectId(id), 
      role: 'user' 
    });
    
    return student as Student | null;
  } catch (error) {
    console.error('Error fetching student:', error);
    return null;
  }
}

async function getStudentAttempts(studentId: string) {
  // Placeholder - replace with real submissions collection later
  // For now, mock data
  return [
    { quizTitle: "Math Fundamentals", score: 18, totalQuestions: 20, timeSpent: 12, date: new Date("2025-12-28") },
    { quizTitle: "World History Quiz", score: 15, totalQuestions: 20, timeSpent: 18, date: new Date("2025-12-25") },
    { quizTitle: "Science Basics", score: 20, totalQuestions: 20, timeSpent: 10, date: new Date("2025-12-20") },
    { quizTitle: "English Literature", score: 17, totalQuestions: 20, timeSpent: 15, date: new Date("2025-12-15") },
  ] as QuizAttempt[];
}

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  // Await params in Next.js 15
  const { id } = await params;
  
  const student = await getStudent(id);
  const attempts = await getStudentAttempts(id);

  if (!student) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Student Not Found</h1>
        <p className="text-gray-600 mt-4">The student with this ID does not exist.</p>
      </div>
    );
  }

  const totalAttempts = attempts.length;
  const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
  const totalQuestions = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);
  const averageScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  const totalTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
            <Image
              src={student.profile_image || "/logo.png"}
              alt={student.name}
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Info */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-xl text-gray-600 mt-2">{student.email}</p>
            <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
                Student
              </span>
              <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                Active
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-md">
              <Ban className="w-5 h-5" />
              Suspend Account
            </button>
            <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition">
              Send Message
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <Calendar className="w-10 h-10 opacity-80 mb-3" />
          <p className="text-blue-100">Joined</p>
          <p className="text-2xl font-bold">{new Date(student.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <BookOpen className="w-10 h-10 opacity-80 mb-3" />
          <p className="text-green-100">Quizzes Taken</p>
          <p className="text-2xl font-bold">{totalAttempts}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <Award className="w-10 h-10 opacity-80 mb-3" />
          <p className="text-purple-100">Average Score</p>
          <p className="text-2xl font-bold">{averageScore}%</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <Clock className="w-10 h-10 opacity-80 mb-3" />
          <p className="text-orange-100">Total Time Spent</p>
          <p className="text-2xl font-bold">{totalTime} min</p>
        </div>
      </div>

      {/* Quiz History */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Quiz History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Quiz</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Time Spent</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No quiz attempts yet
                  </td>
                </tr>
              ) : (
                attempts.map((attempt, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{attempt.quizTitle}</td>
                    <td className="px-6 py-4">
                      {attempt.score}/{attempt.totalQuestions} ({Math.round((attempt.score / attempt.totalQuestions) * 100)}%)
                    </td>
                    <td className="px-6 py-4 text-gray-700">{attempt.timeSpent} min</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(attempt.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-4 py-2 rounded-full font-medium ${
                        attempt.score / attempt.totalQuestions >= 0.9 ? "bg-green-100 text-green-800" :
                        attempt.score / attempt.totalQuestions >= 0.7 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {attempt.score / attempt.totalQuestions >= 0.9 ? "Excellent" :
                         attempt.score / attempt.totalQuestions >= 0.7 ? "Good" : "Needs Improvement"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}