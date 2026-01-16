"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

interface Template {
  _id: string;
  title: string;
  description?: string;
  category: string;
  timeLimit: number;
  questionsCount?: number;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    timeLimit: 30,
  });
  const [saving, setSaving] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/templates", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to load templates");
      }
      setTemplates(data.templates || []);
    } catch (err: any) {
      setError(err.message || "Failed to load templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const addTemplate = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to add template");
      }
      setForm({ title: "", description: "", category: "", timeLimit: 30 });
      setTemplates((prev) => [data.template, ...prev]);
    } catch (err: any) {
      alert(err.message || "Failed to add template");
    } finally {
      setSaving(false);
    }
  };

  const updateTemplate = async (id: string, fields: Partial<Template>) => {
    try {
      const res = await fetch("/api/admin/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...fields }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to update template");
      }
      setTemplates((prev) =>
        prev.map((t) => (t._id === id ? { ...t, ...fields } : t))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update template");
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      const res = await fetch("/api/admin/templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to delete");
      }
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete template");
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quiz Templates</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Template</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Category"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            value={form.timeLimit}
            onChange={(e) =>
              setForm({ ...form, timeLimit: Number(e.target.value) })
            }
            placeholder="Time Limit (min)"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <div className="md:col-span-4">
            <button
              onClick={addTemplate}
              disabled={saving || !form.title}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-5 gap-4 p-5 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div>Title</div>
          <div>Category</div>
          <div>Time Limit</div>
          <div>Questions</div>
          <div className="text-right">Actions</div>
        </div>
        {templates.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No templates found</div>
        ) : (
          templates.map((t) => (
            <div
              key={t._id}
              className="grid grid-cols-5 gap-4 p-5 border-b border-gray-100 last:border-none items-center text-sm"
            >
              <input
                className="font-medium text-gray-900 bg-transparent outline-none"
                value={t.title}
                onChange={(e) =>
                  updateTemplate(t._id, { title: e.target.value })
                }
              />
              <input
                className="text-gray-700 bg-transparent outline-none"
                value={t.category}
                onChange={(e) =>
                  updateTemplate(t._id, { category: e.target.value })
                }
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="w-24 bg-transparent outline-none"
                  value={t.timeLimit}
                  onChange={(e) =>
                    updateTemplate(t._id, { timeLimit: Number(e.target.value) })
                  }
                />
                <span className="text-gray-500">min</span>
              </div>
              <div className="text-gray-700">
                {t.questionsCount ?? 0}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => deleteTemplate(t._id)}
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

