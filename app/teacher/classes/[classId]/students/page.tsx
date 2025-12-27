"use client";

import { Search, Mail, Award } from "lucide-react";
import { useState } from "react";

const mockStudents = [
  { id: 1, name: "Sok Piseth", email: "piseth@student.com", score: 92, completed: 8, pending: 1 },
  { id: 2, name: "Chan Dara", email: "dara@student.com", score: 88, completed: 7, pending: 2 },
  { id: 3, name: "Ly Sopheak", email: "sopheak@student.com", score: 95, completed: 9, pending: 0 },
];

export default function ClassStudents({ params }: { params: { classId: string } }) {
  const [search, setSearch] = useState("");

  const filteredStudents = mockStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Students in Class</h1>

      {/* Search & Add */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-md transition">
          Add Student
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Score</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Completed</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Pending</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.map(student => (
              <tr key={student.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold bg-gradient-to-br from-blue-500 to-blue-600">
                      {student.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{student.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {student.email}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold ${
                    student.score >= 90 ? "bg-green-100 text-green-800" :
                    student.score >= 80 ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    <Award className="w-4 h-4" />
                    {student.score}%
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-semibold text-gray-900">{student.completed}</td>
                <td className="px-6 py-4 text-center font-semibold text-orange-600">{student.pending}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:underline font-medium">View Progress</button>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
