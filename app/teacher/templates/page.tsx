"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {Plus, Search, LayoutTemplate, FileText, Clock, Loader2, AlertTriangle } from "lucide-react";

type QuizStatus = "active" | "draft" | "completed";

interface TemplateItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  questions?: number;
  status: QuizStatus;
  timeLimit: number;
  isTemplate: boolean;
  createdAt: string;
  teacherId: string;
}

export default function TeacherTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (categoryFilter !== "all") params.set("category", categoryFilter);
        params.set("sort", sortBy);
        if (searchTerm.trim()) params.set("search", searchTerm.trim());
        const res = await fetch(`/api/teacher/templates?${params.toString()}`, { headers: { "Cache-Control": "no-cache" } });
        if (!res.ok) throw new Error("Failed to load templates");
        const data = await res.json();
        const list = Array.isArray(data.templates) ? data.templates : [];
        const normalized = list.map((q: any) => ({
          _id: String(q._id || ""),
          title: String(q.title || ""),
          description: String(q.description || ""),
          category: String(q.category || "General"),
          questions: Array.isArray(q.questions) ? q.questions.length : Number(q.questions) || 0,
          status: (q.status as QuizStatus) || "draft",
          timeLimit: Number(q.timeLimit) || 30,
          isTemplate: true,
        })) as TemplateItem[];
        setTemplates(normalized);
      } catch (err: any) {
        setError(err.message || "Failed to load templates");
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [sortBy, categoryFilter, searchTerm]);

  const categories = useMemo(() => {
    return Array.from(new Set(templates.map(t => t.category).filter(Boolean)));
  }, [templates]);

  const filtered = useMemo(() => {
    const bySearch = templates.filter(t => {
      const s = searchTerm.trim().toLowerCase();
      if (!s) return true;
      return (
        t.title.toLowerCase().includes(s) ||
        (t.description || "").toLowerCase().includes(s) ||
        t.category.toLowerCase().includes(s)
      );
    });
    const byCat = categoryFilter === "all" ? bySearch : bySearch.filter(t => t.category === categoryFilter);
    const sorted = [...byCat].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });
    return sorted;
  }, [templates, searchTerm, categoryFilter, sortBy]);

  const useTemplate = async (templateId: string) => {
    try {
      const tpl = templates.find(t => t._id === templateId);
      if (!tpl) throw new Error("Template not found");
      const payload = {
        title: tpl.title,
        description: tpl.description,
        category: tpl.category,
        status: "draft",
        timeLimit: tpl.timeLimit,
        // We need questions; fetch single template for full data
      };
      // Fetch full template to get questions
      const resTemplate = await fetch(`/api/teacher/templates?search=${encodeURIComponent(tpl.title)}`);
      const dataTemplate = await resTemplate.json();
      let questions: any[] = [];
      if (Array.isArray(dataTemplate.templates)) {
        const full = dataTemplate.templates.find((x: any) => String(x._id) === String(templateId)) || dataTemplate.templates[0];
        questions = Array.isArray(full?.questions) ? full.questions : [];
      }
      const res = await fetch(`/api/teacher/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, questions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to use template");
      const newQuizId = String(data.quizId || data.quiz?._id || "");
      if (newQuizId) {
        router.push(`/teacher/quizzes/${newQuizId}/edit`);
      } else {
        alert("Quiz created from template, but could not determine new quiz ID.");
      }
    } catch (err: any) {
      alert(err.message || "Error applying template");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <LayoutTemplate className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
              <p className="text-gray-600 mt-1">Create quizzes faster using reusable templates.</p>
            </div>
          </div>
          <div className="flex gap-3" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
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
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-gray-500">Loading templates...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-red-100">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Unable to load templates</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button onClick={() => setSortBy(sortBy)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutTemplate className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              No template created yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <div key={t._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="h-20">
                  <h3 className="text-lg font-bold text-blue-600 mb-1 line-clamp-1">{t.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{t.description || "No description provided."}</p>
                </div>
                <div className="mb-6">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{t.category}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{t.questions || 0}</p>
                      <p className="text-xs text-gray-500">Questions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{t.timeLimit}</p>
                      <p className="text-xs text-gray-500">Minutes</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Link
                    href={`/teacher/quizzes/${t._id}`}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Preview
                  </Link>
                  <button
                    onClick={() => useTemplate(t._id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
