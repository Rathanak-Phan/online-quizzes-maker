"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAward,
  FiBarChart2,
  FiChevronRight,
} from "react-icons/fi";

interface StudentClass {
  _id: string;
  name: string;
  code: string;
  subject: string;
  teacher: { name: string; email: string };
  totalQuizzes: number;
  upcomingQuizzes: number;
  completedQuizzes: number;
}

interface ActiveQuiz {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  timeLimit: number;
  totalQuestions: number;
  className: string;
  teacherName: string;
  isCompleted: boolean;
  score?: number;
  maxScore?: number;
}

interface StudentStats {
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  totalClasses: number;
  streak: number;
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [activeQuizzes, setActiveQuizzes] = useState<ActiveQuiz[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data once session is ready
  useEffect(() => {
    if (status === "authenticated") {
      fetchStudentData();
    }
  }, [status]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // Use session.user.id in the API calls if needed
      const [classesRes, quizzesRes, statsRes] = await Promise.all([
        fetch("/api/student/classes"),
        fetch("/api/student/quizzes/active"),
        fetch("/api/student/stats"),
      ]);

      if (classesRes.ok) setClasses(await classesRes.json());
      if (quizzesRes.ok) setActiveQuizzes(await quizzesRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error("Failed to fetch student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays > 0) return `Due in ${diffDays} days`;
    return "Overdue";
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <p className="text-xl text-gray-700 mb-4">
          You must be logged in to access the dashboard.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <FiBookOpen className="text-2xl text-blue-600" />
            <h1 className="text-xl font-bold">Student Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {session.user.name || "Student"}
            </span>
            <Link
              href="/student/profile"
              className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold"
            >
              {session.user.name?.charAt(0) || "S"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero & Stats */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Hello, {session.user.name?.split(" ")[0] || "Student"}! 👋
              </h1>
              <p className="text-gray-600">
                Here's what's happening in your classes
              </p>
            </div>
            {stats && (
              <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
                <FiAward className="text-yellow-500" />
                <span className="font-semibold">{stats.streak} day streak</span>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Classes</p>
                    <h3 className="text-2xl font-bold">{stats.totalClasses}</h3>
                  </div>
                  <FiBookOpen className="text-3xl text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Quizzes Completed</p>
                    <h3 className="text-2xl font-bold">
                      {stats.completedQuizzes}/{stats.totalQuizzes}
                    </h3>
                  </div>
                  <FiCheckCircle className="text-3xl text-green-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Average Score</p>
                    <h3 className="text-2xl font-bold">{stats.averageScore}%</h3>
                  </div>
                  <FiBarChart2 className="text-3xl text-purple-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Current Streak</p>
                    <h3 className="text-2xl font-bold">{stats.streak} days</h3>
                  </div>
                  <FiAward className="text-3xl text-yellow-500" />
                </div>
              </div>
            </div>
          )}

          {/* Active Quizzes */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Active Quizzes</h2>
              <Link
                href="/quizzes"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View all <FiChevronRight />
              </Link>
            </div>
            {activeQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border-l-4 border-blue-500"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{quiz.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{quiz.className}</p>
                          <p className="text-gray-500 text-sm">{quiz.teacherName}</p>
                        </div>
                        {quiz.isCompleted ? (
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                            Completed
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar />
                          {quiz.dueDate ? formatDueDate(quiz.dueDate) : "No due date"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiClock />
                          {quiz.timeLimit} minutes
                        </div>
                        <div className="text-sm text-gray-600">{quiz.totalQuestions} questions</div>
                      </div>

                      {quiz.isCompleted ? (
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600 mb-2">
                            Score: {quiz.score}/{quiz.maxScore}
                          </div>
                          <button className="text-blue-600 text-sm hover:text-blue-700">
                            View Results
                          </button>
                        </div>
                      ) : (
                        <Link
                          href={`/quiz/${quiz._id}`}
                          className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          Start Quiz
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow">
                <FiBookOpen className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No active quizzes at the moment</p>
                <p className="text-sm text-gray-400">Check back later for new assignments</p>
              </div>
            )}
          </section>

          {/* My Classes */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Classes</h2>
              <Link
                href="/classes"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View all <FiChevronRight />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <Link
                    key={cls._id}
                    href={`/class/${cls._id}`}
                    className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{cls.name}</h3>
                          <p className="text-gray-600 text-sm">{cls.subject}</p>
                        </div>
                        <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                          {cls.code}
                        </span>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Teacher: {cls.teacher.name}</p>
                        <p className="text-sm text-gray-600">{cls.teacher.email}</p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="text-center">
                          <div className="font-bold text-gray-800">{cls.totalQuizzes}</div>
                          <div className="text-gray-500">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-blue-600">{cls.upcomingQuizzes}</div>
                          <div className="text-gray-500">Upcoming</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-green-600">{cls.completedQuizzes}</div>
                          <div className="text-gray-500">Completed</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 bg-white rounded-xl shadow">
                  <FiBookOpen className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">You haven't joined any classes yet</p>
                  <Link href="/student/join" className="text-blue-600 hover:text-blue-700">
                    Join a class using an invite code
                  </Link>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
