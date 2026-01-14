"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, Clock, BookOpen, Tag } from "lucide-react";

type QuizStatus = "active" | "draft" | "completed";

interface QuizItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  questions?: number;
  assignedClasses: number;
  avgScore: number | null;
  status: QuizStatus;
  lastUsed: string;
  timeLimit: number;
  createdAt: string;
  isTemplate: boolean;
  teacherId: string;
}

export default function StudentQuizzesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | QuizStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "title" | "lastUsed">("newest");
  const [addCode, setAddCode] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!stored) {
      router.replace("/login");
      return;
    }
  }, [router]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (sort) params.set("sort", sort);
      const url =
        params.toString().length > 0
          ? `/api/student/quiz?${params.toString()}`
          : "/api/student/quiz";
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error: ${res.status}`);
      }
      const data = await res.json();
      setQuizzes(data.quizzes || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : typeof err === "string" ? err : "Failed to load quizzes";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter, sort]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach((q) => set.add(q.category || "General"));
    return Array.from(set).sort();
  }, [quizzes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quizzes;
    return quizzes.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [quizzes, query]);

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
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchQuizzes();
                }}
                placeholder="Search quizzes by title or category..."
                className="w-full py-4 pl-12 pr-4 bg-white rounded-2xl border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="ml-4 flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-50"
              onClick={() =>
                setStatusFilter((prev) =>
                  prev === "all" ? "active" : prev === "active" ? "draft" : prev === "draft" ? "completed" : "all"
                )
              }
              aria-label="Status filter"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Status</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {statusFilter}
              </span>
            </button>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-3 px-3 bg-white rounded-2xl border border-gray-200 text-gray-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "newest" | "title" | "lastUsed")}
                className="py-3 px-3 bg-white rounded-2xl border border-gray-200 text-gray-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <option value="newest">Newest</option>
                <option value="title">Title</option>
                <option value="lastUsed">Last used</option>
              </select>
            </div>
            <button
              className="px-4 py-3 bg-blue-600 text-white rounded-2xl shadow-sm hover:bg-blue-700"
              onClick={fetchQuizzes}
            >
              Search
            </button>
            <div className="relative ml-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={addCode}
                  onChange={(e) => setAddCode(e.target.value)}
                  placeholder="Enter quiz code or ID"
                  className="w-56 py-3 px-3 bg-white rounded-2xl border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
                <button
                  className="px-4 py-3 bg-emerald-600 text-white rounded-2xl shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                  onClick={async () => {
                    setAddError(null);
                    setAddSuccess(null);
                    const code = addCode.trim();
                    if (!code) {
                      setAddError("Please enter a quiz code");
                      return;
                    }
                    try {
                      setAdding(true);
                      const res = await fetch("/api/student/quiz/addbycode", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code }),
                      });
                      const data = await res.json();
                      if (!res.ok || data.success === false) {
                        throw new Error(data.error || "Failed to add quiz");
                      }
                      setAddSuccess("Quiz added");
                      setAddCode("");
                      await fetchQuizzes();
                    } catch (e: unknown) {
                      const msg =
                        e instanceof Error ? e.message : typeof e === "string" ? e : "Failed to add quiz";
                      setAddError(msg);
                    } finally {
                      setAdding(false);
                    }
                  }}
                  disabled={adding}
                >
                  {adding ? "Adding..." : "Add Quiz"}
                </button>
              </div>
              {addError && <p className="text-sm text-red-600 mt-2">{addError}</p>}
              {addSuccess && <p className="text-sm text-green-700 mt-2">{addSuccess}</p>}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading quizzes...</div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-600">No quizzes found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {quiz.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs font-semibold flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          {quiz.category}
                        </span>
                        {typeof quiz.questions === "number" && (
                          <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {quiz.questions} questions
                          </span>
                        )}
                        <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {quiz.timeLimit} min
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {quiz.description || "No description"}
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <Link
                      href="#"
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    >
                      Start Quiz
                    </Link>
                    <button
                      className="px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
                      onClick={async () => {
                        setRemoveError(null);
                        setRemovingId(quiz._id);
                        try {
                          const res = await fetch(`/api/student/quiz/${quiz._id}`, { method: "DELETE" });
                          const data = await res.json().catch(() => ({}));
                          if (!res.ok || data.success === false) {
                            throw new Error(data.error || "Failed to remove quiz");
                          }
                          await fetchQuizzes();
                        } catch (e: unknown) {
                          const msg =
                            e instanceof Error ? e.message : typeof e === "string" ? e : "Failed to remove quiz";
                          setRemoveError(msg);
                        } finally {
                          setRemovingId(null);
                        }
                      }}
                      disabled={removingId === quiz._id}
                    >
                      {removingId === quiz._id ? "Removing..." : "Remove"}
                    </button>
                    <span
                      className={`px-3 py-1 rounded-xl text-xs ${
                        quiz.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : quiz.status === "draft"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {quiz.status}
                    </span>
                  </div>
                  {removeError && removingId === null && (
                    <p className="text-sm text-red-600 mt-2">{removeError}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
