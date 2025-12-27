"use client";

import { Award, Users, Clock, TrendingUp } from "lucide-react";

const mockTopPerformers = [
  { id: 1, name: "Sok Piseth", score: 98 },
  { id: 2, name: "Ly Sopheak", score: 95 },
  { id: 3, name: "Chan Dara", score: 93 },
  { id: 4, name: "Vibol", score: 90 },
  { id: 5, name: "Rathana", score: 88 },
];

export default function QuizResultsPage() {
  const classAverage = 87;
  const completed = "34/38";
  const avgTime = 18; // in minutes

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-0 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Quiz Results & Analytics</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard icon={Award} value={`${classAverage}%`} label="Class Average" color="blue" />
        <StatCard icon={Users} value={completed} label="Completed" color="green" />
        <StatCard icon={Clock} value={`${avgTime} min`} label="Avg Time" color="purple" />
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold mb-6">Top Performers</h2>

        <div className="space-y-4">
          {mockTopPerformers.map((student, i) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl font-bold text-white text-lg ${
                    i === 0
                      ? "bg-yellow-400"
                      : i === 1
                      ? "bg-gray-400"
                      : i === 2
                      ? "bg-orange-500"
                      : "bg-blue-500"
                  }`}
                >
                  {i + 1}
                </div>
                <p className="font-semibold text-lg">{student.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="font-bold">{student.score}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* All Students Progress */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">All Students Progress</h3>
          <div className="space-y-3">
            {mockTopPerformers.map((student) => (
              <div key={student.id}>
                <div className="flex justify-between mb-1">
                  <p className="text-gray-700 font-medium">{student.name}</p>
                  <p className="text-gray-700 font-medium">{student.score}%</p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full bg-green-500 transition-all"
                    style={{ width: `${student.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */
function StatCard({ icon: Icon, value, label, color }: any) {
  const colors: any = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };

  return (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-3xl p-8 text-center`}>
      <Icon className={`w-16 h-16 mx-auto mb-4 ${colors[color]}`} />
      <p className={`text-5xl font-bold text-${color}-700`}>{value}</p>
      <p className="text-gray-700 mt-2">{label}</p>
    </div>
  );
}
