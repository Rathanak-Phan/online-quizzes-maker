// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/ui/header";
import api from "@/lib/axios";
import HomePage from "./components/ui/home";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function RootHomePage() {
  const [message, setMessage] = useState("loading...");
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Check backend status
  useEffect(() => {
    api
      .get("/api")
      .then((res) => setMessage(res.data))
      .catch(() => setMessage("⚠️ Backend is offline..."));
  }, []);

  // Load logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token"); // <- check both
      if (!token) {
        setUser(null);
        setLoadingUser(false);
        return;
      }

      try {
        const res = await api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Not logged in or invalid token", err);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();

    const updateUser = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
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
    <div className={`transition-opacity duration-500`}>
      <Header />

      <div className="text-center">
        {/* <h1 className="text-4xl">Hello Frontend</h1> */}
        {/* <p>{message}</p> */}

        {loadingUser ? (
          <p className="text-gray-500 my-5">Loading user...</p>
        ) : user ? (
          <div className="text-blue-400">
            {/* <p>Welcome, {user.name}!</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p> */}
            <HomePage />
          </div>
        ) : (
          <div>
            <HomePage />

            <p className="text-red-500 text-2xl my-5">
              Please login to see your info...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
