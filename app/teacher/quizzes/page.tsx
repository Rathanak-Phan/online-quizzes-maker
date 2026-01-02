// app/teacher/quizzes/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Users,
  Trophy,
  Copy,
  Loader2,
  BarChart3,
  Tag,
  ChevronDown,
} from "lucide-react";
import { QuizCard } from "@/app/teacher/components/quizzes/QuizCard";
import { QuizSkeleton } from "@/app/teacher/components/quizzes/QuizSkeleton";
import { EmptyState } from "@/app/teacher/components/quizzes/EmptyState";
import { Filters } from "@/app/teacher/components/quizzes/Filters";
import { StatsSummary } from "@/app/teacher/components/quizzes/StatsSummary";
import type { Quiz } from "@/types/quiz";

// Debounce hook for better performance
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

  // Fetch quizzes function
  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.set("search", debouncedSearchTerm);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      params.set("sort", sortBy);

      console.log("Fetching from MongoDB Atlas...");
      console.log("API URL:", `/api/teacher/quizzes?${params.toString()}`);

      const response = await fetch(`/api/teacher/quizzes?${params.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error("API Error details:", errorData);
        throw new Error(errorData.error || errorData.message || "Failed to fetch quizzes");
      }

      const data = await response.json();
      console.log("Data received from Atlas:", {
        count: data.quizzes?.length || 0,
        source: data.source || "unknown",
        data: data // Log full data for debugging
      });

      setQuizzes(data.quizzes || []);
      
      // Extract categories
      const uniqueCategories = Array.from(
        new Set(
          data.quizzes?.map((q: Quiz) => q.category).filter(Boolean) || []
        )
      ) as string[];
      setCategories(uniqueCategories);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load quizzes");
      setQuizzes([]); // Empty array on error
      
      // Temporary: Show some mock data for debugging
      console.log("Using mock data for debugging...");
      setQuizzes([
        {
          _id: "mock-1",
          title: "Sample Mathematics Quiz",
          description: "Basic algebra and geometry questions",
          category: "Mathematics",
          questions: 10,
          assignedClasses: 3,
          avgScore: 85.5,
          status: "active",
          lastUsed: new Date().toISOString(),
          timeLimit: 30,
          createdAt: new Date().toISOString(),
          isTemplate: false,
        },
        {
          _id: "mock-2",
          title: "Sample Science Quiz",
          description: "General science knowledge",
          category: "Science",
          questions: 15,
          assignedClasses: 2,
          avgScore: 72.3,
          status: "draft",
          lastUsed: new Date(Date.now() - 86400000).toISOString(),
          timeLimit: 45,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isTemplate: false,
        }
      ]);
      setCategories(["Mathematics", "Science"]);
      setError(null); // Clear error for now
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, sortBy, debouncedSearchTerm]);

  // Initial fetch when component mounts
  useEffect(() => {
    console.log("Component mounted, fetching quizzes...");
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Re-fetch when filters change
  useEffect(() => {
    console.log("Filters changed, fetching quizzes...");
    fetchQuizzes();
  }, [debouncedSearchTerm, statusFilter, categoryFilter, sortBy]);

  // Handle quiz actions
  const handleDelete = async (quizId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/quizzes/${quizId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete quiz");
      }

      // Optimistic update
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (err: any) {
      console.error("Failed to delete quiz:", err);
      alert(err.message || "Error deleting quiz");
      // Re-fetch to restore state
      fetchQuizzes();
    }
  };

  const handleDuplicate = async (quizId: string) => {
    try {
      const response = await fetch(`/api/teacher/quizzes/${quizId}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate quiz");
      }

      const data = await response.json();
      setQuizzes((prev) => [data.quiz, ...prev]);
    } catch (err: any) {
      console.error("Failed to duplicate quiz:", err);
      alert(err.message || "Error duplicating quiz");
    }
  };

  // Filter and sort quizzes
  const filteredQuizzes = useMemo(() => {
    console.log("Filtering quizzes:", {
      total: quizzes.length,
      searchTerm: debouncedSearchTerm,
      statusFilter,
      categoryFilter,
      sortBy
    });
    
    return quizzes
      .filter((quiz) => {
        const matchesSearch =
          debouncedSearchTerm === "" ||
          quiz.title
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          quiz.description
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          quiz.category
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || quiz.status === statusFilter;

        const matchesCategory =
          categoryFilter === "all" || quiz.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "title":
            return a.title.localeCompare(b.title);
          case "lastUsed":
            return (
              new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
            );
          default: // "newest"
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }
      });
  }, [quizzes, debouncedSearchTerm, statusFilter, categoryFilter, sortBy]);

  // Error state component
  const ErrorState = () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-20">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <BarChart3 className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Failed to Load Quizzes
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchQuizzes}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center mx-auto"
        >
          <Loader2 className="w-4 h-4 mr-2" />
          Retry
        </button>
        <div className="mt-6 text-sm text-gray-500">
          <p>Debug info:</p>
          <p>Quizzes count: {quizzes.length}</p>
          <p>API Status: Check browser console</p>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <QuizSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <ErrorState />;
  }

  console.log("Rendering with:", {
    quizzes: quizzes.length,
    filteredQuizzes: filteredQuizzes.length,
    categories: categories.length,
    loading
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Quizzes
              </h1>
              <p className="text-gray-600">Create and manage your quizzes.</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/teacher/quizzes/templates"
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <Copy className="w-4 h-4" />
                Templates
              </Link>
              <Link
                href="/teacher/quizzes/new"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:shadow-blue-500/25"
              >
                <Plus className="w-5 h-5" />
                New Quiz
              </Link>
            </div>
          </div>
        </header>

        {/* Filters & Search */}
        <Filters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          categories={categories}
        />

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <QuizSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Quizzes Grid */}
        {!loading && filteredQuizzes.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz._id}
                  quiz={quiz}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>

            {/* Stats Summary */}
            <StatsSummary quizzes={quizzes} />
          </>
        )}

        {/* Empty State */}
        {!loading && filteredQuizzes.length === 0 && (
          <EmptyState
            title={
              debouncedSearchTerm ||
              statusFilter !== "all" ||
              categoryFilter !== "all"
                ? "No matching quizzes found"
                : "No quizzes yet"
            }
            description={
              debouncedSearchTerm ||
              statusFilter !== "all" ||
              categoryFilter !== "all"
                ? "Try adjusting your filters or search terms"
                : "Get started by creating your first quiz"
            }
            actionText="Create New Quiz"
            actionLink="/teacher/quizzes/new"
            showSearchIllustration={
              debouncedSearchTerm ||
              statusFilter !== "all" ||
              categoryFilter !== "all"
            }
          />
        )}

        {/* Debug info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <details>
              <summary className="cursor-pointer font-medium">Debug Info</summary>
              <div className="mt-2 text-sm">
                <p>Quizzes: {quizzes.length}</p>
                <p>Filtered: {filteredQuizzes.length}</p>
                <p>Categories: {categories.join(', ')}</p>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>Error: {error || 'None'}</p>
                <button 
                  onClick={() => fetchQuizzes()} 
                  className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded"
                >
                  Refetch
                </button>
                <button 
                  onClick={() => {
                    console.log("Current state:", { quizzes, filteredQuizzes, categories, loading, error });
                  }} 
                  className="mt-2 ml-2 px-3 py-1 bg-gray-500 text-white text-xs rounded"
                >
                  Log State
                </button>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}