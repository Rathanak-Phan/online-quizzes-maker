"use client";

import React, { useState } from "react";
import { Search, UserPlus, FileText, Mail, Calendar, Trophy, ChevronRight } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<Tab>("students");
  const [searchTerm, setSearchTerm] = useState("");
  const params = useParams();
  console.log(params.classId);


  // Mock Data (Empty to match your screenshot state)
  const students: Student[] = [];
  const quizzes: ClassQuiz[] = [

  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-20">
      <div className="max-w-6xl mx-auto">

        {/* --- Header / Navigation Tabs --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">

          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-gray-200 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("students")}
              className={`pb-3 text-lg font-bold transition-all relative ${activeTab === "students"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400 hover:text-gray-600"
                }`}
            >
              Students ({students.length})
            </button>
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`pb-3 text-lg font-bold transition-all relative ${activeTab === "quizzes"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400 hover:text-gray-600"
                }`}
            >
              Quizzes ({quizzes.length})
            </button>
          </div>

          {/* Action Button (Dynamic based on Tab) */}
          <div className="mt-4 md:mt-0">
            {activeTab === "students" ? (
              <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm transition-all">
                <UserPlus className="w-5 h-5" />
                Invite Students
              </button>
            ) : (
              <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm transition-all">
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
            {/* Search Bar */}
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

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 p-5 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">Name</div>
                <div className="col-span-1">Email</div>
                <div className="col-span-1">Joined</div>
                <div className="col-span-1">Quizzes</div>
                <div className="col-span-1">Avg Score</div>
              </div>

              {/* Table Body */}
              {students.length === 0 ? (
                // Empty State
                <div>
                  <div className="bg-white p-12 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Student Yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      You haven't assigned any quizzes to this class yet.
                    </p>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                      Invite Students
                    </button>
                  </div>
                </div>
              ) : (
                // List of Students
                <div>
                  {students.map((student) => (
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
                      <div className={`font-bold ${(student.avgScore || 0) >= 80 ? 'text-green-600' :
                        (student.avgScore || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {student.avgScore ? `${student.avgScore}%` : '--'}
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
            {/* Search Bar */}
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
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 p-5 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-2">Quiz Title</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {quizzes.length === 0 ? (
                // Empty State
                <div>
                  <div className="bg-white p-12 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Quizzes Assigned
                    </h3>
                    <p className="text-gray-500 mb-6">
                      You haven't assigned any quizzes to this class yet.
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Assign First Quiz
                    </button>
                  </div>
                </div>
              ) : (
                // Quiz List Table
                <div>
                  {/* Table Body */}
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
                          </div>
                        </div>

                        <div className="col-span-1">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${quiz.status === "active"
                              ? "bg-green-100 text-green-700"
                              : quiz.status === "completed"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {quiz.status}
                          </span>
                        </div>

                        <div className="col-span-1 flex justify-end">
                          <button className="text-gray-400 hover:text-blue-600 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}