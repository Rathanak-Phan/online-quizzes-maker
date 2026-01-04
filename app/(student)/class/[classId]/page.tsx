'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiBookOpen, FiCalendar, FiClock, FiCheckCircle, FiUsers } from 'react-icons/fi';

interface ClassDetails {
  _id: string;
  name: string;
  code: string;
  subject: string;
  description: string;
  schedule: string;
  teacher: {
    name: string;
    email: string;
  };
  studentCount: number;
}

interface ClassQuiz {
  _id: string;
  title: string;
  description: string;
  dueDate?: string;
  timeLimit: number;
  totalQuestions: number;
  status: 'draft' | 'active' | 'completed';
  studentStatus: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  maxScore?: number;
  submittedAt?: string;
}

export default function StudentClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [quizzes, setQuizzes] = useState<ClassQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const [classRes, quizzesRes] = await Promise.all([
        fetch(`/api/student/classes/${classId}`),
        fetch(`/api/student/classes/${classId}/quizzes`),
      ]);

      if (classRes.ok) setClassDetails(await classRes.json());
      if (quizzesRes.ok) setQuizzes(await quizzesRes.json());
    } catch (error) {
      console.error('Failed to fetch class data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => 
    activeTab === 'upcoming' 
      ? quiz.studentStatus !== 'completed'
      : quiz.studentStatus === 'completed'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading class information...</p>
        </div>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Class not found</p>
          <Link href="/student" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800">
      {/* Navigation */}
      <nav className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FiArrowLeft />
            Back
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{classDetails.name}</h1>
            <p className="text-sm text-gray-600">{classDetails.code}</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Class Header */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{classDetails.name}</h1>
              <p className="text-gray-600 mb-4">{classDetails.description}</p>
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiBookOpen />
                  <span>{classDetails.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiCalendar />
                  <span>{classDetails.schedule || 'Schedule not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiUsers />
                  <span>{classDetails.studentCount} students</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Teacher</h3>
              <p className="text-lg font-bold">{classDetails.teacher.name}</p>
              <p className="text-gray-600">{classDetails.teacher.email}</p>
            </div>
          </div>
        </div>

        {/* Quizzes Section */}
        <div className="bg-white rounded-xl shadow">
          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                  activeTab === 'upcoming'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Upcoming Quizzes
                <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {quizzes.filter(q => q.studentStatus !== 'completed').length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                  activeTab === 'completed'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Completed Quizzes
                <span className="ml-2 bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                  {quizzes.filter(q => q.studentStatus === 'completed').length}
                </span>
              </button>
            </div>
          </div>

          {/* Quizzes List */}
          <div className="divide-y">
            {filteredQuizzes.length > 0 ? (
              filteredQuizzes.map((quiz) => (
                <div key={quiz._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{quiz.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          quiz.status === 'active' ? 'bg-green-100 text-green-800' :
                          quiz.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {quiz.status}
                        </span>
                      </div>
                      
                      {quiz.description && (
                        <p className="text-gray-600 mb-3">{quiz.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiClock />
                          {quiz.timeLimit} minutes
                        </div>
                        <div>
                          {quiz.totalQuestions} questions
                        </div>
                        {quiz.dueDate && (
                          <div>
                            Due: {new Date(quiz.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      {quiz.studentStatus === 'completed' ? (
                        <>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {quiz.score}/{quiz.maxScore}
                            </div>
                            <div className="text-sm text-gray-500">Score</div>
                          </div>
                          <Link
                            href={`/student/quiz/${quiz._id}/results`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={`/student/quiz/${quiz._id}`}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          {quiz.studentStatus === 'in_progress' ? 'Continue Quiz' : 'Start Quiz'}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FiBookOpen className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {activeTab === 'upcoming' 
                    ? 'No upcoming quizzes at the moment'
                    : 'No completed quizzes yet'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}