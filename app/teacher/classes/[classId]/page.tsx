"use client";

import { Plus, Search, Users, FileText, Award, Clock, Edit3, UserPlus, FilePlus } from "lucide-react";
import { useState, useRef } from "react";

const mockClass = {
  id: 1,
  name: "Mathematics Grade 10A",
  type: "private",
  students: [
    { id: 1, name: "Vibol", avgScore: 92, completion: 100 },
    { id: 2, name: "Rathana", avgScore: 78, completion: 80 },
    { id: 3, name: "Sopheap", avgScore: 85, completion: 90 },
    { id: 4, name: "Chan", avgScore: 88, completion: 95 },
  ],
  quizzes: [
    { id: 1, title: "Algebra Test", averageScore: 82 },
    { id: 2, title: "Geometry Quiz", averageScore: 88 },
  ],
};

export default function ClassDetailPage() {
  const [search, setSearch] = useState("");
  const studentsRef = useRef<HTMLDivElement>(null);

  const filteredStudents = mockClass.students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Scroll to students section
  const scrollToStudents = () => {
    studentsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{mockClass.name}</h1>
          <p className="text-gray-600 mt-1">{mockClass.type === "public" ? "Public Class" : "Private Class"}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition">
            <Edit3 className="w-5 h-5" /> Edit Class
          </button>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition">
            <UserPlus className="w-5 h-5" /> Add Students
          </button>
          <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition">
            <FilePlus className="w-5 h-5" /> Create Quiz
          </button>
        </div>
      </div>

      {/* Class Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="Total Students" 
          value={mockClass.students.length} 
          icon={Users} 
          color="blue" 
          onClick={scrollToStudents} 
        />
        <StatCard label="Quizzes" value={mockClass.quizzes.length} icon={FileText} color="purple" />
        <StatCard
          label="Average Score"
          value={`${Math.round(mockClass.students.reduce((a, s) => a + s.avgScore, 0) / mockClass.students.length)}%`}
          icon={Award}
          color="orange"
        />
        <StatCard
          label="Average Completion"
          value={`${Math.round(mockClass.students.reduce((a, s) => a + s.completion, 0) / mockClass.students.length)}%`}
          icon={Clock}
          color="green"
        />
      </div>

      {/* Students Table */}
      <div ref={studentsRef} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Students</h2>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full table-auto border-collapse mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Avg Score</th>
              <th className="text-left px-4 py-2">Completion</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-2">{s.name}</td>
                <td className="px-4 py-2 font-bold">{s.avgScore}%</td>
                <td className="px-4 py-2">
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: `${s.completion}%` }} />
                  </div>
                  <span className="text-sm text-gray-600">{s.completion}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */
function StatCard({ label, value, icon: Icon, color, onClick }: any) {
  const colors: any = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    green: "text-green-600",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer`}
    >
      <Icon className={`w-8 h-8 ${colors[color]}`} />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
