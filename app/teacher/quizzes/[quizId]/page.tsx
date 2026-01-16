"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Clock,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";

interface RawQuestion {
  type?: string;
  question?: string;
  text?: string;
  options?: any[];
  answer?: number | boolean | string;
  answers?: number[];
  correctAnswer?: any;
  correctAnswers?: number[];
  points?: number;
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  timeLimit?: number;
  questions?: RawQuestion[];
}

function normalizeQuestion(q: RawQuestion) {
  const text =
    (typeof q.question === "string" ? q.question : undefined) ??
    (typeof q.text === "string" ? q.text : "") ??
    "";
  const options = Array.isArray(q.options)
    ? q.options.map((o: any) => (typeof o === "string" ? o : o?.text ?? String(o)))
    : undefined;
  const type = q.type || (options && options.length === 2 ? "trueFalse" : options && options.length ? "multiple" : "shortanswer");

  const single =
    q.answer !== undefined
      ? q.answer
      : q.correctAnswer !== undefined
      ? q.correctAnswer
      : undefined;
  const multi =
    Array.isArray(q.answers) && q.answers.length
      ? q.answers
      : Array.isArray(q.correctAnswers) && q.correctAnswers.length
      ? q.correctAnswers
      : undefined;

  return { text, options, type, single, multi, points: q.points ?? 0 };
}

export default function PreviewQuizPage() {
  const params = useParams();
  const quizId = params.quizId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (!quizId) return;
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/teacher/quizzes/${quizId}`);
        const data = await res.json();
        if (!res.ok || data.success === false) {
          throw new Error(data.error || "Failed to load quiz");
        }
        setQuiz(data.quiz as Quiz);
      } catch (err: any) {
        setError(err.message || "Failed to load quiz");
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Quiz</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/teacher/quizzes"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const questions = Array.isArray(quiz?.questions)
    ? quiz!.questions!.map(normalizeQuestion)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/teacher/quizzes"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Quizzes
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Preview Quiz</h1>
          </div>
          <div className="flex gap-3">
            {quiz?._id && (
              <>
                <Link
                  href={`/teacher/quizzes/${quiz._id}/edit`}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </Link>
                <Link
                  href={`/teacher/quizzes/${quiz._id}/results`}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Results
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">{quiz?.title}</h2>
              {quiz?.description && (
                <p className="text-gray-600 mt-2">{quiz.description}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <span className="inline-flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                {questions.length} Questions
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                {quiz?.timeLimit ?? 0} Minutes
              </span>
              {quiz?.category && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  {quiz.category}
                </span>
              )}
              {quiz?.status && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                  {quiz.status}
                </span>
              )}
            </div>

            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question {idx + 1}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {q.type}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-4">{q.text}</p>

                  {Array.isArray(q.options) && q.options.length > 0 ? (
                    <ul className="space-y-2">
                      {q.options.map((opt, i) => {
                        const isCorrect =
                          (typeof q.single === "number" && q.single === i) ||
                          (Array.isArray(q.multi) && q.multi.includes(i)) ||
                          (typeof q.single === "boolean" &&
                            ((q.single === true && i === 0) ||
                              (q.single === false && i === 1)));
                        return (
                          <li
                            key={i}
                            className={`flex items-center gap-2 px-3 py-2 rounded border ${
                              isCorrect
                                ? "border-green-300 bg-green-50 text-green-800"
                                : "border-gray-200 bg-white text-gray-800"
                            }`}
                          >
                            {isCorrect && (
                              <BadgeCheck className="w-4 h-4 text-green-600" />
                            )}
                            <span>{opt}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="px-3 py-2 rounded border border-gray-200 bg-white text-gray-700">
                      {typeof q.single === "string" && q.single
                        ? `Correct answer: ${q.single}`
                        : "No options provided"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Category</span>
                <span className="font-medium">{quiz?.category ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-medium">{quiz?.status ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>Time Limit</span>
                <span className="font-medium">{quiz?.timeLimit ?? 0} min</span>
              </div>
              <div className="flex justify-between">
                <span>Total Questions</span>
                <span className="font-medium">{questions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
