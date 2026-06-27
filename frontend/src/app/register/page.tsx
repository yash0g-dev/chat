"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Loader2, Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { registerUser } from "@/store/authSlice";
import { AppDispatch } from "@/store/store";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Clean up Object URL for the image preview
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Image file size must be less than 2MB.");
        return;
      }

      setError("");
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("username", formData.username);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);

      if (avatar) {
        submitData.append("avatar", avatar);
      }

      await dispatch(registerUser(submitData)).unwrap();
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err?.message || err || "Something went wrong during registration",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white py-12">
      <div className="w-full max-w-md p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          {/* Integrated Logo & Avatar Upload */}
          <div className="relative group mb-4">
            <label
              htmlFor="avatar-upload"
              className="block cursor-pointer"
              aria-label="Upload Profile Avatar"
            >
              {/* Profile Circle */}
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 border-4 border-gray-900 shadow-lg ${
                  avatarPreview ? "bg-gray-950" : "bg-blue-600"
                }`}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MessageSquare size={32} className="text-white" />
                )}
              </div>

              {/* Plus Badge on Periphery */}
              <div className="absolute bottom-0 right-0 bg-gray-800 border-2 border-gray-900 rounded-full p-1.5 transition-colors duration-300 group-hover:bg-blue-500 shadow-sm">
                <Plus size={16} className="text-white" />
              </div>
            </label>

            <input
              id="avatar-upload"
              name="avatar"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>

          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-gray-400 text-sm mt-2">Join VibeChat today</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>

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
              minLength={6}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-6 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Register"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-500 hover:text-blue-400 font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
