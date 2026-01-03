// app/teacher/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, School, FileText, Trophy, Clock, Award, Trash2 } from "lucide-react";

interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  activeQuizzes: number;
  pendingReviews: number;
  totalChallenges: number;
  completionRate: number;
}

interface Class {
  _id: string;
  initials: string;
  name: string;
  students: number;
  status: string;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teacherName, setTeacherName] = useState("Teacher");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get current teacher from localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("Please log in again");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      setTeacherName(user.name || "Teacher");

      // Fetch stats and classes from API
      const [statsRes, classesRes] = await Promise.all([
        fetch("/api/teacher/stats"),
        fetch("/api/teacher/classes"),
      ]);

      if (!statsRes.ok || !classesRes.ok) {
        throw new Error("Failed to fetch data from server");
      }

      const statsData = await statsRes.json();
      const classesData = await classesRes.json();

      setStats(statsData.stats);
      setClasses(classesData.classes || []);

    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load data");
      // Optional fallback mock data
      setStats({
        totalClasses: 12,
        totalStudents: 348,
        activeQuizzes: 8,
        pendingReviews: 15,
        totalChallenges: 4,
        completionRate: 92,
      });
      setClasses([
        { _id: "1", initials: "M10", name: "Math Grade 10A", students: 32, status: "Active" },
        { _id: "2", initials: "S9", name: "Science 9B", students: 28, status: "Active" },
        { _id: "3", initials: "E11", name: "English 11", students: 35, status: "Active" },
      ]);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {cls.initials}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{cls.name}</h3>
                        <p className="text-gray-600">{cls.students} students</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {cls.status}
                      </span>
                      <div className="flex gap-2">
                        <Link href={`/teacher/classes/${cls._id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                          View →
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
