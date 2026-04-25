import React from "react";
import { Building2, FlaskConical, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full px-6 py-20 z-10 animate-in fade-in zoom-in-95 duration-300">
      <div className="max-w-2xl w-full">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 mb-3 font-sans">
            Welcome back
          </h2>
          <p className="text-gray-500 text-lg">
            Select your portal to continue.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Admin Card */}
          <div className="relative group">
            <div className="absolute inset-0 translate-x-2 translate-y-2 bg-[#3E424B] rounded-[2rem] -z-10 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3"></div>
            
            <button 
              onClick={() => navigate('/login/admin')}
              className="relative w-full h-full flex flex-col items-start bg-white p-8 rounded-[2rem] border border-gray-300 hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-300 text-left"
            >
              <div className="w-14 h-14 bg-[#eef6ff] rounded-2xl flex items-center justify-center text-[#0080ff] mb-6">
                <Building2 size={28} />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Admin
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed">
                Access patient data syncs, inventory manifests, and verified facility ledgers.
              </p>
            </button>
          </div>

          {/* Lab Card */}
          <div className="relative group">
            <div className="absolute inset-0 translate-x-2 translate-y-2 bg-[#3E424B] rounded-[2rem] -z-10 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3"></div>
            
            <button 
              onClick={() => navigate('/login/lab')}
              className="relative w-full h-full flex flex-col items-start bg-white p-8 rounded-[2rem] border border-gray-300 hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-300 text-left"
            >
              <div className="w-14 h-14 bg-[#f0fdf4] rounded-2xl flex items-center justify-center text-green-600 mb-6">
                <FlaskConical size={28} />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Pharmaceutical Lab
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed">
                Manage material transfers, ZKP compliance reports, and autonomous contracts.
              </p>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}