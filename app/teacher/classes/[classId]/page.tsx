// app/teacher/classes/[classId]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, BookOpen, Link2, Edit3, Globe, Lock, Trophy } from "lucide-react";
import { useState, useEffect } from "react";

interface ClassData {
  _id: string;
  name: string;
  code: string;
  type: "public" | "private";
  students: number;
  quizzes: number;
  avgScore: number;
  inviteLink: string;
}

export default function ClassDetailPage() {
  const router = useRouter();
  const params = useParams();
  const classId = Array.isArray(params.classId) ? params.classId[0] : params.classId;

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      const res = await fetch(`/api/teacher/classes/${classId}`, {
        cache: "no-store", // Always fresh data
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("API error:", res.status, errText);
        throw new Error("Class not found or server error");
      }

      const data = await res.json();
      setClassData(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Class not found");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (classData?.inviteLink) {
      navigator.clipboard.writeText(classData.inviteLink);
      alert("Invite link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="text-2xl text-gray-600">Loading class details...</div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="text-red-600 text-2xl mb-6">{error || "Class not found"}</div>
        <Link href="/teacher/classes" className="text-blue-600 hover:underline text-lg">
          ← Back to Classes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link
        href="/teacher/classes"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 text-lg"
      >
        ← Back to Classes
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{classData.name}</h1>
          <div className="flex items-center gap-8 text-gray-600">
            <span className="flex items-center gap-2">
              {classData.type === "public" ? (
                <Globe className="w-5 h-5 text-green-600" />
              ) : (
                <Lock className="w-5 h-5 text-orange-600" />
              )}
              <span className="font-medium capitalize">{classData.type}</span>
            </span>
            <span>
              Code: <span className="font-medium">{classData.code}</span>
            </span>
            <span>
              <Users className="w-5 h-5 inline mr-2" />
              {classData.students} students
            </span>
          </div>
        </div>

        <Link
          href={`/teacher/classes/${classId}/edit`}
          className="flex items-center gap-3 px-6 py-4 border border-gray-300 rounded-2xl hover:bg-gray-50 transition font-medium"
        >
          <Edit3 className="w-5 h-5" />
          Edit Class
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-10">
        <div className="flex gap-12">
          <Link
            href={`/teacher/classes/${classId}`}
            className="pb-4 border-b-4 border-blue-600 text-blue-600 font-semibold text-lg"
          >
            Overview
          </Link>
          <Link
            href={`/teacher/classes/${classId}/students`}
            className="pb-4 text-gray-600 hover:text-gray-900 font-medium text-lg flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            Students ({classData.students})
          </Link>
          <Link
            href={`/teacher/classes/${classId}/quizzes`}
            className="pb-4 text-gray-600 hover:text-gray-900 font-medium text-lg flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Quizzes ({classData.quizzes})
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Invite & Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Invite Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-semibold mb-6">Invite Students</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">Share this link with students</p>
                <div className="flex items-center gap-4">
                  <code className="flex-1 bg-gray-100 px-5 py-4 rounded-2xl text-sm break-all font-mono">
                    {classData.inviteLink}
                  </code>
                  <button
                    onClick={copyLink}
                    className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition shadow-md"
                  >
                    <Link2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {classData.type === "private"
                  ? "Only students with this link can join. You control access."
                  : "Anyone with this link can join the class."}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 text-center shadow-md">
              <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <p className="text-4xl font-bold text-blue-700">{classData.students}</p>
              <p className="text-gray-700 mt-2">Total Students</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 text-center shadow-md">
              <BookOpen className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <p className="text-4xl font-bold text-green-700">{classData.quizzes}</p>
              <p className="text-gray-700 mt-2">Active Quizzes</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 text-center shadow-md">
              <Trophy className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <p className="text-4xl font-bold text-purple-700">
                {classData.avgScore || "--"}%
              </p>
              <p className="text-gray-700 mt-2">Class Average</p>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">New student joined</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">New quiz assigned</p>
                <p className="text-sm text-gray-500">Yesterday</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Average score updated</p>
                <p className="text-sm text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}