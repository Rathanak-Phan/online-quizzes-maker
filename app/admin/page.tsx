// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Define the stats type
type Stats = {
  totalUsers: number;
  totalTeachers: number;
  pendingTeachers: number;
  totalQuizzes: number;
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  // Fetch stats from API at runtime only
  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then(res => res.json())
      .then(setStats)
      .catch(() =>
        setStats({
          totalUsers: 0,
          totalTeachers: 0,
          pendingTeachers: 0,
          totalQuizzes: 0,
        })
      );
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 animate-pulse text-xl">Loading stats...</p>
      </div>
    );
  }

  return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Welcome back, Admin!</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Here's what's happening in your platform today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats.totalUsers} color="blue" />
          <StatCard title="Teachers" value={stats.totalTeachers} color="green" />
          <StatCard title="Pending Approval" value={stats.pendingTeachers} color="orange" />
          <StatCard title="Total Quizzes" value={stats.totalQuizzes} color="purple" />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/users"
              className="bg-blue-600 text-white text-center py-4 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Manage Users
            </Link>
            <Link
              href="/admin/quizzes"
              className="bg-green-600 text-white text-center py-4 rounded-lg hover:bg-green-700 transition font-medium"
            >
              View Quizzes
            </Link>
            <Link
              href="/admin/reports"
              className="bg-purple-600 text-white text-center py-4 rounded-lg hover:bg-purple-700 transition font-medium"
            >
              Reports
            </Link>
            <Link
              href="/admin/settings"
              className="bg-gray-700 text-white text-center py-4 rounded-lg hover:bg-gray-800 transition font-medium"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
  );
}

// Helper component for stats cards
function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "blue" | "green" | "orange" | "purple";
}) {
  const colors: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className={`bg-gradient-to-r ${colors[color]} rounded-xl shadow-lg p-6 text-white text-center`}>
      <h3 className="text-lg font-medium opacity-90">{title}</h3>
      <p className="text-5xl font-bold mt-4">{value}</p>
    </div>
  );
}
