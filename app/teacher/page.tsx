"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  School,
  FileText,
  Trophy,
  Clock,
  Award,
  Trash2,
} from "lucide-react";


interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  activeQuizzes: number;
  pendingReviews: number;
  totalChallenges: number;
  completionRate: number;
}

interface ApiClass {
  _id: string;
  name: string;
  code: string;
  type: "public" | "private";
  studentCount?: number;
  quizCount?: number;
  students?: any[];
  quizzes?: any[];
}

interface DashboardClass {
  _id: string;
  initials: string;
  name: string;
  students: number;
  status: string;
}


export default function TeacherDashboard() {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [classes, setClasses] = useState<DashboardClass[]>([]);
  const [teacherName, setTeacherName] = useState("Teacher");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();


  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("Please log in again");
        return;
      }

      const user = JSON.parse(storedUser);
      setTeacherName(user.name || "Teacher");

      const [statsRes, classesRes] = await Promise.all([
        fetch("/api/teacher/stats"),
        fetch("/api/teacher/classes"),
      ]);

      if (!classesRes.ok) {
        throw new Error("Failed to load classes");
      }

      const classesData = await classesRes.json();
      const statsData = statsRes.ok ? await statsRes.json() : null;

      /* Normalize classes from API */
      const normalizedClasses: DashboardClass[] = (
        classesData.classes || []
      ).map((cls: ApiClass) => ({
        _id: cls._id,
        name: cls.name,
        initials: getInitials(cls.name),
        students:
          cls.studentCount ??
          cls.students?.length ??
          0,
        status: "Active",
      }));

      setClasses(normalizedClasses);

      /* Stats (fallback-safe) */
      setStats(
        statsData?.stats || {
          totalClasses: normalizedClasses.length,
          totalStudents: normalizedClasses.reduce(
            (sum, c) => sum + c.students,
            0
          ),
          activeQuizzes: 0,
          pendingReviews: 0,
          totalChallenges: 0,
          completionRate: 0,
        }
      );
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load data");

      /* Hard fallback */
      setStats({
        totalClasses: 3,
        totalStudents: 0,
        activeQuizzes: 0,
        pendingReviews: 0,
        totalChallenges: 0,
        completionRate: 0,
      });

      setClasses([]);
    } finally {
      setLoading(false);
    }
  };


  const deleteClass = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    try {
      const res = await fetch(`/api/teacher/classes/${classId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setClasses((prev) => prev.filter((c) => c._id !== classId));
        alert("Class deleted successfully");
      } else {
        alert(data.error || "Failed to delete class");
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
      <div className="bg-white shadow-xl p-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome back, {teacherName}!
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Manage your classes and quizzes.
        </p>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            {[
              {
                title: "Total Classes",
                value: stats.totalClasses,
                Icon: School,
              },
              {
                title: "Total Students",
                value: stats.totalStudents,
                Icon: Users,
              },
              {
                title: "Active Quizzes",
                value: stats.activeQuizzes,
                Icon: FileText,
              },
              {
                title: "Pending Reviews",
                value: stats.pendingReviews,
                Icon: Clock,
              },
              {
                title: "Total Challenges",
                value: stats.totalChallenges,
                Icon: Trophy,
              },
              {
                title: "Completion Rate",
                value: `${stats.completionRate}%`,
                Icon: Award,
              },
            ].map(({ title, value, Icon }) => (
              <div
                key={title}
                className="bg-gray-50 rounded-2xl p-6 text-center border"
              >
                <Icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-sm text-gray-600 mt-2">{title}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-50 rounded-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">My Classes</h2>
            <Link
              href="/teacher/classes/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
            >
              + New Class
            </Link>
          </div>

          {classes.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No classes yet
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <div
                  key={cls._id}
                  className="bg-white rounded-xl shadow p-6"
                >
                  <div className="flex gap-4 mb-4">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xl font-bold">
                      {cls.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{cls.name}</h3>
                      <p className="text-gray-600">
                        {cls.students} students
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">
                      {cls.status}
                    </span>
                    <div className="flex gap-3">
                      <Link
                        href={`/teacher/classes/${cls._id}`}
                        className="text-blue-600 font-medium"
                      >
                        View →
                      </Link>
                      <button
                        onClick={() => deleteClass(cls._id)}
                        className="text-red-600 flex items-center gap-1"
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
  );
}
