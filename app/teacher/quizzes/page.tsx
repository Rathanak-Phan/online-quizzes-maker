"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Search,
  FileText,
  Clock,
  Calendar,
  ChevronDown,
  Loader2,
  BarChart3,
  LayoutTemplate
} from "lucide-react";


interface Question {
  _id: string;
  text: string;
  type: string;
  points: number;
  options?: string[];
  correctAnswer?: any;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: "draft" | "published" | "archived";
  timeLimit: number;
  questions: Question[];
  questionsCount: number;
}

// --- Hook: useDebounce ---

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// --- Sub-Component: Quiz Card ---

const QuizCard = ({
  quiz,
  onDelete,
  onDuplicate,
}: {
  quiz: Quiz;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative">

      {/* Title and Description */}
      <div className="h-20">
        <Link href={`/teacher/quizzes/${quiz._id}`}>
          <h3 className="text-lg font-bold text-blue-600 mb-1 hover:underline line-clamp-1">
            {quiz.title}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm line-clamp-2">
          {quiz.description || "No description provided."}
        </p>
      </div>

      {/* Category */}
      <div className="mb-6">
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
          {quiz.category}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{quiz.questionsCount}</p>
            <p className="text-xs text-gray-500">Questions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{quiz.timeLimit}</p>
            <p className="text-xs text-gray-500">Minutes</p>
          </div>
        </div>
      </div>

      {/* Footer: Date and Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Last used</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDelete(quiz._id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Quiz"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Link 
            href={`/teacher/quizzes/${quiz._id}`}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Preview
          </Link>
          <Link
            href={`/teacher/quizzes/${quiz._id}/results`}
             className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Results
          </Link>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [categories, setCategories] = useState<string[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.set("search", debouncedSearchTerm);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      params.set("sort", sortBy);

      const response = await fetch(`/api/teacher/quizzes?${params.toString()}`, {
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }

      const data = await response.json();

      const list = (data.quizzes || []).map((q: any) => ({
        _id: q._id,
        title: q.title || "",
        description: q.description || "",
        category: q.category || "General",
        status: q.status || "draft",
        timeLimit: q.timeLimit || 30,
        questions: Array.isArray(q.questions) ? q.questions : [],
        questionsCount: Array.isArray(q.questions) ? q.questions.length : Number(q.questions) || 0,
      }));

      const details = await Promise.all(
        list.map(async (q: any) => {
          try {
            const r = await fetch(`/api/teacher/quizzes/${q._id}`);
            const jd = await r.json();
            if (!r.ok || jd.success === false) return null;
            return jd.quiz;
          } catch {
            return null;
          }
        })
      );

      const normalized = list.map((q: any, i: number) => {
        const dq = details[i];
        const qs = Array.isArray(dq?.questions) ? dq.questions : q.questions;
        return {
          ...q,
          questions: qs,
          questionsCount: Array.isArray(qs) ? qs.length : q.questionsCount
        } as Quiz;
      });

      setQuizzes(normalized);

      // Extract unique categories for the filter
      const uniqueCategories = ["Mathematics", "Science", "History", "English", "Computer Science", "Geography", "Art", "Music", "Physical Education", "Other"];
      setCategories(uniqueCategories);

    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load quizzes");
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, statusFilter, categoryFilter, sortBy]);

  // --- Effects ---
  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // --- Actions ---
  const handleDelete = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/teacher/quizzes/${quizId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete quiz");
      
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      fetchQuizzes(); // Restore state on error
    }
  };

  const handleDuplicate = async (quizId: string) => {
    try {
      const response = await fetch(`/api/teacher/quizzes/${quizId}/duplicate`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to duplicate quiz");
      
      const data = await response.json();
      setQuizzes((prev) => [data.quiz, ...prev]);
    } catch (err: any) {
      alert(err.message || "Error duplicating quiz");
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-20 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
            <p className="text-gray-600 mt-1">Create and manage your quizzes.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/teacher/templates"
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
            >
              <LayoutTemplate className="w-5 h-5" />
              Templates
            </Link>
            <Link
              href="/teacher/quizzes/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-sm transition-all"
            >
              <span className="text-xl leading-none">+</span> New Quiz
            </Link>
          </div>
        </header>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Sort Filter */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="lastUsed">Recently Used</option>
                <option value="title">Title (A-Z)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
             <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500">Loading your quizzes...</p>
             </div>
          </div>
        ) : error ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-red-100">
             <BarChart3 className="w-12 h-12 text-red-500 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-gray-900">Something went wrong</h3>
             <p className="text-gray-500 mb-6">{error}</p>
             <button onClick={fetchQuizzes} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Retry</button>
           </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No quizzes found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {searchTerm 
                ? "No quizzes match your search criteria. Try adjusting your filters." 
                : "Get started by creating your first quiz for your students."}
            </p>
            {!searchTerm && (
                <Link
                href="/teacher/quizzes/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" /> Create Quiz
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard 
                key={quiz._id} 
                quiz={quiz} 
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}