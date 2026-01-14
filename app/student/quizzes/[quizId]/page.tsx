"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";

type Question = {
  id: string;
  type: "singleSelect" | "multiSelect" | "trueFalse" | "fillBlank";
  question: string;
  options?: string[];
  points?: number;
  answer: string | number | boolean | number[];
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
  const [answers, setAnswers] = useState<Record<string, string | number | boolean | number[]>>({});
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

  const setAnswer = (qid: string, value: string | number | boolean | number[]) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };


  const handleSubmit = () => {
    if (!quiz) return;
    const total = questions.length;
    let score = 0;

    questions.forEach((q) => {
      const ans = answers[q.id];
      const correct = q.answer;

      if (correct === undefined) return;

      switch (q.type) {
        case "trueFalse":
          if (typeof ans === "boolean" && ans === correct) {
            score += q.points || 1;
          }
          break;

        case "singleSelect":
          if (typeof ans === "number" && ans === correct) {
            score += q.points || 1;
          }
          break;

        case "multiSelect":
          if (Array.isArray(correct) && Array.isArray(ans)) {
            // Check if arrays match (ignoring order)
            const sortedAns = [...ans].sort();
            const sortedCorrect = [...correct].sort();
            if (JSON.stringify(sortedAns) === JSON.stringify(sortedCorrect)) {
              score += q.points || 1;
            }
          }
          break;

        case "fillBlank":
          if (typeof ans === "string" && typeof correct === "string" && ans.trim().toLowerCase() === correct.trim().toLowerCase()) {
            score += q.points || 1;
          }
          break;
      }
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

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gray-50 w-full pt-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold mt-4">Quiz Submitted!</h2>
            <p className="text-gray-600 mt-2">
              You scored {result.score} out of {result.total}.
            </p>
            <div className="text-4xl font-bold mt-4">{result.percentage}%</div>
            <Link href="/student/quizzes">
              <span className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">
                Back to Quizzes
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full pt-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">{quiz.title}</h1>
            <div className="flex items-center gap-2 text-red-500">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{formatTime(remainingSeconds)}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <div className="bg-gray-200 h-1.5 rounded-full mt-1">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {current?.question || "Untitled question"}
            </h2>
            {current?.hint && (
              <p className="mt-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                {current.hint}
              </p>
            )}
          </div>

          {current?.type === "trueFalse" ? (
            <div className="space-y-3">
              {[true, false].map((val) => (
                <label
                  key={String(val)}
                  className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50"
                >
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
          ) : current?.type === "fillBlank" ? (
            <textarea
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows={4}
              value={(answers[current.id] as string) || ""}
              onChange={(e) => setAnswer(current.id, e.target.value)}
              placeholder="Type your answer..."
            />
          ) : current?.type === "multiSelect" ? (
            <div className="space-y-3">
              {(current?.options || []).map((opt, idx) => {
                const selected = Array.isArray(answers[current.id])
                  ? (answers[current.id] as number[]).includes(idx)
                  : false;
                return (
                  <label
                    key={idx}
                    className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        const prev = Array.isArray(answers[current.id])
                          ? (answers[current.id] as number[])
                          : [];
                        if (selected) {
                          setAnswer(current.id, prev.filter((i) => i !== idx));
                        } else {
                          setAnswer(current.id, [...prev, idx]);
                        }
                      }}
                    />
                    <span className="text-gray-900">{opt}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            // singleSelect
            <div className="space-y-3">
              {(current?.options || []).map((opt, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name={`q-${current.id}`}
                    checked={answers[current.id] === idx}
                    onChange={() => setAnswer(current.id, idx)}
                  />
                  <span className="text-gray-900">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {current?.explanation && submitted && (
            <div className="mt-4 flex items-start gap-2 bg-amber-50 text-amber-800 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <p className="text-sm">{current.explanation}</p>
            </div>
          )}
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
