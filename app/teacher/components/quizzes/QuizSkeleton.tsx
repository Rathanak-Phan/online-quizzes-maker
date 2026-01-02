// app/components/quizzes/QuizSkeleton.tsx
"use client";

export function QuizSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-8">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Category */}
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="flex gap-2">
            <div className="h-9 bg-gray-200 rounded-lg w-20"></div>
            <div className="h-9 bg-gray-200 rounded-lg w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}