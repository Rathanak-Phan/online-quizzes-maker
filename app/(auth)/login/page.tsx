// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // SUCCESS
      setMessage("Login successful! Redirecting...");

      // SAFELY save user to localStorage
      try {
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (err) {
        console.warn("Could not save to localStorage");
      }

      // Dispatch login event
      window.dispatchEvent(new Event("login"));

      // FORCE REDIRECT — this works 100%
      const role = data.user.role;
      let redirectPath = "/";

      if (role === "admin") redirectPath = "/admin";
      else if (role === "teacher") redirectPath = "/teacher";

      // Use window.location for guaranteed redirect
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 1500);

    } catch (err) {
      setMessage("Network error. Please check your connection.");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="w-full max-w-xl">
        <div className="bg-white shadow-xl rounded-2xl p-8 backdrop-blur-sm">
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto bg-blue-600 rounded-xl flex items-center justify-center text-white text-3xl shadow-lg">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={56}
                  height={56}
                  className="rounded-xl"
                  priority
                />
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mt-4">QuizMaster</h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Welcome back! Ready to test your knowledge?
            </p>
          </div>

          {/* Tab Buttons */}
          <div className="grid grid-cols-2 mb-6">
            <div className="py-2 font-semibold bg-blue-600 text-white rounded-l-lg text-center">
              Sign In
            </div>
            <Link
              href="/register"
              className="py-2 font-semibold bg-gray-200 rounded-r-lg text-gray-700 text-center"
            >
              Sign Up
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <div className="relative mt-1">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative mt-1">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:scale-[1.02] transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Message */}
            {message && (
              <p
                className={`mt-4 text-center font-medium text-lg py-3 rounded-lg ${
                  message.includes("successful")
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {message}
              </p>
            )}
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-8">
            By continuing, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}