// app/teacher/quizzes/page.tsx
"use client";

import Link from "next/link";
import { Plus, Search, Filter, MoreVertical, FileText, Users, Trophy, Clock } from "lucide-react";
import { useState } from "react";

const mockQuizzes = [
  {
    id: 1,
    title: "Algebra Fundamentals Quiz",
    category: "Mathematics",
    questions: 20,
    classes: 3,
    avgScore: 88,
    status: "active",
    lastUsed: "2 days ago",
  },
  {
    id: 2,
    title: "Cell Structure & Function",
    category: "Science",
    questions: 15,
    classes: 2,
    avgScore: 82,
    status: "active",
    lastUsed: "1 week ago",
  },
  {
    id: 3,
    title: "World War II History Test",
    category: "History",
    questions: 25,
    classes: 5,
    avgScore: 91,
    status: "completed",
    lastUsed: "3 weeks ago",
  },
  {
    id: 4,
    title: "English Grammar Challenge",
    category: "English",
    questions: 18,
    classes: 1,
    avgScore: null,
    status: "draft",
    lastUsed: "Not used yet",
  },
  {
    id: 5,
    title: "Basic Python Programming",
    category: "Computer Science",
    questions: 12,
    classes: 4,
    avgScore: 85,
    status: "active",
    lastUsed: "Yesterday",
  },
];

export default function QuizzesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredQuizzes = mockQuizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      quiz.status === filterStatus ||
      (filterStatus === "draft" && quiz.avgScore === null);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Quizzes</h1>
        <p className="text-gray-600">Create, manage, and assign quizzes to your classes</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes by title or category..."
                className="w-full pl-11 pr-5 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter */}
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

          {/* New Quiz Buttons */}
          <div className="flex gap-4">
            <Link
              href="/teacher/quizzes/templates"
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition"
            >
              Use Template
            </Link>
            <Link
              href="/teacher/quizzes/new"
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5"
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
            key={quiz.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{quiz.category}</p>
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
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

                <div className="flex gap-3">
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition">
                    Duplicate
                  </button>
                  <Link
                    href={`/teacher/quizzes/${quiz.id}`}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (if no quizzes) */}
      {filteredQuizzes.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-600 mb-8">Create your first quiz to get started!</p>
          <Link
            href="/teacher/quizzes/new"
            className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create New Quiz
          </Link>
        </div>
      )}
    </div>
  );
}