import React, { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  
  // Base State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("sponsor");
  
  // Role-specific State
  const [corporateId, setCorporateId] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [nabhLicense, setNabhLicense] = useState("");
  
  // UI State
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    // Map to EXACT snake_case keys for FastAPI
    const payload = {
      email,
      password,
      role,
      ...(role === "sponsor" && { 
        corporate_id_number: corporateId || "N/A" 
      }),
      ...(role === "site_admin" && { 
        hospital_name: hospitalName,
        nabh_license_number: nabhLicense || "N/A"
      }),
    };

    try {
      await registerUser(payload);
      setSuccessMsg("Registration successful! Redirecting to login...");
      
      // Briefly show the success message before routing
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error: any) {
      setErrorMsg(error.message || "Registration failed. Please check your inputs.");
    } finally {
      setIsRegistering(false);
    }
  };

  // Reusable input class for dark mode form fields
  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-gray-800 bg-[#0a0a0a] text-white placeholder-gray-600 focus:bg-[#161616] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 font-medium";
  const labelClass = "text-xs font-bold text-gray-400 uppercase tracking-widest block pl-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 py-12 font-sans relative overflow-hidden">
      
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
      <div className="absolute top-[20%] left-[50%] transform -translate-x-1/2 w-[700px] h-[700px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Registration Card */}
      <div className="relative z-10 max-w-md w-full bg-[#111111]/80 backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-gray-800 p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-5 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Create an Account
          </h2>
          <p className="text-sm text-gray-400 mt-2 font-medium">
            Join the decentralized Medora network
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 text-red-300 text-sm font-semibold rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{errorMsg}</p>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 text-green-300 text-sm font-semibold rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{successMsg}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1.5">
            <label className={labelClass}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              disabled={isRegistering}
              className={inputClass}
              placeholder="you@organization.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              disabled={isRegistering}
              className={`${inputClass} tracking-widest`}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Account Role</label>
            <div className="relative">
              <select 
                value={role} 
                onChange={e => setRole(e.target.value)}
                disabled={isRegistering}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="sponsor">Sponsor (Pharma/Research)</option>
                <option value="site_admin">Hospital (Data Node)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Conditional Fields: SPONSOR */}
          {role === "sponsor" && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className={labelClass}>Corporate ID Number</label>
              <input 
                type="text" 
                value={corporateId} 
                onChange={e => setCorporateId(e.target.value)} 
                required 
                disabled={isRegistering}
                className={inputClass}
                placeholder="e.g. CIN-12345"
              />
            </div>
          )}

          {/* Conditional Fields: HOSPITAL */}
          {role === "site_admin" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <label className={labelClass}>Hospital Name</label>
                <input 
                  type="text" 
                  value={hospitalName} 
                  onChange={e => setHospitalName(e.target.value)} 
                  required 
                  disabled={isRegistering}
                  className={inputClass}
                  placeholder="e.g. Apollo General"
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>NABH License Number</label>
                <input 
                  type="text" 
                  value={nabhLicense} 
                  onChange={e => setNabhLicense(e.target.value)} 
                  required 
                  disabled={isRegistering}
                  className={inputClass}
                  placeholder="e.g. NABH-999-888"
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isRegistering}
            className="w-full bg-white text-black py-4 mt-4 rounded-xl font-bold text-sm hover:bg-gray-200 focus:ring-4 focus:ring-gray-500/50 transition-all duration-200 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {isRegistering ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>

        {/* Footer / Login Link */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500 font-medium">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-white font-bold hover:text-blue-400 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
