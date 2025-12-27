"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "../components/admin/Header";
import Sidebar from "../components/admin/Sidebar";

export default function AdminLayout({
  children,
  allowedRoles = ["admin"],
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    // Not logged in → redirect to login
      if (!storedUser && pathname !== "/admin/login") {
        router.replace("/admin/login");
        return;
      }

    // Logged in as admin but trying to access login → redirect to dashboard
    if (storedUser?.role === "admin" && pathname === "/admin/login") {
      router.replace("/admin");
      return;
    }

    // Logged in but role not allowed → redirect to login
    if (storedUser && !allowedRoles.includes(storedUser.role)) {
      router.replace("/admin/login");
      return;
    }

    // Done checking auth → show page
    setLoading(false);
  }, [pathname, router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  // Login page → render children only
  if (pathname === "/admin/login") return <>{children}</>;

  // Admin dashboard → render layout with sidebar & header
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
