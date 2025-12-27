"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto bg-blue-600 rounded-xl flex items-center justify-center text-white text-3xl shadow-lg">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={56} // 14 * 4 = 56px
                  height={56} // height same as width
                  className="rounded-xl"
                  priority
                />
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mt-4">
              Forgot Password?
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base px-2">
              Don’t worry! Enter your email and we&apos;ll send you a link to
              reset your password.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg hover:scale-[1.02] transition"
            >
              Send Reset Link
            </button>
          </form>

          {/* Back to Login */}
          <p className="text-center text-sm text-gray-600 mt-8">
            Remember your password?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
