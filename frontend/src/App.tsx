import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import {
  Link2,
  ShieldCheck,
  Zap,
  BarChart3,
} from "lucide-react";

import LoginPage from "./login/page";
import AdminLoginPage from "./login/admin/page";
import LabLoginPage from "./login/lab/page";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterPage from "./register/page";
import Footer from "./components/Footer";
import TrialBuilder from "./components/trial-builder/TrialBuilder";

// ================= HOME PAGE =================
function HomePage() {
  const token = localStorage.getItem("token");

  return (
    <>
      {/* NAVBAR */}
      <nav className="relative z-10 flex justify-between items-center px-6 py-3 mx-auto mt-6 w-full max-w-[1100px] bg-white rounded-full border shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Link2 size={22} /> MEDORA
        </Link>

        <div className="hidden md:flex gap-8 text-gray-600">
          <a href="#">Nodes</a>
          <a href="#">Protocols</a>
          <a href="#">Pricing</a>
          <a href="#">Docs</a>
          <a href="#">Network</a>
        </div>

        <div className="flex gap-6">
          {!token ? (
            <>
              <Link to="/login">Log in</Link>
              <Link
                to="/register"
                className="bg-black text-white px-4 py-2 rounded-full"
              >
                Sign up
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-full"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <main className="relative z-10 flex flex-col items-center text-center mt-32 px-6 w-full max-w-4xl mx-auto">
        <div className="bg-[#eef6ff] text-[#0080ff] px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
          5,000+ active factory nodes
        </div>

        <h1 className="text-6xl md:text-7xl font-semibold text-gray-900 mb-6 leading-tight">
  <span className="block">Find the right patients.</span>
  
 <span
  className="block font-vast text-[1.05em] text-white tracking-wide"
  style={{
    WebkitTextStroke: "1px black",
    textShadow: `
      2px 2px 0px black,
      4px 4px 0px rgba(0,0,0,0.8)
    `,
  }}
>
  Protect their privacy.
</span>
  <span className="block">Speed up the cure.</span>
</h1>

        <p className="text-lg text-gray-500 max-w-2xl mb-10">
          Deploy a material exchange protocol in seconds.
        </p>

        <Link
  to="/trial-builder"
  className="bg-black text-white px-8 py-4 rounded-full text-lg hover:scale-[1.02] transition inline-block"
>
  Create a protocol
</Link>
      </main>

      {/* FEATURES */}
      <section className="w-full max-w-5xl mx-auto mt-32 px-6 space-y-6">
        <div className="bg-white rounded-[2rem] p-10 border">
          <Zap className="mb-4 text-blue-500" />
          <h2 className="text-2xl font-semibold">
            Seamlessly sync with ERP
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2rem] p-10 border">
            <ShieldCheck className="mb-4 text-green-600" />
            Secure Compliance
          </div>

          <div className="bg-white rounded-[2rem] p-10 border">
            <BarChart3 className="mb-4 text-orange-500" />
            Analytics
          </div>
        </div>
      </section>
    </>
  );
}


// ================= APP =================
export default function App() {
  return (
    <BrowserRouter>
      {/* ❗ removed blur + kept clean background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100 -z-10" />
      <div className="w-full min-h-screen flex flex-col bg-gray-100 font-sans">

        {/* MAIN CONTENT */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/admin" element={<AdminLoginPage />} />
            <Route path="/login/lab" element={<LabLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/trial-builder" element={<TrialBuilder />} />

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute>
                  <div style={{ marginTop: "200px" }}>
                    ADMIN DASHBOARD 🚀
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/lab-dashboard"
              element={
                <ProtectedRoute>
                  <div style={{ marginTop: "200px" }}>
                    LAB DASHBOARD 🚀
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>

        {/* FOOTER */}
        <Footer />

      </div>
    </BrowserRouter>
  );
}