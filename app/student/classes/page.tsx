"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Users,
  Globe,
  Lock,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ClassType = "public" | "private";

interface StudentClass {
  _id: string;
  name: string;
  code: string;
  type: ClassType;
  students: number;
  inviteLink?: string;
  subject?: string;
  schedule?: string;
}

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ClassType>("all");
  const [adding, setAdding] = useState(false);
  const [addCode, setAddCode] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const router = useRouter();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const url =
        typeFilter === "all"
          ? "/api/student/classes"
          : `/api/student/classes?type=${typeFilter}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error: ${res.status}`);
      }
      const data = await res.json();
      setClasses(data.classes || []);
    } catch (err: any) {
      setError(err.message || "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [typeFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [classes, query]);

  const handleAddClass = async () => {
    setAddError(null);
    setAddSuccess(null);
    const code = addCode.trim();
    if (!code) {
      setAddError("Please enter a class code");
      return;
    }
    try {
      setAdding(true);
      const res = await fetch("/api/student/classes/addclass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to add class");
      }
      setAddSuccess("Class added");
      setAddCode("");
      await fetchClasses();
    } catch (err: any) {
      setAddError(err.message || "Failed to add class");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full pt-24">
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search classes by name or code..."
                className="w-full py-4 pl-12 pr-4 bg-white rounded-2xl border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="ml-4 flex items-center gap-3">
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-50"
                onClick={() =>
                  setTypeFilter((prev) =>
                    prev === "all" ? "public" : prev === "public" ? "private" : "all"
                  )
                }
                aria-label="Filter"
              >
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Filter</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {typeFilter}
                </span>
              </button>
            </div>
            <div className="relative">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={addCode}
                  onChange={(e) => setAddCode(e.target.value)}
                  placeholder="Enter class code"
                  className="w-48 py-3 px-3 bg-white rounded-2xl border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
                <button
                  className="px-4 py-3 bg-blue-600 text-white rounded-2xl shadow-sm hover:bg-blue-700 disabled:opacity-60"
                  onClick={handleAddClass}
                  disabled={adding}
                >
                  {adding ? "Adding..." : "Add Class"}
                </button>
              </div>
              {addError && (
                <p className="text-sm text-red-600 mt-2">{addError}</p>
              )}
              {addSuccess && (
                <p className="text-sm text-green-700 mt-2">{addSuccess}</p>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading classes...</div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-600">No classes found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cls) => (
              <div
                key={cls._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {cls.name}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-gray-600">Code:</span>
                        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs font-semibold">
                          {cls.code}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{cls.students} Students</span>
                      </div>
                    </div>
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700"
                      aria-label="More options"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <Link
                      href={`/student/classes/${cls._id}`}
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    >
                      <Users className="w-5 h-5" />
                      Manage Students
                    </Link>
                    <a
                      href={cls.inviteLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        cls.type === "public"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                      title={cls.type === "public" ? "Public class" : "Private class"}
                    >
                      {cls.type === "public" ? (
                        <Globe className="w-5 h-5" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
