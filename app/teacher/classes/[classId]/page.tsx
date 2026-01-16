"use client";

import React, { useState, useEffect } from "react";
import { Search, UserPlus, FileText, Loader2, ChevronRight, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";

type Tab = "students" | "quizzes";

interface Student {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  quizzesTaken: number;
  avgScore: number | null;
}

interface ClassQuiz {
  id: string;
  title: string;
  status: "active" | "completed" | "scheduled";
  dueDate?: string;
}

export default function ClassDetailsPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<Tab>("students");
  const [searchTerm, setSearchTerm] = useState("");
  
  // 1. FIX: Use State for data so the UI updates when data arrives
  const [students, setStudents] = useState<Student[]>([]);
  const [quizzes, setQuizzes] = useState<ClassQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const [showAssign, setShowAssign] = useState(false);
  const [quizOptions, setQuizOptions] = useState<{ id: string; title: string }[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMsg, setAssignMsg] = useState("");

  // 2. FIX: Use useEffect to actually trigger the fetch
  useEffect(() => {
    if (params.classId) {
      fetchClassDetails();
    }
  }, [params.classId]);

const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const classId = params.classId;

      const res = await fetch(`/api/teacher/classes/${classId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const responseJson = await res.json();
      console.log("API Response:", responseJson);

      // FIX: Access .data because your API wraps the result in { success: true, data: ... }
      const classData = responseJson.data || {}; 

      setStudents(classData.students || []);
      setQuizzes(classData.quizzes || []);
    } catch (err: any) {
      console.error("Failed to fetch class details:", err);
      setError("Failed to load class data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleInviteStudent = async () => {
    try {
      setInviteLoading(true);
      setInviteMsg("");
      const classId = params.classId;
      const res = await fetch(`/api/teacher/classes/${classId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setInviteMsg(data.error || "Failed to invite");
        return;
      }
      const s = data.student;
      setStudents((prev) => [
        ...prev,
        {
          id: s._id || s.id,
          name: s.name || "",
          email: s.email || "",
          joinedDate: new Date().toISOString(),
          quizzesTaken: 0,
          avgScore: null,
        },
      ]);
      setInviteMsg(data.message || "Invited");
      setInviteEmail("");
      setShowInvite(false);
    } catch (e) {
      setInviteMsg("Server error");
    } finally {
      setInviteLoading(false);
    }
  };
  
  const loadQuizzes = async () => {
    try {
      const res = await fetch(`/api/teacher/quizzes`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) return;
      const options = (data.quizzes || []).map((q: any) => ({
        id: q._id || q.id,
        title: q.title || "Untitled Quiz",
      }));
      setQuizOptions(options);
    } catch {}
  };
  
  const handleAssignQuiz = async () => {
    try {
      setAssignLoading(true);
      setAssignMsg("");
      const classId = params.classId;
      const res = await fetch(`/api/teacher/classes/${classId}/addquiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: selectedQuizId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAssignMsg(data.error || "Failed to assign");
        return;
      }
      const q = data.quiz;
      setQuizzes((prev) => [
        ...prev,
        {
          id: q.id,
          title: q.title,
          status: "active",
          dueDate: q.dueDate,
        },
      ]);
      setAssignMsg(data.message || "Assigned");
      setSelectedQuizId("");
      setShowAssign(false);
    } catch (e) {
      setAssignMsg("Server error");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: string, email?: string) => {
    try {
      const classId = params.classId as string;
      const res = await fetch(`/api/teacher/classes/${classId}/removestudent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, email }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        alert(data.error || "Failed to remove student");
        return;
      }
      setStudents((prev) => prev.filter((s) => s.id !== studentId && s.email !== email));
    } catch {
      alert("Server error");
    }
  };

  const handleRemoveQuiz = async (quizId: string, title?: string) => {
    try {
      const classId = params.classId as string;
      const res = await fetch(`/api/teacher/classes/${classId}/removequiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, title }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        alert(data.error || "Failed to remove quiz");
        return;
      }
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId && q.title !== title));
    } catch {
      alert("Server error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-20">
      <div className="max-w-6xl mx-auto px-4">

        {/* --- Header / Navigation Tabs --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          
          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-gray-200 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("students")}
              className={`pb-3 text-lg font-bold transition-all relative ${
                activeTab === "students"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Students ({students.length})
            </button>
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`pb-3 text-lg font-bold transition-all relative ${
                activeTab === "quizzes"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Quizzes ({quizzes.length})
            </button>
          </div>

          {/* Action Button */}
          <div className="mt-4 md:mt-0">
            {activeTab === "students" ? (
              <button
                onClick={() => setShowInvite((v) => !v)}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm transition-all"
              >
                <UserPlus className="w-5 h-5" />
                Invite Students
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowAssign((v) => !v);
                  if (!showAssign) loadQuizzes();
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm transition-all"
              >
                <FileText className="w-5 h-5" />
                Assign Quiz
              </button>
            )}
          </div>
        </div>

        {/* --- CONTENT AREA --- */}

        {/* 1. STUDENTS TAB */}
        {activeTab === "students" && (
          <div className="animate-in fade-in duration-300">
            {showInvite && (
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Student email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full max-w-md px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
                <button
                  onClick={handleInviteStudent}
                  disabled={inviteLoading || !inviteEmail}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {inviteLoading ? "Inviting..." : "Invite"}
                </button>
                {inviteMsg && <span className="text-sm text-gray-600">{inviteMsg}</span>}
              </div>
            )}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-5 gap-4 p-5 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">Name</div>
                <div className="col-span-1">Email</div>
                <div className="col-span-1">Joined</div>
                <div className="col-span-1">Quizzes</div>
                <div className="col-span-1">Avg Score</div>
              </div>

              {students.length === 0 ? (
                <div className="bg-white p-12 text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Yet</h3>
                  <p className="text-gray-500 mb-6">Invite students to get started.</p>
                </div>
              ) : (
                <div>
                  {students
                    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((student) => (
                    <div
                      key={student.id}
                      className="grid grid-cols-5 gap-4 p-5 border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors items-center text-sm text-gray-700"
                    >
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-gray-500 truncate">{student.email}</div>
                      <div className="text-gray-500">{student.joinedDate}</div>
                      <div>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                          {student.quizzesTaken} taken
                        </span>
                      </div>
                      <div className={`font-bold ${
                        (student.avgScore || 0) >= 80 ? 'text-green-600' :
                        (student.avgScore || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {student.avgScore ? `${student.avgScore}%` : '--'}
                      </div>
                      <div className="col-span-5 flex justify-end">
                        <button
                          className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          onClick={() => handleRemoveStudent(student.id, student.email)}
                          title="Remove student"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. QUIZZES TAB */}
        {activeTab === "quizzes" && (
          <div className="animate-in fade-in duration-300">
            {showAssign && (
              <div className="mb-4 flex items-center gap-2">
                <select
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                  className="w-full max-w-md px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select a quiz</option>
                  {quizOptions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignQuiz}
                  disabled={assignLoading || !selectedQuizId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {assignLoading ? "Assigning..." : "Add to Class"}
                </button>
                {assignMsg && <span className="text-sm text-gray-600">{assignMsg}</span>}
              </div>
            )}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assigned quizzes..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-4 gap-4 p-5 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-2">Quiz Title</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {quizzes.length === 0 ? (
                <div className="bg-white p-12 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quizzes Assigned</h3>
                  <p className="text-gray-500 mb-6">You haven't assigned any quizzes to this class yet.</p>
                  <button
                    onClick={() => {
                      setShowAssign(true);
                      loadQuizzes();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Assign First Quiz
                  </button>
                </div>
              ) : (
                <div>
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="grid grid-cols-4 gap-4 p-5 border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors items-center"
                    >
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{quiz.title}</p>
                          <p className="text-xs text-gray-500">{quiz.dueDate ? `Due: ${quiz.dueDate}` : "No Due Date"}</p>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          quiz.status === "active" ? "bg-green-100 text-green-700" :
                          quiz.status === "completed" ? "bg-gray-100 text-gray-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {quiz.status}
                        </span>
                      </div>

                      <div className="col-span-1 flex justify-end gap-2">
                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg"
                          onClick={() => handleRemoveQuiz(quiz.id, quiz.title)}
                          title="Remove quiz"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
