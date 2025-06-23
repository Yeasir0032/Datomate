"use client";
import { auth, googleAuthProvider } from "@/lib/firebase-config";
import {
  getIdToken,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { Scan } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function Login() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const initializeGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      setIsLoading(false);
      const idToken = await getIdToken(user);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res) throw new Error("Login failed");
      router.push("/dashboard");
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      const idToken = await getIdToken(user);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (res.status !== 200) throw new Error(JSON.stringify(res));
      router.push("/dashboard");
    } catch (error) {
      console.log(error);
      setErrors({ general: "Wrong Credentials" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Scan className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Datomate
              </span>
            </div>
          </div>
        </div>
      </header>
      <div
        className="min-h-screen flex items-center justify-center
                    px-4 sm:px-6 lg:px-8
                    bg-gradient-to-br from-blue-50 to-indigo-100
                    dark:from-gray-900 dark:to-black transition-colors duration-300"
      >
        {" "}
        {/* Smooth background transition */}
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          {" "}
          {/* Responsive vertical spacing */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 transition-colors duration-300">
            {" "}
            {/* Smooth card background transition */}
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                {" "}
                {/* Responsive margin-bottom */}
                Welcome Back
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {" "}
                {/* Sub-heading text color */}
                Sign in to your account
              </p>
            </div>
            <form
              className="mt-6 sm:mt-8 space-y-4 sm:space-y-6"
              onSubmit={handleSubmit}
            >
              {" "}
              {/* Responsive top margin and vertical spacing */}
              {errors.general && (
                <div
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700
                              text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm sm:text-base"
                >
                  {" "}
                  {/* Responsive font size for error */}
                  {errors.general}
                </div>
              )}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-1 sm:mb-2"
                >
                  {" "}
                  {/* Responsive margin-bottom */}
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 transition-colors duration-200
                  ${
                    errors.email
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                    {errors.email}
                  </p>
                )}{" "}
                {/* Responsive error font size */}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm sm:text-base font-medium
                                               text-gray-700 dark:text-gray-200 mb-1 sm:mb-2"
                >
                  {" "}
                  {/* Responsive margin-bottom */}
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 transition-colors duration-200
                  ${
                    errors.password
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
                    {errors.password}
                  </p>
                )}{" "}
                {/* Responsive error font size */}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500
                             border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-500 dark:checked:border-indigo-500
                             transition-colors duration-200"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm sm:text-base
                                                    text-gray-700 dark:text-gray-200"
                  >
                    {" "}
                    {/* Remember me text color */}
                    Remember me
                  </label>
                </div>
                <a
                  href="/auth/forgot-password"
                  className="text-sm sm:text-base text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
                >
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white
                         py-2.5 px-4 sm:py-3 sm:px-5
                         rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                         dark:bg-indigo-700 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800
                         transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         font-medium text-base sm:text-lg"
              >
                {" "}
                {/* Responsive button font size */}
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            {/* Separator */}
            <div className="relative my-6 sm:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
            {/* Google Sign-In Button */}
            <div className="mt-4 flex justify-center">
              <button
                title="signin with google"
                onClick={() => initializeGoogleSignIn()}
                className=" cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition text-sm font-medium bg-white text-gray-700"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                  className="w-5 h-5"
                />
                Sign in with Google
              </button>
            </div>
            <div className="mt-4 sm:mt-6 text-center">
              {" "}
              <p
                className="text-sm sm:text-base
                          text-gray-600 dark:text-gray-300"
              >
                {" "}
                {/* Text color */}
                Don't have an account?{" "}
                <a
                  href="/auth/signup"
                  className="text-indigo-600 hover:text-indigo-500 font-medium
                                            dark:text-indigo-400 dark:hover:text-indigo-300  transition-colors duration-200"
                >
                  Sign up here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
