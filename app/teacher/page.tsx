"use client";

import { Users, School, FileText, Trophy, Clock, Award } from "lucide-react";
import Link from "next/link";

const stats = [
  { title: "Total Classes", value: "12", icon: School, color: "bg-blue-100 text-blue-600" },
  { title: "Total Students", value: "348", icon: Users, color: "bg-green-100 text-green-600" },
  { title: "Active Quizzes", value: "8", icon: FileText, color: "bg-purple-100 text-purple-600" },
  { title: "Pending Reviews", value: "15", icon: Clock, color: "bg-yellow-100 text-yellow-600" },
  { title: "Total Challenges", value: "4", icon: Trophy, color: "bg-pink-100 text-pink-600" },
  { title: "Avg. Completion Rate", value: "92%", icon: Award, color: "bg-orange-100 text-orange-600" },
];

const recentClasses = [
  { initials: "M10", name: "Math Grade 10A", teacher: "You", status: "Active" },
  { initials: "S9", name: "Science 9B", teacher: "You", status: "Active" },
  { initials: "E11", name: "English 11", teacher: "You", status: "Active" },
];

export default function TeacherDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Pastel Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600 mt-2">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Class Management Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">My Classes</h2>
          <Link href="/teacher/classes/new" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            + New Class
          </Link>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">CLASS</th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">STUDENTS</th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">STATUS</th>
              <th className="px-8 py-4 text-right text-sm font-semibold text-gray-700">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentClasses.map((cls) => (
              <tr key={cls.name} className="hover:bg-gray-50">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                      {cls.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cls.name}</p>
                      <p className="text-sm text-gray-500">Managed by {cls.teacher}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-gray-700">32 students</td>
                <td className="px-8 py-6">
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {cls.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <Link href={`/teacher/classes/${cls.initials.toLowerCase()}`} className="text-blue-600 hover:underline mr-4">
                    View
                  </Link>
                  <button className="text-gray-400 hover:text-gray-600">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}