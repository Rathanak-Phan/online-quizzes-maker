"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Chrome,
  Facebook,
  Github,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import Image from "next/image";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();

  useAuthRedirect();

  const handleLogin = async () => {
    try {
      const res = await api.post("/api/auth/login", { email, password });

      // Fix profile image URL
      const userWithImage = {
        ...res.data.user,
        profile_image: res.data.user.profile_image
          ? `http://localhost:5000${res.data.user.profile_image}`
          : "/avatar-default.png", // fallback image
      };

      // Save token & user
      if (rememberMe) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(userWithImage));
      } else {
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify(userWithImage));
      }

      setMessage("Login successful");

      // Notify homepage to update user state
      window.dispatchEvent(new Event("login"));

      // Redirect to homepage
      router.push("/");
    } catch (err) {
      let errorMessage = "Error";
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.error || err.message;
      }
      setMessage(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      {/* Fade-in animation */}
      <div className="w-full max-w-xl">
        {/* Card */}
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
            <button className="py-2 font-semibold bg-blue-600 text-white rounded-l-lg">
              Sign In
            </button>
            <a
              href="/register"
              className="py-2 font-semibold bg-gray-200 rounded-r-lg text-gray-700 text-center"
            >
              Sign Up
            </a>
          </div>

          {/* Form */}
          <form className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a
                href="/forgot-password"
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:scale-[1.02] transition"
            >
              Sign In
            </button>
            <p
              className={`mt-2 text-center ${
                message === "Login successful"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-300"></div>
            <span className="text-gray-500 text-sm">Or continue with</span>
            <div className="h-px flex-1 bg-gray-300"></div>
          </div>

          {/* Social Buttons — RESPONSIVE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="flex items-center justify-center gap-2 border py-3 rounded-lg hover:bg-gray-50 transition">
              <Chrome className="w-5 h-5 text-red-500" /> Google
            </button>

            <button className="flex items-center justify-center gap-2 border py-3 rounded-lg hover:bg-gray-50 transition">
              <Facebook className="w-5 h-5 text-blue-600" /> Facebook
            </button>

            <button className="flex items-center justify-center gap-2 border py-3 rounded-lg hover:bg-gray-50 transition">
              <Github className="w-5 h-5" /> GitHub
            </button>
          </div>

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
