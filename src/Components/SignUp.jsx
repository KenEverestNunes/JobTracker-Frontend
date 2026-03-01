import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useState } from "react";

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // ✅ Post signup data
      const response = await api.post("/auth/signup", {
        username: data.username,
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // ✅ save token & redirect
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      navigate(`/${response.data.username}/jobs`);
    } catch (err) {
      setErrorMsg(err.response?.data || "Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center mt-32 ">
      <div className="
      w-full max-w-sm p-8 rounded-2xl shadow-2xl border
      bg-white text-gray-900 border-gray-200
      dark:bg-gradient-to-br dark:from-[#0f1026] dark:via-[#17164b] dark:to-[#2c2a86]
      dark:text-gray-100 dark:border-indigo-700
      transition-all duration-300 font-[cursive]
    ">
        <h2 className="text-3xl font-bold text-center mb-6">Sign Up</h2>

        {errorMsg && (
          <p className="text-red-600 dark:text-red-300 text-sm mb-4 text-center">
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm mb-1" style={{ fontWeight: "bold" }}>Name</label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="
              w-full px-3 py-2 rounded-md border
              bg-white text-gray-900 border-gray-300
              focus:outline-none focus:ring-2 focus:ring-indigo-400
              dark:bg-white/10 dark:text-gray-100 dark:border-white/20
              placeholder-gray-400
            "

            />
            {errors.name && (
              <p className="text-red-600 dark:text-red-300 text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1" style={{ fontWeight: "bold" }}>Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="
              w-full px-3 py-2 rounded-md border
              bg-white text-gray-900 border-gray-300
              focus:outline-none focus:ring-2 focus:ring-indigo-400
              dark:bg-white/10 dark:text-gray-100 dark:border-white/20
              placeholder-gray-400
            "

            />
            {errors.email && (
              <p className="text-red-600 dark:text-red-300 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm mb-1" style={{ fontWeight: "bold" }}>Username</label>
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
              <p className="text-red-600 dark:text-red-300 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1" style={{ fontWeight: "bold" }}>Password</label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
              className="bold 
              w-full px-3 py-2 rounded-md border
              bg-white text-gray-900 border-gray-300
              focus:outline-none focus:ring-2 focus:ring-indigo-400
              dark:bg-white/10 dark:text-gray-100 dark:border-white/20
              placeholder-gray-400
            "

            />
            {errors.password && (
              <p className="text-red-600 dark:text-red-300 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="
            w-full py-2 rounded-lg font-bold text-white
            bg-gradient-to-r from-cyan-500 to-blue-600
            hover:opacity-95 active:opacity-90 transition
            shadow-lg shadow-blue-500/25
          "
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );


};

export default SignUp;
