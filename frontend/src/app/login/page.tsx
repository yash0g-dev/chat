// frontend/src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { MessageSquare } from "lucide-react";
import { useDispatch } from "react-redux";
import { loginUser } from "@/store/authSlice";
import { useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";

export default function AuthPage() {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const error = useSelector((state: RootState) => state.auth.error);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  useEffect(() => {
    console.log("user changed", currentUser);
  }, [currentUser]);
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(loginUser(formData)).unwrap();

      console.log("current user", currentUser);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="w-full max-w-md p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-600 rounded-full mb-4">
            <MessageSquare size={32} className="text-white" />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-6"
          >
            {"Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {"Dont have an account? "}
          <button
            onClick={() => router.push("/register")}
            className="text-blue-500 hover:text-blue-400 font-medium"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
