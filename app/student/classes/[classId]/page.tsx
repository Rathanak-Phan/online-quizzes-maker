"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Globe,
  Lock,
  Award,
  ArrowLeft,
  Copy,
  Check,
  Search,
  Mail,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";

interface StudentInfo {
  _id: string;
  name: string;
  email: string;
  joinedAt: string;
  quizzesAttempted: number;
  avgScore: number;
  grade?: string;
}

interface QuizInfo {
  id: string;
  title: string;
  questions: number;
  description?: string;
}

interface ClassData {
  _id: string;
  name: string;
  code: string;
  type: "public" | "private";
  description?: string;
  studentCount: number;
  quizzesCount: number;
  avgScore: number;
  createdAt: string;
  subject?: string;
  schedule?: string;
  teacher?: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function StudentClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = Array.isArray(params.classId)
    ? params.classId[0]
    : params.classId;

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [quizzes, setQuizzes] = useState<QuizInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"students" | "quizzes">(
    "students"
  );

  useEffect(() => {
    if (!classId) {
      setError("Invalid class ID");
      setLoading(false);
      return;
    }
    fetchClassDetails();
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch class details
      const res = await fetch(`/api/student/classes/${classId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error: ${res.status}`);
      }

      const data = await res.json();
      console.log("API Response:", data);

      setClassData(data.class || data);

      // Ensure students is properly formatted array
      const studentList = Array.isArray(data.students)
        ? data.students.map((s: any) => {
            // Ensure all fields are primitives, not objects
            return {
              _id: String(s._id || s.id || ""),
              name: String(s.name || ""),
              email: String(s.email || ""),
              joinedAt: String(s.joinedAt || new Date().toISOString()),
              quizzesAttempted: Number(s.quizzesAttempted) || 0,
              avgScore: Number(s.avgScore) || 0,
              grade: String(s.grade || ""),
            };
          })
        : [];

      console.log("Processed students:", studentList);
      setStudents(studentList);

      // Ensure quizzes is properly formatted array
      const quizzesList = Array.isArray(data.quizzes)
        ? data.quizzes.map((q: any) => ({
            id: String(q.id || ""),
            title: String(q.title || ""),
            questions: Number(q.questions) || 0,
            description: String(q.description || ""),
          }))
        : [];

      console.log("Processed quizzes:", quizzesList);
      setQuizzes(quizzesList);
    } catch (err: any) {
      console.error("Failed to fetch class details:", err);
      setError(err.message || "Failed to load class details");
    } finally {
      setLoading(false);
    }
  };

  const copyClassCode = () => {
    if (classData?.code) {
      navigator.clipboard.writeText(classData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Unknown date";
    }
  };

  const filteredStudents = Array.isArray(students)
    ? students.filter(
        (student) =>
          typeof student === "object" &&
          student !== null &&
          (String(student.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
            String(student.email || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="w-20 h-20 border-4 border-blue-600/20 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-xl font-medium text-gray-700">
            Loading class details...
          </p>
        </div>
      </div>
    );
  }

  if (error && !classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center px-4">
        <div className="text-center max-w-md p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">!</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Class Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8">{error}</p>
          <Link
            href="/student/classes"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Classes
          </Link>
        </div>
      </div>
    );
  }

  if (!classData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link
          href="/student/classes"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Classes</span>
        </Link>

        {/* Class Header */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200/50 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`p-3 rounded-xl ${
                    classData.type === "public"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {classData.type === "public" ? (
                    <Globe className="w-6 h-6" />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    classData.type === "public"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {classData.type === "public" ? "Public" : "Private"}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {classData.name}
              </h1>
              {classData.description && (
                <p className="text-gray-600 text-lg mb-4">
                  {classData.description}
                </p>
              )}
              <div className="flex flex-wrap gap-6">
                {classData.subject && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{classData.subject}</span>
                  </div>
                )}
                {classData.schedule && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{classData.schedule}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 min-w-fit">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {classData.studentCount || 0}
                </p>
                <p className="text-sm text-gray-600">Students</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 border border-purple-200/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {classData.quizzesCount || 0}
                </p>
                <p className="text-sm text-gray-600">Quizzes</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-6 border border-amber-200/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-200 rounded-lg">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {classData.avgScore?.toFixed(1) || "0"}%
                </p>
                <p className="text-sm text-gray-600">Avg Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("students")}
            className={`pb-4 px-4 font-semibold text-lg transition-colors duration-200 ${
              activeTab === "students"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Students ({filteredStudents.length})
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`pb-4 px-4 font-semibold text-lg transition-colors duration-200 ${
              activeTab === "quizzes"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Quizzes ({quizzes.length})
          </button>
        </div>

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200/50 p-8">

            {/* Students Table */}
            {filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Joined
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Quizzes
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Avg Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr
                        key={student._id}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200"
                      >
                        <td className="py-4 px-4 font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="py-4 px-4 text-gray-600 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {student.email}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {formatDate(student.joinedAt)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            {student.quizzesAttempted}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${student.avgScore}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 min-w-12">
                              {student.avgScore.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-600 font-medium mb-2">
                  No students found
                </p>
                <p className="text-gray-500">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "No students have joined this class yet"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === "quizzes" && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200/50 p-8">
            {quizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-6 border border-gray-200 rounded-2xl hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {quiz.title}
                        </h3>
                        {quiz.description && (
                          <p className="text-sm text-gray-600">
                            {quiz.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          {quiz.questions} Questions
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-600 font-medium mb-2">
                  No quizzes yet
                </p>
                <p className="text-gray-500">
                  Quizzes for this class will appear here
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
