"use client";

import { Plus, Search, BookOpen } from "lucide-react";

const mockTemplates = [
  { id: 1, name: "Multiple Choice Template", questions: 10, category: "General", uses: 24 },
  { id: 2, name: "Science Lab Quiz", questions: 15, category: "Science", uses: 18 },
  { id: 3, name: "Math Problem Set", questions: 20, category: "Mathematics", uses: 32 },
];

export default function TemplatesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Templates</h1>
          <p className="text-gray-600 mt-1">Reusable templates to create quizzes faster</p>
        </div>
        <button className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg">
          <Plus className="w-5 h-5" />
          Save Current as Template
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockTemplates.map((temp) => (
            <div key={temp.id} className="group border-2 border-dashed border-gray-300 hover:border-green-400 rounded-2xl p-10 text-center transition-all hover:shadow-md hover:bg-green-50">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                <BookOpen className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{temp.name}</h3>
              <p className="text-gray-600 mb-4">{temp.questions} questions • {temp.category}</p>
              <p className="text-sm text-gray-500 mb-6">Used {temp.uses} times</p>
              <button className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium">
                Use This Template
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 p-8 bg-gray-50 rounded-3xl">
            <div className="w-16 h-16 bg-gray-200 border-2 border-dashed border-gray-400 rounded-2xl" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">No template yet?</p>
              <p className="text-gray-600">Create a quiz first, then save it as a template</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}