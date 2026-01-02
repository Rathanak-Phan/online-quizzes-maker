"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NewClassPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "public" as "public" | "private",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = "Class name is required";
    } else if (formData.name.length < 3) {
      errors.name = "Class name must be at least 3 characters";
    }
    
    if (!formData.code.trim()) {
      errors.code = "Class code is required";
    } else if (formData.code.length < 3) {
      errors.code = "Class code must be at least 3 characters";
    } else if (!/^[A-Z0-9]+$/.test(formData.code.toUpperCase())) {
      errors.code = "Class code can only contain letters and numbers";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("Submitting form data:", formData);

      const res = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(), // Ensure uppercase
        }),
      });

      const data = await res.json();
      console.log("API Response:", data);

      if (!res.ok) {
        throw new Error(data.message || `Failed to create class: ${res.status} ${res.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to create class");
      }

      // Success - redirect to classes page
      console.log("Class created successfully, redirecting...");
      router.push("/teacher/classes");
      router.refresh();

    } catch (err) {
      console.error("Error creating class:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
    setValidationErrors(prev => ({ ...prev, code: "" }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/teacher/classes"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Back to Classes
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Create New Class
          </h1>
          <p className="text-lg text-gray-600">
            Set up a new class for your students
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Class Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (validationErrors.name) setValidationErrors(prev => ({ ...prev, name: "" }));
                  }}
                  placeholder="e.g., Mathematics 101"
                  className={`w-full px-6 py-4 text-lg border rounded-2xl shadow-sm focus:ring-4 transition ${
                    validationErrors.name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  disabled={loading}
                />
                {validationErrors.name && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.name}</p>
                )}
                <p className="mt-2 text-gray-500 text-sm">
                  Choose a descriptive name for your class
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-lg font-semibold text-gray-900">
                    Class Code
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateCode}
                    disabled={loading}
                    className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Code
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setFormData({ ...formData, code: value });
                    if (validationErrors.code) setValidationErrors(prev => ({ ...prev, code: "" }));
                  }}
                  placeholder="e.g., MATH101"
                  className={`w-full px-6 py-4 text-lg border rounded-2xl shadow-sm focus:ring-4 transition font-mono ${
                    validationErrors.code
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  disabled={loading}
                  maxLength={10}
                />
                {validationErrors.code && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.code}</p>
                )}
                <p className="mt-2 text-gray-500 text-sm">
                  Students will use this code to join your class. Use 3-10 uppercase letters and numbers.
                </p>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Class Type
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "public" })}
                    disabled={loading}
                    className={`p-6 rounded-2xl border-2 transition-all disabled:opacity-50 ${
                      formData.type === "public"
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-900">Public</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Anyone with the link can join
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "private" })}
                    disabled={loading}
                    className={`p-6 rounded-2xl border-2 transition-all disabled:opacity-50 ${
                      formData.type === "private"
                        ? "border-purple-500 bg-purple-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-900">Private</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Requires approval to join
                      </p>
                    </div>
                  </button>
                </div>
                <p className="mt-4 text-gray-600">
                  <span className="font-medium">Public:</span> Students can join with just the class code.
                  <br />
                  <span className="font-medium">Private:</span> You'll need to approve each student's request to join.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/teacher/classes"
              className="flex-1 px-8 py-5 text-center border-2 border-gray-300 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-50 transition disabled:opacity-50"
              tabIndex={loading ? -1 : 0}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Class...
                </>
              ) : (
                "Create Class"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}