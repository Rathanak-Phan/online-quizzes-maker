// app/page.tsx or app/home.tsx
import Link from "next/link";

export default function HomePage() {
  const categories = [
    { name: "Mathematics", icon: "➗", color: "bg-blue-500" },
    { name: "Science", icon: "🧪", color: "bg-green-500" },
    { name: "History", icon: "📜", color: "bg-orange-500" },
    { name: "Geography", icon: "🌍", color: "bg-teal-500" },
    { name: "Programming", icon: "💻", color: "bg-purple-500" },
    { name: "Languages", icon: "🗣️", color: "bg-pink-500" },
    { name: "General Knowledge", icon: "❓", color: "bg-gray-500" },
  ];

  const recentQuizzes = [
    { title: "Template-P", edited: "Edited 5 days ago" },
    { title: "Node.js", edited: "Edited 1 month ago" },
    { title: "Untitled Design", edited: "Edited 5 days ago" },
    { title: "Student-Tracking-System", edited: "Edited 6 days ago" },
    { title: "Template-PDF-4D", edited: "Edited 23 days ago" },
    { title: "Topic: Online Quiz maker", edited: "Edited 2 months ago" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-blue-900 to-purple-900 text-white">
      {/* Hero Section */}
      <section className="pb-20 pt-60 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
          Discover your year in quizzes 🎉
        </h1>
        <p className="text-xl md:text-2xl text-blue-200 mb-8">
          Review your progress, top quizzes, and achievements from 2025!
        </p>

        {/* Tabs (like Your designs / Templates) */}
        <div className="flex justify-center gap-8 mb-8">
          <button className="px-6 py-2 bg-purple-700 rounded-full">
            Your quizzes
          </button>
          <button className="px-6 py-2 bg-gray-700 rounded-full opacity-70">
            Categories
          </button>
          <button className="px-6 py-2 bg-gray-700 rounded-full opacity-70">
            Leaderboard
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search quizzes, categories and more"
              className="w-full py-4 px-12 bg-gray-800 bg-opacity-60 rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-purple-400"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
              🔍
            </span>
          </div>
        </div>

        {/* Category Icons - Horizontal Scroll */}
        <div className="mt-12 overflow-x-auto pb-4">
          <div className="flex gap-8 justify-center min-w-max">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href="/quizzes"
                className="flex flex-col items-center gap-2 text-center hover:scale-110 transition"
              >
                <div
                  className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}
                >
                  {cat.icon}
                </div>
                <span className="text-sm">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recents Section */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Recents</h2>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-purple-700 rounded-lg">
                Owner ▼
              </button>
              <button className="px-4 py-2 bg-gray-700 rounded-lg">
                Quizzes ▼
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Grid */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max">
              {recentQuizzes.map((quiz, idx) => (
                <Link
                  key={idx}
                  href="/quizzes"
                  className="bg-gray-800 bg-opacity-60 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition w-64"
                >
                  <div className="h-48 bg-gray-700 flex items-center justify-center">
                    {/* Placeholder thumbnail */}
                    <div className="bg-gray-600 w-full h-full border-4 border-dashed border-gray-500 rounded-t-2xl" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-gray-400">{quiz.edited}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Optional CTA Footer */}
      <section className="text-center py-12">
        <Link
          href="/quizzes"
          className="px-8 py-4 bg-white text-purple-900 font-bold text-xl rounded-2xl shadow hover:bg-gray-100 transition"
        >
          Start a New Quiz
        </Link>
      </section>
    </div>
  );
}
