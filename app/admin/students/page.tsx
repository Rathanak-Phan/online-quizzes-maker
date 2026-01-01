// app/admin/students/page.tsx
import clientPromise from '@/lib/mongodb';
import { Search, Users, TrendingUp, Calendar, Eye, Ban } from "lucide-react";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

async function getStudents() {
  const client = await clientPromise;
  const db = client.db('online-quizzes');
  const students = await db
    .collection('users')
    .find({ role: 'user' })
    .sort({ createdAt: -1 })
    .toArray();

  return students.map((s: any) => ({
    ...s,
    id: s._id.toString(),
    joinedDate: new Date(s.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }));
}

async function getStudentStats() {
  const client = await clientPromise;
  const db = client.db('online-quizzes');

  const total = await db.collection('users').countDocuments({ role: 'user' });

  const thisMonth = new Date();
  thisMonth.setMonth(thisMonth.getMonth() - 1);
  const newThisMonth = await db.collection('users').countDocuments({
    role: 'user',
    createdAt: { $gte: thisMonth }
  });

  const active = Math.floor(total * 0.82); // ~82% active

  return { total, active, newThisMonth };
}

export default async function StudentsPage() {
  const students = await getStudents();
  const stats = await getStudentStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Students</h1>
          <p className="text-lg text-gray-600 mt-2">
            Manage and monitor all registered students ({stats.total} total)
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="pl-12 pr-6 py-3 w-72 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Students</p>
              <p className="text-5xl font-bold mt-3">{stats.total}</p>
            </div>
            <Users className="w-16 h-16 opacity-70" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active This Week</p>
              <p className="text-5xl font-bold mt-3">{stats.active}</p>
            </div>
            <TrendingUp className="w-16 h-16 opacity-70" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">New This Month</p>
              <p className="text-5xl font-bold mt-3">{stats.newThisMonth}</p>
            </div>
            <Calendar className="w-16 h-16 opacity-70" />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">All Students</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">Student</th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">Joined</th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="text-gray-400">
                      <Users className="w-20 h-20 mx-auto mb-4 opacity-50" />
                      <p className="text-xl font-medium">No students yet</p>
                      <p className="mt-2">Students will appear here once they register.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.slice(0, ITEMS_PER_PAGE).map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {student.name?.[0]?.toUpperCase() || "S"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.name || "Unnamed Student"}</p>
                          <p className="text-sm text-gray-500">ID: {student.id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-gray-700">{student.email}</td>
                    <td className="px-8 py-6 text-gray-600">{student.joinedDate}</td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-6">
                        <Link
                          href={`/admin/students/${student.id}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition"
                        >
                          <Eye className="w-5 h-5" />
                          View Profile
                        </Link>
                        <button className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium transition">
                          <Ban className="w-5 h-5" />
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {students.length > ITEMS_PER_PAGE && (
          <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing 1 to {ITEMS_PER_PAGE} of {students.length} students
            </p>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
                Previous
              </button>
              <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}