"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface StoredUser {
  id: string | number;
  name?: string;
  email?: string;
  role?: string;
  profileImage?: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<
    { _id: string; name: string; code: string; students: number; type?: string }[]
  >([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);

/*
  useEffect(() => {
    const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
    const parsed: StoredUser | null = stored ? JSON.parse(stored) : null;
    if (!parsed) {
      router.replace("/login");
      return;
    }
    setUser(parsed);
    setLoading(false);
  }, [router]);
*/
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoadingClasses(true);
        setClassesError(null);
        const res = await fetch("/api/student/classes");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Error: ${res.status}`);
        }
        const data = await res.json();
        const list = (data.classes || []).map((c: any) => ({
          _id: c._id,
          name: c.name,
          code: c.code,
          students: typeof c.students === "number" ? c.students : (c.students || []).length,
          type: c.type,
        }));
        setClasses(list);
      } catch (err: any) {
        setClassesError(err.message || "Failed to load classes");
      } finally {
        setLoadingClasses(false);
      }
    };
    loadClasses();
  }, []);


  const statCards = [
    { title: "Quizzes Taken", value: 12, color: "bg-blue-600" },
    { title: "Average Score", value: "84%", color: "bg-purple-600" },
    { title: "Streak Days", value: 7, color: "bg-emerald-600" },
    { title: "Badges Earned", value: 5, color: "bg-pink-600" },
  ];

  const upcoming = [
    { title: "Algebra Basics", date: "Jan 20", category: "Mathematics" },
    { title: "World War II", date: "Jan 22", category: "History" },
    { title: "Intro to React", date: "Jan 25", category: "Programming" },
  ];

  const recent = [
    { title: "Chemistry Lab Safety", score: 92, date: "Yesterday" },
    { title: "Maps & Capitals", score: 78, date: "2 days ago" },
    { title: "Data Structures", score: 88, date: "Last week" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 pt-28">
          <div className="animate-pulse text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full flex justify-center mb-4">
      <main className="pt-28 w-full pl-3 pr-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 ">
          <div className="md:col-span-4 ">

            <section className="mb-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Welcome back{user?.name ? `, ${user.name}` : ""}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Track your progress and continue learning
                  </p>
                </div>
                <Link
                  href="/student/quizzes"
                  className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Start a Quiz
                </Link>
              </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl bg-white shadow-sm border border-gray-200 p-6"
            >
              <div className={`w-12 h-12 rounded-xl ${card.color} mb-4`} />
              <p className="text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <p className="text-blue-600 hover:underline">
                View Leaderboard
              </p>
            </div>
            <ul className="divide-y divide-gray-100">
              {recent.map((item) => (
                <li key={item.title} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Score</span>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">
                      {item.score}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Quizzes</h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {upcoming.map((q) => (
                <li key={q.title} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{q.title}</p>
                    <p className="text-sm text-gray-500">{q.category}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                    {q.date}
                  </span>
                </li>
              ))}
            </ul>
            <div className="px-6 py-4">
              <Link
                href="/categories"
                className="block w-full text-center px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </section>


            </section>

            <section id="classes" className="mt-10 rounded-2xl bg-white shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Your Classes</h2>
              </div>
              <div className="px-6 py-6">
                {loadingClasses ? (
                  <p className="text-gray-600">Loading classes...</p>
                ) : classesError ? (
                  <p className="text-red-600">{classesError}</p>
                ) : classes.length === 0 ? (
                  <div>
                    <p className="text-gray-600 mb-4">No classes yet.</p>
                    <Link
                      href="/student/classes"
                      className="inline-block px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    >
                      Add Class
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      {classes.slice(0, 6).map((cls) => (
                        <div
                          key={cls._id}
                          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                        >
                          <div className="p-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                  {cls.name}
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                  {cls.students} Students
                                </p>
                              </div>
                            </div>
                            <div className="mt-5 flex items-center justify-between">
                              <Link
                                href={`/student/classes/${cls._id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                              >
                                View
                              </Link>
                              <span
                                className={`px-3 py-1 rounded-xl text-xs ${
                                  cls.type === "public"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {cls.type || "public"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/student/classes"
                      className="inline-block px-5 py-3 rounded-xl bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200"
                    >
                      View all classes
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
