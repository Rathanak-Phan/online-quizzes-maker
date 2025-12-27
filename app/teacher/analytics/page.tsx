"use client";

import {
  BarChart3,
  TrendingUp,
  Users,
  AlertCircle,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

/* ================= MOCK DATA ================= */

const classes = ["All Classes", "Web Development", "Database Systems"];

const completionData = [
  { week: "W1", rate: 65 },
  { week: "W2", rate: 70 },
  { week: "W3", rate: 75 },
  { week: "W4", rate: 78 },
];

const studentsAtRisk = [
  {
    id: 1,
    name: "Vibol Sok",
    issue: "Low average score (62%)",
    email: "vibol@student.com",
    avgScore: 62,
    pending: 2,
  },
  {
    id: 2,
    name: "Rathana Lim",
    issue: "3 quizzes pending",
    email: "rathana@student.com",
    avgScore: 71,
    pending: 3,
  },
];

export default function AnalyticsPage() {
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [activeStudent, setActiveStudent] =
    useState<(typeof studentsAtRisk)[0] | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-0">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics & Student Engagement
          </h1>
          <p className="text-gray-500 mt-2">
            Monitor performance and identify learning risks early.
          </p>
        </div>

        {/* Class Filter */}
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full lg:w-64 border rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-blue-500"
        >
          {classes.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* ================= KPI ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <KPI
          icon={TrendingUp}
          label="Avg Completion Rate"
          value="78%"
          color="green"
        />
        <KPI
          icon={Users}
          label="Active Students"
          value="124"
          color="blue"
        />
        <KPI
          icon={BarChart3}
          label="Quizzes Created"
          value="18"
          color="purple"
        />
      </div>

      {/* ================= MAIN ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="bg-white rounded-3xl border p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">
            Completion Rate Trend
          </h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionData}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="rate"
                  strokeWidth={3}
                  stroke="#2563eb"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Students at Risk */}
        <div className="bg-white rounded-3xl border p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            Students Needing Attention
          </h2>

          <ul className="space-y-4">
            {studentsAtRisk.map((s) => (
              <li
                key={s.id}
                className="p-4 bg-orange-50 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-orange-700">{s.issue}</p>
                </div>

                <button
                  onClick={() => setActiveStudent(s)}
                  className="text-sm text-orange-600 hover:underline"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ================= STUDENT MODAL ================= */}
      {activeStudent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setActiveStudent(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold mb-4">
              {activeStudent.name}
            </h3>

            <div className="space-y-3 text-sm">
              <Info label="Email" value={activeStudent.email} />
              <Info
                label="Average Score"
                value={`${activeStudent.avgScore}%`}
              />
              <Info
                label="Pending Quizzes"
                value={activeStudent.pending.toString()}
              />
            </div>

            <button className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              Message Student
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function KPI({
  icon: Icon,
  label,
  value,
  color,
}: any) {
  const colors: any = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white border rounded-2xl p-6 flex items-center gap-4 shadow-sm">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function Info({ label, value }: any) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
