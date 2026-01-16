"use client";
import { useEffect, useState } from "react";
import { BookOpen, Users, Award, TrendingUp, Menu, X, Play, CheckCircle, Star, ArrowRight, Clock, BarChart } from 'lucide-react';

import Header from "./components/ui/header";
import HomePage from "./components/ui/home";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function RootHomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoadingUser(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Invalid token or error", err);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();

    // Listen for login/logout events
    const updateUser = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("login", updateUser);
    window.addEventListener("logout", updateUser);

    return () => {
      window.removeEventListener("login", updateUser);
      window.removeEventListener("logout", updateUser);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header></Header>

      <main>
        <section className="container mx-auto px-6 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-6">
                Transform Your Future Today
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Build better quizzes in minutes              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create engaging assessments that capture what your students truly know. No complicated setup. No wasted time. Just straightforward quiz building that works.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center">
                  Start Creating Quizzes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition font-medium flex items-center justify-center">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Template
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Classroom
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 shadow-xl">
                <img
                  src="https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Student learning"
                  className="rounded-lg shadow-lg w-full"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">50K+</div>
                      <div className="text-gray-600">Active Learners</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center justify-items-center">
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">10,000+</div>
                <div className="text-gray-600">Template Available</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">50K+</div>
                <div className="text-gray-600">Active Students</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
                <div className="text-gray-600">Expert Instructors</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-white">LearnHub</span>
              </div>
              <p className="text-gray-400">
                Empowering learners worldwide with quality education and practical skills.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Browse Courses</a></li>
                <li><a href="#" className="hover:text-white transition">For Business</a></li>
                <li><a href="#" className="hover:text-white transition">Become Instructor</a></li>
                <li><a href="#" className="hover:text-white transition">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LearnHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}