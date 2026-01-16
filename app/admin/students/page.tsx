import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

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
    async function deleteStudent(formData: FormData) {
      "use server";
      const id = String(formData.get("id") || "");
      if (!id || !ObjectId.isValid(id)) {
        redirect("/admin/students");
      }
      const client = await clientPromise;
      const db = client.db("main");
      await db.collection("users").deleteOne({ _id: new ObjectId(id), role: "user" });
      redirect("/admin/students");
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Students</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-3 gap-4 p-5 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div>Name</div>
            <div>Email</div>
            <div className="text-right">Actions</div>
          </div>
          {data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No students found</div>
          ) : (
            data.map((s) => (
              <div
                key={s._id}
                className="grid grid-cols-3 gap-4 p-5 border-b border-gray-100 last:border-none items-center text-sm"
              >
                <div className="font-medium text-gray-900">{s.name}</div>
                <div className="text-gray-700">{s.email}</div>
                <div className="flex justify-end">
                  <form action={deleteStudent}>
                    <input type="hidden" name="id" value={s._id} />
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 text-red-700 hover:bg-red-50 rounded-lg">
                      Delete
                    </button>
                  </form>
                </div>
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
