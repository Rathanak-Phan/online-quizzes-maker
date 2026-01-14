"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";

type Question = {
  id: string;
  text: string;
  type: string;
  options?: string[];
  points?: number;
  correctAnswer?: string | number | boolean;
  explanation?: string;
  hint?: string;
};

type Quiz = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  timeLimit: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  lastUsed?: string;
  questions: Question[];
};

export default function TakeQuizPage() {
  const params = useParams<{ quizId: string }>();
  const router = useRouter();
  const quizId = params?.quizId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!stored) {
      router.replace("/login");
      return;
    }
  }, [router]);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/student/quiz/${quizId}`);
        const data = await res.json();
        if (!res.ok || data.success === false) {
          throw new Error(data.error || "Failed to load quiz");
        }
        const qz: Quiz = data.quiz;
        setQuiz(qz);
        setRemainingSeconds(qz.timeLimit ? qz.timeLimit * 60 : 30 * 60);
      } catch (e: any) {
        setError(e?.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (submitted) return;
    if (remainingSeconds === null) return;
    if (remainingSeconds <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setRemainingSeconds((s) => (s ? s - 1 : s)), 1000);
    return () => clearTimeout(t);
  }, [remainingSeconds, submitted]);

  const questions = useMemo(() => quiz?.questions || [], [quiz]);
  const current = questions[currentIndex];

  const formatTime = (sec: number | null) => {
    if (sec === null) return "--:--";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const setAnswer = (qid: string, value: string | number | boolean) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = () => {
    if (!quiz) return;
    const total = questions.length;
    let score = 0;
    questions.forEach((q) => {
      const ans = answers[q.id];
      const correct = q.correctAnswer;
      if (correct === undefined) return;
      if (typeof correct === "boolean" && typeof ans === "boolean" && ans === correct) score += q.points || 1;
      else if (typeof correct === "number" && typeof ans === "number" && ans === correct) score += q.points || 1;
      else if (typeof correct === "string" && typeof ans === "string" && ans.trim() === correct.trim())
        score += q.points || 1;
    });
    const maxPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const percentage = maxPoints > 0 ? Math.round((score / maxPoints) * 100) : 0;
    setSubmitted(true);
    setResult({ score, total, percentage });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 w-full pt-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            Loading quiz...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 w-full pt-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm text-red-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full pt-24">
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600 mt-1">{quiz.description || "No description"}</p>
            <p className="text-sm text-gray-500 mt-1">Category: {quiz.category || "General"}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Clock className="w-5 h-5 text-gray-700" />
            <span className="font-mono text-gray-900">{formatTime(remainingSeconds)}</span>
          </div>
        </div>

        {!submitted ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  Question {currentIndex + 1} of {questions.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                    disabled={currentIndex >= questions.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{current?.text || "Untitled question"}</h2>
                {current?.hint && <p className="mt-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">{current.hint}</p>}
              </div>

              {current?.type?.toLowerCase().includes("true") ? (
                <div className="space-y-3">
                  {[true, false].map((val) => (
                    <label key={String(val)} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`q-${current.id}`}
                        checked={answers[current.id] === val}
                        onChange={() => setAnswer(current.id, val)}
                      />
                      <span className="text-gray-900">{val ? "True" : "False"}</span>
                    </label>
                  ))}
                </div>
              ) : current?.type?.toLowerCase().includes("short") ? (
                <textarea
                  className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                  rows={4}
                  value={(answers[current.id] as string) || ""}
                  onChange={(e) => setAnswer(current.id, e.target.value)}
                  placeholder="Type your answer..."
                />
              ) : (
                <div className="space-y-3">
                  {(current?.options || []).map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`q-${current.id}`}
                        checked={answers[current.id] === idx || answers[current.id] === opt}
                        onChange={() => setAnswer(current.id, typeof current.correctAnswer === "number" ? idx : opt)}
                      />
                      <span className="text-gray-900">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {current?.explanation && (
                <div className="mt-4 flex items-start gap-2 bg-amber-50 text-amber-800 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <p className="text-sm">{current.explanation}</p>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <Link href="/student/quizzes" className="text-gray-700 hover:underline">
                  Exit
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                  >
                    Previous
                  </button>
                  {currentIndex < questions.length - 1 ? (
                    <button
                      className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                      onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Quiz submitted</h2>
            </div>
            <p className="mt-2 text-gray-700">
              Score: {result?.score} / {questions.reduce((sum, q) => sum + (q.points || 1), 0)} (
              {result?.percentage}%)
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/student/quizzes"
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Back to quizzes
              </Link>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  setSubmitted(false);
                  setResult(null);
                  setAnswers({});
                  setCurrentIndex(0);
                  setRemainingSeconds(quiz.timeLimit * 60);
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
