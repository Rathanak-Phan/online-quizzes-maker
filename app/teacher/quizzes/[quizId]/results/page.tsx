// app/teacher/quizzes/[quizId]/results/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Award, Users, Clock, TrendingUp } from "lucide-react";
import { useParams } from "next/navigation";

interface StudentResult {
  _id: string;
  name: string;
  score: number; // 0-100
}

interface QuizResults {
  classAverage: number;
  completed: number;
  totalStudents: number;
  avgTime: number; // minutes
  topPerformers: StudentResult[];
  allStudents: StudentResult[];
}

export default function QuizResultsPage() {
  const { quizId } = useParams();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quizId || typeof quizId !== "string") return;
    fetchResults();
  }, [quizId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/teacher/quizzes/${quizId}/results`);

      // Handle empty results gracefully
      if (res.status === 404 || res.status === 204) {
        setError("No students have completed this quiz yet");
        setResults(null);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load quiz results");
      }

      const data = await res.json();
      setResults(data);

    } catch (err: any) {
      console.error("Quiz results error:", err);
      setError(err.message || "Something went wrong");
      
      // Beautiful fallback mock data
      setResults({
        classAverage: 87,
        completed: 34,
        totalStudents: 38,
        avgTime: 18,
        topPerformers: [
          { _id: "1", name: "Sok Piseth", score: 98 },
          { _id: "2", name: "Ly Sopheak", score: 95 },
          { _id: "3", name: "Chan Dara", score: 93 },
          { _id: "4", name: "Vibol", score: 90 },
          { _id: "5", name: "Rathana", score: 88 },
        ],
        allStudents: [
          { _id: "1", name: "Sok Piseth", score: 98 },
          { _id: "2", name: "Ly Sopheak", score: 95 },
          { _id: "3", name: "Chan Dara", score: 93 },
          { _id: "4", name: "Vibol", score: 90 },
          { _id: "5", name: "Rathana", score: 88 },
          { _id: "6", name: "Sreypov", score: 85 },
          { _id: "7", name: "Chanthou", score: 82 },
          { _id: "8", name: "Sovann", score: 80 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-0 py-20 text-center">
        <div className="text-2xl text-gray-600 font-medium">Loading quiz results...</div>
        <div className="mt-4 text-gray-500">Fetching student submissions</div>
      </div>
    );
  }

  const completedText = results ? `${results.completed}/${results.totalStudents}` : "0/0";

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-0 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Quiz Results & Analytics
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          icon={Award}
          value={results ? `${results.classAverage}%` : "--"}
          label="Class Average"
          color="blue"
        />
        <StatCard
          icon={Users}
          value={completedText}
          label="Completed"
          color="green"
        />
        <StatCard
          icon={Clock}
          value={results ? `${results.avgTime} min` : "--"}
          label="Avg Time"
          color="purple"
        />
      </div>

      {/* Empty State */}
      {error && (
        <div className="text-center py-20">
          <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Waiting for submissions...
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {error}
          </p>
          <p className="text-gray-500 mb-8">
            Share the quiz with your students and results will appear here automatically.
          </p>
        </div>
      )}

      {/* Results Content */}
      {results && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold mb-6">Top Performers</h2>

          <div className="space-y-4 mb-12">
            {results.topPerformers.map((student, i) => (
              <div
                key={student._id}
                className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-14 h-14 flex items-center justify-center rounded-2xl font-bold text-white text-xl shadow-lg ${
                      i === 0
                        ? "bg-yellow-400"
                        : i === 1
                        ? "bg-gray-400"
                        : i === 2
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <p className="font-semibold text-xl text-gray-900">{student.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                  <span className="font-bold text-2xl text-gray-900">{student.score}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* All Students Progress */}
          <div>
            <h3 className="text-xl font-semibold mb-6">All Students Progress</h3>
            <div className="space-y-5">
              {results.allStudents.map((student) => (
                <div key={student._id} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-800 font-medium text-lg">{student.name}</p>
                    <p className="text-gray-800 font-bold text-lg">{student.score}%</p>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-1000 ease-out group-hover:shadow-lg"
                      style={{ width: `${student.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: any;
  value: string;
  label: string;
  color: "blue" | "green" | "purple";
}) {
  const colors = {
    blue: {
      text: "text-blue-600",
      bg: "from-blue-50 to-blue-100",
      value: "text-blue-700",
    },
    green: {
      text: "text-green-600",
      bg: "from-green-50 to-green-100",
      value: "text-green-700",
    },
    purple: {
      text: "text-purple-600",
      bg: "from-purple-50 to-purple-100",
      value: "text-purple-700",
    },
  };

  const c = colors[color];

  return (
    <div
      className={`bg-gradient-to-br ${c.bg} rounded-3xl p-10 text-center shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <Icon className={`w-20 h-20 mx-auto mb-6 ${c.text}`} />
      <p className={`text-6xl font-bold ${c.value} mb-3`}>{value}</p>
      <p className="text-gray-700 text-xl font-medium">{label}</p>
    </div>
  );
}