// app/teacher/classes/[classId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Edit3,
  Globe,
  Lock,
  Trophy,
  Calendar,
  BarChart3,
  Activity,
  ChevronRight,
  Copy,
  Check,
  ArrowLeft,
  FileText,
  Clock,
  Award,
} from "lucide-react";
import { useState, useEffect } from "react";

interface ClassData {
  _id: string;
  name: string;
  code: string;
  type: "public" | "private";
  description?: string;
  students: number;
  quizzes: number;
  avgScore: number;
  inviteLink: string;
  createdAt: string;
  subject?: string;
  schedule?: string;
}

// Mock data for when API is not available
const mockClasses = [
  {
    _id: "65a1b2c3d4e5f67890123456",
    name: "Mathematics 101",
    code: "MATH101",
    type: "public" as const,
    description: "Introduction to basic mathematics concepts including algebra, geometry, and basic calculus. This course is designed for beginners.",
    students: 25,
    quizzes: 5,
    avgScore: 78.5,
    inviteLink: "http://localhost:3000/join/MATH101",
    createdAt: "2024-01-15T10:30:00Z",
    subject: "Mathematics",
    schedule: "Mon/Wed 10:00 AM"
  },
  {
    _id: "65b2c3d4e5f6789012345678",
    name: "Physics: Intro",
    code: "PHYS101",
    type: "private" as const,
    description: "Fundamentals of physics covering motion, energy, and basic thermodynamics.",
    students: 18,
    quizzes: 3,
    avgScore: 82.3,
    inviteLink: "http://localhost:3000/join/PHYS101",
    createdAt: "2024-02-01T14:00:00Z",
    subject: "Physics",
    schedule: "Tue/Thu 2:00 PM"
  },
  {
    _id: "65c3d4e5f678901234567890",
    name: "Chemistry Basics",
    code: "CHEM101",
    type: "public" as const,
    description: "Introduction to chemistry concepts including elements, compounds, and chemical reactions.",
    students: 32,
    quizzes: 7,
    avgScore: 75.2,
    inviteLink: "http://localhost:3000/join/CHEM101",
    createdAt: "2024-02-10T09:15:00Z",
    subject: "Chemistry",
    schedule: "Mon/Wed/Fri 11:00 AM"
  }
];

