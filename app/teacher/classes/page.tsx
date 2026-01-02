// app/teacher/classes/page.tsx (improved UX)
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
  Calendar,
  BookOpen,
  ChevronRight,
  Sparkles,
  Filter,
  Loader2,
  Eye,
  UserPlus,
  Settings,
} from "lucide-react";

interface Class {
  _id: string;
  name: string;
  code: string;
  type: "public" | "private";
  students: number;
  inviteLink?: string;
  createdAt?: string;
  subject?: string;
  schedule?: string;
}

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "public" | "private"
  >("all");
  const [showFilters, setShowFilters] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
    if (!confirm("Are you sure? This will delete the class permanently."))
      return;

    try {
      const res = await fetch(`/api/teacher/classes/${id}`, {
        method: "DELETE",
      });
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

  const filtered = classes.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = activeFilter === "all" || c.type === activeFilter;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-600/20 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-8 text-xl font-medium text-gray-700 animate-pulse">
            Loading your classes...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center px-4">
        <div className="text-center max-w-md p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">!</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h2>
          <p className="text-lg text-gray-600 mb-8">{error}</p>
          <button
            onClick={fetchClasses}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                My Classes
                {classes.length > 0 && (
                  <span className="ml-4 text-2xl lg:text-3xl text-blue-600 font-extrabold bg-blue-50 px-4 py-2 rounded-full">
                    {classes.length}
                  </span>
                )}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Manage your classes, invite students, and track progress in one
                place
              </p>
            </div>
            <Link
              href="/teacher/classes/new"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]"></div>
              <Plus className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Create Class</span>
              <ChevronRight className="w-5 h-5 relative z-10 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </Link>
          </div>
        </div>

        {/* Stats & Search Bar */}
        <div className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {classes.reduce((acc, c) => acc + c.students, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Public Classes
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {classes.filter((c) => c.type === "public").length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Lock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Private Classes
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {classes.filter((c) => c.type === "private").length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-base bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Filter by type:
                </span>
                <button
                  onClick={() => {
                    setActiveFilter("all");
                    setShowFilters(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex-1 ${
                    activeFilter === "all"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Classes
                </button>
                <button
                  onClick={() => setActiveFilter("public")}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex-1 flex items-center justify-center gap-2 ${
                    activeFilter === "public"
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Public
                </button>
                <button
                  onClick={() => setActiveFilter("private")}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex-1 flex items-center justify-center gap-2 ${
                    activeFilter === "private"
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Private
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Existing Classes */}
          {filtered.map((cls) => (
            <div
              key={cls._id}
              className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1"
              onClick={() =>
                (window.location.href = `/teacher/classes/${cls._id}`)
              }
            >
              {/* Clickable Class Content */}
              <div className="p-5">
                {/* Class Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {cls.name}
                </h3>

                {/* Class Code */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-500 font-medium">
                    Code:
                  </span>
                  <code className="text-xs font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                    {cls.code}
                  </code>
                </div>

                {/* Student Count & Schedule */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {cls.students} Student{cls.students !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {cls.schedule && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {cls.schedule}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom row with Manage Students and Privacy Badge */}
                <div className="flex items-center justify-between">
                  {/* Manage Students Button */}
                  <div
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/teacher/classes/${cls._id}/students`;
                    }}
                  >
                    <Users className="w-4 h-4" />
                    <span>Manage Students</span>
                  </div>

                  {/* Public/Private Badge - Bottom right (icon only) */}
                  <div
                    className={`ml-3 p-2 rounded-lg ${
                      cls.type === "public"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                    title={
                      cls.type === "public" ? "Public Class" : "Private Class"
                    }
                  >
                    {cls.type === "public" ? (
                      <Globe className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Top-right dropdown for essential options (no delete) */}
              <div
                className="absolute top-3 right-3 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => toggleDropdown(cls._id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>

                  {openDropdown === cls._id && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        {/* View Details */}
                        <button
                          onClick={() => {
                            setOpenDropdown(null);
                            window.location.href = `/teacher/classes/${cls._id}`;
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-gray-50 text-gray-700"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="font-medium">View Details</span>
                        </button>

                        {/* Edit Class */}
                        <Link
                          href={`/teacher/classes/${cls._id}/edit`}
                          onClick={() => setOpenDropdown(null)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="font-medium">Edit Class</span>
                        </Link>

                        {/* Copy Invite Link */}
                        {cls.inviteLink && (
                          <button
                            onClick={() => {
                              copyInviteLink(cls.inviteLink!, cls._id);
                              setOpenDropdown(null);
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-gray-50 text-gray-700"
                          >
                            {copiedId === cls._id ? (
                              <>
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-green-600">
                                  Copied!
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span className="font-medium">
                                  Copy Invite Link
                                </span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Settings (for future additional options) */}
                        <Link
                          href={`/teacher/classes/${cls._id}/settings`}
                          onClick={() => setOpenDropdown(null)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="font-medium">More Settings</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add New Class Card - Always visible */}
          <Link
            href="/teacher/classes/new"
            className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <Plus className="w-6 h-6 text-gray-500 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Add New Class
            </h3>
            <p className="text-gray-500 text-center text-sm">
              Create a new class
            </p>
          </Link>
        </div>
        
        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16 px-6">
            <div className="relative mx-auto mb-10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl opacity-40 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-white to-blue-50/50 rounded-3xl w-64 h-64 mx-auto flex flex-col items-center justify-center shadow-2xl border border-gray-200/50 backdrop-blur-sm">
                <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
                  <BookOpen className="w-20 h-20 text-blue-600" />
                </div>
                <p className="text-lg font-semibold text-gray-700">
                  No classes found
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {searchTerm || activeFilter !== "all"
                ? "No matching classes"
                : "Welcome to your classroom"}
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              {searchTerm
                ? "Try adjusting your search or filters"
                : "Create your first class to start organizing students and assignments."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {(searchTerm || activeFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setActiveFilter("all");
                    setShowFilters(false);
                  }}
                  className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  Clear Search & Filters
                </button>
              )}
              {!searchTerm && activeFilter === "all" && (
                <Link
                  href="/teacher/classes/new"
                  className="group relative inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300"></div>
                  <Sparkles className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">Create Your First Class</span>
                  <ChevronRight className="w-5 h-5 relative z-10 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Footer Stats */}
        {filtered.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-gray-500 font-medium">
                  Showing{" "}
                  <span className="font-bold text-gray-900">
                    {filtered.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-900">
                    {classes.length}
                  </span>{" "}
                  classes
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {activeFilter !== "all" &&
                    `Filtered by: ${activeFilter} classes`}
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>
                    Public: {classes.filter((c) => c.type === "public").length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>
                    Private:{" "}
                    {classes.filter((c) => c.type === "private").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
