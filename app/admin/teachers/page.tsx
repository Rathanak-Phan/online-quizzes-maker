import clientPromise from "@/lib/mongodb";

export default async function AdminTeachersPage() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const users = db.collection("users");
    const teachers = await users
      .find({ role: "teacher" })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    const data = teachers.map((t: any) => ({
      _id: t._id.toString(),
      name: String(t.name || t.fullName || t.username || t.email || "Unknown"),
      email: String(t.email || ""),
      isValidated: Boolean(t.isValidated),
    }));

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Teachers</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-3 gap-4 p-5 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div>Name</div>
            <div>Email</div>
            <div>Validated</div>
          </div>
          {data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No teachers found</div>
          ) : (
            data.map((t) => (
              <div
                key={t._id}
                className="grid grid-cols-3 gap-4 p-5 border-b border-gray-100 last:border-none items-center text-sm"
              >
                <div className="font-medium text-gray-900">{t.name}</div>
                <div className="text-gray-700">{t.email}</div>
                <div className={t.isValidated ? "text-green-600 font-semibold" : "text-yellow-600 font-semibold"}>
                  {t.isValidated ? "Yes" : "Pending"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  } catch (err) {
    return <div className="p-6 text-red-600">Failed to load teachers</div>;
  }
}
