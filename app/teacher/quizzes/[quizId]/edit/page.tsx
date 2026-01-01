// app/teacher/quizzes/[quizId]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

interface Question {
  id: string;
  title: string;
  type: "multiple" | "truefalse" | "short";
  points: number;
  options?: string[];
  correctAnswer?: number | boolean | string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
}

export default function EditQuizPage() {
  const router = useRouter();
  const { quizId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quizId) fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/teacher/quizzes/${quizId}`);
      if (!res.ok) throw new Error("Quiz not found");
      const data = await res.json();

      setTitle(data.title);
      setDescription(data.description || "");
      setTimeLimit(data.timeLimit || 30);
      setQuestions(data.questions.map((q: any, i: number) => ({
        id: i.toString(),
        ...q,
        options: q.options || ["", "", "", ""],
      })));
    } catch (err) {
      alert("Failed to load quiz");
      router.push("/teacher/quizzes");
    } finally {
      setLoading(false);
    }
  };

  const updateQuiz = async () => {
    if (!title.trim()) return alert("Title required");

    try {
      const res = await fetch(`/api/teacher/quizzes/${quizId}`, {
        method: "PUT",
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
        router.push(`/teacher/quizzes/${quizId}/results`);
      } else {
        alert("Failed to update");
      }
    } catch (err) {
      alert("Error updating quiz");
    }
  };

  // Reuse same functions as create page (addQuestion, removeQuestion, etc.)
  // ... (copy from new/page.tsx)

  if (loading) return <div className="text-center py-20 text-2xl">Loading quiz...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href={`/teacher/quizzes/${quizId}`} className="inline-flex items-center gap-2 text-blue-600 mb-4">
        <ArrowLeft /> Back
      </Link>
      <h1 className="text-3xl font-bold mb-8">Edit Quiz</h1>

      {/* Same form as create page */}
      {/* ... title, time, questions, save button calling updateQuiz() ... */}
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-6">
        <div className="max-w-5xl mx-auto flex justify-end gap-4">
          <button onClick={updateQuiz} className="flex items-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-xl">
            <Save /> Update Quiz
          </button>
        </div>
      </div>
    </div>
  );
}