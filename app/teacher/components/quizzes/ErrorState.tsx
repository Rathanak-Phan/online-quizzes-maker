// app/teacher/components/quizzes/ErrorState.tsx
import { BarChart3, Loader2 } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-20">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <BarChart3 className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Failed to Load Quizzes</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center mx-auto"
        >
          <Loader2 className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    </div>
  );
}