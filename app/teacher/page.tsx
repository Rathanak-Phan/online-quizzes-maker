"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, School, FileText, Trophy, Clock, Award, Trash2 } from "lucide-react";

interface Class {
  _id: string;
  name: string;
  code: string;
  type: "public" | "private";
  students: any[] | number;
  inviteLink?: string;
  createdAt?: string;
  subject?: string;
  schedule?: string;
  status?: string; // Added optional status
}

interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  activeQuizzes: number;
  pendingReviews: number;
  totalChallenges: number;
  completionRate: number;
}

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [teacherName, setTeacherName] = useState("Teacher");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper to generate initials from class name (e.g., "Math Grade 10" -> "MG")
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Helper to safely get student count
  const getStudentCount = (students: any[] | number) => {
    return Array.isArray(students) ? students.length : students;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);


      setTeacherName("Teacher");

      const [classesRes] = await Promise.all([
        fetch("/api/teacher/classes"),
      ]);

      if (!classesRes.ok) {
        throw new Error("Failed to fetch data from server");
      }

      const classesData = await classesRes.json();

      setStats({
        totalClasses: 12,
        totalStudents: 348,
        activeQuizzes: 8,
        pendingReviews: 15,
        totalChallenges: 4,
        completionRate: 92,
      });

      setClasses(classesData.classes || []);

    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
      
    }
  };

  const deleteClass = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    try {
      const res = await fetch(`/api/teacher/classes/${classId}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        setClasses(prev => prev.filter(c => c._id !== classId));
        alert("Class deleted successfully!");
      } else {
        alert("Failed to delete class: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting class");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-12">
      <div className="w-full mx-auto">
        <div className="bg-white shadow-xl p-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {teacherName}!
          </h1>
          <p className="text-xl text-gray-600 mb-10">Manage your classes and quizzes.</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            {stats && [
              { title: "Total Classes", value: stats.totalClasses.toString(), Icon: School, color: "bg-blue-100 text-blue-600" },
              { title: "Total Students", value: stats.totalStudents.toString(), Icon: Users, color: "bg-green-100 text-green-600" },
              { title: "Active Quizzes", value: stats.activeQuizzes.toString(), Icon: FileText, color: "bg-purple-100 text-purple-600" },
              { title: "Pending Reviews", value: stats.pendingReviews.toString(), Icon: Clock, color: "bg-yellow-100 text-yellow-600" },
              { title: "Total Challenges", value: stats.totalChallenges.toString(), Icon: Trophy, color: "bg-pink-100 text-pink-600" },
              { title: "Avg. Completion Rate", value: `${stats.completionRate}%`, Icon: Award, color: "bg-orange-100 text-orange-600" },
            ].map((stat) => (
              <div key={stat.title} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200">
                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                  <stat.Icon className="w-8 h-8" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-2">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* My Classes */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">My Classes</h2>
              <Link href="/teacher/classes/new" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md">
                + New Class
              </Link>
            </div>

            {classes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl">No classes yet</p>
                <p className="mt-2">Create your first class to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {classes.map((cls) => (
                  <div key={cls._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{cls.name}</h3>
                        <p className="text-gray-600">{getStudentCount(cls.students)} students</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${cls.type === "private"
                            ? "bg-amber-100 text-amber-800" // Style if Private
                            : "bg-green-100 text-green-800" // Style if Public (Default)
                          }`}>
                        {cls.type || "public"}
                      </span>
                      <div className="flex gap-2">
                        <Link href={`/teacher/classes/${cls._id}`}
                          className="flex items-center gap-1 px-3 py-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 font-medium">
                          View
                        </Link>
                        <button
                          onClick={() => deleteClass(cls._id)}
                          className="flex items-center gap-1 px-3 py-1 text-red-600 bg-red-50 rounded hover:bg-red-100 font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}