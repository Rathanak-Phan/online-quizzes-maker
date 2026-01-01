// app/admin/users/page.tsx
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function getAllUsers() {
  const client = await clientPromise;
  const db = client.db('online-quizzes');
  return await db.collection('users').find({}).toArray();
}

async function approveTeacher(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;

  try {
    const client = await clientPromise;
    const db = client.db('online-quizzes');
    
    // Use ObjectId directly, not $oid
    await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isValidated: true } }
    );
    
    // Revalidate the page to show updated data
    // revalidatePath('/admin/users');
  } catch (error) {
    console.error('Error approving teacher:', error);
    throw error;
  }
}

export default async function UsersPage() {
  const users = await getAllUsers();

  const pendingTeachers = users.filter(u => u.role === 'teacher' && !u.isValidated);
  const approvedTeachers = users.filter(u => u.role === 'teacher' && u.isValidated);
  const students = users.filter(u => u.role === 'user');

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">User Management</h1>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Pending Teacher Approvals ({pendingTeachers.length})</h2>
        {pendingTeachers.length === 0 ? (
          <p className="text-gray-500">No pending approvals</p>
        ) : (
          <div className="space-y-4">
            {pendingTeachers.map((teacher: any) => (
              <div key={teacher._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{teacher.name}</p>
                  <p className="text-gray-600">{teacher.email}</p>
                </div>
                <form action={approveTeacher}>
                  <input type="hidden" name="id" value={teacher._id.toString()} />
                  <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                    Approve
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold mb-4">Students ({students.length})</h3>
          <ul className="space-y-2">
            {students.slice(0, 10).map((s: any) => (
              <li key={s._id} className="text-gray-700">{s.name} ({s.email})</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold mb-4">Approved Teachers ({approvedTeachers.length})</h3>
          <ul className="space-y-2">
            {approvedTeachers.map((t: any) => (
              <li key={t._id} className="text-gray-700">{t.name}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold mb-4">Platform Stats</h3>
          <p>Total Users: {users.length}</p>
          <p>Teachers: {approvedTeachers.length + pendingTeachers.length}</p>
          <p>Students: {students.length}</p>
        </div>
      </div>
    </div>
  );
}