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
  id: string;
  text: string;
  type: "multiple" | "truefalse" | "shortanswer";
  options: string[];
  correctAnswer: string | number;
  points: number;
  explanation?: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  timeLimit: number;
  status: string;
  isTemplate: boolean;
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
    isTemplate: false,
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

        setQuiz(result.quiz);
        setFormData({
          title: result.quiz.title,
          description: result.quiz.description || "",
          category: result.quiz.category,
          timeLimit: result.quiz.timeLimit,
          status: result.quiz.status,
          isTemplate: result.quiz.isTemplate || false,
        });
        setQuestions(result.quiz.questions || []);
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
      setSaving(true);

      const updateData = {
        ...formData,
        questions: questions.map(q => ({
          ...q,
          id: undefined, // Remove id as MongoDB will handle it
        })),
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
      <div className="min-h-screen flex items-center justify-center">
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
          {/* Basic Info Section - Same as New Quiz page */}
          {/* Copy the Basic Info, Questions, and Settings sections from NewQuizPage */}
          {/* Make sure to use formData and questions state */}
        </form>
      </div>
    </div>
  );
}