"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, School, FileText } from "lucide-react";
import { usePathname } from "next/navigation";

type ActiveItem = "dashboard" | "classes" | "quizzes" | "templates";

export default function StudentSidebar() {
  const [activeItem, setActiveItem] = useState<ActiveItem>("dashboard");
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/student/quizzes")) {
      setActiveItem("quizzes");
    } else if (pathname.startsWith("/student/classes")) {
      setActiveItem("classes");
    } else if (pathname.startsWith("/student")) {
      setActiveItem("dashboard");
    }
  }, [pathname]);

  return (
    <div className="fixed left-0 top-18 overflow-hidden border border-gray-800 shadow-lg h-[90vh] max-w-[20rem]">
      <div className="bg-gradient-to-b from-gray-900 to-black text-white h-full flex flex-col">
        <div className="px-4 py-3 text-xs font-semibold text-gray-400 tracking-wider">
          Teaching
        </div>
        <nav className="px-3 pb-3 flex-1 overflow-y-auto">
          <Link
            href="/teacher"
            onClick={() => setActiveItem("dashboard")}
            className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
              activeItem === "dashboard"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20"
                : "text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1"
            }`}
          >
            {activeItem === "dashboard" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
            )}
            <LayoutDashboard
              className={`w-5 h-5 ${
                activeItem === "dashboard" ? "text-white" : "text-gray-400 group-hover:text-white"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">Dashboard</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 truncate">Overview & insights</p>
            </div>
          </Link>

          <Link
            href="/teacher/classes"
            onClick={() => setActiveItem("classes")}
            className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
              activeItem === "classes"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20"
                : "text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1"
            }`}
          >
            {activeItem === "classes" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
            )}
            <School
              className={`w-5 h-5 ${
                activeItem === "classes" ? "text-white" : "text-gray-400 group-hover:text-white"
              }`}
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium truncate">Classes</span>
            </div>

          </Link>

          <Link
            href="/teacher/quizzes"
            onClick={() => setActiveItem("quizzes")}
            className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
              activeItem === "quizzes"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20"
                : "text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1"
            }`}
          >
            {activeItem === "quizzes" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
            )}
            <FileText
              className={`w-5 h-5 ${
                activeItem === "quizzes" ? "text-white" : "text-gray-400 group-hover:text-white"
              }`}
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium truncate">Quizzes</span>
            </div>
          </Link>

          <Link
            href="/teacher/templates"
            onClick={() => setActiveItem("templates")}
            className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
              activeItem === "templates"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20"
                : "text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1"
            }`}
          >
            {activeItem === "templates" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
            )}
            <FileText
              className={`w-5 h-5 ${
                activeItem === "templates" ? "text-white" : "text-gray-400 group-hover:text-white"
              }`}
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium truncate">Templates</span>
            </div>
          </Link>
        </nav>
      </div>
    </div>
  );
}
