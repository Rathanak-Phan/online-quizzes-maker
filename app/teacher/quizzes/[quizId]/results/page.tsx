// app/teacher/quizzes/[quizId]/results/page.tsx - WITHOUT useSession
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Users,
  Trophy,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface QuizResult {
  _id: string;
  studentName: string;
  percentage: number;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  submittedAt: string;
  answers: {
    questionId: string;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const scores = quizResults.map(r => r.percentage).filter(Boolean) as number[];
    const total = scores.length;
    
    if (total === 0) {
      return {
        average: 0,
        standardDeviation: 0,
        highest: 0,
        lowest: 0,
        passRate: 0,
      };
    }

    const average = scores.reduce((a, b) => a + b, 0) / total;
    const squareDiffs = scores.map(score => Math.pow(score - average, 2));
    const variance = squareDiffs.reduce((a, b) => a + b, 0) / total;
    const standardDeviation = Math.sqrt(variance);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passRate = (scores.filter(s => s >= 70).length / total) * 100;

    return {
      average,
      standardDeviation,
      highest,
      lowest,
      passRate,
    };
  }, [quizResults]);

  useEffect(() => {
    fetchResults();
  }, [quizId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching results for quiz:", quizId);
      
      const response = await fetch(`/api/teacher/quizzes/${quizId}/results`);
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        // Try to get error message
        let errorText = "";
        try {
          errorText = await response.text();
        } catch (e) {
          console.log("Could not read error response");
        }
        
        // If API endpoint doesn't exist (404), use mock data
        if (response.status === 404) {
          console.log("API endpoint not found, using mock data");
          setQuizResults(getMockResults());
          setQuizTitle(`Quiz ${quizId} - Results (Mock Data)`);
          return;
        }
        
        throw new Error(`Failed to fetch results (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log("Results data received:", data);
      
      setQuizResults(data.results || []);
      setQuizTitle(data.quizTitle || `Quiz Results - ${quizId.substring(0, 8)}...`);
    } catch (err: any) {
      console.error("Error fetching results:", err);
      setError(err.message || "Failed to load results");
      
      // Fallback to mock data
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock data for development");
        setQuizResults(getMockResults());
        setQuizTitle(`Quiz ${quizId} - Results (Mock Data)`);
        setError(null); // Clear error since we have mock data
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock data function
  function getMockResults(): QuizResult[] {
    return [
      {
        _id: "1",
        studentName: "John Doe",
        percentage: 85.5,
        score: 17,
        totalQuestions: 20,
        timeSpent: 1250,
        submittedAt: new Date().toISOString(),
        answers: [],
      },
      {
        _id: "2",
        studentName: "Jane Smith",
        percentage: 92.0,
        score: 18,
        totalQuestions: 20,
        timeSpent: 1100,
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        answers: [],
      },
      {
        _id: "3",
        studentName: "Bob Johnson",
        percentage: 75.0,
        score: 15,
        totalQuestions: 20,
        timeSpent: 980,
        submittedAt: new Date(Date.now() - 172800000).toISOString(),
        answers: [],
      },
      {
        _id: "4",
        studentName: "Alice Williams",
        percentage: 65.0,
        score: 13,
        totalQuestions: 20,
        timeSpent: 1150,
        submittedAt: new Date(Date.now() - 259200000).toISOString(),
        answers: [],
      },
      {
        _id: "5",
        studentName: "Charlie Brown",
        percentage: 95.0,
        score: 19,
        totalQuestions: 20,
        timeSpent: 1050,
        submittedAt: new Date(Date.now() - 345600000).toISOString(),
        answers: [],
      },
    ];
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchResults}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/teacher/quizzes"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Quizzes
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{quizTitle}</h1>
            </div>
            <button
              onClick={() => alert("Export feature coming soon")}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export Results
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.average.toFixed(1)}%</p>
              </div>
              <Trophy className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Standard Deviation</p>
                <p className="text-2xl font-bold text-gray-900">{stats.standardDeviation.toFixed(1)}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">{quizResults.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pass Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.passRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Student Results</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quizResults.map((result) => (
                  <tr key={result._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.studentName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {result.score} / {result.totalQuestions}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {result.percentage.toFixed(1)}%
                        </div>
                        {result.percentage >= 70 ? (
                          <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(result.submittedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/teacher/quizzes/${quizId}/results/${result._id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {quizResults.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
            <p className="text-gray-600 mb-4">Students haven't taken this quiz yet.</p>
            <Link
              href="/teacher/quizzes"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Quizzes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}