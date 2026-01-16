"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  School, 
  FileText, 
  LayoutTemplate // Icon for Templates
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  // Helper function to check if a link is active
  // It checks if the current pathname starts with the link's href
  const isActive = (path: string) => {
    // strict check for dashboard to avoid highlighting it on every /teacher page
    if (path === "/teacher") {
      return pathname === "/teacher";
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/teacher",
      icon: LayoutDashboard,
      description: "Overview & insights",
    },
    {
      name: "Classes",
      href: "/teacher/classes", // Matches /teacher/classes, /teacher/classes/new, etc.
      icon: School,
      description: "Manage students",
    },
    {
      name: "Quizzes",
      href: "/teacher/quizzes",
      icon: FileText,
      description: "Assessments",
    },
    {
      name: "Templates",
      href: "/teacher/templates",
      icon: LayoutTemplate,
      description: "Reusable formats",
    },
  ];

  return (
    <div className="fixed left-0 top-18 overflow-hidden border border-gray-800 shadow-lg h-[90vh] max-w-[20rem]">
      <div className="bg-gradient-to-b from-gray-900 to-black text-white h-full flex flex-col">
        <div className="px-4 py-3 text-xs font-semibold text-gray-400 tracking-wider">
          Teaching
        </div>
        
        <nav className="px-3 pb-3 flex-1 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1"
                }`}
              >
                {/* Active Indicator Bar */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                )}

                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    active ? "text-white" : "text-gray-400 group-hover:text-white"
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{item.name}</span>
                  </div>
                  {/* Optional: Show description only if active or hovered? 
                      Currently showing always for consistency */}
                  {/* <p className="text-xs text-gray-400 mt-1 truncate">
                    {item.description}
                  </p> */}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}