// app/admin/reports/page.tsx
import { BarChart3, Users, BookOpen, Clock, TrendingUp, Award } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-lg text-gray-600 mt-2">
          Comprehensive insights into platform performance, user engagement, and quiz activity.
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Active Users</p>
              <p className="text-4xl font-bold mt-2">8,542</p>
              <p className="text-blue-200 text-sm mt-1">+12% from last month</p>
            </div>
            <Users className="w-12 h-12 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Quizzes Completed</p>
              <p className="text-4xl font-bold mt-2">3,219</p>
              <p className="text-green-200 text-sm mt-1">This month</p>
            </div>
            <BookOpen className="w-12 h-12 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg. Completion Time</p>
              <p className="text-4xl font-bold mt-2">14m 32s</p>
              <p className="text-purple-200 text-sm mt-1">-8% from last week</p>
            </div>
            <Clock className="w-12 h-12 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Top Score Average</p>
              <p className="text-4xl font-bold mt-2">92.4%</p>
              <p className="text-orange-200 text-sm mt-1">All time high</p>
            </div>
            <Award className="w-12 h-12 opacity-60" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="py-4 px-1 border-b-2 border-blue-600 text-blue-600 font-medium">
            Overview
          </button>
          <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
            User Activity
          </button>
          <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
            Quiz Performance
          </button>
          <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
            Engagement Trends
          </button>
        </nav>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">User Growth</h2>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Line chart: New users per month (Jan–Dec 2025)</p>
          </div>
          <p className="text-sm text-gray-500 text-center mt-4">+28% growth this year</p>
        </div>

        {/* Quiz Completion Rate */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quiz Completion Rate</h2>
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Bar chart: Completion % by category</p>
          </div>
          <p className="text-sm text-gray-500 text-center mt-4">Math: 94% • Science: 87% • History: 81%</p>
        </div>
      </div>

      {/* Top Performing Quizzes */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Performing Quizzes</h2>
        <div className="space-y-4">
          {["Advanced Algebra Challenge", "World History Timeline", "Biology Fundamentals", "Physics Motion Quiz", "English Literature Exam"].map((quiz, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{quiz}</h3>
                  <p className="text-sm text-gray-600">1,245 attempts • Avg score: 89%</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-4 py-2 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                  +15% this week
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-end gap-4">
        <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">
          Export as CSV
        </button>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-md">
          Generate PDF Report
        </button>
      </div>
    </div>
  );
}