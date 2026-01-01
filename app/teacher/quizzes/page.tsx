// app/teacher/quizzes/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreVertical,
  FileText,
  Users,
  Trophy,
  Clock,
  Edit3,
  Copy,
  Trash2,
} from "lucide-react";

interface Quiz {
  _id: string;
  title: string;
  category: string;
  questions: number;
  classes: number;
  avgScore: number | null;
  status: "active" | "completed" | "draft";
  lastUsed: string;
}

export default function QuizzesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("Please log in");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      if (user.role !== "teacher") {
        setError("Access denied");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/teacher/quizzes");
      if (!res.ok) throw new Error("Failed to load quizzes");

      const data = await res.json();
      setQuizzes(data.quizzes || []);

    } catch (err) {
      console.error("Error loading quizzes:", err);
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      quiz.status === filterStatus ||
      (filterStatus === "draft" && quiz.avgScore === null);
    return matchesSearch && matchesFilter;
  });

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm("Delete this quiz permanently? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/teacher/quizzes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setQuizzes(quizzes.filter((q) => q._id !== id));
        setOpenDropdown(null);
      } else {
        alert("Failed to delete quiz");
      }
    } catch (err) {
      alert("Error deleting quiz");
    }
  };

  const duplicateQuiz = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/quizzes/${id}`);
      if (!res.ok) throw new Error("Failed to fetch quiz");

      const original = await res.json();

      const duplicate = {
        title: `${original.title} (Copy)`,
        description: original.description || "",
        timeLimit: original.timeLimit,
        questions: original.questions,
        category: original.category,
      };

      const createRes = await fetch("/api/teacher/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicate),
      });

      if (createRes.ok) {
        fetchQuizzes();
        setOpenDropdown(null);
      } else {
        alert("Failed to duplicate quiz");
      }
    } catch (err) {
      alert("Error duplicating quiz");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-32 text-center">
        <div className="text-2xl text-gray-600">Loading your quizzes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-32 text-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Quizzes</h1>
        <p className="text-gray-600">Create, manage, and assign quizzes to your classes</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or category..."
                className="w-full pl-11 pr-5 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-5 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex gap-4">
            <Link
              href="/teacher/quizzes/templates"
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition"
            >
              Use Template
            </Link>
            <Link
              href="/teacher/quizzes/new"
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              New Quiz
            </Link>
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group relative"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-8">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{quiz.category}</p>
                </div>

                {/* More Button + Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => toggleDropdown(quiz._id)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition opacity-70 hover:opacity-100"
                    aria-label="Quiz actions"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Dropdown */}
                  {openDropdown === quiz._id && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                      <div className="py-2">
                        <Link
                          href={`/teacher/quizzes/${quiz._id}/edit`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Quiz
                        </Link>
                        <button
                          onClick={() => duplicateQuiz(quiz._id)}
                          className="flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-left transition"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate Quiz
                        </button>
                        <button
                          onClick={() => deleteQuiz(quiz._id)}
                          className="flex w-full items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 text-left transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Quiz
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    Questions
                  </span>
                  <span className="font-semibold">{quiz.questions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    Assigned Classes
                  </span>
                  <span className="font-semibold">{quiz.classes}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    Last Used
                  </span>
                  <span className="font-semibold text-gray-500">{quiz.lastUsed}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                {quiz.avgScore !== null ? (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-600">{quiz.avgScore}% avg</span>
                  </div>
                ) : (
                  <span className="px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Draft
                  </span>
                )}

                <Link
                  href={`/teacher/quizzes/${quiz._id}/results`}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredQuizzes.length === 0 && (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <FileText className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            {searchTerm || filterStatus !== "all" ? "No quizzes match your search" : "No quizzes yet"}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search term or filters"
              : "Get started by creating your first quiz"}
          </p>
          <Link
            href="/teacher/quizzes/new"
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105"
          >
            <Plus className="w-6 h-6" />
            Create Your First Quiz
          </Link>
        </div>
      )}
    </div>
  );
}