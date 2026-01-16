import clientPromise from "@/lib/mongodb";

export default async function AdminStudentsPage() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const users = db.collection("users");
    const students = await users
      .find({ role: "user" })
      .sort({ createdAt: -1 })
      .limit(300)
      .toArray();

    const data = students.map((s: any) => ({
      _id: s._id.toString(),
      name: String(s.name || s.fullName || s.username || s.email || "Unknown"),
      email: String(s.email || ""),
    }));

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Students</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-2 gap-4 p-5 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div>Name</div>
            <div>Email</div>
          </div>
          {data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No students found</div>
          ) : (
            data.map((s) => (
              <div
                key={s._id}
                className="grid grid-cols-2 gap-4 p-5 border-b border-gray-100 last:border-none items-center text-sm"
              >
                <div className="font-medium text-gray-900">{s.name}</div>
                <div className="text-gray-700">{s.email}</div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  } catch (err) {
    return <div className="p-6 text-red-600">Failed to load students</div>;
  }
}
