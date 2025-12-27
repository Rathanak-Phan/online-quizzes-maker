"use client";

import {
  Trophy,
  Clock,
  Users,
  Plus,
  Flame,
} from "lucide-react";

/* ================= MOCK DATA ================= */

const challenges = [
  {
    id: 1,
    title: "Weekly Math Challenge",
    participants: 42,
    endsIn: "2 days",
    status: "active",
  },
  {
    id: 2,
    title: "JavaScript Speed Quiz",
    participants: 30,
    endsIn: "Starts tomorrow",
    status: "upcoming",
  },
  {
    id: 3,
    title: "Database Fundamentals",
    participants: 55,
    endsIn: "Ended",
    status: "ended",
  },
];

export default function ChallengesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-0">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Challenges & Leaderboards
          </h1>
          <p className="text-gray-500 mt-2">
            Create timed competitions to boost student engagement.
          </p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition">
          <Plus className="w-5 h-5" />
          Create New Challenge
        </button>
      </div>

      {/* ================= HIGHLIGHT SECTION ================= */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-8 mb-14">
        <Trophy className="w-20 h-20 text-yellow-500" />

        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">
            Gamify Learning 🎯
          </h2>
          <p className="text-gray-700">
            Challenges motivate students through friendly competition,
            improving participation and performance.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Stat icon={Flame} value="3" label="Active Challenges" />
          <Stat icon={Users} value="127" label="Participants" />
        </div>
      </div>

      {/* ================= CHALLENGE LIST ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {challenges.map((c) => (
          <div
            key={c.id}
            className="bg-white border rounded-3xl p-8 shadow-sm hover:shadow-md transition"
          >
            {/* Status Badge */}
            <span
              className={`inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full
                ${
                  c.status === "active"
                    ? "bg-green-100 text-green-700"
                    : c.status === "upcoming"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
                }`}
            >
              {c.status.toUpperCase()}
            </span>

            <h3 className="text-xl font-bold mb-4">
              {c.title}
            </h3>

            <div className="flex items-center justify-between mb-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{c.participants} students</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{c.endsIn}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
                View
              </button>

              {c.status === "active" && (
                <button className="flex-1 py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-medium">
                  Leaderboard
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */

function Stat({ icon: Icon, value, label }: any) {
  return (
    <div className="text-center">
      <Icon className="w-8 h-8 text-orange-600 mx-auto mb-1" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
