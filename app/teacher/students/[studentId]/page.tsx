// app/teacher/students/[studentId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Award,
  BookOpen,
  BarChart3,
  Clock,
  Edit3,
  MessageSquare,
  Download,
  Loader2,
  AlertCircle,
  User,
  GraduationCap,
} from "lucide-react";

interface StudentDetail {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  enrollmentDate: string;
  className?: string;
  status: string;
  totalQuizzes: number;
  averageScore: number;
  totalPoints: number;
  lastActive: string;
  quizHistory: Array<{
    quizId: string;
    quizTitle: string;
    score: number;
    percentage: number;
    submittedAt: string;
    timeSpent: number;
  }>;
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teacher/students/${studentId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch student details");
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Student not found");
        }

        setStudent(data.student);
      } catch (err: any) {
        console.error("Error fetching student:", err);
        setError(err.message || "Failed to load student profile");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Student</h2>
          <p className="text-gray-600 mb-4">{error || "Student not found"}</p>
          <Link
            href="/teacher/students"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Students
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/teacher/students"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Students
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <MessageSquare className="w-4 h-4" />
                Send Message
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Student Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
                <p className="text-gray-600">{student.email}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  student.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : student.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{student.email}</p>
                  </div>
                </div>
                
                {student.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{student.phone}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Enrollment Date</p>
                    <p className="font-medium">
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {student.className && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Class</p>
                      <p className="font-medium">{student.className}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Average Score</span>
                  </div>
                  <span className={`text-lg font-bold ${
                    student.averageScore >= 80 ? 'text-green-600' :
                    student.averageScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {student.averageScore.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-600">Quizzes Taken</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{student.totalQuizzes}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-600">Last Active</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(student.lastActive).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Performance & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
                <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
              
              {/* Performance Chart Placeholder */}
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center mb-6">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Performance chart will appear here</p>
                  <p className="text-sm text-gray-400">Shows score trends over time</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium">Best Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.max(...student.quizHistory.map(q => q.percentage), 0).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {student.totalQuizzes > 0 ? '95%' : '0%'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quiz History */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Quiz History</h3>
              
              {student.quizHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quiz
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time Spent
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {student.quizHistory.map((quiz, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {quiz.quizTitle}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(quiz.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              quiz.percentage >= 80 ? 'bg-green-100 text-green-800' :
                              quiz.percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {quiz.percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {Math.floor(quiz.timeSpent / 60)}m {quiz.timeSpent % 60}s
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => router.push(`/teacher/quizzes/${quiz.quizId}/results`)}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Quiz History</h4>
                  <p className="text-gray-600 mb-4">This student hasn't taken any quizzes yet.</p>
                  <Link
                    href="/teacher/quizzes"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Assign a Quiz →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}