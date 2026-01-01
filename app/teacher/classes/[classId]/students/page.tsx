// app/teacher/classes/[classId]/students/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, Mail, UserPlus, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";

interface Student {
  _id: string;
  name: string;
  email: string;
  joinedAt: string;
  quizzesCompleted: number;
  avgScore: number;
}

export default function ClassStudentsPage() {
  const { classId } = useParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/students`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      alert("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-20">Loading students...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href={`/teacher/classes/${classId}`} className="inline-flex items-center gap-2 text-blue-600 mb-6">
        ← Back to Class
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Students ({students.length})</h1>
        <button className="flex items-center gap-3 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">
          <UserPlus className="w-5 h-5" />
          Invite Students
        </button>
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-5 py-3 border rounded-xl bg-gray-50"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-6 font-medium text-gray-700">Name</th>
              <th className="text-left p-6 font-medium text-gray-700">Email</th>
              <th className="text-left p-6 font-medium text-gray-700">Joined</th>
              <th className="text-left p-6 font-medium text-gray-700">Quizzes</th>
              <th className="text-left p-6 font-medium text-gray-700">Avg Score</th>
              <th className="p-6"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student._id} className="border-b hover:bg-gray-50">
                <td className="p-6 font-medium">{student.name}</td>
                <td className="p-6 text-gray-600">{student.email}</td>
                <td className="p-6 text-gray-600">{new Date(student.joinedAt).toLocaleDateString()}</td>
                <td className="p-6">{student.quizzesCompleted}</td>
                <td className="p-6 font-medium text-green-600">{student.avgScore}%</td>
                <td className="p-6">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}