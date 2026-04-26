import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import TrialBuilder from "./components/TrialBuilder";
import HospitalDashboard from "./components/HospitalDashboard";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-100 flex flex-col selection:bg-blue-500/30">
      
      {/* Modern Global Navbar - Deep Midnight Blue Variant */}
      <nav className="bg-[#080f1e]/80 backdrop-blur-xl border-b border-blue-900/30 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo / Brand */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-blue-100 transition-colors">Medora</span>
              </Link>
            </div>

            {/* Right Side Nav */}
            <div className="flex items-center gap-4">
              {!user ? (
                <div className="flex items-center gap-4">
                  <Link 
                    to="/login" 
                    className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-blue-600/10 border border-blue-500/30 text-blue-400 px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-600/20 hover:text-blue-300 transition-all shadow-sm"
                  >
                    Sign up
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-5">
                  {user.role === "sponsor" && (
                    <Link 
                      to="/trial-builder" 
                      className="text-sm font-bold text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      Sponsor Dashboard
                    </Link>
                  )}
                  {user.role === "site_admin" && (
                    <Link 
                      to="/hospital-dashboard" 
                      className="text-sm font-bold text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      Hospital Dashboard
                    </Link>
                  )}
                  
                  {/* Divider */}
                  <div className="w-px h-5 bg-gray-800 mx-1"></div>
                  
                  <button 
                    onClick={handleLogout} 
                    className="text-sm font-bold text-red-500 hover:text-red-400 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content Area */}
      <main className="flex-grow w-full relative flex flex-col">
        <Routes>
          
          {/* Welcome/Landing Route */}
          <Route path="/" element={
            <div className="flex-grow flex flex-col items-center justify-center relative overflow-hidden py-32 px-4">
              
              {/* Immersive Grid Background Effect (Localized for Landing) */}
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

              {/* Ambient Glows */}
              <div className="absolute top-[20%] left-[50%] transform -translate-x-1/2 w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl">
                
                {/* Hero Icon */}
                <div className="w-16 h-16 bg-[#111111]/80 backdrop-blur-xl border border-gray-800 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">
                  Welcome to Medora
                </h2>
                
                <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed mb-10">
                  The decentralized network for clinical trial orchestration and privacy-preserving patient matching.
                </p>
                
                {/* CTA Buttons */}
                {!user && (
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link 
                      to="/login" 
                      className="bg-[#111111]/80 backdrop-blur-md border border-gray-800 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 hover:border-gray-700 transition-all flex items-center justify-center"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                    >
                      Create Account
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          } />
          
          {/* Sub-Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/trial-builder" element={<TrialBuilder />} />
          <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
        </Routes>
      </main>
    </div>
  );
}
