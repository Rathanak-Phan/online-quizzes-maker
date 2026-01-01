// app/teacher/classes/page.tsx (updated with better UI and CRUD integration)
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Users,
  Globe,
  Lock,
  Copy,
  Edit3,
  Trash2,
  MoreVertical,
  Check,
} from "lucide-react";

interface Class {
  _id: string;
  name: string;
  code: string;
  type: "public" | "private";
  students: number;
  inviteLink?: string;
}

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/teacher/classes");
      if (!res.ok) throw new Error("Failed to load classes");

      const data = await res.json();
      setClasses(data.classes || []);
    } catch (err) {
      setError("Failed to load classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (id: string) => {
    if (!confirm("Are you sure? This will delete the class permanently.")) return;

    try {
      const res = await fetch(`/api/teacher/classes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setClasses(classes.filter((c) => c._id !== id));
        setOpenDropdown(null);
      } else {
        alert("Failed to delete class");
      }
    } catch (err) {
      alert("Error deleting class");
    }
  };

  const copyInviteLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const filtered = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-gray-600">Loading classes...</p>
        </div>
    </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-lg text-gray-600 mb-8">{error}</p>
          <button
            onClick={fetchClasses}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Classes
          </h1>
          <p className="text-xl text-gray-600">Manage your classes and students</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 text-lg bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <Link
            href="/teacher/classes/new"
            className="flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-7 h-7" />
            Create Class
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((cls) => (
            <div
              key={cls._id}
              className="group relative bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {cls.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-3">
                      <code className="text-lg font-mono font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                        {cls.code}
                      </code>
                    </div>
                  </div>

                  <div className={`px-5 py-2 rounded-full font-semibold text-sm flex items-center gap-2 ${
                    cls.type === "public"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {cls.type === "public" ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    {cls.type.charAt(0).toUpperCase() + cls.type.slice(1)}
                  </div>
                </div>

                <div className="flex items-center gap-5 mb-10 py-6 border-y border-gray-100">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-4xl font-extrabold text-gray-900">{cls.students}</p>
                    <p className="text-gray-600 font-medium">Students</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Link
                      href={`/teacher/classes/${cls._id}`}
                      className="px-7 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-md"
                    >
                      View Class
                    </Link>
                    {cls.inviteLink && (
                      <button
                        onClick={() => copyInviteLink(cls.inviteLink!, cls._id)}
                        className="flex items-center gap-3 px-6 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
                      >
                        {copiedId === cls._id ? (
                          <>
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5 text-gray-600" />
                            Copy Link
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => toggleDropdown(cls._id)}
                      className="p-3 rounded-xl hover:bg-gray-100 transition"
                      aria-label="More options"
                    >
                      <MoreVertical className="w-6 h-6 text-gray-600" />
                    </button>

                    {openDropdown === cls._id && (
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="py-2">
                          <Link
                            href={`/teacher/classes/${cls._id}/edit`}
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 text-gray-800 transition"
                          >
                            <Edit3 className="w-5 h-5" />
                            <div>
                              <p className="font-medium">Edit Class</p>
                            </div>
                          </Link>
                          <button
                            onClick={() => deleteClass(cls._id)}
                            className="flex w-full items-center gap-4 px-6 py-4 hover:bg-red-50 text-red-600 transition"
                          >
                            <Trash2 className="w-5 h-5" />
                            <div className="text-left">
                              <p className="font-medium">Delete Class</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 px-6">
            <div className="w-64 h-64 mx-auto mb-10 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-40"></div>
              <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-full h-full flex items-center justify-center shadow-2xl">
                <Users className="w-32 h-32 text-blue-600" />
              </div>
            </div>

            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
              {searchTerm ? "No classes found" : "No classes yet"}
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              {searchTerm
                ? "Try adjusting your search"
                : "Create your first class to get started."}
            </p>

            {!searchTerm && (
              <Link
                href="/teacher/classes/new"
                className="inline-flex items-center gap-5 px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300"
              >
                <Plus className="w-10 h-10" />
                Create First Class
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}