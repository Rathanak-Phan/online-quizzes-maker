// app/admin/quizzes/page.tsx
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function getAllQuizzes() {
  const client = await clientPromise;
  const db = client.db('online-quizzes');
  const quizzes = await db.collection('quizzes').aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'teacherId',
        foreignField: '_id',
        as: 'teacher'
      }
    },
    { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        title: 1,
        category: 1,
        questions: 1,
        createdAt: 1,
        teacherName: { $ifNull: ['$teacher.name', 'Unknown'] }
      }
    }
  ]).toArray();

  return quizzes;
}

async function deleteQuiz(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;

  const client = await clientPromise;
  const db = client.db('online-quizzes');
  await db.collection('quizzes').deleteOne({ _id: new ObjectId(id) });
}

export default async function QuizzesPage() {
  const quizzes = await getAllQuizzes();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Quiz Management</h1>
          <p className="text-xl text-gray-600 mt-2">
            View, edit, and manage all quizzes on the platform ({quizzes.length} total)
          </p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Create New Quiz
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium opacity-90">Total Quizzes</h3>
          <p className="text-4xl font-bold mt-3">{quizzes.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium opacity-90">Categories</h3>
          <p className="text-4xl font-bold mt-3">
            {new Set(quizzes.map(q => q.category)).size}
          </p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium opacity-90">Total Questions</h3>
          <p className="text-4xl font-bold mt-3">
            {quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0)}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search quizzes by title or category..."
          className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Quiz List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Questions</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Teacher</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No quizzes found. Create the first one!
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz: any) => (
                  <tr key={quiz._id.toString()} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{quiz.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {quiz.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{quiz.questions?.length || 0}</td>
                    <td className="px-6 py-4 text-gray-700">{quiz.teacherName}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                        <button className="text-green-600 hover:text-green-800 font-medium">Edit</button>
                        <form action={deleteQuiz} className="inline">
                          <input type="hidden" name="id" value={quiz._id.toString()} />
                          <button type="submit" className="text-red-600 hover:text-red-800 font-medium">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}