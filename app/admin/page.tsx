// app/admin/page.tsx
import clientPromise from '@/lib/mongodb';
import Link from "next/link";

// ✅ ADD THESE TWO LINES (VERY IMPORTANT)
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getStats() {
  const client = await clientPromise;
  const db = client.db('online-quizzes');

  const totalUsers = await db.collection('users').countDocuments();
  const totalTeachers = await db.collection('users').countDocuments({ role: 'teacher' });
  const pendingTeachers = await db.collection('users').countDocuments({
    role: 'teacher',
    isValidated: false
  });
  const totalQuizzes = await db.collection('quizzes').countDocuments();

  return { totalUsers, totalTeachers, pendingTeachers, totalQuizzes };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome back, Admin!
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Here's what's happening in your platform today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium opacity-90">Total Users</h3>
          <p className="text-5xl font-bold mt-4">{stats.totalUsers}</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium opacity-90">Teachers</h3>
          <p className="text-5xl font-bold mt-4">{stats.totalTeachers}</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium opacity-90">Pending Approval</h3>
          <p className="text-5xl font-bold mt-4">{stats.pendingTeachers}</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium opacity-90">Total Quizzes</h3>
          <p className="text-5xl font-bold mt-4">{stats.totalQuizzes}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/users" className="bg-blue-600 text-white text-center py-4 rounded-lg hover:bg-blue-700 transition font-medium">
            Manage Users
          </Link>
          <Link href="/admin/quizzes" className="bg-green-600 text-white text-center py-4 rounded-lg hover:bg-green-700 transition font-medium">
            View Quizzes
          </Link>
          <Link href="/admin/reports" className="bg-purple-600 text-white text-center py-4 rounded-lg hover:bg-purple-700 transition font-medium">
            Reports
          </Link>
          <Link href="/admin/settings" className="bg-gray-700 text-white text-center py-4 rounded-lg hover:bg-gray-800 transition font-medium">
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
