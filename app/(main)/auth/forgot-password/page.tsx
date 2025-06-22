"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase-config";

// Define types for form data and errors
interface FormData {
  email: string;
}

interface Errors {
  email?: string;
  general?: string;
}

const ForgotPassword: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name as keyof Errors]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      setErrors({ email: "Email is required" });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: "Email is invalid" });
      return;
    }

    setIsLoading(true);
    setErrors({});
    setMessage(""); // Clear previous messages

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setMessage("A reset link has been sent to your email.");
      setFormData({ email: "" });
      //TODO:
    } catch (error) {
      setErrors({ email: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-8 sm:py-12 md:py-16 font-sans">
      <div className="max-w-md w-full mx-auto space-y-6 sm:space-y-8 md:space-y-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 md:p-10 border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-orange-100 dark:bg-orange-800 mb-4">
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-4a1 1 0 011-1h2.586l6.414-6.414a6 6 0 117.743 5.743L19 7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Forgot Password
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Enter your email to receive a reset code
            </p>
          </div>

          {message && (
            <div className="mt-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-600 dark:text-green-200 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          {errors.general && (
            <div className="mt-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}
          {message ? (
            <div className="mt-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-600 dark:text-green-200 px-4 py-5 rounded-lg text-sm text-center">
              <p>{message}</p>
              <p className="mt-2">
                Check your inbox and follow the instructions to reset your
                password.
              </p>
              <Link
                href="/auth/login"
                className="inline-block mt-4 text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors text-sm sm:text-base"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              {" "}
              <form
                className="mt-6 space-y-4 sm:space-y-6"
                onSubmit={handleEmailSubmit}
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                      errors.email
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center px-4 lg:px-8 py-2 lg:py-3 text-sm lg:text-base bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white rounded-lg lg:rounded-xl hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-800 dark:hover:to-purple-800 cursor-pointer transition-all duration-300 shadow-lg flex-1 sm:flex-initial justify-center"
                >
                  {isLoading ? "Sending Code..." : "Send Reset Code"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link
                  href="/auth/login"
                  className="text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors text-sm sm:text-base"
                >
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
