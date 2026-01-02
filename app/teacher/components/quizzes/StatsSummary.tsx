// app/teacher/components/quizzes/StatsSummary.tsx
import { FileText, Users, Trophy } from "lucide-react";
import type { Quiz } from "@/types/quiz";

interface StatsSummaryProps {
  quizzes: Quiz[];
}

export function StatsSummary({ quizzes }: StatsSummaryProps) {
  const activeQuizzes = quizzes.filter(q => q.status === 'active').length;
  const quizzesWithScores = quizzes.filter(q => q.avgScore !== null);
  const averageScore = quizzesWithScores.length > 0 
    ? Math.round(quizzesWithScores.reduce((acc, q) => acc + (q.avgScore || 0), 0) / quizzesWithScores.length)
    : 0;

  const stats = [
    {
      label: "Total Quizzes",
      value: quizzes.length,
      icon: FileText,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
      textColor: "text-blue-600"
    },
    {
      label: "Active Quizzes",
      value: activeQuizzes,
      icon: Users,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
      textColor: "text-green-600"
    },
    {
      label: "Average Score",
      value: `${averageScore}%`,
      icon: Trophy,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
      textColor: "text-purple-600"
    }
  ];

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`${stat.bgColor} rounded-xl p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${stat.textColor}`}>{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}