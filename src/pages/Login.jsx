import { useState } from "react";
import { login } from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/layouts/Header/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { ImSpinner3 } from "react-icons/im";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogginIn, setIsLogginIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLogginIn(true)
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
      setIsLogginIn(false)
    }
  };

  function onChange(value) {
    // console.log("Captcha value:", value);
  }

  return (
    <>
      <Header />
      <div className={`flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-loginBg bg-center`}>
        <div className="bg-white py-20 px-10 lg:w-5/12 w-full rounded-xl shadow-md mx-auto ">
          <h2 className="text-center text-[40px] font-bold text-orange-500">
            Welcome to the Sports Stats
          </h2>
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className=" text-center text-2xl font leading-9 tracking-tight text-gray-900">
              Let's Sign in to your account
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" action="#" method="POST">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border py-1.5 text-gray-900 shadow-sm  sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                  {/* <div className="text-sm">
                  <a
                    href="/forgot-password"
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </a>
                </div> */}
                </div>
                <div className="mt-2 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border py-1.5 text-gray-900 shadow-sm sm:text-sm sm:leading-6 h-12"
                  />
                  <div className=" h-12 w-12 absolute top-0 right-0 flex items-center justify-center">
                    <>
                      {!showPassword ? <IoEye className="cursor-pointer w-5 h-5" onClick={() => setShowPassword(!showPassword)} /> : <IoEyeOff className="cursor-pointer w-5 h-5" onClick={() => setShowPassword(!showPassword)} />}
                    </>
                  </div>
                </div>
              </div>
              <div>
                <Button
                  type="submit"
                  onClick={handleLogin}
                  className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 h-12 "
                  disabled={isLogginIn}
                >
                  Sign in
                  {
                    isLogginIn && <ImSpinner3 className="h-4 w-4 ml-2 animate-spin" />
                  }
                </Button>
              </div>
            </form>
          </div>
          <ToastContainer />
        </div>
      </div>
    </>
  );
}