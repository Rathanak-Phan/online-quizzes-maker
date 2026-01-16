"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Trash2 } from "lucide-react";

interface Teacher {
  _id: string;
  name: string;
  email: string;
  isValidated: boolean;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/teachers", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to load teachers");
      }
      setTeachers(data.teachers || []);
    } catch (err: any) {
      setError(err.message || "Failed to load teachers");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const validateTeacher = async (id: string) => {
    try {
      const res = await fetch("/api/admin/teachers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isValidated: true }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to validate");
      }
      setTeachers((prev) => prev.map(t => t._id === id ? { ...t, isValidated: true } : t));
    } catch (err: any) {
      alert(err.message || "Failed to validate");
    }
  };

  const removeTeacher = async (id: string) => {
    if (!confirm("Remove this teacher?")) return;
    try {
      const res = await fetch("/api/admin/teachers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to remove");
      }
      setTeachers((prev) => prev.filter(t => t._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to remove");
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Teachers</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-4 gap-4 p-5 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div>Name</div>
          <div>Email</div>
          <div>Validated</div>
          <div className="text-right">Actions</div>
        </div>
        {teachers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No teachers found</div>
        ) : (
          teachers.map((t) => (
            <div key={t._id} className="grid grid-cols-4 gap-4 p-5 border-b border-gray-100 last:border-none items-center text-sm">
              <div className="font-medium text-gray-900">{t.name}</div>
              <div className="text-gray-700">{t.email}</div>
              <div className={t.isValidated ? "text-green-600 font-semibold" : "text-yellow-600 font-semibold"}>
                {t.isValidated ? "Yes" : "Pending"}
              </div>
              <div className="flex justify-end gap-2">
                {!t.isValidated && (
                  <button
                    onClick={() => validateTeacher(t._id)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-green-700 hover:bg-green-50 rounded-lg"
                    title="Validate"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Validate
                  </button>
                )}
                <button
                  onClick={() => removeTeacher(t._id)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-red-700 hover:bg-red-50 rounded-lg"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
