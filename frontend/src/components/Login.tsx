import React, { useState } from "react";
import { loginUser, getCurrentUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg("");
    
    try {
      const data = await loginUser(email, password);
      const token = data.access_token;
      
      localStorage.setItem("token", token);
      
      const user = await getCurrentUser(token);
      localStorage.setItem("user", JSON.stringify(user));
      
      if (user.role === "sponsor") {
        navigate("/trial-builder");
      } else if (user.role === "site_admin") {
        navigate("/hospital-dashboard");
      } else {
        navigate("/"); 
      }
      
    } catch (error: any) {
      setErrorMsg(error.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 font-sans relative overflow-hidden">
      
      {/* Immersive Grid Background Effect */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
        }}
      ></div>

      {/* Ambient Glow */}
      <div className="absolute top-[10%] left-[50%] transform -translate-x-1/2 w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full bg-[#111111]/80 backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-gray-800 p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-5 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Secure Access
          </h2>
          <p className="text-sm text-gray-400 mt-2 font-medium">
            Enter your credentials to enter the Medora Hub
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 text-red-300 text-sm font-semibold rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block pl-1">
              Email Address
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              disabled={isLoggingIn}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-800 bg-[#0a0a0a] text-white placeholder-gray-600 focus:bg-[#161616] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 font-medium"
              placeholder="you@organization.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block pl-1">
              Password
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              disabled={isLoggingIn}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-800 bg-[#0a0a0a] text-white placeholder-gray-600 focus:bg-[#161616] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 font-medium tracking-widest"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoggingIn}
            className="w-full bg-white text-black py-4 mt-2 rounded-xl font-bold text-sm hover:bg-gray-200 focus:ring-4 focus:ring-gray-500/50 transition-all duration-200 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {isLoggingIn ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer / Register Link */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500 font-medium">
            Don't have a node configured?{" "}
            <Link 
              to="/register" 
              className="text-white font-bold hover:text-blue-400 transition-colors"
            >
              Request access
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
