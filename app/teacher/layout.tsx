"use client";

import { ReactNode } from "react";
import TeacherSidebar from "../components/teacher/Sidebar";
import TeacherHeader from "../components/teacher/Header";


export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
        <TeacherSidebar />
      <div className="flex-1 flex flex-col">
        <TeacherHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
