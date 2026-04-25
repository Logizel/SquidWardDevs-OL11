import React, { useState } from "react";
import { ArrowLeft, Link2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginUser, getCurrentUser } from "@/api/auth";

export default function LoginScreen({ role }: { role: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 🔐 Step 1: Login → get token
      const data = await loginUser(email, password);
      const token = data.access_token;

      // 💾 Step 2: Save token
      localStorage.setItem("token", token);

      // 👤 Step 3: Get user details
      const user = await getCurrentUser(token);

      console.log("USER DATA:", user);

      // 💾 Step 4: SAVE USER (IMPORTANT)
      localStorage.setItem("user", JSON.stringify(user));

      // 🚀 Step 5: Role-based redirect (NO RELOAD)
      if (user.role === "sponsor") {
        navigate("/lab-dashboard");
      } else if (user.role === "site_admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);
      alert("Invalid credentials or not approved yet");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full px-6 py-20 z-10 animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="w-full max-w-md">
        
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to selection
        </button>

        <div className="relative bg-white rounded-[1.5rem] p-10 border border-gray-300">
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-[#3E424B] rounded-[1.5rem] -z-10"></div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2 font-sans">
              {role} Login
            </h2>
            <p className="text-sm text-gray-500">
              Enter your credentials to access the secure portal.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 text-left">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                Email or Username
              </label>
              <input 
                type="text" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@gmail.com"
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all text-gray-900 font-sans"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-[#0080ff] hover:underline">
                  Forgot password?
                </a>
              </div>

              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="123456"
                  className="w-full px-5 py-3.5 pr-12 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all text-gray-900 font-sans"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#3E424B] text-white px-6 py-4 rounded-xl text-[15px] font-medium hover:bg-black transition-transform active:scale-[0.98] shadow-md mt-4 font-sans"
            >
              Log in securely
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          Powered by <Link2 size={14} className="inline text-[#0080ff]" /> MEDORA
        </div>
      </div>
    </div>
  );
}