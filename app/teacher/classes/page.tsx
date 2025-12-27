"use client";

import Link from "next/link";
import { Plus, Search, Users, FileText, Award, Clock, MoreVertical, Edit3, UserPlus, FilePlus } from "lucide-react";
import { useState } from "react";

const mockClasses = [
  { id: 1, name: "Mathematics Grade 10A", type: "private", students: 38, quizzes: 8, avgScore: 85, completion: 91 },
  { id: 2, name: "Science 9B", type: "public", students: 32, quizzes: 5, avgScore: 78, completion: 88 },
  { id: 3, name: "English Advanced", type: "private", students: 45, quizzes: 12, avgScore: 89, completion: 94 },
  { id: 4, name: "History Grade 11", type: "public", students: 29, quizzes: 6, avgScore: 82, completion: 87 },
];

export default function ClassesPage() {
  const [search, setSearch] = useState("");

  const filtered = mockClasses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600 mt-1">Manage your classes and students</p>
        </div>
        <Link
          href="/teacher/classes/new"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          New Class
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>

      {/* Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filtered.map((cls) => (
          <Link
            key={cls.id}
            href={`/teacher/classes/${cls.id}`}
            className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-transform hover:-translate-y-1"
          >
            {/* More actions button */}
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
              {/* Quick Actions */}
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Edit3 className="w-5 h-5 text-gray-600" title="Edit Class" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <UserPlus className="w-5 h-5 text-green-600" title="Add Students" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <FilePlus className="w-5 h-5 text-purple-600" title="Create Quiz" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <MoreVertical className="w-5 h-5 text-gray-500" title="More Options" />
              </button>
            </div>

            {/* Title & Badge */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700">{cls.name}</h3>
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                cls.type === "public" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}>
                {cls.type === "public" ? "Public" : "Private"}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Stat icon={Users} label="Students" value={cls.students} color="blue" />
              <Stat icon={FileText} label="Quizzes" value={cls.quizzes} color="purple" />
              <Stat icon={Award} label="Avg Score" value={`${cls.avgScore}%`} color="orange" />
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <div className="w-full h-2 rounded-full bg-gray-200 mt-1">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: `${cls.completion}%` }} />
                </div>
                <p className="text-sm text-gray-600 mt-1">{cls.completion}%</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */
function Stat({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  };

  return (
    <div className="flex items-center gap-3">
      <Icon className={`w-6 h-6 ${colors[color]}`} />
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}
