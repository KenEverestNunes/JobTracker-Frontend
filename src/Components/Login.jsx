import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axiosInstance";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/auth/login", {
        username: data.username,
        password: data.password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      navigate(`/${response.data.username}/jobs`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="flex justify-center mt-20">
      {/* Box changes color based on theme */}
      <div
         className="
    w-full max-w-sm p-8 rounded-xl shadow-2xl
    bg-white text-gray-900
    dark:bg-gradient-to-br dark:from-gray-900 dark:via-indigo-950 dark:to-indigo-800
    dark:text-gray-100
    transition-all duration-500
    border border-gray-200 dark:border-indigo-700
  "
      >
        <h2 className="text-3xl font-bold text-center mb-6" style={{fontFamily:"cursive", fontWeight:"bold"}}>Login</h2>

        {errorMsg && <p className="text-red-500 dark:text-red-300 text-center mb-4">{errorMsg}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{fontFamily:"cursive", fontWeight:"bold"}}>Username</label>
            <input
              type="text"
                {...register("username", { required: "Username is required" })}
                className="
              w-full px-3 py-2 rounded-md border
              bg-white text-gray-900 border-gray-300
              focus:outline-none focus:ring-2 focus:ring-indigo-400
              dark:bg-white/10 dark:text-gray-100 dark:border-white/20
              placeholder-gray-400
            "
/>

            {errors.username && (
              <p className="text-red-500 dark:text-red-200 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{fontFamily:"cursive", fontWeight:"bold"}}>Password</label>
            <input
                type="password"
                  {...register("password", {
                  required: "Password is required",
                  minLength: { value: 3, message: "Minimum 6 characters" },
                  })}
                    className="
              w-full px-3 py-2 rounded-md border
              bg-white text-gray-900 border-gray-300
              focus:outline-none focus:ring-2 focus:ring-indigo-400
              dark:bg-white/10 dark:text-gray-100 dark:border-white/20
              placeholder-gray-400
            "
/>

            {errors.password && (
              <p className="text-red-500 dark:text-red-200 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition"
            style={{fontFamily:"cursive"}}
          >
            Login
          </button>
        </form>

        {/* Signup button */}
        <button
          onClick={() => navigate("/signup")}
          className="w-full mt-4 py-2 rounded-lg font-bold border border-gray-400 text-gray-900 hover:bg-gray-100 transition dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-purple-700"
          style={{fontFamily:"cursive"}}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Login;
