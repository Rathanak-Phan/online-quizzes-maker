"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/students", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to load students");
      }
      setStudents(data.students || []);
    } catch (err: any) {
      setError(err.message || "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const addStudent = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to add student");
      }
      setForm({ name: "", email: "" });
      setStudents((prev) => [data.student, ...prev]);
    } catch (err: any) {
      alert(err.message || "Failed to add student");
    } finally {
      setSaving(false);
    }
  };

  const updateStudent = async (id: string, fields: Partial<Student>) => {
    try {
      const res = await fetch("/api/admin/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...fields }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to update student");
      }
      setStudents((prev) => prev.map(s => s._id === id ? { ...s, ...fields } : s));
    } catch (err: any) {
      alert(err.message || "Failed to update student");
    }
  };

  const deleteStudent = async (id: string) => {
    if (!confirm("Delete this student?")) return;
    try {
      const res = await fetch("/api/admin/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to delete");
      }
      setStudents((prev) => prev.filter(s => s._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete student");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Students</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Student</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={addStudent}
            disabled={saving || !form.name || !form.email}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-3 gap-4 p-5 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div>Name</div>
          <div>Email</div>
          <div className="text-right">Actions</div>
        </div>
        {students.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No students found</div>
        ) : (
          students.map((s) => (
            <div key={s._id} className="grid grid-cols-3 gap-4 p-5 border-b border-gray-100 last:border-none items-center text-sm">
              <input
                className="font-medium text-gray-900 bg-transparent outline-none"
                value={s.name}
                onChange={(e) => updateStudent(s._id, { name: e.target.value })}
              />
              <input
                className="text-gray-700 bg-transparent outline-none"
                value={s.email}
                onChange={(e) => updateStudent(s._id, { email: e.target.value })}
              />
              <div className="flex justify-end">
                <button
                  onClick={() => deleteStudent(s._id)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
