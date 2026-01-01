// app/teacher/layout.tsx
"use client";

import { useState, useEffect } from "react";
import TeacherHeader from "./components/Header";
import TeacherSidebar from "./components/Sidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for collapse/expand from Sidebar
  useEffect(() => {
    const handleCollapse = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener(
      "sidebar-collapse",
      handleCollapse as EventListener
    );

    // Load saved state
    const saved = localStorage.getItem("teacher-sidebar-collapsed");
    if (saved === "true") setSidebarCollapsed(true);

    return () => {
      window.removeEventListener(
        "sidebar-collapse",
        handleCollapse as EventListener
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="sticky top-0 z-40 h-screen">
        <TeacherSidebar />
      </div>

      {/* Main Content - Auto resizes based on sidebar width */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "ml-20" : "ml-64" // Adjust left margin
        } lg:ml-0`} // On large screens, no margin needed because sidebar is static
      >
        <TeacherHeader />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
