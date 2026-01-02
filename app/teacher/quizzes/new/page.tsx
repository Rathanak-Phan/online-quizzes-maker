// app/teacher/quizzes/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: "multiple" | "truefalse" | "shortanswer";
  options: string[];
  correctAnswer: string | number;
  points: number;
  explanation?: string;
}

export default function NewQuizPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Mathematics",
    timeLimit: 30,
    status: "draft",
    isTemplate: false,
  });

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Date.now().toString(),
      text: "",
      type: "multiple",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 10,
      explanation: "",
    },
  ]);

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
      // Reset options when changing type
      if (value === "multiple") {
        updatedQuestions[index].options = ["", "", "", ""];
        updatedQuestions[index].correctAnswer = 0;
      } else if (value === "truefalse") {
        updatedQuestions[index].options = ["True", "False"];
        updatedQuestions[index].correctAnswer = 0;
      } else if (value === "shortanswer") {
        updatedQuestions[index].options = [];
        updatedQuestions[index].correctAnswer = "";
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
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  // Add new question
  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      type: "multiple",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 10,
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
      
      if (!q.text.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }

      if (q.type === "multiple") {
        const hasEmptyOptions = q.options.some(opt => !opt.trim());
        if (hasEmptyOptions) {
          setError(`Question ${i + 1} has empty options`);
          return false;
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
      setLoading(true);

      const quizData = {
        ...formData,
        questions: questions.map(q => ({
          ...q,
          id: undefined, // Remove id as MongoDB will create its own
        })),
      };

      const response = await fetch("/api/teacher/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create quiz");
      }

      // Redirect to quizzes page or edit page
      router.push(`/teacher/quizzes/${result.quizId}/edit`);
      
    } catch (err: any) {
      console.error("Error creating quiz:", err);
      setError(err.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  // Handle save as draft
  const handleSaveDraft = async () => {
    setFormData(prev => ({ ...prev, status: "draft" }));
    await handleSubmit(new Event("submit") as any);
  };

  // Handle publish
  const handlePublish = async () => {
    setFormData(prev => ({ ...prev, status: "active" }));
    await handleSubmit(new Event("submit") as any);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                Publish Quiz
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
          {/* Basic Info Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title *
                </label>
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

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what this quiz is about..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
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

              {/* Time Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (minutes) *
                </label>
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
            </div>
          </div>

          {/* Questions Section */}
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

            {questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-6 mb-6 last:mb-0">
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
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      value={question.text}
                      onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Enter your question..."
                      required
                    />
                  </div>

                  {/* Question Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type *
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => handleQuestionChange(index, "type", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="multiple">Multiple Choice</option>
                      <option value="truefalse">True/False</option>
                      <option value="shortanswer">Short Answer</option>
                    </select>
                  </div>

                  {/* Options for Multiple Choice */}
                  {question.type === "multiple" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Options (Select the correct answer) *
                      </label>
                      <div className="space-y-3">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correctAnswer-${index}`}
                              checked={question.correctAnswer === optIndex}
                              onChange={() => handleQuestionChange(index, "correctAnswer", optIndex)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`Option ${optIndex + 1}`}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Options for True/False */}
                  {question.type === "truefalse" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select the correct answer *
                      </label>
                      <div className="space-y-3">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correctAnswer-${index}`}
                              checked={question.correctAnswer === optIndex}
                              onChange={() => handleQuestionChange(index, "correctAnswer", optIndex)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-gray-700">{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Correct Answer for Short Answer */}
                  {question.type === "shortanswer" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer *
                      </label>
                      <input
                        type="text"
                        value={question.correctAnswer as string}
                        onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter the correct answer"
                        required
                      />
                    </div>
                  )}

                  {/* Points */}
                  <div className="max-w-xs">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => handleQuestionChange(index, "points", parseInt(e.target.value) || 1)}
                        min="1"
                        max="100"
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={question.explanation || ""}
                      onChange={(e) => handleQuestionChange(index, "explanation", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Settings Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isTemplate"
                  checked={formData.isTemplate}
                  onChange={handleInputChange}
                  id="isTemplate"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isTemplate" className="ml-3 text-gray-700">
                  Save as template for future use
                </label>
              </div>

              <div className="text-sm text-gray-500">
                <p>Templates can be reused to create new quizzes quickly.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Link
              href="/teacher/quizzes"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save as Draft"}
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50"
              >
                {loading ? "Publishing..." : "Publish Quiz"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}