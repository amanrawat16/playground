import { useState } from "react";
import { login } from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/layouts/Header/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { ImSpinner3 } from "react-icons/im";
import { Mail, Lock, Trophy, LogIn } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogginIn, setIsLogginIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLogginIn(true);
    try {
      // Call the login function from apiService.js
      const response = await login({ email, password });

      // Handle the response as needed
      // console.log("Login response:", response);

      // Show toast with the message from the API response
      localStorage.setItem("userType", response.userType);
      localStorage.setItem("_id", response._id);
      toast.success(response.message);
      navigate("/dashboard");
      // Clear the form
      setEmail("");
      setPassword("");
    } catch (error) {
      // Handle login error
      console.error("Error during login:", error);

      // Show error toast
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLogginIn(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex min-h-screen flex-col justify-center bg-[#0f172a] px-4 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo/Icon Section */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-br from-orange-600 to-orange-500 rounded-full shadow-lg">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-base sm:text-lg text-slate-400">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <form className="space-y-6" onSubmit={handleLogin}>
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-300 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-500" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-600 bg-[#0f172a] rounded-lg text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 transition-all sm:text-sm sm:leading-6"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 border border-slate-600 bg-[#0f172a] rounded-lg text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 transition-all sm:text-sm sm:leading-6"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <IoEyeOff className="h-5 w-5" />
                      ) : (
                        <IoEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLogginIn}
                    className="flex w-full justify-center items-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm sm:text-base font-semibold text-white shadow-lg hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLogginIn ? (
                      <>
                        <ImSpinner3 className="h-5 w-5 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        <span>Sign In</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <p className="text-sm text-slate-400">
                    Don't have an account?
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Contact:</span>
                    <a
                      href="mailto:thefieldsports23@gmail.com"
                      className="text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      thefieldsports23@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Bottom Border */}
            <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600"></div>
          </div>

          {/* Footer Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Secure login powered by{" "}
              <span className="font-semibold text-orange-500">Playground</span>
            </p>
          </div>
        </div>
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </>
  );
}