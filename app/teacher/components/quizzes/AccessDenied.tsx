// app/teacher/components/quizzes/AccessDenied.tsx
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface AccessDeniedProps {
  type: "unauthenticated" | "not-teacher" | "pending-approval";
}

export function AccessDenied({ type }: AccessDeniedProps) {
  const messages = {
    "unauthenticated": {
      title: "Access Denied",
      description: "Please log in as a teacher to access this page.",
      action: {
        text: "Go to Login",
        href: "/login",
      },
      iconColor: "text-red-500",
    },
    "not-teacher": {
      title: "Teacher Access Required",
      description: "This page is only accessible to teachers.",
      action: null,
      iconColor: "text-yellow-500",
    },
    "pending-approval": {
      title: "Account Pending Approval",
      description: "Your teacher account is pending approval. Please contact the administrator.",
      action: {
        text: "Contact Admin",
        href: "mailto:admin@example.com",
      },
      iconColor: "text-yellow-500",
    },
  };

  const { title, description, action, iconColor } = messages[type];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-20">
        <AlertCircle className={`w-16 h-16 ${iconColor} mx-auto mb-6`} />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>
        {action && (
          <Link
            href={action.href}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition inline-block"
          >
            {action.text}
          </Link>
        )}
      </div>
    </div>
  );
}