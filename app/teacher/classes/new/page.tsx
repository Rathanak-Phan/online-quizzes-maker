// app/teacher/classes/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default function NewClassPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<"public" | "private">("private");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !code.trim()) {
      alert("Please fill in class name and code");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          type,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/teacher/classes/${data.classId}`);
      } else {
        const error = await res.json();
        alert(error.message || "Failed to create class");
      }
    } catch (err) {
      alert("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Back Link */}
      <Link
        href="/teacher/classes"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Classes
      </Link>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Create New Class</h1>
        <p className="text-xl text-gray-600">Set up a new class for your students</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 space-y-8">
        {/* Class Name */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Class Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mathematics Grade 10A"
            className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        {/* Class Code */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Class Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. M10A-2026"
            className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
          <p className="text-sm text-gray-500 mt-2">Students will use this code to find the class</p>
        </div>

        {/* Class Type */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-4">
            Class Privacy
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-start gap-4 p-6 border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-blue-500 transition has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                name="type"
                value="private"
                checked={type === "private"}
                onChange={(e) => setType(e.target.value as "private")}
                className="mt-1 w-5 h-5 text-blue-600"
              />
              <div>
                <h3 className="font-semibold text-lg">Private Class</h3>
                <p className="text-gray-600 mt-1">Only students you invite can join</p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-6 border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-green-500 transition has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
              <input
                type="radio"
                name="type"
                value="public"
                checked={type === "public"}
                onChange={(e) => setType(e.target.value as "public")}
                className="mt-1 w-5 h-5 text-green-600"
              />
              <div>
                <h3 className="font-semibold text-lg">Public Class</h3>
                <p className="text-gray-600 mt-1">Anyone with the link can join</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 pt-6">
          <Link
            href="/teacher/classes"
            className="px-8 py-4 border border-gray-300 rounded-2xl hover:bg-gray-50 font-medium transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:shadow-xl transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Plus className="w-6 h-6" />
            {loading ? "Creating..." : "Create Class"}
          </button>
        </div>
      </form>
    </div>
  );
}