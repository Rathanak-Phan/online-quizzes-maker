// app/page.tsx — Updated version without Axios
"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/ui/header";
import HomePage from "./(student)/home";

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

 

  // Load logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
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
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
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
    <div className="transition-opacity duration-500">
      <Header />

      <div className="text-center">
        {loadingUser ? (
          <p className="text-gray-500 my-5">Loading user...</p>
        ) : user ? (
          <div className="text-blue-400">
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
