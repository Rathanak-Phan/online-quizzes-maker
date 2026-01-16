// app/teacher/quizzes/[quizId]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  Type,
  Hash,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Question {
  type: "singleSelect" | "multiSelect" | "trueFalse" | "fillBlank";
  question: string;
  options?: string[];
  answer?: number | boolean | string;
  answers?: number[];
  hint?: string;
  explanation?: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  timeLimit: number;
  questions: Question[];
}


export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Mathematics",
    timeLimit: 30,
    status: "draft",
  });


  const [questions, setQuestions] = useState<Question[]>([]);

  // Available categories
  const categories = [
    "Mathematics",
    "Science",
    "History",
    "English",
    "Computer Science",
    "Geography",
    "Art",
    "Music",
    "Physical Education",
    "Other",
  ];

  // Fetch quiz data
  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teacher/quizzes/${quizId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch quiz");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Quiz not found");
        }

        const q = result.quiz;
        setQuiz(q);
        setFormData({
          title: q.title,
          description: q.description || "",
          category: q.category,
          timeLimit: q.timeLimit,
          status: q.status,
        });
        const normalized: Question[] = Array.isArray(q.questions)
          ? q.questions.map((it: any) => ({
              type: (it.type as Question["type"]) || "singleSelect",
              question: typeof it.question === "string" ? it.question : it.text || "",
              options: Array.isArray(it.options)
                ? it.options.map((o: any) => (typeof o === "string" ? o : o?.text ?? String(o)))
                : undefined,
              answer:
                it.answer !== undefined
                  ? it.answer
                  : Array.isArray(it.answers)
                  ? undefined
                  : it.correctAnswer,
              answers: Array.isArray(it.answers)
                ? it.answers
                : Array.isArray(it.correctAnswers)
                ? it.correctAnswers
                : undefined,
              hint: it.hint,
              explanation: it.explanation,
            }))
          : [];
        setQuestions(normalized);

      } catch (err: any) {
        console.error("Error fetching quiz:", err);
        setError(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle question changes
  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];

    if (field === "type") {
      const t = value as Question["type"];
      if (t === "singleSelect") {
        updatedQuestions[index].options = ["", "", "", ""];
        updatedQuestions[index].answer = 0;
        updatedQuestions[index].answers = undefined;
      } else if (t === "multiSelect") {
        updatedQuestions[index].options = ["", "", "", ""];
        updatedQuestions[index].answers = [];
        updatedQuestions[index].answer = undefined;
      } else if (t === "trueFalse") {
        updatedQuestions[index].options = ["True", "False"];
        updatedQuestions[index].answer = false;
        updatedQuestions[index].answers = undefined;
      } else if (t === "fillBlank") {
        updatedQuestions[index].options = [];
        updatedQuestions[index].answer = "";
        updatedQuestions[index].answers = undefined;
      }
    }

    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };

    setQuestions(updatedQuestions);
  };

  // Handle option changes for multiple choice
  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const opts = updatedQuestions[questionIndex].options || [];
    opts[optionIndex] = value;
    updatedQuestions[questionIndex].options = opts;
    setQuestions(updatedQuestions);
  };

  // Add new question
  const addQuestion = () => {
    const newQuestion: Question = {
      type: "singleSelect",
      question: "",
      options: ["", "", "", ""],
      answer: 0,
      hint: "",
      explanation: "",
    };
    setQuestions([...questions, newQuestion]);
  };

  // Remove question
  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert("At least one question is required");
      return;
    }
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("Quiz title is required");
      return false;
    }

    if (!formData.category.trim()) {
      setError("Category is required");
      return false;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.question?.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }

      if (q.type === "singleSelect" || q.type === "multiSelect" || q.type === "trueFalse") {
        const opts = q.options || [];
        const hasEmptyOptions = opts.some(opt => !opt?.trim());
        if ((q.type === "singleSelect" || q.type === "multiSelect") && hasEmptyOptions) {
          setError(`Question ${i + 1} has empty options`);
          return false;
        }
        if (q.type === "singleSelect") {
          if (typeof q.answer !== "number") {
            setError(`Question ${i + 1} must have a selected correct option`);
            return false;
          }
        }
        if (q.type === "multiSelect") {
          if (!Array.isArray(q.answers) || q.answers.length === 0) {
            setError(`Question ${i + 1} must have at least one correct option`);
            return false;
          }
        }
        if (q.type === "trueFalse") {
          if (typeof q.answer !== "boolean") {
            setError(`Question ${i + 1} must set True or False as answer`);
            return false;
          }
        }
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        timeLimit: formData.timeLimit,
        questions,
      };


      const response = await fetch(`/api/teacher/quizzes/${quizId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });


      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update quiz");
      }

      // Show success message
      alert("Quiz updated successfully!");

      // Redirect back to quizzes page
      router.push("/teacher/quizzes");

    } catch (err: any) {
      console.error("Error updating quiz:", err);
      setError(err.message || "Failed to update quiz");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/quizzes/${quizId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete quiz");
      }

      // Redirect to quizzes page
      router.push("/teacher/quizzes");

    } catch (err: any) {
      console.error("Error deleting quiz:", err);
      setError(err.message || "Failed to delete quiz");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete Quiz
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <HelpCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter quiz title"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what this quiz is about..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes) *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleInputChange}
                    min="1"
                    max="180"
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Questions ({questions.length})</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            {questions.map((q, index) => {
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-6 mb-6 last:mb-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Question {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                      <textarea
                        value={q.question}
                        onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        placeholder="Enter your question..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question Type *</label>
                      <select
                        value={q.type}
                        onChange={(e) => handleQuestionChange(index, "type", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="singleSelect">Single Select</option>
                        <option value="multiSelect">Multi Select</option>
                        <option value="trueFalse">True/False</option>
                        <option value="fillBlank">Fill in the Blank</option>
                      </select>
                    </div>

                    {(q.type === "singleSelect" || q.type === "multiSelect" || q.type === "trueFalse") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Options *</label>
                        <div className="space-y-3">
                          {(q.options || []).map((opt, optIndex) => {
                            const isSingle = q.type === "singleSelect";
                            const isMulti = q.type === "multiSelect";
                            const isTF = q.type === "trueFalse";
                            const checkedSingle = isSingle && typeof q.answer === "number" && q.answer === optIndex;
                            const checkedMulti = isMulti && Array.isArray(q.answers) && q.answers.includes(optIndex);
                            const checkedTF = isTF && typeof q.answer === "boolean" && ((optIndex === 0 && q.answer === true) || (optIndex === 1 && q.answer === false));
                            return (
                              <div key={optIndex} className="flex items-center gap-3">
                                {isSingle && (
                                  <input
                                    type="radio"
                                    name={`correct-${index}`}
                                    checked={checkedSingle}
                                    onChange={() => handleQuestionChange(index, "answer", optIndex)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                )}
                                {isMulti && (
                                  <input
                                    type="checkbox"
                                    checked={checkedMulti}
                                    onChange={(e) => {
                                      const next = Array.isArray(q.answers) ? [...q.answers] : [];
                                      if (e.target.checked) {
                                        if (!next.includes(optIndex)) next.push(optIndex);
                                      } else {
                                        const i = next.indexOf(optIndex);
                                        if (i >= 0) next.splice(i, 1);
                                      }
                                      handleQuestionChange(index, "answers", next);
                                    }}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                )}
                                {isTF && (
                                  <input
                                    type="radio"
                                    name={`tf-${index}`}
                                    checked={checkedTF}
                                    onChange={() => handleQuestionChange(index, "answer", optIndex === 0)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                )}
                                <input
                                  type="text"
                                  value={typeof opt === "string" ? opt : String(opt ?? "")}
                                  onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder={`Option ${optIndex + 1}`}
                                  required={q.type !== "trueFalse"}
                                  disabled={q.type === "trueFalse"}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {q.type === "fillBlank" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer *</label>
                        <input
                          type="text"
                          value={typeof q.answer === "string" ? q.answer : ""}
                          onChange={(e) => handleQuestionChange(index, "answer", e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter the correct answer"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hint (Optional)</label>
                      <textarea
                        value={q.hint || ""}
                        onChange={(e) => handleQuestionChange(index, "hint", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        placeholder="Provide a hint to help students"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
                      <textarea
                        value={q.explanation || ""}
                        onChange={(e) => handleQuestionChange(index, "explanation", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        placeholder="Explain why this is the correct answer"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
