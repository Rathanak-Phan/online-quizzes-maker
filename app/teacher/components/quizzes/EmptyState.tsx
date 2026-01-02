// app/components/quizzes/EmptyState.tsx
"use client";

import { FileText, Search, Filter, Plus } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  icon?: React.ReactNode;
  showSearchIllustration?: boolean;
}

export function EmptyState({
  title,
  description,
  actionText = "Create New Quiz",
  actionLink = "/teacher/quizzes/new",
  icon,
  showSearchIllustration = false,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-8">
          {showSearchIllustration ? (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center">
                <Search className="w-12 h-12 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          ) : icon ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center">
              {icon}
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
          )}
        </div>

        {/* Text */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-8">{description}</p>

        {/* Action Button */}
        {actionLink && (
          <Link
            href={actionLink}
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            {actionText}
          </Link>
        )}

        {/* Tips */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-4">Quick Tips:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium text-gray-900 mb-1">Use Templates</div>
              <p>Start with pre-built templates for common subjects</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium text-gray-900 mb-1">Import Questions</div>
              <p>Import questions from existing documents or spreadsheets</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-medium text-gray-900 mb-1">Collaborate</div>
              <p>Share quizzes with colleagues for feedback</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}