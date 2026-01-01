// app/teacher/quizzes/new/page.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  type: "multiple" | "truefalse" | "short";
  title: string;
  points: number;
  options?: string[];
  correctAnswer?: number | boolean | string;
}

export default function NewQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(30); // minutes
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      type: "multiple",
      title: "",
      points: 10,
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ]);

  const addQuestion = () => {
    const newQ: Question = {
      id: Date.now().toString(),
      type: "multiple",
      title: "",
      points: 10,
      options: ["", "", "", ""],
      correctAnswer: 0,
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (qId: string, index: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.options) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const saveQuiz = async () => {
    if (!title.trim()) {
      alert("Please enter a quiz title");
      return;
    }

    if (questions.some(q => !q.title.trim())) {
      alert("All questions must have a title");
      return;
    }

    try {
      const res = await fetch("/api/teacher/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          timeLimit,
          questions: questions.map(q => ({
            title: q.title,
            type: q.type,
            points: q.points,
            options: q.options,
            correctAnswer: q.correctAnswer,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/teacher/quizzes/${data.quizId}/results`);
      } else {
        alert("Failed to save quiz");
      }
    } catch (err) {
      alert("Error saving quiz");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-10">
        <Link href="/teacher/quizzes" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-5 h-5" />
          Back to Quizzes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
        <p className="text-gray-600 mt-2">Build your quiz question by question</p>
      </div>

      {/* Quiz Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Algebra Fundamentals Quiz"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              min="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief description for students..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, qIndex) => (
          <div key={question.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Question {qIndex + 1}</h3>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-6">
              <input
                type="text"
                value={question.title}
                onChange={(e) => updateQuestion(question.id, "title", e.target.value)}
                placeholder="Enter question text..."
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex items-center gap-4">
                <select
                  value={question.type}
                  onChange={(e) => updateQuestion(question.id, "type", e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl"
                >
                  <option value="multiple">Multiple Choice</option>
                  <option value="truefalse">True/False</option>
                  <option value="short">Short Answer</option>
                </select>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Points:</label>
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) => updateQuestion(question.id, "points", Number(e.target.value))}
                    min="1"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                  />
                </div>
              </div>

              {question.type === "multiple" && (
                <div className="space-y-4">
                  {question.options?.map((option, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={question.correctAnswer === i}
                        onChange={() => updateQuestion(question.id, "correctAnswer", i)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(question.id, i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}

              {question.type === "truefalse" && (
                <div className="flex gap-8">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={question.correctAnswer === true}
                      onChange={() => updateQuestion(question.id, "correctAnswer", true)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-medium">True</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={question.correctAnswer === false}
                      onChange={() => updateQuestion(question.id, "correctAnswer", false)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-medium">False</span>
                  </label>
                </div>
              )}

              {question.type === "short" && (
                <input
                  type="text"
                  value={question.correctAnswer as string || ""}
                  onChange={(e) => updateQuestion(question.id, "correctAnswer", e.target.value)}
                  placeholder="Expected answer (case insensitive)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition flex items-center justify-center gap-3 text-gray-600 hover:text-blue-600"
        >
          <Plus className="w-6 h-6" />
          Add Another Question
        </button>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6">
        <div className="max-w-5xl mx-auto flex justify-end gap-4">
          <Link
            href="/teacher/quizzes"
            className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
          >
            Cancel
          </Link>
          <button
            onClick={saveQuiz}
            className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
          >
            <Save className="w-5 h-5" />
            Save Quiz
          </button>
        </div>
      </div>
    </div>
  );
}