export default function ClassDetailPage() {
  const params = useParams();
  const classId = Array.isArray(params.classId)
    ? params.classId[0]
    : params.classId;

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    if (!classId) {
      setError("Invalid class ID");
      setLoading(false);
      return;
    }
    fetchClass();
  }, [classId]);

  const fetchClass = async () => {
    try {
      setLoading(true);
      setError("");
      setUsingMockData(false);

      console.log("Fetching class details for ID:", classId);

      // Try to fetch from API
      const res = await fetch(`/api/teacher/classes/${classId}`, {
        cache: "no-store",
      });

      console.log("Response status:", res.status);

      // Check if we got a valid JSON response
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        
        if (!res.ok) {
          console.error("API error response:", data);
          throw new Error(data?.error || `Server error: ${res.status}`);
        }

        if (!data.success) {
          throw new Error(data?.error || "Class not found");
        }

        setClassData(data.data || data);
        console.log("Class data loaded from API:", data.data?.name);
        return;
      }
      
      // If not JSON or API not available, use mock data
      throw new Error("API returned non-JSON response");
      
    } catch (err) {
      console.log("API fetch failed, using mock data:", err);
      setUsingMockData(true);
      
      // Find mock class data
      let mockClass = mockClasses.find(c => c._id === classId);
      
      // Try partial match if exact not found
      if (!mockClass) {
        mockClass = mockClasses.find(c => 
          c._id.startsWith(classId) || 
          classId.startsWith(c._id.substring(0, 8))
        );
      }
      
      // Use first mock class as fallback
      if (!mockClass) {
        mockClass = mockClasses[0];
      }
      
      // Add fallback properties if missing
      const classDataWithDefaults: ClassData = {
        ...mockClass,
        avgScore: mockClass.avgScore || 0,
        quizzes: mockClass.quizzes || 0,
        inviteLink: mockClass.inviteLink || `http://localhost:3000/join/${mockClass.code}`,
        createdAt: mockClass.createdAt || new Date().toISOString(),
      };
      
      setClassData(classDataWithDefaults);
      console.log("Using mock data:", classDataWithDefaults.name);
      
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (classData?.inviteLink) {
      navigator.clipboard.writeText(classData.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Unknown date";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-600/20 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-8 text-xl font-medium text-gray-700">
            Loading class details...
          </p>
          {classId && (
            <p className="mt-2 text-sm text-gray-500">Class ID: {classId}</p>
          )}
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
            href="/teacher/classes"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Classes
          </Link>
        </div>
      </div>
    );
  }

  if (!classData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Development notice if using mock data */}
        {usingMockData && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">!</span>
              </div>
              <div>
                <p className="font-medium text-yellow-800">Development Mode</p>
                <p className="text-sm text-yellow-600">
                  Using mock data. API endpoint not available.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/teacher/classes"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Classes</span>
          </Link>
        </div>

        {/* Class Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
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
              <div
                className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                  classData.type === "public"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {classData.type.charAt(0).toUpperCase() +
                  classData.type.slice(1)}{" "}
                Class
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              {classData.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <code className="font-mono font-bold text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg">
                  {classData.code}
                </code>
              </div>
              {classData.subject && (
                <span className="text-gray-600">• {classData.subject}</span>
              )}
              {classData.schedule && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{classData.schedule}</span>
                </div>
              )}
            </div>

            {classData.description && (
              <p className="mt-4 text-gray-600 max-w-3xl">
                {classData.description}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/teacher/classes/${classId}/edit`}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-sm"
            >
              <Edit3 className="w-5 h-5" />
              Edit Class
            </Link>
            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Invite Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex flex-wrap gap-4 lg:gap-8">
            <Link
              href={`/teacher/classes/${classId}`}
              className="pb-4 border-b-2 border-blue-600 text-blue-600 font-semibold flex items-center gap-2"
            >
              <Activity className="w-5 h-5" />
              Overview
            </Link>
            <Link
              href={`/teacher/classes/${classId}/students`}
              className="pb-4 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors"
            >
              <Users className="w-5 h-5" />
              Students
              <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-sm font-semibold">
                {classData.students}
              </span>
            </Link>
            <Link
              href={`/teacher/classes/${classId}/quizzes`}
              className="pb-4 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              Quizzes
              <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-sm font-semibold">
                {classData.quizzes}
              </span>
            </Link>
            <Link
              href={`/teacher/classes/${classId}/analytics`}
              className="pb-4 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200/50 p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Total Students
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {classData.students}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/50 p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Active Quizzes
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {classData.quizzes}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/50 p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Class Average
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {classData.avgScore || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invite Section */}
            <div className="bg-white rounded-2xl border border-gray-200/50 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Invite Students
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-1">
                      Class Invite Link
                    </p>
                    <code className="text-sm font-mono text-gray-800 break-all">
                      {classData.inviteLink}
                    </code>
                  </div>
                  <button
                    onClick={copyLink}
                    className="ml-4 flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  {classData.type === "public" ? (
                    <Globe className="w-4 h-4 text-green-600 mt-0.5" />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-600 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">
                      {classData.type === "public"
                        ? "Public Class"
                        : "Private Class"}
                    </p>
                    <p className="mt-1">
                      {classData.type === "public"
                        ? "Anyone with the link can join this class."
                        : "Only students with this invite link can join."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200/50 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href={`/teacher/classes/${classId}/students`}
                  className="group flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      Manage Students
                    </p>
                    <p className="text-sm text-gray-600">
                      View and manage class roster
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </Link>

                <Link
                  href={`/teacher/classes/${classId}/quizzes/new`}
                  className="group flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Create Quiz</p>
                    <p className="text-sm text-gray-600">
                      Add a new quiz to this class
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Info & Activity */}
          <div className="space-y-8">
            {/* Class Information */}
            <div className="bg-white rounded-2xl border border-gray-200/50 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Class Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Class Code</span>
                  <code className="font-mono font-bold text-gray-900">
                    {classData.code}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      classData.type === "public"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {classData.type.charAt(0).toUpperCase() +
                      classData.type.slice(1)}
                  </span>
                </div>
                {classData.subject && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subject</span>
                    <span className="font-medium text-gray-900">
                      {classData.subject}
                    </span>
                  </div>
                )}
                {classData.schedule && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Schedule</span>
                    <span className="font-medium text-gray-900">
                      {classData.schedule}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(classData.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-200/50 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Activity
                </h2>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Student joined</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Quiz assigned</p>
                    <p className="text-sm text-gray-500">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Quiz completed</p>
                    <p className="text-sm text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}