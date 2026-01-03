// app/components/quizzes/QuizCard.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  MoreVertical,
  FileText,
  Users,
  Trophy,
  Clock,
  Edit3,
  Copy,
  Trash2,
  Eye,
  Share2,
  Calendar,
  BarChart3,
  Tag,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { Quiz as QuizType } from "@/types/quiz";

interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  questions: number;
  assignedClasses: number;
  avgScore: number | null;
  status: "active" | "completed" | "draft";
  lastUsed: string;
  timeLimit: number;
  isTemplate: boolean;
}


interface QuizCardProps {
  quiz: QuizType;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onShare?: (id: string) => void;
}

export function QuizCard({
  quiz,
  onDelete,
  onDuplicate,
  onShare,
}: QuizCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusConfig = (status: Quiz["status"]) => {
    switch (status) {
      case "active":
        return {
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
          label: "Active",
        };
      case "completed":
        return {
          color: "bg-blue-100 text-blue-800",
          icon: CheckCircle,
          label: "Completed",
        };
      case "draft":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: XCircle,
          label: "Draft",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: CheckCircle,
          label: "Unknown",
        };
    }
  };

  const statusConfig = getStatusConfig(quiz.status);
  const StatusIcon = statusConfig.icon;

  const handleShare = () => {
    if (onShare) {
      onShare(quiz._id);
    } else {
      const link = `${window.location.origin}/quiz/${quiz._id}`;
      navigator.clipboard.writeText(link);
      setShowDropdown(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              {quiz.isTemplate && (
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                  Template
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {quiz.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {quiz.description || "No description"}
            </p>
          </div>

          {/* Actions Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Quiz actions"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <Link
                    href={`/teacher/quizzes/${quiz._id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Link>
                  <Link
                    href={`/teacher/quizzes/${quiz._id}/edit`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </Link>
                  <Link
                    href={`/teacher/quizzes/${quiz._id}/results`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Results
                  </Link>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 w-full"
                  >
                    <Share2 className="w-4 h-4" />
                    Copy Share Link
                  </button>
                  <button
                    onClick={() => {
                      onDuplicate(quiz._id);
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 w-full"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={() => {
                      onDelete(quiz._id);
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 w-full"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm">
            <Tag className="w-3.5 h-3.5" />
            {quiz.category}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {quiz.questions.length}
              </p>
              <p className="text-sm text-gray-600">Questions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {quiz.assignedClasses}
              </p>
              <p className="text-sm text-gray-600">Classes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {quiz.timeLimit}
              </p>
              <p className="text-sm text-gray-600">Minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {quiz.avgScore !== null ? `${quiz.avgScore}%` : "--"}
              </p>
              <p className="text-sm text-gray-600">Avg Score</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            Last used: {formatDate(quiz.lastUsed)}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/teacher/quizzes/${quiz._id}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Preview
            </Link>
            <Link
              href={`/teacher/quizzes/${quiz._id}/results`}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition"
            >
              Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
