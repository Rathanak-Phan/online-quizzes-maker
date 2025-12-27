"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  User,
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

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [comformpassword, setComformpassword] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();

  useAuthRedirect();

  const handleRegister = async () => {
    // Frontend check: passwords match
    if (password !== comformpassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await api.post("/api/auth/register", {
        name: fullname,
        email,
        password,
        role,
      });

      setMessage(res.data.message);

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      let errorMessage = "Error";
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.error || err.message; // backend sends 'error'
      }
      setMessage(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="w-full max-w-xl">
        <div className="bg-white shadow-xl rounded-2xl p-8 backdrop-blur-sm">
          {/* Logo */}
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
            <h1 className="text-3xl md:text-4xl font-bold mt-4">
              Create Account
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Join QuizMaster and start your learning journey!
            </p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 mb-6">
            <a
              href="/login"
              className="py-2 font-semibold bg-gray-200 rounded-l-lg text-gray-700 text-center"
            >
              Sign In
            </a>
            <button className="py-2 font-semibold bg-blue-600 text-white rounded-r-lg">
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <div className="relative mt-1">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Email Address
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
                  placeholder="••••••••"
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

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showPassword2 ? "text" : "password"}
                  placeholder="••••••••"
                  value={comformpassword}
                  onChange={(e) => setComformpassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="absolute right-3 top-3"
                >
                  {showPassword2 ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="button"
              onClick={handleRegister}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:scale-[1.02] transition"
            >
              Create Account
            </button>
            <p
              className={`mt-2 text-center ${
                message.includes("success") ? "text-green-600" : "text-red-500"
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

          {/* Social buttons */}
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
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
